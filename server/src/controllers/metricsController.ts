import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { dbGet } from '../config/database.js';

interface MetricsAgg {
  total_projects: number;
  total_tasks: number;
  todo_count: number;
  in_progress_count: number;
  done_count: number;
  overdue_count: number;
}

export const getMetrics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id || req.user!.uid;
    const todayStr = new Date().toISOString().split('T')[0];

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

    res.status(200).json({
      totalProjects: agg?.total_projects || 0,
      totalTasks: agg?.total_tasks || 0,
      todoCount: agg?.todo_count || 0,
      inProgressCount: agg?.in_progress_count || 0,
      doneCount: agg?.done_count || 0,
      overdueCount: agg?.overdue_count || 0,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
