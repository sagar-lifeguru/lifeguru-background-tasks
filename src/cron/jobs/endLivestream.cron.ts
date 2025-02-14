import { logger } from '../../utils/logger';
import Livestream from '../../models/livestream.model';
import LivestreamCall from '../../models/livestreamCall.model';
import Astrologer from '../../models/astrologer.model';
import User from '../../models/user.model';
import { Op } from 'sequelize';
import moment from 'moment';
import sendNotification from '../../utils/sendNotification';
import livestreamCallSettlement from '../../utils/livestreamCallSettlement';
import redisClient from '../../config/redis.config';
import util from 'util';

const redisDelAsync = util.promisify(redisClient.del).bind(redisClient);

const deleteRedisKey = async (astrologer: Astrologer, isInCall = false) => {
  if (!isInCall) {
    const keyToDelete = `${astrologer.astro_id}`;
    const redisValue = await redisClient.get(keyToDelete);
    if (redisValue !== null) {
      try {
        await redisDelAsync(keyToDelete);
        logger.info(`Deleted Redis key: ${keyToDelete}`);
      } catch (err) {
        logger.error(`Error deleting key ${keyToDelete}:`, err);
      }
    }
  }
};

export const endLivestream = async (): Promise<void> => {
  logger.info('Running endLivestream job');
  
  try {
    const fiveMinutesAgo = moment().subtract(moment.duration('00:05')).toISOString();
    const pausedLivestreams = await Livestream.findAll({
      where: {
        status: 'paused',
        paused_time: { [Op.lt]: fiveMinutesAgo },
      },
    });
    
    const endTime = new Date().toISOString();
    
    for (const currentLive of pausedLivestreams) {
      if (currentLive.status === 'paused') {
        const ongoingCalls = await LivestreamCall.findAll({
          where: {
            livestream_id: currentLive.id,
            astro_id: currentLive.astro_id,
            call_status: { [Op.ne]: 'ended' },
          },
        });
        
        for (const call of ongoingCalls) {
          const callDuration = Math.ceil(
            (new Date(endTime).getTime() - new Date(call.start_time).getTime()) / 1000 / 60
          );
          
          await call.update({
            reason: `Astrologer left the livestream || ${call.call_status}`,
            end_time: new Date(endTime),
            call_duration: callDuration,
            call_status: 'ended',
            astro_status: 'end_astro'
          });
          
          const astrologer = await Astrologer.findByPk(call.astro_id);
          if (astrologer) {
            await deleteRedisKey(astrologer);
            await astrologer.update({ is_busy: false });
          }
          
          await livestreamCallSettlement(String(call.id));
          
          if (call.user_id) {
            const user = await User.findByPk(call.user_id);
            if (user) {
              await sendNotification(user.device_token, {
                notification_type: 'system_end_call',
                livestream_call_id: call.id,
                livestream_id: call.livestream_id,
                channel_name: '',
                chat_id: '',
                title: 'LifeGuru',
                body: 'Astrologer left the call',
              });
            }
          }
        }
        
        await currentLive.update({
          status: 'ended',
          end_date: new Date(endTime)
        });
      }
    }
  } catch (error) {
    logger.error('Error in endLivestream job:', error);
  }
};
