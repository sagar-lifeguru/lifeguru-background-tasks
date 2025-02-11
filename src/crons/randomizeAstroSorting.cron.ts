import { Service } from 'typedi';
import { BaseCron } from './base.cron';
import { logger } from '../utils/logger';
import Astrologer from '../models/astrologer.model';

@Service()
export class RandomizeAstroSorting extends BaseCron {
  protected schedule = '*/30 * * * *'; // Run every 30 minutes
  protected name = 'randomizeAstroSorting';

  async execute(): Promise<void> {
    logger.info('Running randomizeAstroSorting cron job');
    
    try {
      const astrologers = await Astrologer.findAll({
        where: {
          is_delete: false,
          status: true,
          is_verified: true,
        },
        attributes: ['id', 'order_count'],
      });
      
      if (!astrologers.length) {
        logger.info('No astrologers found to randomize sorting.');
        return;
      }
      
      let order_nums: number[] = [];
      while (order_nums.length < astrologers.length) {
        let r = Math.floor(Math.random() * 100) + 1;
        if (!order_nums.includes(r)) order_nums.push(r);
      }
      
      console.log(order_nums);
      
      for (let i = 0; i < astrologers.length; i++) {
        let astro = astrologers[i];
        astro.order_count = order_nums[i];
        await astro.save();
      }

      logger.info('Astrologer sorting order randomized successfully');
    } catch (error) {
      logger.error('Error randomizing astrologer sorting order', error);
    }
  }
}
