'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { isTaskOverdue, parseTaskTag } from '@/lib/utils';
import {
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  RightOutlined,
  LeftOutlined,
  RollbackOutlined,
  CheckOutlined,
  BugOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Avatar, Tooltip, Popconfirm } from 'antd';
import { useLanguage } from '@/context/LanguageContext';
import { PrioritySignalBadge } from '@/components/ui/PrioritySignalBadge';

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
export const CARD_STYLES = {
  cardBase:
    'tactile-card group relative bg-white dark:bg-[#141211] border rounded-xl p-4 space-y-3 cursor-pointer text-start transition-all duration-150 select-none active:scale-[0.99]',
  cardDragging:
    'opacity-25 scale-95 border-dashed border-[#7A5818] dark:border-[#D4B26E] shadow-none',
  cardIdle:
    'border-[#DDDAD3] dark:border-[#2C2824] hover:border-[#7A5818]/60 dark:hover:border-[#D4B26E]/60 hover:shadow-tactile-md shadow-tactile-card dark:shadow-tactile-card-dark',
  shortIdBadge:
    'font-mono text-xs font-semibold text-[#5A5348] dark:text-[#B5AC9C] bg-[#EDECE8] dark:bg-[#1C1A17] px-2.5 py-1 rounded-md border border-[#DDDAD3] dark:border-[#2C2824]',
  overdueBadge:
    'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#9C2E1F] text-white shadow-xs',
};

export const PRIORITY_STYLES: Record<TaskPriority, { container: string; dot: string }> = {
  high: {
    container:
      'bg-[#FCE8E5] dark:bg-[#331915] text-[#9C2E1F] dark:text-[#EE8A78] border border-[#9C2E1F]/20 dark:border-[#EE8A78]/30',
    dot: 'priority-dot priority-dot-high',
  },
  medium: {
    container:
      'bg-[#E3EDF8] dark:bg-[#142136] text-[#1E4D8A] dark:text-[#8DB4E8] border border-[#1E4D8A]/20 dark:border-[#8DB4E8]/30',
    dot: 'priority-dot priority-dot-normal',
  },
  low: {
    container:
      'bg-[#EDECE8] text-[#5A5348] dark:bg-[#1C1A17] dark:text-[#B5AC9C] border border-[#DDDAD3] dark:border-[#2C2824]',
    dot: 'priority-dot priority-dot-low',
  },
};

