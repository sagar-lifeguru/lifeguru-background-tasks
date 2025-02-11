import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config';

export const rateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
});
