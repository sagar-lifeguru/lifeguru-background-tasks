import { logger } from '../../utils/logger';
import UserCall from '../../models/userCall.model';
import Astrologer from '../../models/astrologer.model';
import User from '../../models/user.model';
import WaitingUser from '../../models/waitingUser.model';
import { Op, literal } from 'sequelize';
import redisClient from '../../config/redis.config';
import sendNotification from '../../utils/sendNotification';
import callSettlement from '../../utils/callSettlement';
import util from 'util';
import { CronJob } from './base.cron';
import {removeWaitlistQueue} from '../../queues/producer/waitlistQueue';

const redisDelAsync = util.promisify(redisClient.del).bind(redisClient);

const endCall = async (call: UserCall, reason: string): Promise<boolean> => {
  try {
    let call_status = call.call_status;
    let c_status = call.status;
    
    if (call.call_status === "ended") {
      return false;
    }
    
    call.callDuration = call.maxMinute;
    if (call.call_status === "initiated") {
      call.callDuration = 0;
    }
    
    call.endTime = new Date().toISOString();
    call.status = "end_user";
    call.call_status = "ended";
    call.reason = `${reason} || ${call_status} - ${c_status}`;
    await call.save();

    const userNotif = {
      notification_type: "end_user",
      firebaseChId: call.firebaseChId,
      channel_id: call.channelId,
      title: "LifeGuru",
      body: "Chat ended due to balance exhausted",
    };

    const astroNotif = {
      notification_type: "end_user",
      firebaseChId: call.firebaseChId,
      channel_id: call.channelId,
      title: "User Balance Exhausted",
      body: "Chat ended due to balance exhausted",
    };
    try { 
      await callSettlement(call.channelId);
    } catch (error: any) {
      console.log("Errorrrr: ", error);
    }

    if (call.userId) {
      const user = await User.findByPk(call.userId);
      if (user) {
        await sendNotification(user.device_token, userNotif);
      }
    }

    if (call.astroId) {
      console.log("send astro notif 1");
      const waitCount = await WaitingUser.findAll({
        where: {
          astro_id: call.astroId,
          status: true,
          is_delete: false,
        },
      });

      const astrologer = await Astrologer.findByPk(call.astroId);
      
      if (astrologer) {
        if (waitCount?.length === 0) {
          astrologer.is_busy = false;
          await astrologer.save();
          const currentKey = `astro_${astrologer?.astro_id}`;
          try {
            const deleteResult = redisDelAsync(currentKey);
            console.log("send astro notif 2", deleteResult);
            logger.info(`Deleted Redis key: ${currentKey}`);
          } catch (err) {
            logger.error(`Error deleting key ${currentKey}:`, err);
          }
        } else {
          if(waitCount[0].call_type === 'chat'){ 
            await removeWaitlistQueue({astroId: astrologer.astro_id, userId: waitCount[0].user_id, channelId: waitCount[0].channelId, callType:waitCount[0].call_type}, 180000);
          } else if(waitCount[0].call_type === 'call'){
              await removeWaitlistQueue({astroId: astrologer.astro_id, userId: waitCount[0].user_id, channelId: waitCount[0].channelId, callType:waitCount[0].user_calls_id}, 180000);
          }
        }
        await sendNotification(astrologer.devicetoken, astroNotif);
        console.log("send astro notif 3");
      }
    }
    return true;
  } catch (error) {
    console.log("Error: ", error);
    logger.error("Error in ending call:", error);
    return false;
  }
};

export const abandonedCall: CronJob = {
  schedule: '*/10 * * * * *',
  name: 'abandonedCall',
  execute: async () => {
    logger.info('Running Abandoned Call check cron job');
    
    try {
      const timeSinceStart = `floor(EXTRACT(EPOCH FROM (now() - timestamptz("startTime")) / 60))`;

      const abandoned_calls = await UserCall.findAll({
        attributes: [
          "id",
          "channelId",
          "firebaseChId",
          "userId",
          "astroId",
          "callDuration",
          "maxMinute",
          "startTime",
          "status",
          "call_status",
          "astro_status",
          "user_status",
          [literal(`(now() at time zone 'utc')`), "now"],
          [literal(timeSinceStart), "current_duration"],
        ],
        where: {
          call_status: "in_progress",
          callType: "chat",
          [Op.and]: [literal(`${timeSinceStart} >= "maxMinute"`)],
        },
      });

      for (const call of abandoned_calls) {
        await endCall(call, "Ended by system | user balance has exhausted");
      }
      
      logger.info(`Processed ${abandoned_calls.length} abandoned calls`);
    } catch (error) {
      console.log("Error: ", error);
      logger.error('Error in Abandoned Call cron job:', error);
    }
  }
};
