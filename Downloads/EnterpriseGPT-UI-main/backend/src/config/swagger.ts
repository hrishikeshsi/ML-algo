import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { env } from './env';

const isTs = __filename.endsWith('.ts');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'EnterpriseGPT Backend API',
      version: '1.0.0',
      description:
        'Secure middleware API between the EnterpriseGPT frontend and the Purple Fabric AI Agent. ' +
        'Handles authentication, conversation/message persistence, audit logging and Purple Fabric integration.',
      contact: { name: 'EnterpriseGPT Engineering' },
    },
    servers: [{ url: `http://localhost:${env.port}${env.apiPrefix}`, description: 'Local' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object', nullable: true },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, '..', 'routes', `*.${isTs ? 'ts' : 'js'}`)],
};

export const swaggerSpec = swaggerJsdoc(options);
