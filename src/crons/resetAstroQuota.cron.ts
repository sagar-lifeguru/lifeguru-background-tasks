import { Service } from 'typedi';
import { BaseCron } from './base.cron';
import { logger } from '../utils/logger';
import Astrologer from '../models/astrologer.model';

@Service()
export class ResetAstroQuota extends BaseCron {
  protected schedule = '30 10 * * *'; // Run at 10:30 UTC daily
  protected name = 'resetAstroQuota';

  async execute(): Promise<void> {
    logger.info('Running resetAstroQuota cron job');
    
    try {
      await Astrologer.update(
        { quota_used: 0 },
        {
          where: {
            is_delete: false,
            status: true,
            is_verified: true,
          },
        }
      );
      logger.info('Astrologer quota reset successfully');
    } catch (error) {
      logger.error('Error resetting astrologer quota', error);
    }
  }
}
