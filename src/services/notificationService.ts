import { DueSoonTaskItem, Task } from '@/types';
import { DataService } from './dataStore';

const NOTIFIED_SESSION_KEY = 'taskflow_notified_task_ids';

function getNotifiedTaskIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(NOTIFIED_SESSION_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markTaskIdNotified(taskId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getNotifiedTaskIds();
    current.add(taskId);
    sessionStorage.setItem(NOTIFIED_SESSION_KEY, JSON.stringify(Array.from(current)));
  } catch {
    // Ignore storage issues
  }
}

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export const NotificationService = {
  getPermissionState(): PushPermissionState {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as PushPermissionState;
  },

  async requestPushPermission(): Promise<PushPermissionState> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const result = await Notification.requestPermission();
      return result as PushPermissionState;
    } catch {
      return 'denied';
    }
  },

  sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission !== 'granted') {
      return false;
    }
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return true;
    } catch (e) {
      console.warn('[NotificationService] Failed to trigger notification:', e);
      return false;
    }
  },

  sendTestNotification(isArabic: boolean = false): boolean {
    const title = isArabic ? 'تنبيه TaskFlow: اختبار الإشعارات الفورية' : 'TaskFlow Alert: Test Push Notification';
    const body = isArabic
      ? 'نظام الإشعارات المباشرة للمهام والمواعيد النهائية يعمل بكفاءة تامة.'
      : 'Real-time task deadline notifications and browser alerts are active.';
    return this.sendBrowserNotification(title, { body, tag: 'test-notification' });
  },

  async checkApproachingTasksAndNotify(isArabic: boolean = false): Promise<DueSoonTaskItem[]> {
    try {
      const dueTasks = await DataService.getDueSoonTasks();
      if (!dueTasks || dueTasks.length === 0) return [];

      const notifiedSet = getNotifiedTaskIds();
      const unnotified = dueTasks.filter((t) => !notifiedSet.has(t.id));

      if (unnotified.length > 0 && this.getPermissionState() === 'granted') {
        for (const task of unnotified) {
          const title = isArabic
            ? `اقتراب موعد تسليم: ${task.title}`
            : `Task Approaching Deadline: ${task.title}`;
          const body = isArabic
            ? `المشروع: ${task.projectName || 'TaskFlow'} | تاريخ الاستحقاق: ${task.dueDate}`
            : `Project: ${task.projectName || 'TaskFlow'} | Due: ${task.dueDate}`;

          this.sendBrowserNotification(title, {
            body,
            tag: `due-${task.id}`,
          });

          markTaskIdNotified(task.id);
        }
      }

      return dueTasks;
    } catch (err) {
      console.warn('[NotificationService] Could not check due tasks:', err);
      return [];
    }
  },
};
