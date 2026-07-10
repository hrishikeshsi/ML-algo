import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: env.isProduction ? ['error', 'warn'] : ['warn', 'error'],
  });
}

// Reuse a single PrismaClient instance across module reloads (important in dev/test to avoid
// exhausting the Postgres connection pool).
export const prisma: PrismaClient = global.__prisma__ ?? createPrismaClient();

if (!env.isProduction) {
  global.__prisma__ = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('Database connection established');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database connection closed');
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error: error instanceof Error ? error.message : error });
    return false;
  }
}
