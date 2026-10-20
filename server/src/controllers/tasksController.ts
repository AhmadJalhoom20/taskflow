import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest, Task } from '../types/index.js';
import { dbAll, dbGet, dbRun } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { createTaskSchema, updateTaskSchema } from '../validators/schemas.js';

interface DBTaskRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  assignee_name: string | null;
  assignee_email: string | null;
  creator_name: string | null;
}

function mapRowToTask(row: DBTaskRow): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    assigneeId: row.assignee_id,
    assigneeName: row.assignee_name,
    assigneeEmail: row.assignee_email,
    createdBy: row.created_by,
    creatorName: row.creator_name,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const listTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    const userId = req.user!.id || req.user!.uid;

    const project = await dbGet<{ id: string; owner_id: string }>(
      `SELECT id, owner_id FROM projects WHERE id = ?`,
      [projectId]
    );

    if (!project) {
      throw new AppError(404, 'Project not found in SQL database.', 'NOT_FOUND');
    }

    const membership = await dbGet<{ user_id: string }>(
      `SELECT user_id FROM project_members WHERE project_id = ? AND user_id = ?`,
      [projectId, userId]
    );

    if (!membership && project.owner_id !== userId) {
      throw new AppError(403, 'Access denied: You are not a member of this project.', 'FORBIDDEN');
    }

    const rows = await dbAll<DBTaskRow>(
      `SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
              t.assignee_id, t.created_by, t.due_date, t.created_at, t.updated_at,
              ua.display_name AS assignee_name, ua.email AS assignee_email,
              uc.display_name AS creator_name
       FROM tasks t
       LEFT JOIN users ua ON t.assignee_id = ua.id
       LEFT JOIN users uc ON t.created_by = uc.id
       WHERE t.project_id = ?
       ORDER BY t.created_at DESC`,
      [projectId]
    );

    const tasks: Task[] = rows.map(mapRowToTask);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    const user = req.user!;
    const userId = user.id || user.uid;
    const validated = createTaskSchema.parse(req.body);

    const project = await dbGet<{ id: string; owner_id: string }>(
      `SELECT id, owner_id FROM projects WHERE id = ?`,
      [projectId]
    );

    if (!project) {
      throw new AppError(404, 'Project not found.', 'NOT_FOUND');
    }

    const membership = await dbGet<{ user_id: string }>(
      `SELECT user_id FROM project_members WHERE project_id = ? AND user_id = ?`,
      [projectId, userId]
    );

    if (!membership && project.owner_id !== userId) {
      throw new AppError(403, 'Access denied: You are not a member of this project.', 'FORBIDDEN');
    }

    let assigneeId: string | null = null;
    let assigneeName: string | null = null;
    let assigneeEmail: string | null = null;

    if (validated.assigneeId) {
      const targetUser = await dbGet<{ id: string; display_name: string; email: string }>(
        `SELECT u.id, u.display_name, u.email
         FROM users u
         INNER JOIN project_members pm ON u.id = pm.user_id
         WHERE pm.project_id = ? AND (u.id = ? OR u.email = ?)`,
        [projectId, validated.assigneeId, validated.assigneeId]
      );

      if (!targetUser) {
        throw new AppError(400, 'Assignee must be an active member of this project.', 'INVALID_ASSIGNEE');
      }

      assigneeId = targetUser.id;
      assigneeName = targetUser.display_name;
      assigneeEmail = targetUser.email;
    }

    const taskId = uuidv4();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, created_by, due_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        taskId,
        projectId,
        validated.title,
        validated.description || '',
        validated.status,
        validated.priority,
        assigneeId,
        userId,
        validated.dueDate || null,
        now,
        now,
      ]
    );

    const newTask: Task = {
      id: taskId,
      projectId,
      title: validated.title,
      description: validated.description || '',
      status: validated.status,
      priority: validated.priority,
      assigneeId,
      assigneeName,
      assigneeEmail,
      createdBy: userId,
      creatorName: user.displayName,
      dueDate: validated.dueDate || null,
      createdAt: now,
      updatedAt: now,
    };

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: projectId, taskId } = req.params;
    const user = req.user!;
    const userId = user.id || user.uid;
    const validated = updateTaskSchema.parse(req.body);

    const project = await dbGet<{ id: string; owner_id: string }>(
      `SELECT id, owner_id FROM projects WHERE id = ?`,
      [projectId]
    );

    if (!project) {
      throw new AppError(404, 'Project not found.', 'NOT_FOUND');
    }

    const task = await dbGet<{ id: string; project_id: string; created_by: string; assignee_id: string | null }>(
      `SELECT id, project_id, created_by, assignee_id FROM tasks WHERE id = ? AND project_id = ?`,
      [taskId, projectId]
    );

    if (!task) {
      throw new AppError(404, 'Task not found in this project.', 'NOT_FOUND');
    }

    const isOwner = project.owner_id === userId;
    const isCreator = task.created_by === userId;
    const isAssignee = task.assignee_id === userId;

    if (!isOwner && !isCreator && !isAssignee) {
      throw new AppError(403, 'Unauthorized: Only project owners, task creators, or assignees can edit this task.', 'FORBIDDEN');
    }

    // Assignees who are not owners or creators are strictly restricted to updating status only
    if (isAssignee && !isOwner && !isCreator) {
      const hasForbiddenField = [
        validated.title !== undefined,
        validated.description !== undefined,
        validated.priority !== undefined,
        validated.dueDate !== undefined,
        validated.assigneeId !== undefined,
      ].some(Boolean);

      if (hasForbiddenField) {
        throw new AppError(
          403,
          'Unauthorized: Assignees are only permitted to update task status.',
          'FORBIDDEN'
        );
      }
    }

    const now = new Date().toISOString();
    const updates: string[] = ['updated_at = ?'];
    const params: any[] = [now];

    if (validated.title !== undefined) {
      updates.push('title = ?');
      params.push(validated.title);
    }
    if (validated.description !== undefined) {
      updates.push('description = ?');
      params.push(validated.description);
    }
    if (validated.status !== undefined) {
      updates.push('status = ?');
      params.push(validated.status);
    }
    if (validated.priority !== undefined) {
      updates.push('priority = ?');
      params.push(validated.priority);
    }
    if (validated.dueDate !== undefined) {
      updates.push('due_date = ?');
      params.push(validated.dueDate || null);
    }

    if (validated.assigneeId !== undefined) {
      if (validated.assigneeId) {
        const targetUser = await dbGet<{ id: string }>(
          `SELECT u.id
           FROM users u
           INNER JOIN project_members pm ON u.id = pm.user_id
           WHERE pm.project_id = ? AND (u.id = ? OR u.email = ?)`,
          [projectId, validated.assigneeId, validated.assigneeId]
        );
        if (!targetUser) {
          throw new AppError(400, 'Assignee must be an active project member.', 'INVALID_ASSIGNEE');
        }
        updates.push('assignee_id = ?');
        params.push(targetUser.id);
      } else {
        updates.push('assignee_id = ?');
        params.push(null);
      }
    }

    params.push(taskId, projectId);
    await dbRun(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND project_id = ?`, params);

    // Fetch updated task
    const updatedRow = await dbGet<DBTaskRow>(
      `SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
              t.assignee_id, t.created_by, t.due_date, t.created_at, t.updated_at,
              ua.display_name AS assignee_name, ua.email AS assignee_email,
              uc.display_name AS creator_name
       FROM tasks t
       LEFT JOIN users ua ON t.assignee_id = ua.id
       LEFT JOIN users uc ON t.created_by = uc.id
       WHERE t.id = ? AND t.project_id = ?`,
      [taskId, projectId]
    );

    res.status(200).json(mapRowToTask(updatedRow!));
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: projectId, taskId } = req.params;
    const user = req.user!;
    const userId = user.id || user.uid;

    const project = await dbGet<{ id: string; owner_id: string }>(
      `SELECT id, owner_id FROM projects WHERE id = ?`,
      [projectId]
    );

    if (!project) {
      throw new AppError(404, 'Project not found.', 'NOT_FOUND');
    }

    const task = await dbGet<{ id: string; created_by: string }>(
      `SELECT id, created_by FROM tasks WHERE id = ? AND project_id = ?`,
      [taskId, projectId]
    );

    if (!task) {
      throw new AppError(404, 'Task not found in this project.', 'NOT_FOUND');
    }

    const isOwner = project.owner_id === userId;
    const isCreator = task.created_by === userId;

    if (!isOwner && !isCreator) {
      throw new AppError(403, 'Unauthorized: Only project owners or task creators can delete this task.', 'FORBIDDEN');
    }

    await dbRun(`DELETE FROM tasks WHERE id = ? AND project_id = ?`, [taskId, projectId]);

    res.status(200).json({
      message: 'Task deleted successfully from SQL database.',
      taskId,
    });
  } catch (error) {
    next(error);
  }
};
