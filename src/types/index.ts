export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type UserRole = 'owner' | 'member' | 'trainee';

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  role?: UserRole;
  createdAt: string;
}

export interface ProjectMemberDetail {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  role: 'owner' | 'member' | 'trainee';
  joinedAt?: string;
}

export interface Project {
  id: string;
  name: string; // 3-80 characters
  description?: string; // max 1000 characters
  ownerId: string;
  memberIds: string[]; // includes ownerId
  memberDetails?: Record<string, ProjectMemberDetail>;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string; // 3-120 characters
  description?: string; // max 1000 characters
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  createdBy: string;
  creatorName?: string | null;
  dueDate: string | null; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface CompletionTrendPoint {
  date: string;
  day: string;
  completed: number;
  created: number;
}

export interface DashboardMetrics {
  totalProjects: number;
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  overdueCount: number;
  completionTrends?: CompletionTrendPoint[];
}

export interface UserSettings {
  userId?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderHours: number;
  theme?: string;
  language?: string;
  updatedAt?: string;
}

export interface DueSoonTaskItem {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}
