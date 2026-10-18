'use client';

import React, { useEffect, useState } from 'react';
import { Drawer, Button, Select, Input, Popconfirm } from 'antd';
import { CloseOutlined, EditOutlined, DeleteOutlined, RollbackOutlined, CheckOutlined } from '@ant-design/icons';
import { Task, Project, TaskStatus, TaskPriority } from '@/types';
import { isTaskOverdue } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface TaskDetailDrawerProps {
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
  const { t, isRTL } = useLanguage();
  const [drawerWidth, setDrawerWidth] = useState<number | string>(460);

  // Dynamic viewport width clamping (prevents mobile horizontal overflow)
  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== 'undefined') {
        setDrawerWidth(window.innerWidth < 500 ? '100%' : 460);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  if (!task) return null;

  return (
    <Drawer
      title={null}
      placement={isRTL ? 'left' : 'right'}
      onClose={onClose}
      open={!!task}
      width={drawerWidth}
      styles={{
        body: { padding: 0, backgroundColor: 'transparent' },
      }}
      aria-label={`Task inspection for ${task.title}`}
    >
      <div className="flex flex-col h-full bg-white dark:bg-[#12161f] text-slate-900 dark:text-slate-100">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#1e2430] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-[#171c26] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e2430]">
              TASK-{task.id.slice(0, 6)}
            </span>
            {isTaskOverdue(task.dueDate, task.status) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                OVERDUE
              </span>
            )}
          </div>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
            aria-label="Close inspector drawer"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          />
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {task.title}
          </h3>

          {/* Linear Attribute Matrix */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-[#0e121a] border border-slate-200 dark:border-[#1e2430] text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                {t('colStatus')}
              </span>
              <Select
                size="small"
                value={task.status}
                disabled={!canEdit}
                onChange={(val) => onStatusChange(task.id, val as TaskStatus)}
                className="w-full"
                options={[
                  { value: 'todo', label: t('statusTodo') },
                  { value: 'in_progress', label: t('statusInProgress') },
                  { value: 'done', label: t('statusDone') },
                ]}
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                {t('colPriority')}
              </span>
              <Select
                size="small"
                value={task.priority}
                disabled={!canEdit}
                onChange={(val) => onPriorityChange(task.id, val as TaskPriority)}
                className="w-full"
                options={[
                  { value: 'high', label: t('priorityHigh') },
                  { value: 'medium', label: t('priorityMedium') },
                  { value: 'low', label: t('priorityLow') },
                ]}
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                {t('colAssignee')}
              </span>
              <Select
                size="small"
                value={task.assigneeId || ''}
                disabled={!canEdit}
                onChange={(val) => onAssigneeChange(task.id, val)}
                className="w-full"
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
              <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                {t('colDueDate')}
              </span>
              <Input
                type="date"
                size="small"
                value={task.dueDate || ''}
                disabled={!canEdit}
                onChange={(e) => onDueDateChange(task.id, e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('description')}
            </span>
            <div
              dir="auto"
              className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0e121a] border border-slate-200 dark:border-[#1e2430] text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[90px]"
            >
              {task.description || (
                <span className="italic text-slate-400">{t('noDescriptionProvided')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#1e2430] flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-[#0e121a]/50">
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  onEdit(task);
                  onClose();
                }}
                className="text-xs"
              >
                {t('editAction')}
              </Button>
            )}
            {canDelete && (
              <Popconfirm
                title={t('deleteTaskConfirmTitle')}
                description={`${t('deleteTaskConfirmDesc')} ("${task.title}")`}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  onDelete(task.id);
                  onClose();
                }}
                onCancel={(e) => {
                  e?.stopPropagation();
                }}
                okText={t('deleteAction')}
                cancelText={t('cancel')}
                okButtonProps={{ danger: true }}
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('deleteAction')}
                </Button>
              </Popconfirm>
            )}
          </div>

          {/* Quick Complete / Reopen Toggle */}
          {canEdit && (
            <Button
              type={task.status === 'done' ? 'default' : 'primary'}
              size="small"
              icon={task.status === 'done' ? <RollbackOutlined /> : <CheckOutlined />}
              onClick={() => {
                onStatusChange(
                  task.id,
                  task.status === 'done' ? 'in_progress' : 'done'
                );
              }}
              className={
                task.status === 'done'
                  ? 'text-xs'
                  : '!bg-emerald-600 !border-emerald-600 text-white text-xs'
              }
            >
              {task.status === 'done' ? t('reopenTask') : t('markAsDone')}
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
