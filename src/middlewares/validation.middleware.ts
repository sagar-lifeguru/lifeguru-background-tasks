import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { logger } from '../utils/logger';

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      logger.error('Validation error:', error);
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(err => ({
          message: err.message,
          path: err.path,
        })),
      });
    }

    next();
  };
};
