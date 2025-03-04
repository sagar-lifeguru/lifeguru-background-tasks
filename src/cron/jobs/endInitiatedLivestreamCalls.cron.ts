import { logger } from '../../utils/logger';
import LivestreamCall from '../../models/livestreamCall.model';
import User from '../../models/user.model';
import Astrologer from '../../models/astrologer.model';
import WaitingUser from '../../models/waitingUser.model';
import { Op, literal } from 'sequelize';
import { CronJob } from './base.cron';
import sendNotification from '../../utils/sendNotification';
import redisClient from '../../config/redis.config';
import util from 'util';

const redisDelAsync = util.promisify(redisClient.del).bind(redisClient);

const endinitLivestreamCall = async (call: any, reason: string): Promise<void> => {
  try {
    call.call_duration = 0;
    call.end_time = new Date().toISOString();
    call.call_status = "ended";
    call.reason = reason;
    await call.save();

    const userNotif = {
      notification_type: "end_init_call",
      livestream_call_id: call.id,
      livestream_id: call.livestream_id,
      chat_id: "",
      channel_name: "",
      title: "LifeGuru",
      body: "Chat ended",
    };

    if (call.user_id) {
      const user = await User.findByPk(call.user_id);
      if (user) {
        await sendNotification(user.device_token, userNotif);
      }
    }

    if (call.astro_id) {
      const waitCount = await WaitingUser.count({
        where: {
          astro_id: call.astro_id,
          status: true,
          is_delete: false,
        },
      });

      const astrologer = await Astrologer.findByPk(call.astro_id);
      
      if (astrologer) {
        const currentKey = `astro_${astrologer?.astro_id}`;
        try {
          const deleteResult = redisDelAsync(currentKey);
          logger.info(`Deleted Redis key: ${currentKey}`);
        } catch (err) {
          logger.error(`Error deleting key ${currentKey}:`, err);
        }
        if (waitCount === 0) {
          astrologer.is_busy = false;
          await astrologer.save();
        }
        await sendNotification(astrologer.devicetoken, userNotif);
      }
    }
  } catch (error) {
    logger.error("Error in ending livestream call:", error);
  }
};

const endInitiatedLivestreamCalls = async (): Promise<void> => {
  try {
    const timeSinceStart = `floor(EXTRACT(EPOCH FROM (now() - timestamptz("start_time")) ))`;
    const initiated_calls = await LivestreamCall.findAll({
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
        call_status: "initiated",
        [Op.and]: [
          literal(
            `${timeSinceStart} >= ${process.env.LIVESTREAM_CALLER_TIME || 100}`
          ),
        ],
      },
    });

    logger.info(`Found ${initiated_calls.length} initiated livestream calls.`);
    for (const call of initiated_calls) {
      await endinitLivestreamCall(
        call,
        "Ended by system | astro or user did not join the livestream call"
      );
    }
  } catch (error) {
    logger.error("Error in ending Livestream initiated calls:", error);
  }
};

export const endInitiatedLivestreamCallsJob: CronJob = {
  schedule: '*/10 * * * * *',
  name: 'endInitiatedLivestreamCalls',
  execute: async () => {
    logger.info('Running End Initiated Livestream Calls cron job');
    await endInitiatedLivestreamCalls();
  }
}; 