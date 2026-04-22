import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { getConfig } from '../shared/config.js';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

export function generateToken(userId: string, email: string): string {
  const config = getConfig();
  return sign({ userId, email }, config.JWT_SECRET, {
    expiresIn: '24h',
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const config = getConfig();
    const decoded = verify(token, config.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
