import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { sanitizeRequest } from './middleware/sanitize.middleware';
import { requestLogger } from './middleware/requestLogger.middleware';
import { generalRateLimiter } from './middleware/rateLimiter.middleware';
import { notFoundHandler, globalErrorHandler } from './middleware/error.middleware';
import { ApiResponse } from './utils/apiResponse';

export function createApp(): Application {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(sanitizeRequest);
  app.use(requestLogger);
  app.use(generalRateLimiter);

  app.get('/', (_req, res) => {
    res.status(200).json(ApiResponse.success({ name: 'EnterpriseGPT Backend API', version: '1.0.0' }));
  });

  app.use(`${env.apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get(`${env.apiPrefix}/docs.json`, (_req, res) => res.json(swaggerSpec));

  app.use(env.apiPrefix, routes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
