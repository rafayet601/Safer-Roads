import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getConfig } from '../shared/config.js';
import { UnauthorizedError } from '../shared/errors.js';
import type { RequestWithUser } from '../shared/types.js';

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
    };

    (req as RequestWithUser).user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
