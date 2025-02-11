import { Service } from 'typedi';
import { BaseCron } from './base.cron';
import { logger } from '../utils/logger';
import AstroNotifications from '../models/astroNotification.model';
import { Op } from 'sequelize';
import moment from 'moment';

@Service()
export class HideCallButtonInMissedConsults extends BaseCron {
  protected schedule = '0 * * * *'; // Run every hour
  protected name = 'hideCallButtonInMissedConsults';

  async execute(): Promise<void> {
    logger.info('Running hideCallButtonInMissedConsults cron job');
    
    try {
      const cutoffTime = moment().subtract(48, 'hours').toDate();

      await AstroNotifications.update(
        { is_read: true },
        {
          where: {
            [Op.or]: [
              { status: 'astro_missed' },
              { status: 'notify' },
              { status: 'user_left_waitlist' },
            ],
            is_read: false,
            created_at: { [Op.lte]: cutoffTime },
          },
        }
      );
      
      logger.info('Call button hide in missed consults updated successfully');
    } catch (error) {
      logger.error('Error updating notifications:', error);
    }
  }
}
