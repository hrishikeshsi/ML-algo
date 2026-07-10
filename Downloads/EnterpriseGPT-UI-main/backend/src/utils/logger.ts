import path from 'path';
import winston from 'winston';
import { env } from '../config/env';

const logsDir = path.join(process.cwd(), 'logs');

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

const fileFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

export const logger = winston.createLogger({
  level: env.logLevel,
  transports: [
    new winston.transports.Console({ format: consoleFormat, silent: env.isTest }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      silent: env.isTest,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      silent: env.isTest,
    }),
  ],
  exitOnError: false,
});

export const httpLogger = winston.createLogger({
  level: 'http',
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      format: fileFormat,
      silent: env.isTest,
    }),
  ],
});
