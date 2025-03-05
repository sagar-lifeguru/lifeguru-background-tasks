import 'reflect-metadata';
import express from 'express';
import { Container } from 'typedi';
import { sequelize } from './config/database.config';
import { logger } from './utils/logger';
import { env } from './config/env.config';
import { EmailConsumer } from './queues/consumers/email.consumer';
import { WaitlistConsumer } from './queues/consumers/waitlist.consumer';
import { initCronJobs } from './cron';

const app = express();
const container = Container.of();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize consumers
// const emailConsumer = container.get(EmailConsumer);
// const waitlistConsumer = container.get(WaitlistConsumer);

// Start consumers
// Promise.all([
//   emailConsumer.initialize(),
//   waitlistConsumer.initialize()
// ]).catch(error => {
//   logger.error('Failed to initialize queue consumers:', error);
// });

async function initializeServices() {
  try {
    // Database
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info(`Database connected to host: ${env.database.host}`);

    // Initialize Cron Jobs
    initCronJobs();
    logger.info('Cron jobs initialized successfully');

    // Server port & host from env
    const port = env.server.port;
    const host = env.server.host;

    app.listen(port, host, () => {
      logger.info(`Server running at http://${host}:${port}`);
    });
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

initializeServices();

export default app;
