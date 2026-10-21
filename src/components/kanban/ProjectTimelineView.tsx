'use client';

// ============================================================================
// 1. الاستيرادات (Imports)
// مكتبات التصميم، الأيقونات، وسياق اللغة لتوليد مخطط زمني احترافي ومبهر
// ============================================================================
import React, { useMemo } from 'react';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PlusOutlined,
  RightOutlined,
  LeftOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Button, Tooltip, Avatar, Tag, Empty } from 'antd';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { isTaskOverdue, parseTaskTag } from '@/lib/utils';
import { PrioritySignalBadge } from '@/components/ui/PrioritySignalBadge';

// ============================================================================
// 2. منطقة التعديل السريع (Constants & Styles)
// ألوان ومسارات المخطط الزمني للوضع الفاتح والداكن
// ============================================================================
const TIMELINE_CONFIG = {
  columnWidth: 'min-w-[280px] max-w-[340px] flex-1',
} as const;

const STYLES = {
  container:
    'tactile-card rounded-xl border border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] p-4 sm:p-6 shadow-tactile-card dark:shadow-tactile-card-dark space-y-6',
  headerRow: 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDDAD3] dark:border-[#2C2824]',
  timeLane:
    'flex-1 flex flex-col rounded-xl border border-[#DDDAD3] dark:border-[#2C2824] bg-[#F4F4F2]/50 dark:bg-[#11100E] p-3.5 space-y-3',
  laneTitle:
    'text-xs uppercase tracking-wider font-bold text-[#5A5348] dark:text-[#B5AC9C] flex items-center justify-between',
  taskItem:
    'tactile-card group relative rounded-lg border border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#151719] p-3 space-y-2 cursor-pointer transition-all hover:border-[#7A5818] dark:hover:border-[#D4B26E] shadow-2xs',
} as const;

// ============================================================================
// 3. الأنواع والواجهات (Types & Interfaces)
// ============================================================================
export interface ProjectTimelineViewProps {
  tasks: Task[];
  projectId: string;
  isOwner: boolean;
  currentUserId?: string;
  onInspect: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
  onCreateTask: () => void;
}

interface TimelineBucket {
  id: 'overdue' | 'today' | 'this_week' | 'upcoming' | 'no_date';
  titleEn: string;
  titleAr: string;
  tasks: Task[];
  accentColor: string;
}

// ============================================================================
// 4. دوال مساعدة لحساب الفترات الزمنية (Helper Functions)
// بنقسم المهام زمنيا: متأخرة، اليوم، هذا الأسبوع، قادمة، وبدون تاريخ محدد
// ============================================================================
function categorizeTasksIntoBuckets(tasks: Task[]): TimelineBucket[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1;
  const endOfWeek = startOfToday + 7 * 24 * 60 * 60 * 1000;

  const buckets: Record<TimelineBucket['id'], Task[]> = {
    overdue: [],
    today: [],
    this_week: [],
    upcoming: [],
    no_date: [],
  };

  for (const task of tasks) {
    if (!task.dueDate) {
      buckets.no_date.push(task);
      continue;
    }

    const taskDue = new Date(task.dueDate).getTime();
    if (task.status !== 'done' && taskDue < startOfToday) {
      buckets.overdue.push(task);
    } else if (taskDue >= startOfToday && taskDue <= endOfToday) {
      buckets.today.push(task);
    } else if (taskDue > endOfToday && taskDue <= endOfWeek) {
      buckets.this_week.push(task);
    } else {
      buckets.upcoming.push(task);
    }
  }

  const result: TimelineBucket[] = [
    {
      id: 'overdue',
      titleEn: 'Overdue Horizon',
      titleAr: 'متأخرة عن الموعد',
      tasks: buckets.overdue,
      accentColor: '#9C2E1F',
    },
    {
      id: 'today',
      titleEn: 'Due Today',
      titleAr: 'مستحقة اليوم',
      tasks: buckets.today,
      accentColor: '#7A5818',
    },
    {
      id: 'this_week',
      titleEn: 'This Sprint / Week',
      titleAr: 'خلال هذا الأسبوع',
      tasks: buckets.this_week,
      accentColor: '#1E4D8A',
    },
    {
      id: 'upcoming',
      titleEn: 'Future Horizons',
      titleAr: 'المواعيد القادمة',
      tasks: buckets.upcoming,
      accentColor: '#235832',
    },
    {
      id: 'no_date',
      titleEn: 'Unscheduled Backlog',
      titleAr: 'قيد الانتظار (بدون تاريخ)',
      tasks: buckets.no_date,
      accentColor: '#736B5E',
    },
  ];

  return result;
}

function getShortTaskId(id: string): string {
  return `TF-${id.slice(0, 4).toUpperCase()}`;
}

