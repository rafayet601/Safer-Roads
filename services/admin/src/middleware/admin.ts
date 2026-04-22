import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../shared/errors.js';
import type { RequestWithUser } from './auth.js';

/**
 * Middleware to check if the authenticated user has admin role
 * Returns 403 Forbidden if user is not an admin
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const user = (req as RequestWithUser).user;

  if (!user) {
    next(new ForbiddenError('Authentication required'));
    return;
  }

  if (user.role !== 'admin') {
    next(new ForbiddenError('Admin access required'));
    return;
  }

  next();
}
