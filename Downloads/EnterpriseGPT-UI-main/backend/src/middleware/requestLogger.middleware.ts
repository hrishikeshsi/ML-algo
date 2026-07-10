import { NextFunction, Request, Response } from 'express';
import { httpLogger } from '../utils/logger';
import { logService } from '../services/log.service';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    httpLogger.log('http', `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`);

    void logService.recordApiLog({
      endpoint: req.originalUrl,
      method: req.method,
      request: req.body,
      statusCode: res.statusCode,
      executionTime: Math.round(durationMs),
      userId: req.user?.id,
    });
  });

  next();
}
