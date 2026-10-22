import {
  Project,
  Task,
  UserProfile,
  DashboardMetrics,
  TaskStatus,
  UserSettings,
  DueSoonTaskItem,
} from '@/types';
import { apiRequest, getApiBaseUrl } from '@/lib/api';

interface HealthCheckResult {
  connected: boolean;
  backendUrl: string;
  engine: string;
  database?: {
    type: string;
    status: string;
    tablesCount: number;
  };
  version?: string;
  security?: {
    helmet: boolean;
    rateLimiter: string | boolean;
    hsts?: string;
    frameGuard?: string;
    authProtocols?: string[];
  };
  uptime?: number;
  timestamp?: string;
}

export const DataService = {
  // ==========================================
  // SYSTEM HEALTH & SQL ENGINE STATUS
  // ==========================================
  async checkBackendHealth(): Promise<HealthCheckResult> {
    const url = getApiBaseUrl();
    try {
      const res = await apiRequest<any>('/health');
      return {
        connected: true,
        backendUrl: url,
        engine: res.engine || 'TaskFlow Standalone SQL Service',
        database: res.database,
        version: res.version || '3.0.0',
        security: res.security,
        uptime: res.uptimeSeconds,
        timestamp: res.timestamp,
      };
    } catch {
      return {
        connected: false,
        backendUrl: url,
        engine: 'TaskFlow Standalone SQL Service (Unreachable)',
      };
    }
  },

  setEngineMode(mode: 'auto' | 'backend' | 'direct_sql') {
    if (typeof window === 'undefined') return;
    localStorage.setItem('taskflow_engine_mode', mode);
  },

  getEngineMode(): 'auto' | 'backend' | 'direct_sql' {
    if (typeof window === 'undefined') return 'auto';
    return (localStorage.getItem('taskflow_engine_mode') as any) || 'backend';
  },

  // ==========================================
  // USERS
  // ==========================================
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const res = await apiRequest<{ users: UserProfile[] }>('/auth/users');
      const found = res.users.find((u) => u.id === uid || u.uid === uid);
      return found || null;
    } catch {
      return null;
    }
  },

  async findUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await apiRequest<{ users: UserProfile[] }>('/auth/users');
      const found = res.users.find((u) => u.email.toLowerCase() === cleanEmail);
      return found || null;
    } catch {
      return null;
    }
  },

  async saveUserProfile(_profile: UserProfile): Promise<void> {
    // Handled natively on the backend via Auth register/update
  },

  // ==========================================
  // PROJECTS (Pure SQL via REST API)
  // ==========================================
  async getAccessibleProjects(_userId: string): Promise<Project[]> {
    return apiRequest<Project[]>('/projects', { method: 'GET' });
  },

  async getProjectById(projectId: string, _userId: string): Promise<Project | null> {
    return apiRequest<Project>(`/projects/${projectId}`, { method: 'GET' });
  },

  async createProject(name: string, description: string, _user: UserProfile): Promise<Project> {
    const trimmedName = name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 80) {
      throw new Error('Project name must be between 3 and 80 characters.');
    }
    if (description && description.length > 1000) {
      throw new Error('Description cannot exceed 1000 characters.');
    }

    return apiRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name: trimmedName, description }),
    });
  },

  async updateProject(
    projectId: string,
    name: string,
    description: string,
    _userId: string
  ): Promise<Project> {
    const trimmedName = name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 80) {
      throw new Error('Project name must be between 3 and 80 characters.');
    }
    if (description && description.length > 1000) {
      throw new Error('Description cannot exceed 1000 characters.');
    }

    return apiRequest<Project>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: trimmedName, description }),
    });
  },

  async deleteProject(projectId: string, _userId: string): Promise<void> {
    await apiRequest<{ message: string }>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  async addProjectMember(
    projectId: string,
    memberEmail: string,
    _userId: string,
    role: string = 'member'
  ): Promise<Project> {
    await apiRequest<any>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email: memberEmail, role }),
    });

    const updated = await this.getProjectById(projectId, _userId);
    if (!updated) throw new Error('Failed to retrieve updated project after adding member.');
    return updated;
  },

  async updateProjectMemberRole(
    projectId: string,
    targetMemberId: string,
    role: string,
    _userId: string
  ): Promise<Project> {
    await apiRequest<any>(`/projects/${projectId}/members/${targetMemberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });

    const updated = await this.getProjectById(projectId, _userId);
    if (!updated) throw new Error('Failed to retrieve updated project after changing member role.');
    return updated;
  },

  async removeProjectMember(projectId: string, targetMemberId: string, _userId: string): Promise<Project> {
    await apiRequest<any>(`/projects/${projectId}/members/${targetMemberId}`, {
      method: 'DELETE',
    });

    const updated = await this.getProjectById(projectId, _userId);
    if (!updated) throw new Error('Failed to retrieve updated project after removing member.');
    return updated;
  },

  // ==========================================
  // TASKS (Pure SQL via REST API)
  // ==========================================
  async getProjectTasks(projectId: string, _userId: string): Promise<Task[]> {
    return apiRequest<Task[]>(`/projects/${projectId}/tasks`, {
      method: 'GET',
    });
  },

  async createTask(
    projectId: string,
    data: {
      title: string;
      description?: string;
      status: TaskStatus;
      priority: 'low' | 'medium' | 'high';
      assigneeId?: string | null;
      dueDate?: string | null;
    },
    _user: UserProfile
  ): Promise<Task> {
    const trimmedTitle = data.title?.trim() || '';
    if (trimmedTitle.length < 3 || trimmedTitle.length > 120) {
      throw new Error('Task title is required and must be between 3 and 120 characters.');
    }
    if (data.description && data.description.length > 1000) {
      throw new Error('Description cannot exceed 1000 characters.');
    }

    return apiRequest<Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(
    projectId: string,
    taskId: string,
    updates: Partial<Task>,
    _user: UserProfile
  ): Promise<Task> {
    if (updates.title && (updates.title.trim().length < 3 || updates.title.trim().length > 120)) {
      throw new Error('Task title must be between 3 and 120 characters.');
    }

    return apiRequest<Task>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(projectId: string, taskId: string, _user: UserProfile): Promise<void> {
    await apiRequest<{ message: string }>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // DASHBOARD METRICS (Pure SQL Aggregation)
  // ==========================================
  async getDashboardMetrics(_userId: string): Promise<DashboardMetrics> {
    return apiRequest<DashboardMetrics>('/metrics', {
      method: 'GET',
    });
  },

  // ==========================================
  // SETTINGS & NOTIFICATIONS
  // ==========================================
  async getUserSettings(): Promise<UserSettings> {
    try {
      return await apiRequest<UserSettings>('/settings', { method: 'GET' });
    } catch {
      return {
        emailNotifications: true,
        pushNotifications: true,
        reminderHours: 24,
      };
    }
  },

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const res = await apiRequest<{ success: boolean; settings: UserSettings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return res.settings;
  },

  async getDueSoonTasks(): Promise<DueSoonTaskItem[]> {
    try {
      const res = await apiRequest<{ dueSoonTasks: DueSoonTaskItem[] }>(
        '/settings/notifications/due-soon',
        { method: 'GET' }
      );
      return res.dueSoonTasks || [];
    } catch {
      return [];
    }
  },

  // ==========================================
  // ACCOUNT & CREDENTIALS
  // ==========================================
  async updateUserProfile(displayName: string): Promise<{ user: UserProfile }> {
    return apiRequest<{ user: UserProfile }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ displayName }),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async deleteAccount(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/account', {
      method: 'DELETE',
    });
  },
};