export const TAG_STYLES: Record<'bug' | 'feature' | 'improvement' | 'default', string> = {
  bug: 'bg-[#9C2E1F]/10 dark:bg-[#EE8A78]/15 text-[#9C2E1F] dark:text-[#EE8A78] border-[#9C2E1F]/25 dark:border-[#EE8A78]/30',
  feature: 'bg-[#1E4D8A]/10 dark:bg-[#8DB4E8]/15 text-[#1E4D8A] dark:text-[#8DB4E8] border-[#1E4D8A]/25 dark:border-[#8DB4E8]/30',
  improvement: 'bg-[#235832]/10 dark:bg-[#9CC5A1]/15 text-[#235832] dark:text-[#9CC5A1] border-[#235832]/25 dark:border-[#9CC5A1]/30',
  default: 'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] border-[#DDDAD3] dark:border-[#2C2824]',
};

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
export interface KanbanCardProps {
  task: Task;
  canEdit: boolean;
  canDelete: boolean;
  isDragging: boolean;
  onInspect: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (task: Task, nextStatus: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
}

// ============================================================================
// 4. HELPER FUNCTIONS
// ============================================================================
function getShortTaskId(id: string): string {
  return `TF-${id.slice(0, 4).toUpperCase()}`;
}

// ============================================================================
// 5. SUB-COMPONENTS (NO EMOJIS — REAL VECTOR ICONS / PICS)
// ============================================================================
function TaskTagBadge({
  tag,
}: {
  tag: { label: string; type: 'bug' | 'feature' | 'improvement' | 'default' };
}) {
  const styleClass = TAG_STYLES[tag.type] || TAG_STYLES.default;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${styleClass}`}
    >
      {tag.type === 'bug' && <BugOutlined className="text-xs" />}
      {tag.type === 'feature' && <RocketOutlined className="text-xs" />}
      {tag.type === 'improvement' && <ThunderboltOutlined className="text-xs" />}
      <span>{tag.label}</span>
    </span>
  );
}

function GripHandle({ isRTL }: { isRTL: boolean }) {
  return (
    <Tooltip title={isRTL ? 'اسحب لنقل المهمة بين الأعمدة' : 'Drag to reorder'}>
      <span
        aria-hidden="true"
        className="text-[#DDDAD3] dark:text-[#3A352F] group-hover:text-[#5A5348] dark:group-hover:text-[#9A9183] transition-colors cursor-grab active:cursor-grabbing p-1"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </span>
    </Tooltip>
  );
}

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export function KanbanCard({
  task,
  canEdit,
  canDelete,
  isDragging,
  onInspect,
  onEdit,
  onDelete,
  onStatusChange,
  onDragStart,
  onDragEnd,
}: KanbanCardProps) {
  const { t, formatTaskPriority, formatDateLocalized, isRTL } = useLanguage();
  const isOverdue = isTaskOverdue(task.dueDate, task.status);
  const { tag, cleanTitle } = parseTaskTag(task.title);
  const shortId = getShortTaskId(task.id);
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onInspect(task.id);
    }
  }

  function handleCardClick() {
    onInspect(task.id);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${cleanTitle}. ${formatTaskPriority(task.priority)}. ${task.assigneeName ? task.assigneeName : t('unassigned')}`}
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`${CARD_STYLES.cardBase} ${
        isDragging ? CARD_STYLES.cardDragging : CARD_STYLES.cardIdle
      } ${task.status === 'done' ? 'opacity-85' : ''}`}
    >
      {/* Top Metadata Bar: Priority + Task Key + Grip */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Tooltip title={shortId}>
            <span className={CARD_STYLES.shortIdBadge}>{shortId}</span>
          </Tooltip>

          <Tooltip title={`${t('colPriority')}: ${formatTaskPriority(task.priority)}`}>
            <span className="inline-flex cursor-default">
              <PrioritySignalBadge
                priority={task.priority}
                label={formatTaskPriority(task.priority)}
                size="md"
              />
            </span>
          </Tooltip>

          {tag && <TaskTagBadge tag={tag} />}

          {isOverdue && (
            <Tooltip title={t('overdueFilter')}>
              <span className={CARD_STYLES.overdueBadge}>{t('overdueBadge')}</span>
            </Tooltip>
          )}
        </div>

        {canEdit && <GripHandle isRTL={isRTL} />}
      </div>

      {/* Task Title */}
      <div
        dir="auto"
        className={`font-bold text-base sm:text-lg leading-snug ${
          task.status === 'done'
            ? 'line-through text-[#736B5E] dark:text-[#736B5E]'
            : 'text-[#1B1915] dark:text-[#EFE9DD]'
        }`}
      >
        {cleanTitle}
      </div>

      {/* Optional Description */}
      {task.description && (
        <div
          dir="auto"
          className="text-sm sm:text-base text-[#5A5348] dark:text-[#B5AC9C] line-clamp-3 leading-relaxed"
        >
          {task.description}
        </div>
      )}

      {/* Footer Info: Assignee & Due Date */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#DDDAD3] dark:border-[#2C2824] text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-[#5A5348] dark:text-[#B5AC9C]">
          {task.assigneeName ? (
            <Tooltip title={`${t('assignedToPrefix')} ${task.assigneeName}`}>
              <div className="flex items-center gap-2">
                <Avatar
                  size={26}
                  style={{ backgroundColor: '#D4B26E', color: '#1A1408' }}
                  className="font-bold text-xs border border-white dark:border-[#141211] shadow-xs"
                >
                  {task.assigneeName.charAt(0).toUpperCase()}
                </Avatar>
                <span className="text-xs sm:text-sm text-[#1B1915] dark:text-[#EFE9DD] font-semibold truncate max-w-[130px]">
                  {task.assigneeName}
                </span>
              </div>
            </Tooltip>
          ) : (
            <Tooltip title={t('unassigned')}>
              <span className="text-[#736B5E] dark:text-[#9A9183] italic text-xs sm:text-sm cursor-default">
                {t('unassigned')}
              </span>
            </Tooltip>
          )}
        </div>

        {task.dueDate && (
          <Tooltip title={isOverdue ? t('overdueFilter') : t('colDueDate')}>
            <span
              className={`text-xs sm:text-sm font-mono tnum flex items-center gap-1.5 cursor-default ${
                isOverdue
                  ? 'text-[#9C2E1F] dark:text-[#EE8A78] font-bold'
                  : 'text-[#736B5E] dark:text-[#9A9183]'
              }`}
            >
              <CalendarOutlined />
              {formatDateLocalized(task.dueDate)}
            </span>
          </Tooltip>
        )}
      </div>

      {/* Quick Action Controls */}
      <div
        className="flex items-center justify-between pt-1.5 text-xs sm:text-sm"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          {canEdit && (
            <Tooltip title={t('editAction')}>
              <Button
                type="text"
                size="middle"
                icon={<EditOutlined className="text-sm" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                aria-label={`Edit task ${task.title}`}
                className="text-[#736B5E] hover:text-[#1B1915] dark:text-[#9A9183] dark:hover:text-[#EFE9DD]"
              />
            </Tooltip>
          )}

          {canDelete && (
            <Popconfirm
              title={t('deleteTaskConfirmTitle')}
              description={`${t('deleteTaskConfirmDesc')} ("${task.title}")`}
              onConfirm={(e) => {
                e?.stopPropagation();
                onDelete(task.id);
              }}
              onCancel={(e) => {
                e?.stopPropagation();
              }}
              okText={t('deleteAction')}
              cancelText={t('cancel')}
              okButtonProps={{ danger: true }}
            >
              <Tooltip title={t('deleteAction')}>
                <Button
                  type="text"
                  danger
                  size="middle"
                  icon={<DeleteOutlined className="text-sm" />}
                  aria-label={`Delete task ${task.title}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center gap-1.5">
            {task.status === 'todo' && (
              <Tooltip title={t('statusInProgress')}>
                <Button
                  type="default"
                  size="middle"
                  iconPlacement="end"
                  icon={
                    isRTL ? (
                      <LeftOutlined className="text-xs" />
                    ) : (
                      <RightOutlined className="text-xs" />
                    )
                  }
                  onClick={() => onStatusChange(task, 'in_progress')}
                  className="tactile-btn text-xs sm:text-sm font-semibold border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD] rounded hover:border-[#7A5818] dark:hover:border-[#D4B26E]"
                >
                  {t('startAction')}
                </Button>
              </Tooltip>
            )}

            {task.status === 'in_progress' && (
              <>
                <Tooltip title={t('statusTodo')}>
                  <Button
                    type="text"
                    size="middle"
                    icon={<RollbackOutlined className="text-xs" />}
                    onClick={() => onStatusChange(task, 'todo')}
                    className="text-xs sm:text-sm text-[#736B5E] dark:text-[#9A9183]"
                  >
                    {t('statusTodo')}
                  </Button>
                </Tooltip>

                <Tooltip title={t('statusDone')}>
                  <Button
                    type="primary"
                    size="middle"
                    iconPlacement="end"
                    icon={<CheckOutlined className="text-xs" />}
                    onClick={() => onStatusChange(task, 'done')}
                    className="tactile-btn text-xs sm:text-sm font-semibold !bg-[#235832] dark:!bg-[#9CC5A1] !border-transparent text-white dark:!text-[#152618] rounded"
                  >
                    {t('doneAction')}
                  </Button>
                </Tooltip>
              </>
            )}

            {task.status === 'done' && (
              <Tooltip title={t('statusInProgress')}>
                <Button
                  type="default"
                  size="middle"
                  icon={<RollbackOutlined className="text-xs" />}
                  onClick={() => onStatusChange(task, 'in_progress')}
                  className="tactile-btn text-xs sm:text-sm text-[#736B5E] dark:text-[#9A9183] border-[#DDDAD3] dark:border-[#2C2824] rounded"
                >
                  {t('reopenAction')}
                </Button>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
