import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './database/prisma';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.port, () => {
    logger.info(`EnterpriseGPT backend listening on port ${env.port} (${env.nodeEnv})`);
    logger.info(`API docs available at http://localhost:${env.port}${env.apiPrefix}/docs`);
  });

  const shutdown = (signal: string): void => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(() => {
      disconnectDatabase()
        .catch((error) => logger.error('Error while disconnecting database', { error }))
        .finally(() => process.exit(0));
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap application', error);
  process.exit(1);
});
