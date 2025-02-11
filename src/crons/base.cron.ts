import { Service } from 'typedi';
import cron from 'node-cron';
import { logger } from '../utils/logger';

@Service()
export abstract class BaseCron {
  protected abstract schedule: string;
  protected abstract name: string;

  abstract execute(): Promise<void>;

  start(): void {
    logger.info(`Starting cron job: ${this.name}`);
    cron.schedule(this.schedule, async () => {
      try {
        await this.execute();
      } catch (error) {
        logger.error(`Error in cron job ${this.name}:`, error);
      }
    });
  }
}
