import { Service } from 'typedi';
import { BaseCron } from './base.cron';
import { logger } from '../utils/logger';
import Livestream from '../models/livestream.model';
import LivestreamCall from '../models/livestreamCall.model';
import Astrologer from '../models/astrologer.model';
import User from '../models/user.model';
import { Op } from 'sequelize';
import moment from 'moment';
import sendNotification from '../utils/sendNotification';
import livestreamCallSettlement from '../utils/livestreamCallSettlement';
import redisClient from '../config/redis.config';
import util from 'util';

//using util.promisify to make client.del return a promise. This will ensure proper async handling.
const redisDelAsync = util.promisify(redisClient.del).bind(redisClient);

@Service()
export class EndLivestream extends BaseCron {
  protected schedule = '* * * * *';
  protected name = 'endLivestream';

  async execute(): Promise<void> {
    logger.info('Running endLivestream cron job');
    
    try {
      const fiveMinutesAgo = moment().subtract(moment.duration('00:05')).toISOString();
      logger.info(`Five Minutes Ago: ${fiveMinutesAgo}`);
      
      const pausedLivestreams = await Livestream.findAll({
        where: {
          status: 'paused',
          paused_time: {
            [Op.lt]: fiveMinutesAgo,
          },
        },
      });
      
      logger.info(`Paused Livestreams count: ${pausedLivestreams.length}`);
      
      let endTime = new Date().toISOString();
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
            let callDuration = Math.ceil(
              (new Date(endTime).getTime() - new Date(call.start_time).getTime()) / 1000 / 60
            );
            let prev_status = call.call_status;
            call.reason = `Astrologer left the livestream || ${prev_status}`;
            call.end_time = new Date(endTime);
            call.call_duration = callDuration;
            call.call_status = 'ended';
            call.astro_status = 'end_astro';
            await call.save();
            
            const astrologer = await Astrologer.findByPk(call.astro_id);
            
            if(astrologer){
              await this.deleteRedisKey(astrologer);
                astrologer.is_busy = false;
                await astrologer.save();
            }
            
            await livestreamCallSettlement(String(call.id));
            
            const userNotif = {
              notification_type: 'system_end_call',
              livestream_call_id: call.id,
              livestream_id: call.livestream_id,
              channel_name: '',
              chat_id: '',
              title: 'LifeGuru',
              body: 'Astrologer left the call',
            };
            
            if (call.user_id) {
              const user = await User.findByPk(call.user_id);
              if (user) {
                await sendNotification(user.device_token, userNotif);
              }
            }
          }
          
          currentLive.status = 'ended';
          currentLive.end_date = new Date(endTime);
          await currentLive.save();
        }
      }
      
      logger.info('EndLivestream cron job completed successfully');
    } catch (error) {
      logger.error('Error ending livestreams:', error);
    }
  }

  private async deleteRedisKey(astrologer: Astrologer, isInCall = false) {
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
  }
}
