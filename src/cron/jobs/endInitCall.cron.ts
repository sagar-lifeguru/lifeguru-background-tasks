import { logger } from '../../utils/logger';
import UserCall from '../../models/userCall.model';
import Astrologer from '../../models/astrologer.model';
import User from '../../models/user.model';
import WaitingUser from '../../models/waitingUser.model';
import AstroNotification from '../../models/astroNotification.model';
import AstrologerStatusLogs from '../../models/astrologerStatusLogs.model';
import { Op, literal } from 'sequelize';
import redisClient from '../../config/redis.config';
import sendNotification from '../../utils/sendNotification';
import { CronJob } from './base.cron';
import util from 'util';

const redisDelAsync = util.promisify(redisClient.del).bind(redisClient);
const redisSetAsync = util.promisify(redisClient.set).bind(redisClient);

const astroStatusLog = async (astrologer: any, statusType: string): Promise<void> => {
  try {
    const logData = {
      astro_id: astrologer.id,
      status: `${statusType} offline`,
      created_at: new Date(),
    };

    await AstrologerStatusLogs.create(logData);
  } catch (error) {
    logger.error(`Error in astroStatusLog: ${error}`);
  }
};

const increaseRejectCounter = async (astrologer: any): Promise<number> => {
  try {
    const key = `${astrologer.id}_${astrologer.display_name}_reject_counter`;
    const count = await redisClient.get(key) || "0";
    const newCount = parseInt(count) + 1;
    await redisSetAsync(key, newCount.toString());
    return newCount;
  } catch (error) {
    logger.error('Error in increaseRejectCounter:', error);
    return 0;
  }
};

const endinitCall = async (call: any, reason: string): Promise<void> => {
  try {
    call.callDuration = 0;
    call.holdDuration = 0;
    call.endTime = new Date().toISOString();
    call.status = "system_end";
    call.call_status = "ended";
    call.reason = reason;
    await call.save();

    const userNotif = {
      notification_type: "disconnect_user",
      firebaseChId: call.firebaseChId,
      channel_id: call.channelId,
      title: "LifeGuru",
      body: "Chat ended",
    };

    if (call.userId) {
      const user = await User.findByPk(call.userId);
      if (user) {
        await sendNotification(user.device_token, userNotif);
      }
    }

    if (call.astroId) {
      const waitCount = await WaitingUser.count({
        where: {
          astro_id: call.astroId,
          status: true,
          is_delete: false,
        },
      });

      const astrologer = await Astrologer.findByPk(call.astroId);
      if (!astrologer) return;

      if (call.astro_status !== "accept_astro") {
        try {
          const existingNotification = await AstroNotification.findOne({
            where: {
              user_id: call.userId,
              astro_id: call.astroId,
              user_call_id: call.id,
            },
          });

          if (!existingNotification) {
            await AstroNotification.create({
              user_id: call.userId,
              astro_id: call.astroId,
              user_call_id: call.id,
              is_read: false,
              status: "astro_missed",
              call_type: call.callType,
            });
          }

          const lastConsquetiveCalls = process.env.LAST_CONSEQUETIVE_CHATS || "3";
          const count = await increaseRejectCounter(astrologer);

          if (count >= parseInt(lastConsquetiveCalls)) {
            logger.info("Marking Astro offline forcefully");
            await redisSetAsync(
              `${astrologer.id}_${astrologer.display_name}_reject_counter`,
              "0"
            );

            const affectedUsers = await WaitingUser.findAll({
              where: { astro_id: astrologer.id, status: true },
              attributes: ["user_id", "channelId", "fb_channelId"],
            });

            if (astrologer.is_voice_online) {
              astrologer.is_voice_online = false;
              await astroStatusLog(astrologer, "forced audio call");
            }

            astrologer.is_chat_online = false;
            await astrologer.save();
            await astroStatusLog(astrologer, "forced chat");

            // Update waiting users and calls
            const endTime = new Date().toISOString();
            await Promise.all([
              WaitingUser.update(
                { status: false },
                { where: { astro_id: astrologer.id, status: true } }
              ),
              UserCall.update(
                {
                  call_status: "ended",
                  status: "reject_astro",
                  reason: "Astrologer went offline",
                  endTime: endTime,
                },
                {
                  where: {
                    astroId: astrologer.id,
                    call_status: "waiting",
                  },
                }
              )
            ]);

            // Send notifications
            const forcedEndNotification = {
              notification_type: "forced_offline",
              firebaseChId: call.firebaseChId || "",
              channelId: call.channelId || "",
              startTime: call.startTime || "",
              title: "LifeGuru",
              body: `You have been marked offline because you have missed ${lastConsquetiveCalls} consecutive consultations`,
            };

            await sendNotification(astrologer.devicetoken, forcedEndNotification);

            if (affectedUsers) {
              for (const user of affectedUsers) {
                const userDeviceToken = await User.findOne({
                  where: { id: user.dataValues.user_id },
                  attributes: ["device_token"],
                });

                if (userDeviceToken) {
                  const endNotificationForAstroGoingOffline = {
                    notification_type: "astro_offline",
                    firebaseChId: user.dataValues.fb_channelId,
                    channelId: user.dataValues.channelId,
                    title: "LifeGuru",
                    body: "Astrologer Went Offline",
                  };
                  await sendNotification(
                    userDeviceToken.dataValues.device_token,
                    endNotificationForAstroGoingOffline
                  );
                }
              }
            }
          }
        } catch (error) {
          logger.error("Error while marking astrologer offline forcefully:", error);
        }
      }

      await redisDelAsync(astrologer.astro_id);

      if (waitCount === 0) {
        astrologer.is_busy = false;
        await astrologer.save();
      }
      await sendNotification(astrologer.devicetoken, userNotif);
    }
  } catch (error) {
    logger.error("Error in ending call:", error);
  }
};

export const endInitCall: CronJob = {
  schedule: '*/10 * * * * *',
  name: 'endInitCall',
  execute: async () => {
    logger.info('Running End Init Call cron job');
    
    try {
      const timeSinceStart = `floor(EXTRACT(EPOCH FROM (now() - timestamptz("startTime")) ))`;
      const initiated_calls = await UserCall.findAll({
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
          call_status: "initiated",
          callType: "chat",
          [Op.and]: [
            literal(
              `${timeSinceStart} >= ${process.env.CHAT_CALLER_TIME || 60}`
            ),
          ],
        },
      });

      for (const call of initiated_calls) {
        await endinitCall(
          call,
          "Ended by system | astro or user did not joined the call"
        );
      }
      
      logger.info(`Processed ${initiated_calls.length} initiated calls`);
    } catch (error) {
      logger.error('Error in End Init Call cron job:', error);
    }
  }
};
