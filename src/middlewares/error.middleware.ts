import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

class ApiError extends Error implements CustomError {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production mode: don't leak error details
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Programming or unknown errors: don't leak error details
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
};

const errorMiddleware = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ApiError) {
    return errorHandler(error, req, res, next);
  }

  // Handle validation errors (example for mongoose validation errors)
  if (error instanceof Error && error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid input data',
      errors: error.message
    });
  }

  // Handle MongoDB duplicate key errors
  if (error instanceof Error && (error as any).code === 11000) {
    const value = (error as any).keyValue ? Object.keys((error as any).keyValue)[0] : 'field';
    return res.status(400).json({
      status: 'fail',
      message: `Duplicate ${value}. Please use another value.`
    });
  }

  // Handle JWT errors
  if (error instanceof Error && error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please log in again.'
    });
  }

  if (error instanceof Error && error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Your token has expired. Please log in again.'
    });
  }

  // Handle other types of errors
  console.error('ERROR:', error);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};

export { ApiError, errorHandler, errorMiddleware };
