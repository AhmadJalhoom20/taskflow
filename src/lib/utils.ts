import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaskPriority, TaskStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * SRS Rule 10.1 & 13:
 * Overdue means due date before the current date in the application timezone and status not Done.
 */
export function isTaskOverdue(dueDate: any, status: TaskStatus): boolean {
  if (!dueDate || status === 'done') return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let due: Date;
  if (typeof dueDate === 'string') {
    const parts = dueDate.split('-');
    if (parts.length === 3) {
      due = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      due = new Date(dueDate);
    }
  } else if (dueDate && typeof dueDate.toDate === 'function') {
    due = dueDate.toDate();
  } else if (dueDate && typeof dueDate.seconds === 'number') {
    due = new Date(dueDate.seconds * 1000);
  } else {
    due = new Date(dueDate);
  }

  if (isNaN(due.getTime())) return false;
  due.setHours(0, 0, 0, 0);

  return due.getTime() < today.getTime();
}

/**
 * Robust date formatting supporting Firestore Timestamps, ISO strings, and dates
 */
export function formatDate(dateVal: any): string {
  if (!dateVal) return 'Recently';

  try {
    let d: Date;

    // Handle Firestore Timestamp object with .toDate()
    if (typeof dateVal.toDate === 'function') {
      d = dateVal.toDate();
    }
    // Handle raw { seconds, nanoseconds } object
    else if (typeof dateVal.seconds === 'number') {
      d = new Date(dateVal.seconds * 1000);
    }
    // Handle YYYY-MM-DD string
    else if (typeof dateVal === 'string') {
      const parts = dateVal.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        d = new Date(dateVal);
      }
    }
    // Handle Date object or timestamp number
    else if (dateVal instanceof Date) {
      d = dateVal;
    } else if (typeof dateVal === 'number') {
      d = new Date(dateVal);
    } else {
      return 'Recently';
    }

    if (isNaN(d.getTime())) return 'Recently';

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

export function getStatusLabel(status: TaskStatus, lang: 'en' | 'ar' = 'en'): string {
  if (lang === 'ar') {
    switch (status) {
      case 'todo':
        return 'قيد الانتظار';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'done':
        return 'مكتمل';
      default:
        return status;
    }
  }
  switch (status) {
    case 'todo':
      return 'To Do';
    case 'in_progress':
      return 'In Progress';
    case 'done':
      return 'Done';
    default:
      return status;
  }
}

export function getPriorityLabel(priority: TaskPriority | string, lang: 'en' | 'ar' = 'en'): string {
  const p = priority.toLowerCase();
  if (lang === 'ar') {
    switch (p) {
      case 'urgent':
        return 'عاجل';
      case 'high':
        return 'عالي';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'منخفض';
      default:
        return priority;
    }
  }
  switch (p) {
    case 'urgent':
      return 'Urgent';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return priority;
  }
}

export function getStatusBadgeClass(status: TaskStatus): string {
  switch (status) {
    case 'todo':
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
    case 'in_progress':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
    case 'done':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function getPriorityBadgeClass(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';
    case 'medium':
      return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300';
    case 'low':
      return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
