import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(3, 'Project name must be at least 3 characters').max(80, 'Project name must not exceed 80 characters'),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional().default(''),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(3, 'Project name must be at least 3 characters').max(80, 'Project name must not exceed 80 characters').optional(),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional(),
});

export const addMemberSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, 'Task title must be at least 3 characters').max(120, 'Task title must not exceed 120 characters'),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional().default(''),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assigneeId: z.string().nullable().optional().default(null),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').nullable().optional().default(null),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(3, 'Task title must be at least 3 characters').max(120, 'Task title must not exceed 120 characters').optional(),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').nullable().optional(),
});
