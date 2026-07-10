import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/appError';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: string[] = ['Internal server error'];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = err.code === 'P2025' ? 404 : 409;
    message = statusCode === 404 ? 'Resource not found' : 'Database constraint violation';
    errors = [message];
  } else if (err instanceof Error) {
    message = env.isProduction ? 'Internal server error' : err.message;
    errors = [message];
  }

  if (statusCode >= 500) {
    logger.error(message, {
      path: req.originalUrl,
      method: req.method,
      error: err instanceof Error ? err.stack : err,
    });
  } else {
    logger.warn(message, { path: req.originalUrl, method: req.method, statusCode });
  }

  res.status(statusCode).json(ApiResponse.error(message, errors));
}
