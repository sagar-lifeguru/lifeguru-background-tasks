import { Service } from 'typedi';
import { BaseCron } from './base.cron';
import { logger } from '../utils/logger';
import Astrologer from '../models/astrologer.model';
import UserCall from '../models/userCall.model';
import { Op } from 'sequelize';
import moment from 'moment';
import redisClient from '../config/redis.config';
import util from 'util';

//using util.promisify to make client.del return a promise. This will ensure proper async handling.
const redisDelAsync = util.promisify(redisClient.del).bind(redisClient);

@Service()
export class ExpireRedisKeys extends BaseCron {
  protected schedule = '* * * * *';
  protected name = 'expireRedisKeys';

  async execute(): Promise<void> {
    logger.info('Running expireRedisKeys cron job');
    
    try {
      const keys = await redisClient.keys('*');
      
      for (const currentKey of keys) {
        const redisValue = await redisClient.get(currentKey);
        if (redisValue === null) continue;
        
        const keyArray = currentKey.split('_') || [];
        if (keyArray.includes('counter') || keyArray.includes('horoscope') || keyArray.includes('livestream')) {
          continue;
        }
        
        const astro = await Astrologer.findOne({ where: { astro_id: currentKey } });
        if (!astro) continue;
        
        const ongoingCallAstro = await UserCall.count({
          where: {
            astroId: astro.id,
            call_status: { [Op.notIn]: ['ended', 'waiting'] },
          },
        });
        
        if (ongoingCallAstro <= 0) {
          try {
            await redisDelAsync(currentKey);
            logger.info(`Deleted Redis key: ${currentKey}`);
          } catch (err) {
            logger.error(`Error deleting key ${currentKey}:`, err);
          }
        }
      }
    } catch (error) {
      logger.error('Error in expireRedisKeys cron job:', error);
    }
  }
}
