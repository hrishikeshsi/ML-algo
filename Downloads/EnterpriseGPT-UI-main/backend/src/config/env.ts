import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(20).default(12),

  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  PASSWORD_RESET_URL: z.string().default('http://localhost:5173/reset-password'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  SMTP_USER: z.string().default(''),
  SMTP_PASSWORD: z.string().default(''),
  SMTP_FROM_NAME: z.string().default('EnterpriseGPT'),
  SMTP_FROM_EMAIL: z.string().default('no-reply@enterprisegpt.local'),

  PURPLE_FABRIC_ENDPOINT: z.string().url('PURPLE_FABRIC_ENDPOINT must be a valid URL'),
  PURPLE_FABRIC_TENANT: z.string().min(1),
  PURPLE_FABRIC_API_KEY: z.string().min(1, 'PURPLE_FABRIC_API_KEY is required'),
  PURPLE_FABRIC_USERNAME: z.string().min(1),
  PURPLE_FABRIC_PASSWORD: z.string().min(1),
  PURPLE_FABRIC_WORKSPACE_ID: z.string().min(1),
  PURPLE_FABRIC_ASSET_VERSION_ID: z.string().min(1),
  PURPLE_FABRIC_AGENT_NAME: z.string().default('EnterpriseGPT Agent'),
  PURPLE_FABRIC_API_VERSION: z.string().default('v1'),
  PURPLE_FABRIC_APP: z.string().default('magicplatform'),
  PURPLE_FABRIC_TOKEN_REFRESH_BUFFER_MS: z.coerce.number().int().positive().default(30000),
  PURPLE_FABRIC_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  PURPLE_FABRIC_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(1500),
  PURPLE_FABRIC_POLL_MAX_ATTEMPTS: z.coerce.number().int().positive().default(40),
});

type EnvShape = z.infer<typeof envSchema>;

function parseEnv(): EnvShape {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    // eslint-disable-next-line no-console
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
  }

  return parsed.data;
}

const parsedEnv = parseEnv();

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  isProduction: parsedEnv.NODE_ENV === 'production',
  isTest: parsedEnv.NODE_ENV === 'test',
  port: parsedEnv.PORT,
  apiPrefix: parsedEnv.API_PREFIX,
  logLevel: parsedEnv.LOG_LEVEL,

  corsOrigins: parsedEnv.CORS_ORIGIN.split(',').map((origin) => origin.trim()),

  databaseUrl: parsedEnv.DATABASE_URL,

  jwt: {
    secret: parsedEnv.JWT_SECRET,
    expiresIn: parsedEnv.JWT_EXPIRES_IN,
    refreshSecret: parsedEnv.JWT_REFRESH_SECRET,
    refreshExpiresIn: parsedEnv.JWT_REFRESH_EXPIRES_IN,
  },

  bcryptSaltRounds: parsedEnv.BCRYPT_SALT_ROUNDS,

  passwordReset: {
    tokenTtlMinutes: parsedEnv.PASSWORD_RESET_TOKEN_TTL_MINUTES,
    resetUrl: parsedEnv.PASSWORD_RESET_URL,
  },

  rateLimit: {
    windowMs: parsedEnv.RATE_LIMIT_WINDOW_MS,
    max: parsedEnv.RATE_LIMIT_MAX,
    authWindowMs: parsedEnv.AUTH_RATE_LIMIT_WINDOW_MS,
    authMax: parsedEnv.AUTH_RATE_LIMIT_MAX,
  },

  smtp: {
    host: parsedEnv.SMTP_HOST,
    port: parsedEnv.SMTP_PORT,
    secure: parsedEnv.SMTP_SECURE,
    user: parsedEnv.SMTP_USER,
    password: parsedEnv.SMTP_PASSWORD,
    fromName: parsedEnv.SMTP_FROM_NAME,
    fromEmail: parsedEnv.SMTP_FROM_EMAIL,
  },

  purpleFabric: {
    endpoint: parsedEnv.PURPLE_FABRIC_ENDPOINT.replace(/\/+$/, ''),
    tenant: parsedEnv.PURPLE_FABRIC_TENANT,
    apiKey: parsedEnv.PURPLE_FABRIC_API_KEY,
    username: parsedEnv.PURPLE_FABRIC_USERNAME,
    password: parsedEnv.PURPLE_FABRIC_PASSWORD,
    workspaceId: parsedEnv.PURPLE_FABRIC_WORKSPACE_ID,
    assetVersionId: parsedEnv.PURPLE_FABRIC_ASSET_VERSION_ID,
    agentName: parsedEnv.PURPLE_FABRIC_AGENT_NAME,
    apiVersion: parsedEnv.PURPLE_FABRIC_API_VERSION,
    app: parsedEnv.PURPLE_FABRIC_APP,
    tokenRefreshBufferMs: parsedEnv.PURPLE_FABRIC_TOKEN_REFRESH_BUFFER_MS,
    timeoutMs: parsedEnv.PURPLE_FABRIC_TIMEOUT_MS,
    pollIntervalMs: parsedEnv.PURPLE_FABRIC_POLL_INTERVAL_MS,
    pollMaxAttempts: parsedEnv.PURPLE_FABRIC_POLL_MAX_ATTEMPTS,
  },
} as const;

export type Env = typeof env;
