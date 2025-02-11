import { Service } from 'typedi';
import { BaseCron } from './base.cron';
import { logger } from '../utils/logger';
import UserCall from '../models/userCall.model';
import Astrologer from '../models/astrologer.model';
import User from '../models/user.model';
import WaitingUser from '../models/WaitingUser.model';
import ExotelResponse from '../models/exotelResponse.model';
import { Op } from 'sequelize';
import moment from 'moment-timezone';
import redisClient from '../config/redis.config';
import sendNotification from '../utils/sendNotification';
import { callSettlement } from '../services/callSettlement';
import axios from 'axios';
import util from 'util';


//using util.promisify to make client.del return a promise. This will ensure proper async handling.
const redisDelAsync = util.promisify(redisClient.del).bind(redisClient);

@Service()
export class ExotelFailSafe extends BaseCron {
  protected schedule = '*/5 * * * *';
  protected name = 'exotelFailSafe';

  async execute(): Promise<void> {
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

        const result = await this.checkExotelCallStatus(call.channelId);
        if (!result.status) continue;

        const callDetails = result.data;
        if (callDetails.Status === 'in-progress') continue;
        
        const astrologer = await Astrologer.findByPk(call.astroId);
        if(!astrologer) continue;
        const user = await User.findByPk(call.userId);
        if(!user) continue;
        const istStartTime = moment.tz(callDetails.StartTime, 'Asia/Kolkata');
        const gmtStartTime = istStartTime.clone().tz('GMT').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        const istEndTime = callDetails.EndTime ? moment.tz(callDetails.EndTime, 'Asia/Kolkata') : '';
        const gmtEndTime = callDetails.EndTime ? istEndTime.clone().tz('GMT').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '';
        
        let extResponse = new ExotelResponse({
          CallSid: callDetails.Sid,
          To: callDetails.To,
          From: callDetails.From,
          Status: callDetails.Status,
          StartTime: gmtStartTime,
          RecordingUrl: callDetails.RecordingUrl,
          ConversationDuration: callDetails.Duration,
          data: JSON.stringify(callDetails),
          user_call_id: call.id,
          EndTime: gmtEndTime,
        });
        
        let minuteSpent = Math.ceil(callDetails.Duration / 60);
        call.callDuration = minuteSpent > call.maxMinute ? Math.ceil((callDetails.Duration - 10) / 60) : minuteSpent;
        call.status = callDetails.Status;
        call.recording_url = callDetails.RecordingUrl;
        call.startTime = gmtStartTime;
        call.endTime = gmtEndTime;
        call.call_status = 'ended';
        
        await call.save();
        await extResponse.save();
        
        const waitCount = await WaitingUser.count({
          where: { astro_id: astrologer.id, status: true, is_delete: false },
        });
        if (waitCount <= 0) {
          astrologer.is_busy = false;
          await astrologer.save();
        }
        
        const userNotif = {
          notification_type: 'call_disconnected',
          status: callDetails.Status,
          channel_id: call.channelId ?? '',
          astro_name: astrologer.display_name,
          astro_id: astrologer.id,
          user_name: user.user_name ?? '',
          user_id: user.id ?? '',
          startTime: gmtStartTime,
          endTime: gmtEndTime,
          call_type: 'call',
          title: 'LifeGuru',
          body: 'Call disconnected!',
        };
        
        await callSettlement(callDetails.Sid);
        try {
          await redisDelAsync(astrologer.astro_id);
          logger.info(`Deleted Redis key: ${astrologer.astro_id}`);
        } catch (err) {
          logger.error(`Error deleting key ${astrologer.astro_id}:`, err);
        }
        
        try {
          await sendNotification(user.device_token, userNotif);
        } catch (error) {
          logger.error('Error sending notification:', error);
        }
      }
    } catch (error) {
      logger.error('Error in ExotelFailSafe cron job:', error);
    }
  }

  private async checkExotelCallStatus(channelId: string) {
    try {
      const apiKey = process.env.API_KEY;
      const apiToken = process.env.API_TOKEN;
      const EXOTEL_SID = process.env.EXOTEL_SID;
      const SUB_DOMAIN = process.env.SUB_DOMAIN;
      const url = `https://${apiKey}:${apiToken}@${SUB_DOMAIN}/v1/Accounts/${EXOTEL_SID}/Calls/${channelId}.json`;
      const result = await axios.get(url);
      return { data: result.data.Call, status: true };
    } catch (error) {
      logger.error('Error fetching Exotel call status:', error);
      return { data: error, status: false };
    }
  }
}
