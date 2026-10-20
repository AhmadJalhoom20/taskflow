'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useEffect, useState } from 'react';
import { Drawer, Button, Select, Input, Popconfirm, Tooltip } from 'antd';
import {
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  BugOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Task, Project, TaskStatus, TaskPriority } from '@/types';
import { isTaskOverdue, parseTaskTag } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { PrioritySignalIcon } from '@/components/ui/PrioritySignalBadge';

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
const DRAWER_CONFIG = {
  defaultWidth: 460,
  mobileBreakpoint: 500,
};

const STYLES = {
  badgeContainer:
    'font-mono text-xs uppercase px-2 py-0.5 rounded bg-[#EDECE8] dark:bg-[#141211] text-[#1B1915] dark:text-[#EFE9DD] border border-[#DDDAD3] dark:border-[#2C2824] font-semibold cursor-default',
  overdueBadge:
    'text-[10px] font-bold px-2 py-0.5 rounded bg-[#FCE8E5] dark:bg-[#331915] text-[#9C2E1F] dark:text-[#EE8A78] border border-[#9C2E1F]/20 dark:border-[#EE8A78]/30 cursor-default',
  attributeMatrix:
    'grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-[#EDECE8] dark:bg-[#141211] border border-[#DDDAD3] dark:border-[#2C2824] text-xs sm:text-sm',
  descriptionBox:
    'p-3.5 rounded-lg bg-[#F4F4F2] dark:bg-[#141211] border border-[#DDDAD3] dark:border-[#2C2824] text-sm leading-relaxed text-[#1B1915] dark:text-[#EFE9DD] min-h-[90px] whitespace-pre-wrap',
};

const TAG_STYLES: Record<'bug' | 'feature' | 'improvement' | 'default', string> = {
  bug: 'bg-[#9C2E1F]/10 dark:bg-[#EE8A78]/15 text-[#9C2E1F] dark:text-[#EE8A78] border-[#9C2E1F]/25 dark:border-[#EE8A78]/30',
  feature: 'bg-[#1E4D8A]/10 dark:bg-[#8DB4E8]/15 text-[#1E4D8A] dark:text-[#8DB4E8] border-[#1E4D8A]/25 dark:border-[#8DB4E8]/30',
  improvement: 'bg-[#235832]/10 dark:bg-[#9CC5A1]/15 text-[#235832] dark:text-[#9CC5A1] border-[#235832]/25 dark:border-[#9CC5A1]/30',
  default: 'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] border-[#DDDAD3] dark:border-[#2C2824]',
};

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
export interface TaskDetailDrawerProps {
  task: Task | null;
  project: Project;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
  onPriorityChange: (taskId: string, nextPriority: TaskPriority) => void;
  onAssigneeChange: (taskId: string, nextAssigneeId: string) => void;
  onDueDateChange: (taskId: string, nextDueDate: string) => void;
}

// ============================================================================
// 4. HELPER FUNCTIONS
// ============================================================================
function getShortKey(taskId: string): string {
  return `TF-${taskId.slice(0, 6).toUpperCase()}`;
}

