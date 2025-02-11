import { Service } from 'typedi';
import { BaseCron } from './base.cron';
import { logger } from '../utils/logger';
import Astrologer from '../models/astrologer.model';
import AstrologerOnlineReport from '../models/astrologerOnlineReport.model';
import { Op } from 'sequelize';
import moment from 'moment';
import sendNotification from '../utils/sendNotification';

@Service()
export class NotifyAstro extends BaseCron {
  protected schedule = '*/5 * * * *';
  protected name = 'notifyAstro';

  async execute(): Promise<void> {
    logger.info('Running notifyAstro cron job');
    
    try {
      const astrologers = await Astrologer.findAll({
        where: {
          is_delete: false,
          status: true,
          is_verified: true,
          next_online_time: { [Op.ne]: null },
        },
      });
      
      if (!astrologers.length) return;
      
      for (const astro of astrologers) {
        const astroOnlineRec = await AstrologerOnlineReport.findOne({
          where: {
            astro_id: astro.id,
            actual_online_time: null,
            notified: false,
          },
          order: [['createdAt', 'DESC']],
        });
        
        const currentTime = moment();
        const onlineTime = moment(astro.next_online_time);
        const timeDiff = moment.duration(onlineTime.diff(currentTime)).asMinutes();
        const notifyTimeDiff = parseInt(process.env.NOTIFY_ASTRO_TIME_DIFF || '10');
        
        if (astro.is_chat_online || astro.is_voice_online) {
          astro.next_online_time = null;
          await astro.save();
        } else {
          if (timeDiff > 0 && timeDiff <= notifyTimeDiff) {
            const NotifyAstro = {
              notification_type: 'Online',
              title: 'LifeGuru',
              body: 'Your online scheduled time is approaching.',
            };
            await sendNotification(astro.devicetoken, NotifyAstro);
            if (astroOnlineRec) {
              astroOnlineRec.notified = true;
              await astroOnlineRec.save();
            }
            logger.info(`${astro.display_name} is notified`);
          } else if (timeDiff <= 0) {
            astro.next_online_time = null;
            await astro.save();
          }
        }
      }
    } catch (error) {
      logger.error('Error in notifyAstro cron job:', error);
    }
  }
}
