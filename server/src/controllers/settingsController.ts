import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { dbGet, dbRun, dbAll } from '../config/database.js';

interface UserSettingsRow {
  user_id: string;
  email_notifications: number;
  push_notifications: number;
  reminder_hours: number;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export const getSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id || req.user!.uid;

    const row = await dbGet<UserSettingsRow>(
      `SELECT * FROM user_settings WHERE user_id = ?`,
      [userId]
    );

    if (!row) {
      // Return defaults
      res.status(200).json({
        userId,
        emailNotifications: true,
        pushNotifications: true,
        reminderHours: 24,
        theme: 'system',
        language: 'ar',
      });
      return;
    }

    res.status(200).json({
      userId: row.user_id,
      emailNotifications: Boolean(row.email_notifications),
      pushNotifications: Boolean(row.push_notifications),
      reminderHours: row.reminder_hours,
      theme: row.theme,
      language: row.language,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id || req.user!.uid;
    const { emailNotifications, pushNotifications, reminderHours, theme, language } = req.body;

    const emailVal = emailNotifications !== undefined ? (emailNotifications ? 1 : 0) : 1;
    const pushVal = pushNotifications !== undefined ? (pushNotifications ? 1 : 0) : 1;
    const reminderVal = Number.isInteger(reminderHours) ? Math.max(1, Math.min(168, Number(reminderHours))) : 24;
    const themeVal = typeof theme === 'string' ? theme.slice(0, 20) : 'system';
    const langVal = typeof language === 'string' ? language.slice(0, 10) : 'ar';
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO user_settings (user_id, email_notifications, push_notifications, reminder_hours, theme, language, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         email_notifications = excluded.email_notifications,
         push_notifications = excluded.push_notifications,
         reminder_hours = excluded.reminder_hours,
         theme = excluded.theme,
         language = excluded.language,
         updated_at = excluded.updated_at`,
      [userId, emailVal, pushVal, reminderVal, themeVal, langVal, now, now]
    );

    res.status(200).json({
      success: true,
      settings: {
        userId,
        emailNotifications: Boolean(emailVal),
        pushNotifications: Boolean(pushVal),
        reminderHours: reminderVal,
        theme: themeVal,
        language: langVal,
        updatedAt: now,
      },
      message: 'Settings updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getDueSoonTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id || req.user!.uid;
    const today = new Date().toISOString().split('T')[0];

    // Read user reminder hours
    const settings = await dbGet<UserSettingsRow>(
      `SELECT reminder_hours FROM user_settings WHERE user_id = ?`,
      [userId]
    );
    const reminderHours = settings?.reminder_hours || 24;
    const daysAhead = Math.max(1, Math.ceil(reminderHours / 24));

    // Calculate maximum due date filter
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + daysAhead);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const tasks = await dbAll<any>(
      `SELECT
        t.id,
        t.project_id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        p.name AS project_name
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = ?
         AND t.status != 'done'
         AND t.due_date IS NOT NULL
         AND t.due_date >= ?
         AND t.due_date <= ?
       ORDER BY t.due_date ASC`,
      [userId, today, maxDateStr]
    );

    res.status(200).json({
      dueSoonTasks: tasks.map((t) => ({
        id: t.id,
        projectId: t.project_id,
        projectName: t.project_name,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.due_date,
      })),
      count: tasks.length,
      reminderHours,
      thresholdDate: maxDateStr,
    });
  } catch (error) {
    next(error);
  }
};
