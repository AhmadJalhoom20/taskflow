import { Request } from 'express';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type UserRole = 'owner' | 'member' | 'trainee';

export interface UserProfile {
  id: string;
  uid: string; // compatibility alias for frontend
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface ProjectMemberDetail {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: 'owner' | 'member' | 'trainee';
  joinedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  memberDetails?: Record<string, ProjectMemberDetail>;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  createdBy: string;
  creatorName?: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export interface AuthTokens {
  token: string;
  user: UserProfile;
}
