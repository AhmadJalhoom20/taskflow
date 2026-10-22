import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { dbGet, dbAll } from '../config/database.js';

interface MetricsAgg {
  total_projects: number;
  total_tasks: number;
  todo_count: number;
  in_progress_count: number;
  done_count: number;
  overdue_count: number;
}

interface TrendRow {
  log_date: string;
  count: number;
}

export const getMetrics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id || req.user!.uid;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 1. Overall Aggregations
    const agg = await dbGet<MetricsAgg>(
      `SELECT
        COUNT(DISTINCT p.id) AS total_projects,
        COUNT(t.id) AS total_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END), 0) AS todo_count,
        COALESCE(SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END), 0) AS in_progress_count,
        COALESCE(SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END), 0) AS done_count,
        COALESCE(SUM(CASE WHEN t.status != 'done' AND t.due_date IS NOT NULL AND t.due_date < ? THEN 1 ELSE 0 END), 0) AS overdue_count
       FROM project_members pm
       JOIN projects p ON pm.project_id = p.id
       LEFT JOIN tasks t ON p.id = t.project_id
       WHERE pm.user_id = ?`,
      [todayStr, userId]
    );

    // 2. Calculate Last 7 Days Date Series
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dateMap = new Map<string, { date: string; day: string; completed: number; created: number }>();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];
      dateMap.set(isoDate, { date: isoDate, day: dayName, completed: 0, created: 0 });
    }

    const startDateStr = Array.from(dateMap.keys())[0];

    // 3. Query Completed Tasks Grouped by Date (using updated_at when status='done')
    const completedRows = await dbAll<TrendRow>(
      `SELECT
        substr(t.updated_at, 1, 10) AS log_date,
        COUNT(t.id) AS count
       FROM tasks t
       JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = ?
         AND t.status = 'done'
         AND substr(t.updated_at, 1, 10) >= ?
       GROUP BY substr(t.updated_at, 1, 10)`,
      [userId, startDateStr]
    );

    for (const row of completedRows) {
      if (dateMap.has(row.log_date)) {
        dateMap.get(row.log_date)!.completed = Number(row.count) || 0;
      }
    }

    // 4. Query Created Tasks Grouped by Date
    const createdRows = await dbAll<TrendRow>(
      `SELECT
        substr(t.created_at, 1, 10) AS log_date,
        COUNT(t.id) AS count
       FROM tasks t
       JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = ?
         AND substr(t.created_at, 1, 10) >= ?
       GROUP BY substr(t.created_at, 1, 10)`,
      [userId, startDateStr]
    );

    for (const row of createdRows) {
      if (dateMap.has(row.log_date)) {
        dateMap.get(row.log_date)!.created = Number(row.count) || 0;
      }
    }

    const completionTrends = Array.from(dateMap.values());

    res.status(200).json({
      totalProjects: agg?.total_projects || 0,
      totalTasks: agg?.total_tasks || 0,
      todoCount: agg?.todo_count || 0,
      inProgressCount: agg?.in_progress_count || 0,
      doneCount: agg?.done_count || 0,
      overdueCount: agg?.overdue_count || 0,
      completionTrends,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
