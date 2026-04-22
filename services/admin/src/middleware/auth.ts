import type { Request, Response, NextFunction } from 'express';
import { getConfig } from '../shared/config.js';
import { UnauthorizedError } from '../shared/errors.js';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user?: AuthUser;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or invalid authorization header'));
    return;
  }

  const token = authHeader.substring(7);
  const config = getConfig();

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    (req as RequestWithUser).user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
