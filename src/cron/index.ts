import cron from 'node-cron';
import { logger } from '../utils/logger';
import { resetAstroQuota } from './jobs/resetAstroQuota.cron';
import { RandomizeAstroSorting } from './jobs/randomizeAstroSorting.cron';
import { NotifyAstro } from './jobs/notifyAstro.cron';
import { HideCallButtonInMissedConsults } from './jobs/hideCallButtonInMissedConsults.cron';
import { expireRedisKeys } from './jobs/expireRedisKeys.cron';
import { ExpirePromoCashback } from './jobs/expirePromoCashback.cron';
import { ExpireCashback } from './jobs/expireCashback.cron';
import { exotelFailSafe } from './jobs/exotelFailSafe.cron';
import { endLivestream } from './jobs/endLivestream.cron';

interface CronTask {
  schedule: string;
  name: string;
  execute: () => Promise<void>;
}

const cronJobs: CronTask[] = [
  {
    schedule: '30 10 * * *',
    name: 'resetAstroQuota',
    execute: resetAstroQuota
  },
  {
    schedule: '*/30 * * * *',
    name: 'randomizeAstroSorting',
    execute: RandomizeAstroSorting.execute
  },
  {
    schedule: '*/5 * * * *',
    name: 'notifyAstro',
    execute: NotifyAstro.execute
  },
  {
    schedule: '0 * * * *',
    name: 'hideCallButtonInMissedConsults',
    execute: HideCallButtonInMissedConsults.execute
  },
  {
    schedule: '* * * * *',
    name: 'expireRedisKeys',
    execute: expireRedisKeys
  },
  {
    schedule: '0 5 * * *',
    name: 'expirePromoCashback',
    execute: ExpirePromoCashback.execute
  },
  {
    schedule: '*/5 * * * *',
    name: 'exotelFailSafe',
    execute: exotelFailSafe.execute
  },
  {
    schedule: '* * * * *',
    name: 'endLivestream', 
    execute: endLivestream
  }
];

export const initCronJobs = () => {
  cronJobs.forEach(job => {
    cron.schedule(job.schedule, async () => {
      logger.info(`Running job: ${job.name}`);
      try {
        await job.execute();
        logger.info(`Completed job: ${job.name}`);
      } catch (error) {
        logger.error(`Error in job ${job.name}:`, error);
      }
    });
  });
  
  logger.info('All cron jobs initialized');
};
