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
      return 'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] border border-[#DDDAD3] dark:border-[#2C2824]';
    case 'in_progress':
      return 'bg-[#8DB4E8]/15 text-[#8DB4E8] border border-[#8DB4E8]/30';
    case 'done':
      return 'bg-[#9CC5A1]/15 text-[#3b6e41] dark:text-[#9CC5A1] border border-[#9CC5A1]/30';
    default:
      return 'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C]';
  }
}

export function getPriorityBadgeClass(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return 'bg-[#EE8A78]/15 text-[#c24b37] dark:text-[#EE8A78] border border-[#EE8A78]/30';
    case 'medium':
      return 'bg-[#8DB4E8]/15 text-[#8DB4E8] border border-[#8DB4E8]/30';
    case 'low':
      return 'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] border border-[#DDDAD3] dark:border-[#2C2824]';
    default:
      return 'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C]';
  }
}

export interface ParsedTaskTag {
  tag?: {
    label: string;
    type: 'bug' | 'feature' | 'improvement' | 'default';
  };
  cleanTitle: string;
}

export function parseTaskTag(title: string): ParsedTaskTag {
  if (!title) return { cleanTitle: '' };
  const match = title.match(/^\s*\[(Bug|Feature|Improvement|خطأ|ميزة|تحسين|Fix)\]\s*(.*)$/i);
  if (match) {
    const rawTag = match[1].toLowerCase();
    let type: 'bug' | 'feature' | 'improvement' | 'default' = 'default';
    if (rawTag === 'bug' || rawTag === 'fix' || rawTag === 'خطأ') type = 'bug';
    else if (rawTag === 'feature' || rawTag === 'ميزة') type = 'feature';
    else if (rawTag === 'improvement' || rawTag === 'تحسين') type = 'improvement';

    return {
      tag: { label: match[1], type },
      cleanTitle: match[2] || title,
    };
  }
  return { cleanTitle: title };
}
