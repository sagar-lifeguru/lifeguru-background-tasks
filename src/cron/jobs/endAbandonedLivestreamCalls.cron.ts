import { logger } from '../../utils/logger';
import LivestreamCall from '../../models/livestreamCall.model';
import User from '../../models/user.model';
import Astrologer from '../../models/astrologer.model';
import { Op, literal } from 'sequelize';
import { CronJob } from './base.cron';
import sendNotification from '../../utils/sendNotification';
import redisClient from '../../config/redis.config';
import livestreamCallSettlement from '../../utils/livestreamCallSettlement';
import util from 'util';

const redisDelAsync = util.promisify(redisClient.del).bind(redisClient);

const endLivestreamCall = async (data: any, reason: string): Promise<void> => {
  try {
    const call = await LivestreamCall.findOne({ where: { id: data.id } });
    if (!call || call.call_status === "ended") {
      return;
    }

    const call_status = call.call_status;
    call.call_duration = call.max_minute;
    if (call.call_status === "initiated") {
      call.call_duration = 0;
    }
    call.end_time = new Date(new Date().toISOString());
    call.call_status = "ended";
    call.reason = `${reason} || ${call_status}`;
    await call.save();

    const userNotif = {
      notification_type: "system_end_call",
      livestream_call_id: call.id,
      livestream_id: call.livestream_id,
      channel_name: "",
      chat_id: "",
      title: "LifeGuru",
      body: "Livestream call ended due to balance exhausted",
    };

    const astroNotif = {
      notification_type: "system_end_call",
      livestream_call_id: call.id,
      livestream_id: call.livestream_id,
      channel_name: "",
      chat_id: "",
      title: "User Balance Exhausted",
      body: "Livestream call ended due to balance exhausted",
    };

    await livestreamCallSettlement(String(call.id));

    if (call.user_id) {
      const user = await User.findByPk(call.user_id);
      if (user) {
        await sendNotification(user.device_token, userNotif);
      }
    }

    if (call.astro_id) {
      const astrologer = await Astrologer.findByPk(call.astro_id);
      if (astrologer) {
        astrologer.is_busy = false;
        await astrologer.save();
        try {
          await sendNotification(astrologer.devicetoken, astroNotif); 
        } catch (error) {
          console.log("Error in sending fcm token: ", error);
        }
        const currentKey = `${astrologer?.astro_id}_livestream`;
      try {
        const deleteResult = redisDelAsync(currentKey);
        logger.info(`Deleted Redis key: ${currentKey}`);
      } catch (err) {
        logger.error(`Error deleting key ${currentKey}:`, err);
      }
      }
    }
  } catch (error) {
    logger.error("Error in ending Livestream call:", error);
  }
};

const endAbandonedLivestreamCalls = async (): Promise<void> => {
  try {
    const timeSinceStart = `floor(EXTRACT(EPOCH FROM (now() - timestamptz("start_time")) / 60))`;

    const abandoned_calls = await LivestreamCall.findAll({
      attributes: [
        "id",
        "user_id",
        "astro_id",
        "call_duration",
        "max_minute",
        "start_time",
        "call_status",
        "astro_status",
        "user_status",
        [literal(`(now() at time zone 'utc')`), "now"],
        [literal(timeSinceStart), "current_duration"],
      ],
      where: {
        call_status: "in_progress",
        [Op.and]: [literal(`${timeSinceStart} >= "max_minute"`)],
      },
    });

    logger.info(`Found ${abandoned_calls.length} abandoned livestream calls.`);
    for (const call of abandoned_calls) {
      await endLivestreamCall(
        call,
        "Ended by system | user balance has exhausted"
      );
    }
  } catch (error) {
    logger.error("Error in ending abandoned Livestream calls:", error);
  }
};

export const endAbandonedLivestreamCallsJob: CronJob = {
  schedule: '*/10 * * * * *',
  name: 'endAbandonedLivestreamCalls',
  execute: async () => {
    logger.info('Running End Abandoned Livestream Calls cron job');
    await endAbandonedLivestreamCalls();
  }
}; 