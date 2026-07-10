import { ApiLog, Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';

export interface ApiLogListOptions {
  page: number;
  limit: number;
}

export const apiLogRepository = {
  create(data: Prisma.ApiLogCreateInput): Promise<ApiLog> {
    return prisma.apiLog.create({ data });
  },

  async list({ page, limit }: ApiLogListOptions): Promise<{ logs: ApiLog[]; total: number }> {
    const [logs, total] = await Promise.all([
      prisma.apiLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.apiLog.count(),
    ]);

    return { logs, total };
  },

  countSince(since: Date): Promise<number> {
    return prisma.apiLog.count({ where: { createdAt: { gte: since } } });
  },

  averageExecutionTimeSince(since: Date): Promise<number | null> {
    return prisma.apiLog
      .aggregate({ where: { createdAt: { gte: since } }, _avg: { executionTime: true } })
      .then((result) => result._avg.executionTime);
  },

  countErrorsSince(since: Date): Promise<number> {
    return prisma.apiLog.count({ where: { createdAt: { gte: since }, statusCode: { gte: 400 } } });
  },
};
