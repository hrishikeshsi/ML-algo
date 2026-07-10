import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiResponse } from '../utils/apiResponse';

export const generalRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(ApiResponse.error('Too many requests, please try again later.'));
  },
});

export const authRateLimiter = rateLimit({
  windowMs: env.rateLimit.authWindowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(ApiResponse.error('Too many authentication attempts, please try again later.'));
  },
});
