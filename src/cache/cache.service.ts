import { Service } from 'typedi';
import { redisClient } from '../config/redis.config';

@Service()
export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }
}
