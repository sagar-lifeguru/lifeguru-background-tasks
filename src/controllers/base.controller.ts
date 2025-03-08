import { Response } from 'express';
import { logger } from '../utils/logger';

export abstract class BaseController {
  protected sendSuccess(res: Response, data: any = null, message: string = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  protected sendError(res: Response, error: any) {
    logger.error('Controller error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: error.stack,
    });
  }
}
