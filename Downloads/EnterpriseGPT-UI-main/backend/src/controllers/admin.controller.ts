import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { logService } from '../services/log.service';
import { purpleFabricService } from '../services/purpleFabric.service';
import { checkDatabaseHealth } from '../database/prisma';

export const getLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const { logs, total } = await logService.listLogs(page, limit);
  res.status(200).json(ApiResponse.success({ logs, total, page, limit }));
});

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const [databaseHealthy, purpleFabricHealth] = await Promise.all([
    checkDatabaseHealth(),
    purpleFabricService.healthCheck(),
  ]);

  const isHealthy = databaseHealthy && purpleFabricHealth.status === 'ok';

  res.status(isHealthy ? 200 : 503).json(
    ApiResponse.success(
      {
        status: isHealthy ? 'ok' : 'degraded',
        database: databaseHealthy ? 'connected' : 'disconnected',
        purpleFabric: purpleFabricHealth,
        timestamp: new Date().toISOString(),
      },
      isHealthy ? 'Service is healthy' : 'Service is degraded'
    )
  );
});

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await logService.getStats();
  res.status(200).json(ApiResponse.success(stats));
});