// ============================================================================
// 5. SUB-COMPONENTS (NO EMOJIS — REAL VECTOR ICONS / PICS)
// ============================================================================
function DrawerTagBadge({
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

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export function TaskDetailDrawer({
  task,
  project,
  canEdit,
  canDelete,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDueDateChange,
}: TaskDetailDrawerProps) {
  const { t, isRTL, formatDateLocalized } = useLanguage();
  const [drawerWidth, setDrawerWidth] = useState<number | string>(DRAWER_CONFIG.defaultWidth);

  // Dynamic viewport width clamping (prevents mobile horizontal overflow)
  useEffect(() => {
    function updateWidth() {
      if (typeof window !== 'undefined') {
        setDrawerWidth(
          window.innerWidth < DRAWER_CONFIG.mobileBreakpoint
            ? '100%'
            : DRAWER_CONFIG.defaultWidth
        );
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Guard clause: Drawer is invisible when no task is selected
  if (!task) return null;

  const shortKey = getShortKey(task.id);
  const isOverdue = isTaskOverdue(task.dueDate, task.status);
  const { tag, cleanTitle } = parseTaskTag(task.title);

  function handleDeleteConfirm() {
    if (!task) return;
    onDelete(task.id);
    onClose();
  }

  function handleEditClick() {
    if (!task) return;
    onEdit(task);
    onClose();
  }

  return (
    <Drawer
      title={null}
      placement={isRTL ? 'left' : 'right'}
      onClose={onClose}
      open={Boolean(task)}
      width={drawerWidth}
      styles={{
        body: { padding: 0, backgroundColor: 'transparent' },
      }}
      aria-label={`Task inspection for ${task.title}`}
    >
      <div className="flex flex-col h-full bg-white dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD]">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tooltip title={shortKey}>
              <span className={STYLES.badgeContainer}>{shortKey}</span>
            </Tooltip>
            {isOverdue && (
              <Tooltip title={t('overdueFilter')}>
                <span className={STYLES.overdueBadge}>{t('overdueBadge')}</span>
              </Tooltip>
            )}
          </div>
          <Tooltip title={t('closeAction')}>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={onClose}
              aria-label="Close inspector drawer"
              className="text-[#736B5E] hover:text-[#1B1915] dark:text-[#9A9183] dark:hover:text-[#EFE9DD]"
            />
          </Tooltip>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="space-y-1.5">
            {tag && <DrawerTagBadge tag={tag} />}
            <h3 className="text-base font-bold text-[#1B1915] dark:text-[#EFE9DD] leading-snug">
              {cleanTitle}
            </h3>
          </div>

          {/* Attribute Matrix */}
          <div className={STYLES.attributeMatrix}>
            <div>
              <span className="text-xs uppercase font-semibold text-[#5A5348] dark:text-[#9A9183] block mb-1">
                {t('colStatus')}
              </span>
              <Select
                size="middle"
                value={task.status}
                onChange={(val) => onStatusChange(task.id, val)}
                disabled={!canEdit}
                className="w-full text-sm font-semibold"
                options={[
                  { value: 'todo', label: t('statusTodo') },
                  { value: 'in_progress', label: t('statusInProgress') },
                  { value: 'done', label: t('statusDone') },
                ]}
              />
            </div>

            <div>
              <span className="text-xs uppercase font-semibold text-[#5A5348] dark:text-[#9A9183] block mb-1">
                {t('colPriority')}
              </span>
              <Select
                size="middle"
                value={task.priority}
                onChange={(val) => onPriorityChange(task.id, val)}
                disabled={!canEdit}
                className="w-full text-sm font-semibold"
                options={[
                  {
                    value: 'low',
                    label: (
                      <div className="flex items-center justify-between">
                        <span>{t('priorityLow')}</span>
                        <PrioritySignalIcon priority="low" size="sm" />
                      </div>
                    ),
                  },
                  {
                    value: 'medium',
                    label: (
                      <div className="flex items-center justify-between">
                        <span>{t('priorityMedium')}</span>
                        <PrioritySignalIcon priority="medium" size="sm" />
                      </div>
                    ),
                  },
                  {
                    value: 'high',
                    label: (
                      <div className="flex items-center justify-between">
                        <span>{t('priorityHigh')}</span>
                        <PrioritySignalIcon priority="high" size="sm" />
                      </div>
                    ),
                  },
                ]}
              />
            </div>

            <div>
              <span className="text-xs uppercase font-semibold text-[#5A5348] dark:text-[#9A9183] block mb-1">
                {t('colAssignee')}
              </span>
              <Select
                size="middle"
                value={task.assigneeId || ''}
                onChange={(val) => onAssigneeChange(task.id, val)}
                disabled={!canEdit}
                className="w-full text-sm font-semibold"
                options={[
                  { value: '', label: t('unassigned') },
                  ...project.memberIds.map((mId) => ({
                    value: mId,
                    label: project.memberDetails?.[mId]?.displayName || mId,
                  })),
                ]}
              />
            </div>

            <div>
              <span className="text-xs uppercase font-semibold text-[#5A5348] dark:text-[#9A9183] block mb-1">
                {t('colDueDate')}
              </span>
              <Input
                type="date"
                size="middle"
                value={task.dueDate || ''}
                onChange={(e) => onDueDateChange(task.id, e.target.value)}
                disabled={!canEdit}
                className="w-full text-sm font-mono"
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-semibold text-[#5A5348] dark:text-[#9A9183] uppercase tracking-wider block">
              {t('description')}
            </span>
            <div className={STYLES.descriptionBox}>
              {task.description || (
                <span className="italic text-[#736B5E] dark:text-[#9A9183]">
                  {t('noProjectDescription')}
                </span>
              )}
            </div>
          </div>

          {/* Timestamps & Audit Record */}
          <div className="pt-3 border-t border-[#DDDAD3] dark:border-[#2C2824] space-y-1 font-mono text-xs text-[#736B5E] dark:text-[#9A9183]">
            <div>
              {t('creatorLabel')}: {task.creatorName || task.createdBy}
            </div>
            <div>
              {t('created')}: {formatDateLocalized(task.createdAt)}
            </div>
            <div>
              {t('updated')}: {formatDateLocalized(task.updatedAt)}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-[#DDDAD3] dark:border-[#2C2824] bg-[#EDECE8] dark:bg-[#11100E] flex items-center justify-between gap-2">
          {canDelete && (
            <Popconfirm
              title={t('deleteTaskConfirmTitle')}
              description={t('deleteTaskConfirmDesc')}
              onConfirm={handleDeleteConfirm}
              okText={t('deleteAction')}
              cancelText={t('cancel')}
              okButtonProps={{ danger: true }}
            >
              <Tooltip title={t('deleteAction')}>
                <Button danger size="middle" icon={<DeleteOutlined />}>
                  {t('deleteAction')}
                </Button>
              </Tooltip>
            </Popconfirm>
          )}

          <div className="flex items-center gap-2 ms-auto">
            {canEdit && (
              <Tooltip title={t('editAction')}>
                <Button size="middle" icon={<EditOutlined />} onClick={handleEditClick}>
                  {t('editAction')}
                </Button>
              </Tooltip>
            )}
            <Tooltip title={t('closeAction')}>
              <Button size="middle" onClick={onClose}>
                {t('closeAction')}
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
