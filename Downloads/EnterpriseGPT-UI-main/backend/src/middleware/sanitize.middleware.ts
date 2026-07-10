import { NextFunction, Request, Response } from 'express';
import { sanitizeValue } from '../utils/sanitize';

/** Recursively strips HTML/script content from incoming body and query values (defense-in-depth against XSS). */
export function sanitizeRequest(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = sanitizeValue(req.query as Record<string, unknown>);
    Object.keys(req.query).forEach((key) => delete (req.query as Record<string, unknown>)[key]);
    Object.assign(req.query, sanitizedQuery);
  }

  next();
}