// ============================================================================
// 5. المكون الرئيسي للمخطط الزمني (ProjectTimelineView)
// ============================================================================
export default function ProjectTimelineView({
  tasks,
  isOwner,
  currentUserId,
  onInspect,
  onEdit,
  onStatusChange,
  onCreateTask,
}: ProjectTimelineViewProps) {
  const { t, isRTL, formatDateLocalized } = useLanguage();

  const buckets = useMemo(() => categorizeTasksIntoBuckets(tasks), [tasks]);

  const scheduledCount = useMemo(
    () => tasks.filter((t) => Boolean(t.dueDate)).length,
    [tasks]
  );

  return (
    <div className={STYLES.container}>
      {/* شريط معلومات المخطط الزمني */}
      <div className={STYLES.headerRow}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-[#7A5818] dark:text-[#D4B26E] text-base" />
            <h3 className="font-bold text-base text-[#1B1915] dark:text-[#EFE9DD] !mb-0 font-display">
              {isRTL ? 'المسار الزمني للمشروع (Horizon Timeline)' : 'Project Horizon Timeline'}
            </h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] border border-[#DDDAD3] dark:border-[#2C2824]">
              {scheduledCount} / {tasks.length} {isRTL ? 'مجدولة' : 'Scheduled'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5A5348] dark:text-[#B5AC9C] !mb-0">
            {isRTL
              ? 'توزيع زمني تفاعلي للمهام بحسب مواعيد الاستحقاق ومراحل الإنجاز'
              : 'Interactive sprint distribution mapped across execution horizons and due dates'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            onClick={onCreateTask}
            className="tactile-btn !bg-[#7A5818] hover:!bg-[#5E420E] dark:!bg-[#D4B26E] dark:hover:!bg-[#E2C88E] !border-transparent !text-white dark:!text-[#1A1408] font-bold text-xs shadow-xs"
          >
            {t('addTask')}
          </Button>
        </div>
      </div>

      {/* أعمدة المسار الزمني المتجاورة */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start scrollbar-thin">
        {buckets.map((bucket) => {
          // إذا العمود فاضي وعمود المتأخرات، بنخفيه عشان ما يشوش الواجهة
          if (bucket.id === 'overdue' && bucket.tasks.length === 0) return null;

          return (
            <div
              key={bucket.id}
              className={`${TIMELINE_CONFIG.columnWidth} ${STYLES.timeLane}`}
            >
              {/* ترويسة الفترة الزمنية */}
              <div className={STYLES.laneTitle}>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: bucket.accentColor }}
                  />
                  <span>{isRTL ? bucket.titleAr : bucket.titleEn}</span>
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD] tnum">
                  {bucket.tasks.length}
                </span>
              </div>

              {/* بطاقات المهام المندرجة في هذه الفترة */}
              <div className="space-y-2.5 min-h-[140px]">
                {bucket.tasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#736B5E] dark:text-[#9A9183] border border-dashed border-[#DDDAD3] dark:border-[#2C2824] rounded-lg">
                    {isRTL ? 'لا توجد مهام في هذه الفترة' : 'No tasks in this horizon'}
                  </div>
                ) : (
                  bucket.tasks.map((task) => {
                    const shortId = getShortTaskId(task.id);
                    const { cleanTitle } = parseTaskTag(task.title);
                    const canEdit =
                      isOwner || task.createdBy === currentUserId || task.assigneeId === currentUserId;

                    return (
                      <div
                        key={task.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onInspect(task.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onInspect(task.id);
                          }
                        }}
                        className={`${STYLES.taskItem} ${
                          task.status === 'done' ? 'opacity-75' : ''
                        }`}
                      >
                        {/* السطر العلوي: معرف المهمة والأولوية */}
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] border border-[#DDDAD3] dark:border-[#2C2824]">
                            {shortId}
                          </span>
                          <PrioritySignalBadge
                            priority={task.priority}
                            label={t(
                              task.priority === 'high'
                                ? 'priorityHigh'
                                : task.priority === 'medium'
                                ? 'priorityMedium'
                                : 'priorityLow'
                            )}
                            size="sm"
                          />
                        </div>

                        {/* عنوان المهمة */}
                        <div
                          dir="auto"
                          className={`font-semibold text-sm leading-snug line-clamp-2 ${
                            task.status === 'done'
                              ? 'line-through text-[#736B5E]'
                              : 'text-[#1B1915] dark:text-[#EFE9DD]'
                          }`}
                        >
                          {cleanTitle}
                        </div>

                        {/* تذييل البطاقة: المسؤول وتاريخ الاستحقاق وزر الانتقال السريع */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-[#DDDAD3]/60 dark:border-[#2C2824]/60 text-xs text-[#5A5348] dark:text-[#B5AC9C]">
                          <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                            {task.assigneeName ? (
                              <Tooltip title={task.assigneeName}>
                                <div className="flex items-center gap-1 truncate">
                                  <Avatar
                                    size={20}
                                    style={{ backgroundColor: '#D4B26E', color: '#1A1408' }}
                                    className="font-bold text-[10px]"
                                  >
                                    {task.assigneeName.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <span className="truncate text-xs font-medium">
                                    {task.assigneeName}
                                  </span>
                                </div>
                              </Tooltip>
                            ) : (
                              <span className="text-[11px] italic text-[#736B5E]">
                                {t('unassigned')}
                              </span>
                            )}
                          </div>

                          {task.dueDate && (
                            <span className="font-mono text-xs text-[#736B5E] dark:text-[#9A9183] flex items-center gap-1">
                              <ClockCircleOutlined className="text-[10px]" />
                              {formatDateLocalized(task.dueDate)}
                            </span>
                          )}
                        </div>

                        {/* زر التغيير السريع لحالة المهمة من داخل المخطط */}
                        {canEdit && (
                          <div
                            className="pt-1 flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {task.status !== 'done' ? (
                              <Button
                                size="small"
                                type="text"
                                icon={<CheckCircleOutlined className="text-xs" />}
                                onClick={() => onStatusChange(task.id, 'done')}
                                className="text-[11px] font-semibold text-[#235832] dark:text-[#9CC5A1] hover:bg-[#E1EFE4] dark:hover:bg-[#152618]"
                              >
                                {t('doneAction')}
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                type="text"
                                onClick={() => onStatusChange(task.id, 'in_progress')}
                                className="text-[11px] text-[#736B5E] dark:text-[#9A9183]"
                              >
                                {t('reopenAction')}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
