import { logger } from '../../utils/logger';
import UserCall from '../../models/userCall.model';
import Astrologer from '../../models/astrologer.model';
import User from '../../models/user.model';
import WaitingUser from '../../models/waitingUser.model';
import ExotelResponse from '../../models/exotelResponse.model';
import { Op } from 'sequelize';
import moment from 'moment-timezone';
import redisClient from '../../config/redis.config';
import sendNotification from '../../utils/sendNotification';
import callSettlement from '../../utils/callSettlement';
import axios from 'axios';
import util from 'util';
import { CronJob } from './base.cron';

const redisDelAsync = util.promisify(redisClient.del).bind(redisClient);

const checkExotelCallStatus = async (channelId: string) => {
  try {
    const { API_KEY, API_TOKEN, EXOTEL_SID, SUB_DOMAIN } = process.env;
    const url = `https://${API_KEY}:${API_TOKEN}@${SUB_DOMAIN}/v1/Accounts/${EXOTEL_SID}/Calls/${channelId}.json`;
    const result = await axios.get(url);
    return { data: result.data.Call, status: true };
  } catch (error) {
    logger.error('Error fetching Exotel call status:', error);
    return { data: error, status: false };
  }
};

const convertToGMTTime = (time: string | null) => {
  if (!time) return '';
  return moment.tz(time, 'Asia/Kolkata').clone().tz('GMT').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
};

const createExotelResponse = async (callDetails: any, callId: number) => {
  const gmtStartTime = convertToGMTTime(callDetails.StartTime);
  const gmtEndTime = convertToGMTTime(callDetails.EndTime);

  return new ExotelResponse({
    CallSid: callDetails.Sid,
    To: callDetails.To,
    From: callDetails.From,
    Status: callDetails.Status,
    StartTime: gmtStartTime,
    RecordingUrl: callDetails.RecordingUrl,
    ConversationDuration: callDetails.Duration,
    data: JSON.stringify(callDetails),
    user_call_id: callId,
    EndTime: gmtEndTime,
  });
};

const updateCallDetails = async (call: any, callDetails: any) => {
  const gmtStartTime = convertToGMTTime(callDetails.StartTime);
  const gmtEndTime = convertToGMTTime(callDetails.EndTime);
  const minuteSpent = Math.ceil(callDetails.Duration / 60);

  call.callDuration = minuteSpent > call.maxMinute ? Math.ceil((callDetails.Duration - 10) / 60) : minuteSpent;
  call.status = callDetails.Status;
  call.recording_url = callDetails.RecordingUrl;
  call.startTime = gmtStartTime;
  call.endTime = gmtEndTime;
  call.call_status = 'ended';
  
  await call.save();
};

const handleAstrologerStatus = async (astrologer: any) => {
  const waitCount = await WaitingUser.count({
    where: { astro_id: astrologer.id, status: true, is_delete: false },
  });
  
  if (waitCount <= 0) {
    astrologer.is_busy = false;
    await astrologer.save();
  }
};

const createNotification = (call: any, astrologer: any, user: any, startTime: string, endTime: string) => ({
  notification_type: 'call_disconnected',
  status: call.status,
  channel_id: call.channelId ?? '',
  astro_name: astrologer.display_name,
  astro_id: astrologer.id,
  user_name: user.user_name ?? '',
  user_id: user.id ?? '',
  startTime,
  endTime,
  call_type: 'call',
  title: 'LifeGuru',
  body: 'Call disconnected!',
});

export const exotelFailSafe: CronJob = {
  schedule: '*/5 * * * *',
  name: 'exotelFailSafe',
  execute: async () => {
    logger.info('Running ExotelFailSafe cron job');
    
    try {
      const ongoingCalls = await UserCall.findAll({
        where: {
          callType: 'call',
          call_status: { [Op.ne]: 'ended' },
        },
      });
      
      for (const call of ongoingCalls) {
        if (!call.channelId) continue;

        const result = await checkExotelCallStatus(call.channelId);
        if (!result.status) continue;

        const callDetails = result.data;
        if (callDetails.Status === 'in-progress') continue;
        
        const [astrologer, user] = await Promise.all([
          Astrologer.findByPk(call.astroId),
          User.findByPk(call.userId)
        ]);
        
        if (!astrologer || !user) continue;

        const extResponse = await createExotelResponse(callDetails, call.id);
        await updateCallDetails(call, callDetails);
        await extResponse.save();
        await handleAstrologerStatus(astrologer);

        const gmtStartTime = convertToGMTTime(callDetails.StartTime);
        const gmtEndTime = convertToGMTTime(callDetails.EndTime);
        const userNotif = createNotification(call, astrologer, user, gmtStartTime, gmtEndTime);
        
        await Promise.all([
          callSettlement(callDetails.Sid),
          redisDelAsync(astrologer.astro_id).catch((err: any) => 
            logger.error(`Error deleting key ${astrologer.astro_id}:`, err)
          ),
          sendNotification(user.device_token, userNotif).catch(error =>
            logger.error('Error sending notification:', error)
          )
        ]);
      }
    } catch (error) {
      logger.error('Error in ExotelFailSafe cron job:', error);
    }
  }
};
