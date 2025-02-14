export interface CronJob {
  schedule: string;
  name: string;
  execute: () => Promise<void>;
} 