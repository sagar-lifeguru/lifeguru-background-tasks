import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { CacheService } from '../cache/cache.service';

export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cacheService = Container.get(CacheService);
    const key = `cache:${req.method}:${req.originalUrl}`;

    try {
      const cachedData = await cacheService.get(key);
      if (cachedData) {
        return res.json(cachedData);
      }

      const originalJson = res.json;
      res.json = function (data) {
        cacheService.set(key, data, ttlSeconds);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
