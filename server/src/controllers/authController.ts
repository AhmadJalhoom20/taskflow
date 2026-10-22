import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { dbGet, dbAll, dbRun } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { AuthenticatedRequest, UserProfile } from '../types/index.js';
import { getJwtSecret } from '../config/env.js';

interface DBUser {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  role: 'owner' | 'member' | 'trainee';
  created_at: string;
  updated_at: string;
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, displayName, role = 'member' } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new AppError(400, 'Valid email address is required.', 'VALIDATION_ERROR');
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new AppError(400, 'Password must be at least 8 characters.', 'VALIDATION_ERROR');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = typeof displayName === 'string' && displayName.trim().length > 0
      ? displayName.trim()
      : cleanEmail.split('@')[0];

    const validRole = ['owner', 'member', 'trainee'].includes(role) ? role : 'member';

    // Check if user already exists
    const existing = await dbGet<{ id: string }>('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      throw new AppError(409, 'An account with this email address already exists.', 'USER_ALREADY_EXISTS');
    }

    const userId = uuidv4();
    const now = new Date().toISOString();
    // High-security work factor: 12 bcrypt salt rounds
    const passwordHash = await bcrypt.hash(password, 12);

    await dbRun(
      `INSERT INTO users (id, email, password_hash, display_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, cleanEmail, passwordHash, cleanName, validRole, now, now]
    );

    const userProfile: UserProfile = {
      id: userId,
      uid: userId,
      email: cleanEmail,
      displayName: cleanName,
      role: validRole as any,
      createdAt: now,
    };

    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { userId, email: cleanEmail, role: validRole },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Account registered successfully in SQL database.',
      token,
      user: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required.', 'VALIDATION_ERROR');
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await dbGet<DBUser>(
      'SELECT id, email, password_hash, display_name, role, created_at FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (!user) {
      throw new AppError(401, 'Invalid email or password credentials.', 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError(401, 'Invalid email or password credentials.', 'INVALID_CREDENTIALS');
    }

    const userProfile: UserProfile = {
      id: user.id,
      uid: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      createdAt: user.created_at,
    };

    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Authentication successful.',
      token,
      user: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized session.', 'UNAUTHORIZED');
    }

    res.status(200).json({
      status: 'success',
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const listAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'owner') {
      throw new AppError(
        403,
        'Access denied: Only workspace owners can view the global user directory.',
        'FORBIDDEN'
      );
    }

    const rows = await dbAll<Omit<DBUser, 'password_hash'>>(
      'SELECT id, email, display_name, role, created_at FROM users ORDER BY display_name ASC'
    );

    const users: UserProfile[] = rows.map((u) => ({
      id: u.id,
      uid: u.id,
      email: u.email,
      displayName: u.display_name,
      role: u.role,
      createdAt: u.created_at,
    }));

    res.status(200).json({
      status: 'success',
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id || req.user!.uid;
    const { displayName } = req.body;

    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
      throw new AppError(400, 'Display name cannot be empty.', 'VALIDATION_ERROR');
    }

    const cleanName = displayName.trim();
    const now = new Date().toISOString();

    await dbRun(
      `UPDATE users SET display_name = ?, updated_at = ? WHERE id = ?`,
      [cleanName, now, userId]
    );

    const user = await dbGet<DBUser>(
      'SELECT id, email, display_name, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new AppError(404, 'User not found.', 'NOT_FOUND');
    }

    const updatedProfile: UserProfile = {
      id: user.id,
      uid: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      createdAt: user.created_at,
    };

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      user: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id || req.user!.uid;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError(400, 'Both current and new passwords are required.', 'VALIDATION_ERROR');
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      throw new AppError(400, 'New password must be at least 8 characters.', 'VALIDATION_ERROR');
    }

    const user = await dbGet<DBUser>(
      'SELECT id, password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new AppError(404, 'User not found.', 'NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new AppError(400, 'Current password is incorrect.', 'INVALID_PASSWORD');
    }

    const now = new Date().toISOString();
    const newHash = await bcrypt.hash(newPassword, 12);

    await dbRun(
      `UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`,
      [newHash, now, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id || req.user!.uid;

    await dbRun(`DELETE FROM users WHERE id = ?`, [userId]);

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
