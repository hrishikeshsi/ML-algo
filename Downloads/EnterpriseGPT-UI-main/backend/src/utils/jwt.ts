import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { AppError } from './appError';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as SignOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.jwt.secret) as AccessTokenPayload;
  } catch {
    throw AppError.unauthorized('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }
}
