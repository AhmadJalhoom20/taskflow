import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, UserProfile } from '../types/index.js';
import { dbGet } from '../config/database.js';
import { AppError } from './errorHandler.js';
import { getJwtSecret } from '../config/env.js';

interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        401,
        'Authentication required. Provide Authorization: Bearer <token> header.',
        'UNAUTHORIZED'
      );
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new AppError(
        401,
        'Authentication required. Bearer token is empty.',
        'UNAUTHORIZED'
      );
    }

    const jwtSecret = getJwtSecret();

    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    } catch {
      throw new AppError(
        401,
        'Invalid or expired authentication token. Please sign in again.',
        'INVALID_TOKEN'
      );
    }

    interface DBUser {
      id: string;
      email: string;
      display_name: string;
      role: 'owner' | 'member' | 'trainee';
      created_at: string;
    }

    const user = await dbGet<DBUser>(
      'SELECT id, email, display_name, role, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      throw new AppError(
        401,
        'User account associated with this session does not exist in the SQL database.',
        'USER_NOT_FOUND'
      );
    }

    req.user = {
      id: user.id,
      uid: user.id, // compatibility alias
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      createdAt: user.created_at,
    };

    next();
  } catch (error) {
    next(error);
  }
};
