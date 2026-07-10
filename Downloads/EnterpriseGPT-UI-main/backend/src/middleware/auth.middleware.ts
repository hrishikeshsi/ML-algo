import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError';
import { verifyAccessToken } from '../utils/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(AppError.unauthorized('Authentication token is missing'));
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    next(AppError.unauthorized('Authentication token is missing'));
    return;
  }

  const payload = verifyAccessToken(token);

  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    organizationId: payload.organizationId,
  };

  next();
}
