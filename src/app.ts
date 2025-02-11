import 'reflect-metadata';
import express from 'express';
import { Container } from 'typedi';
import { sequelize } from './config/database.config';
import  redisClient from './config/redis.config';
import { ResetAstroQuota } from './crons/resetAstroQuota.cron';
import { logger } from './utils/logger';
import { env } from './config/env.config';
import { EmailConsumer } from './queues/consumers/email.consumer';
// import swaggerUi from 'swagger-ui-express';
// import { swaggerSpec } from './config/swagger.config';
// import { errorMiddleware } from './middlewares/error.middleware';
// import { EmailConsumer } from './queues/consumers/email.consumer';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
// app.use('/api/users', userRoutes);

// Error handling
// app.use(errorMiddleware);

// Initialize services
async function initializeServices() {
  try {
    // Database
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info(`Database connected to host: ${env.database.host}`);

    // Redis
    // await redisClient.connect();
    // logger.info(`Redis connected on host: ${env.redis.host}`);

    // RabbitMQ Consumer
    try {
      const emailConsumer = Container.get(EmailConsumer);
      await emailConsumer.initialize();
    } catch (error) {
      logger.error('Failed to initialize email consumer:', error);
    }

    // Cron Jobs
    const resetAstroQuota = Container.get(ResetAstroQuota);
    resetAstroQuota.start();

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
