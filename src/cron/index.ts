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
import { abandonedCall } from './jobs/abandonedCall.cron';
import { endInitCall } from './jobs/endInitCall.cron';
import { endInitiatedLivestreamCallsJob } from './jobs/endInitiatedLivestreamCalls.cron';
import { endAbandonedLivestreamCallsJob } from './jobs/endAbandonedLivestreamCalls.cron';
import {checkPendingTransactionsJob} from './jobs/checkPendingTransactions.cron';

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
    schedule: ExpireCashback.schedule,
    name: ExpireCashback.name,
    execute: ExpireCashback.execute
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
  },
  {
    schedule: abandonedCall.schedule,
    name: abandonedCall.name,
    execute: abandonedCall.execute
  },
  {
    schedule: endInitCall.schedule,
    name: endInitCall.name,
    execute: endInitCall.execute
  },
  {
    schedule: endInitiatedLivestreamCallsJob.schedule,
    name: endInitiatedLivestreamCallsJob.name,
    execute: endInitiatedLivestreamCallsJob.execute
  },
  {
    schedule: endAbandonedLivestreamCallsJob.schedule,
    name: endAbandonedLivestreamCallsJob.name,
    execute: endAbandonedLivestreamCallsJob.execute
  },
  {
    schedule: checkPendingTransactionsJob.schedule,
    name: checkPendingTransactionsJob.name,
    execute: checkPendingTransactionsJob.execute
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
