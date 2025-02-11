import { createClient } from 'redis';
import { env } from './env.config';
import { logger } from '../utils/logger';

const redisClient = createClient({
  socket: {
    host: env.redis.host,
    port: env.redis.port,
    reconnectStrategy: (retries) => {
      logger.warn(`Redis reconnect attempt ${retries}`);
      return Math.min(retries * 100, 3000); // Exponential backoff, max 3s
    },
  },
  username: 'default',
  password: env.redis.pass !== '' ? env.redis.pass : undefined, // Handle optional password
});

redisClient.on('error', (err) => logger.error('❌ Redis Client Error:', err));
redisClient.on('connect', () => logger.info('✅ Redis Client Connected Successfully'));
redisClient.on('reconnecting', () => logger.warn('⚠️ Redis Client Reconnecting...'));
redisClient.on('end', () => logger.warn('⛔ Redis Client Disconnected'));

(async () => {
  try {
    await redisClient.connect();
    logger.info('🔄 Redis Connection Established');
  } catch (err) {
    logger.error('❌ Redis Connection Failed:', err);
  }
})();

export default redisClient;
