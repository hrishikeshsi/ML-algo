import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../utils/appError';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized('Authentication is required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden('You do not have permission to perform this action'));
      return;
    }

    next();
  };
}
