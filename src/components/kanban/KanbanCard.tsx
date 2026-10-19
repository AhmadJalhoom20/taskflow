'use client';

import React from 'react';
import { Task, TaskStatus } from '@/types';
import { isTaskOverdue } from '@/lib/utils';
import {
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  RightOutlined,
  LeftOutlined,
  RollbackOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { Button, Avatar, Tooltip, Popconfirm } from 'antd';
import { useLanguage } from '@/context/LanguageContext';

interface KanbanCardProps {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onInspect(task.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${task.title}. ${formatTaskPriority(task.priority)}. ${task.assigneeName ? task.assigneeName : t('unassigned')}`}
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={() => onInspect(task.id)}
      onKeyDown={handleKeyDown}
      className={`group bg-white dark:bg-[#111827] border rounded-lg p-3 space-y-2.5 cursor-pointer transition-all duration-150 ease-out active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
        isDragging
          ? 'opacity-30 scale-95 border-dashed border-blue-600 shadow-none'
          : 'border-slate-200 dark:border-[#1e2430] hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-sm'
      } ${task.status === 'done' ? 'opacity-85' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${
              task.priority === 'high'
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                : task.priority === 'medium'
                ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span
              className={`priority-dot ${
                task.priority === 'high'
                  ? 'priority-dot-high'
                  : task.priority === 'medium'
                  ? 'priority-dot-normal'
                  : 'priority-dot-low'
              }`}
            />
            {formatTaskPriority(task.priority)}
          </span>
          {isOverdue && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white shadow-xs">
              {t('overdueBadge')}
            </span>
          )}
        </div>

        {/* Crisp Vector Grip Icon (Replacing raw unicode glyphs) */}
        {canEdit && (
          <span
            title={isRTL ? 'اسحب لنقل المهمة' : 'Drag to move'}
            aria-hidden="true"
            className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors cursor-grab active:cursor-grabbing p-0.5"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5" cy="3" r="1.5" />
              <circle cx="11" cy="3" r="1.5" />
              <circle cx="5" cy="8" r="1.5" />
              <circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="13" r="1.5" />
              <circle cx="11" cy="13" r="1.5" />
            </svg>
          </span>
        )}
      </div>

      <div
        dir="auto"
        className={`font-semibold text-xs sm:text-sm leading-snug ${
          task.status === 'done'
            ? 'line-through text-slate-400 dark:text-slate-500'
            : 'text-slate-900 dark:text-white'
        }`}
      >
        {task.title}
      </div>

      {task.description && (
        <div dir="auto" className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
          {task.description}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1e2430] text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          {task.assigneeName ? (
            <Tooltip title={`${t('assignedToPrefix')} ${task.assigneeName}`}>
              <div className="flex items-center gap-1.5">
                <Avatar
                  size={20}
                  className="bg-blue-600 text-[10px] border border-white dark:border-[#111827] shadow-xs"
                >
                  {task.assigneeName.charAt(0).toUpperCase()}
                </Avatar>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[90px]">
                  {task.assigneeName}
                </span>
              </div>
            </Tooltip>
          ) : (
            <span className="text-slate-400 italic text-[10px]">{t('unassigned')}</span>
          )}
        </div>

        {task.dueDate && (
          <span
            className={`text-[10px] tnum flex items-center gap-1 ${
              isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CalendarOutlined />
            {formatDateLocalized(task.dueDate)}
          </span>
        )}
      </div>

      {/* Quick Action Controls */}
      <div
        className="flex items-center justify-between pt-1 text-xs"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          {canEdit && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              aria-label={`Edit task ${task.title}`}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            />
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
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                aria-label={`Delete task ${task.title}`}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center gap-1">
            {task.status === 'todo' && (
              <Button
                type="default"
                size="small"
                iconPlacement="end"
                icon={isRTL ? <LeftOutlined className="text-[9px]" /> : <RightOutlined className="text-[9px]" />}
                onClick={() => onStatusChange(task, 'in_progress')}
                className="text-[11px] font-medium border-slate-200 dark:border-[#1e2430] rounded-md"
              >
                {t('startAction')}
              </Button>
            )}
            {task.status === 'in_progress' && (
              <>
                <Button
                  type="text"
                  size="small"
                  icon={<RollbackOutlined className="text-[9px]" />}
                  onClick={() => onStatusChange(task, 'todo')}
                  className="text-[10px] text-slate-500"
                >
                  {t('statusTodo')}
                </Button>
                <Button
                  type="primary"
                  size="small"
                  iconPlacement="end"
                  icon={<CheckOutlined className="text-[9px]" />}
                  onClick={() => onStatusChange(task, 'done')}
                  className="text-[11px] font-medium !bg-emerald-600 !border-emerald-600 text-white rounded-md"
                >
                  {t('doneAction')}
                </Button>
              </>
            )}
            {task.status === 'done' && (
              <Button
                type="default"
                size="small"
                icon={<RollbackOutlined className="text-[9px]" />}
                onClick={() => onStatusChange(task, 'in_progress')}
                className="text-[10px] text-slate-500 border-slate-200 dark:border-[#1e2430] rounded-md"
              >
                {t('reopenAction')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
