'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SettingOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FilterOutlined,
  BugOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Card,
  Tag,
  Button,
  Input,
  Select,
  Modal,
  Form,
  Space,
  Avatar,
  Breadcrumb,
  Popconfirm,
  Typography,
  App,
  Segmented,
  Progress,
  Tooltip,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, TranslationKey } from '@/context/LanguageContext';
import { DataService } from '@/services/dataStore';
import { Project, Task, TaskStatus, TaskPriority } from '@/types';
import { isTaskOverdue, parseTaskTag } from '@/lib/utils';
import { KanbanCard } from '@/components/kanban/KanbanCard';
import ProjectDetailSkeleton from '@/components/ui/ProjectDetailSkeleton';
import { PrioritySignalBadge, PrioritySignalIcon } from '@/components/ui/PrioritySignalBadge';

const TeamRosterModal = dynamic(() => import('@/components/ui/TeamRosterModal'), { ssr: false });
const TaskDetailDrawer = dynamic(
  () => import('@/components/kanban/TaskDetailDrawer').then((mod) => mod.TaskDetailDrawer),
  { ssr: false }
);

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
// Edit limits, column metadata, priority weights, and styling presets here.
const CONFIG = {
  maxTitleLength: 120,
  minTitleLength: 3,
  maxDescriptionLength: 1000,
  tablePageSize: 12,
  teamRosterPreviewCount: 5,
} as const;

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const KANBAN_COLUMNS_CONFIG: Record<
  TaskStatus,
  {
    key: TaskStatus;
    dotClass: string;
    countBadgeClass: string;
    trackClass: string;
    dragOverClass: string;
    defaultBgClass: string;
  }
> = {
  todo: {
    key: 'todo',
    dotClass: 'bg-[#736B5E] dark:bg-[#9A9183]',
    countBadgeClass: 'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD]',
    trackClass: 'status-track-todo',
    dragOverClass:
      'border-[#7A5818] dark:border-[#D4B26E] bg-[#D4B26E]/10 ring-2 ring-[#D4B26E]/20 shadow-md',
    defaultBgClass:
      'border-[#DDDAD3] dark:border-[#2C2824] bg-[#EDECE8]/60 dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark',
  },
  in_progress: {
    key: 'in_progress',
    dotClass: 'bg-[#1E4D8A] dark:bg-[#8DB4E8]',
    countBadgeClass: 'bg-[#E3EDF8] dark:bg-[#142136] text-[#1E4D8A] dark:text-[#8DB4E8]',
    trackClass: 'status-track-in_progress',
    dragOverClass: 'border-[#8DB4E8] bg-[#8DB4E8]/10 ring-2 ring-[#8DB4E8]/20 shadow-md',
    defaultBgClass:
      'border-[#DDDAD3] dark:border-[#2C2824] bg-[#EDECE8]/60 dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark',
  },
  done: {
    key: 'done',
    dotClass: 'bg-[#235832] dark:bg-[#9CC5A1]',
    countBadgeClass: 'bg-[#E1EFE4] dark:bg-[#152618] text-[#235832] dark:text-[#9CC5A1]',
    trackClass: 'status-track-done',
    dragOverClass: 'border-[#9CC5A1] bg-[#9CC5A1]/10 ring-2 ring-[#9CC5A1]/20 shadow-md',
    defaultBgClass:
      'border-[#DDDAD3] dark:border-[#2C2824] bg-[#EDECE8]/60 dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark',
  },
};

const STYLES = {
  container: 'space-y-4',
  card: 'tactile-card border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark',
  cardFlat: 'tactile-card border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-none',
  pageTitle: '!mb-0 !text-xl sm:!text-2xl !font-bold tracking-tight text-[#1B1915] dark:text-[#EFE9DD] font-display',
  primaryGoldButton:
    'tactile-btn !bg-[#7A5818] hover:!bg-[#5E420E] dark:!bg-[#D4B26E] dark:hover:!bg-[#E2C88E] !border-transparent !text-white dark:!text-[#1A1408] font-bold shadow-xs text-sm',
  secondaryButton:
    'tactile-btn border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD] font-semibold text-sm',
  inputBase:
    'rounded text-sm bg-[#F4F4F2] dark:bg-[#141211] border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]',
  columnShell:
    'flex-col rounded-xl border p-4 space-y-3.5 transition-all duration-150 relative min-h-[580px] lg:min-h-[calc(100vh-210px)]',
} as const;

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
type ViewMode = 'kanban' | 'table';
type MobileKanbanColumn = 'todo' | 'in_progress' | 'done';
type SortByOption = 'default' | 'priority' | 'due_date' | 'title';

interface FilterState {
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  assigneeFilter: string;
  overdueOnly: boolean;
  myTasksOnly: boolean;
  sortBy: SortByOption;
}

interface TaskModalFormValues {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tag?: string;
  assigneeId?: string;
  dueDate?: string;
}

// ============================================================================
// 4. HELPER FUNCTIONS & HOOKS
// ============================================================================
function filterAndSortTasks(
  tasks: Task[],
  filters: FilterState,
  currentUserId?: string
): Task[] {
  let result = [...tasks];

  // 1. Search Query
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assigneeName && t.assigneeName.toLowerCase().includes(q))
    );
  }

  // 2. Status Filter
  if (filters.statusFilter !== 'all') {
    result = result.filter((t) => t.status === filters.statusFilter);
  }

  // 3. Priority Filter
  if (filters.priorityFilter !== 'all') {
    result = result.filter((t) => t.priority === filters.priorityFilter);
  }

  // 4. Assignee Filter
  if (filters.assigneeFilter !== 'all') {
    if (filters.assigneeFilter === 'unassigned') {
      result = result.filter((t) => !t.assigneeId);
    } else {
      result = result.filter((t) => t.assigneeId === filters.assigneeFilter);
    }
  }

  // 5. Overdue Only Filter
  if (filters.overdueOnly) {
    result = result.filter((t) => isTaskOverdue(t.dueDate, t.status));
  }

  // 6. My Tasks Only Filter
  if (filters.myTasksOnly && currentUserId) {
    result = result.filter((t) => t.assigneeId === currentUserId);
  }

  // 7. Sorting
  if (filters.sortBy === 'priority') {
    result.sort((a, b) => PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority]);
  } else if (filters.sortBy === 'due_date') {
    result.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  } else if (filters.sortBy === 'title') {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  return result;
}

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================


interface KanbanColumnShellProps {
  status: TaskStatus;
  title: string;
  count: number;
  tasks: Task[];
  dragOverCol: TaskStatus | null;
  mobileKanbanCol: MobileKanbanColumn;
  showAddButton: boolean; // CRITICAL: Only true for 'todo' column
  emptyMessage: string;
  dropMessage: string;
  onAddTask?: () => void;
  onDragOver: (e: React.DragEvent, status: TaskStatus) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
  renderTaskCard: (task: Task) => React.ReactNode;
}

function KanbanColumnShell({
  status,
  title,
  count,
  tasks,
  dragOverCol,
  mobileKanbanCol,
  showAddButton,
  emptyMessage,
  dropMessage,
  onAddTask,
  onDragOver,
  onDragLeave,
  onDrop,
  renderTaskCard,
}: KanbanColumnShellProps) {
  const colMeta = KANBAN_COLUMNS_CONFIG[status];
  const isDragOver = dragOverCol === status;
  const isVisibleOnMobile = mobileKanbanCol === status;

  return (
    <div
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
      className={`${
        isVisibleOnMobile ? 'block' : 'hidden md:flex'
      } ${STYLES.columnShell} ${colMeta.trackClass} ${
        isDragOver ? colMeta.dragOverClass : colMeta.defaultBgClass
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#DDDAD3] dark:border-[#2C2824]">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${colMeta.dotClass}`} />
          <span className="font-bold text-base uppercase tracking-wider text-[#1B1915] dark:text-[#EFE9DD] font-sans">
            {title}
          </span>
          <span className={`text-sm font-bold px-3 py-0.5 rounded-full ${colMeta.countBadgeClass} tnum`}>
            {count}
          </span>
        </div>

        {/* KANBAN RULE: The '+' task creation button exists ONLY on 'todo' column */}
        {showAddButton && onAddTask && (
          <Tooltip title={title}>
            <Button
              type="text"
              size="middle"
              icon={<PlusOutlined />}
              onClick={onAddTask}
              className="text-base text-[#736B5E] hover:text-[#7A5818] dark:text-[#9A9183] dark:hover:text-[#D4B26E] rounded"
              aria-label="Add task"
            />
          </Tooltip>
        )}
      </div>

      {/* Column Cards Container */}
      <div className="space-y-3 min-h-[500px] lg:min-h-[calc(100vh-360px)] flex-1 flex flex-col">
        {tasks.length === 0 ? (
          <div
            className={`text-center py-14 px-4 rounded-xl border border-dashed flex-1 flex flex-col items-center justify-center gap-2.5 transition-all select-none ${
              isDragOver
                ? 'border-[#7A5818] dark:border-[#D4B26E] text-[#7A5818] dark:text-[#D4B26E] bg-[#D4B26E]/5 font-semibold'
                : 'border-[#DDDAD3] dark:border-[#2C2824] bg-white/30 dark:bg-[#141211]/30 text-[#736B5E] dark:text-[#9A9183]'
            }`}
          >
            <div className="w-10 h-10 rounded-lg border border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-center bg-white dark:bg-[#1C1A17] shadow-2xs">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <span className="text-xs font-medium max-w-[220px] leading-relaxed">
              {isDragOver ? dropMessage : emptyMessage}
            </span>
          </div>
        ) : (
          tasks.map((task) => renderTaskCard(task))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export default function ProjectDetailsPage() {
  const { message } = App.useApp();
  const params = useParams();
  const projectId = params?.id as string;
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const { themeMode } = useTheme();
  const { t, language, formatTaskStatus, formatTaskPriority, formatDateLocalized, isRTL } =
    useLanguage();
  const isArabic = language === 'ar';

  const [taskForm] = Form.useForm();

  // --- Project & Tasks State ---
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- View Mode ---
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [mobileKanbanCol, setMobileKanbanCol] = useState<MobileKanbanColumn>('todo');

  // --- Filters & Sorting ---
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    statusFilter: 'all',
    priorityFilter: 'all',
    assigneeFilter: 'all',
    overdueOnly: false,
    myTasksOnly: false,
    sortBy: 'default',
  });

  // --- Task Modals & Inspection State ---
  const [inspectingTaskId, setInspectingTaskId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // --- Drag and Drop State ---
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  // --- Load Data ---
  const loadProjectData = useCallback(async () => {
    if (!user || !projectId) return;
    setLoading(true);
    setError(null);
    try {
      const proj = await DataService.getProjectById(projectId, user.uid);
      if (!proj) {
        setError('Project not found or you lack permission to view it.');
        return;
      }
      setProject(proj);

      const taskList = await DataService.getProjectTasks(projectId, user.uid);
      setTasks(taskList);
    } catch (err: any) {
      setError(err?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && projectId) {
      loadProjectData();
    }
  }, [user, authLoading, projectId, loadProjectData, router]);

  // --- Global Event Listener for Quick Task Dispatch (Command Palette & Shortcuts) ---
  useEffect(() => {
    const handleQuickTask = () => {
      openCreateTaskModal('todo');
    };
    window.addEventListener('taskflow:open-create-task', handleQuickTask);
    return () => window.removeEventListener('taskflow:open-create-task', handleQuickTask);
  }, []);

  // --- Auto-trigger Task Creation from Onboarding if flag is present in sessionStorage ---
  useEffect(() => {
    if (project && typeof window !== 'undefined') {
      if (sessionStorage.getItem('taskflow_auto_create_task') === 'true') {
        sessionStorage.removeItem('taskflow_auto_create_task');
        openCreateTaskModal('todo');
      }
    }
  }, [project]);

  // --- Derived Calculations & Filtered Tasks (Zero useEffect loops) ---
  const isOwner = Boolean(project && user && project.ownerId === user.uid);

  const filteredTasks = useMemo(() => {
    return filterAndSortTasks(tasks, filters, user?.uid);
  }, [tasks, filters, user?.uid]);

  const todoTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'todo'), [filteredTasks]);
  const inProgressTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'in_progress'),
    [filteredTasks]
  );
  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'done'), [filteredTasks]);

  const overdueCount = useMemo(() => {
    return tasks.filter((t) => isTaskOverdue(t.dueDate, t.status)).length;
  }, [tasks]);

  const doneCount = useMemo(() => tasks.filter((t) => t.status === 'done').length, [tasks]);
  const inProgressCount = useMemo(() => tasks.filter((t) => t.status === 'in_progress').length, [tasks]);
  const todoCount = useMemo(() => tasks.filter((t) => t.status === 'todo').length, [tasks]);
  const completionPercent = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  // --- Filter State Updaters ---
  const updateFilterField = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      assigneeFilter: 'all',
      overdueOnly: false,
      myTasksOnly: false,
      sortBy: 'default',
    });
  };

  // --- Modal Openers ---
  const openCreateTaskModal = (initialStatus?: TaskStatus | React.MouseEvent) => {
    const statusVal: TaskStatus =
      initialStatus === 'in_progress' || initialStatus === 'done' ? initialStatus : 'todo';
    setEditingTask(null);
    taskForm.resetFields();
    taskForm.setFieldsValue({
      status: statusVal,
      priority: 'medium',
      tag: '',
      assigneeId: '',
    });
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    if (!user) return;
    const canEdit = isOwner || task.createdBy === user.uid || task.assigneeId === user.uid;
    if (!canEdit) {
      message.error('You can only edit tasks you created or are assigned to.');
      return;
    }

    const { tag, cleanTitle } = parseTaskTag(task.title);
    setEditingTask(task);
    taskForm.setFieldsValue({
      title: cleanTitle,
      tag: tag?.label || '',
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate || '',
    });
    setIsTaskModalOpen(true);
  };

  // --- Task Operations Handlers ---
  const handleSaveTask = async (values: TaskModalFormValues) => {
    if (!user || !project || taskSubmitting) return;
    let title = values.title?.trim() || '';
    if (values.tag && !title.toLowerCase().startsWith(`[${values.tag.toLowerCase()}]`)) {
      title = `[${values.tag}] ${title}`;
    }

    try {
      setTaskSubmitting(true);
      if (editingTask) {
        await DataService.updateTask(
          projectId,
          editingTask.id,
          {
            title,
            description: values.description?.trim() || undefined,
            status: values.status,
            priority: values.priority,
            assigneeId: values.assigneeId || null,
            dueDate: values.dueDate || null,
          },
          user
        );
        message.success('Task updated successfully');
      } else {
        await DataService.createTask(
          projectId,
          {
            title,
            description: values.description?.trim() || undefined,
            status: values.status,
            priority: values.priority,
            assigneeId: values.assigneeId || null,
            dueDate: values.dueDate || null,
          },
          user
        );
        message.success('Task created successfully');
      }

      const updatedTasks = await DataService.getProjectTasks(projectId, user.uid);
      setTasks(updatedTasks);
      setIsTaskModalOpen(false);
    } catch (err: any) {
      message.error(err?.message || 'Failed to save task');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (taskOrId: Task | string, nextStatus: TaskStatus) => {
    if (!user) return;
    const taskId = typeof taskOrId === 'string' ? taskOrId : taskOrId.id;
    const oldTask = tasks.find((t) => t.id === taskId);
    if (!oldTask || oldTask.status === nextStatus) return;

    // Optimistic Update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));

    try {
      await DataService.updateTask(projectId, taskId, { status: nextStatus }, user);
      message.success(`Status updated to ${nextStatus.replace('_', ' ')}`);
    } catch (err: any) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? oldTask : t)));
      message.error(err?.message || 'Failed to change task status');
    }
  };

  const handleQuickPriorityChange = async (taskId: string, nextPriority: TaskPriority) => {
    if (!user) return;
    const oldTask = tasks.find((t) => t.id === taskId);
    if (!oldTask || oldTask.priority === nextPriority) return;

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, priority: nextPriority } : t)));
    try {
      await DataService.updateTask(projectId, taskId, { priority: nextPriority }, user);
      message.success(`Priority updated to ${nextPriority}`);
    } catch (err: any) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? oldTask : t)));
      message.error(err?.message || 'Failed to update priority');
    }
  };

  const handleQuickAssigneeChange = async (taskId: string, nextAssigneeId: string) => {
    if (!user || !project) return;
    const oldTask = tasks.find((t) => t.id === taskId);
    if (!oldTask) return;

    const assigneeName = nextAssigneeId
      ? project.memberDetails?.[nextAssigneeId]?.displayName || nextAssigneeId
      : null;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, assigneeId: nextAssigneeId || null, assigneeName } : t
      )
    );

    try {
      await DataService.updateTask(projectId, taskId, { assigneeId: nextAssigneeId || null }, user);
      message.success('Assignee updated');
    } catch (err: any) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? oldTask : t)));
      message.error(err?.message || 'Failed to update assignee');
    }
  };

  const handleQuickDueDateChange = async (taskId: string, nextDueDate: string) => {
    if (!user) return;
    const oldTask = tasks.find((t) => t.id === taskId);
    if (!oldTask) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: nextDueDate || null } : t))
    );

    try {
      await DataService.updateTask(projectId, taskId, { dueDate: nextDueDate || null }, user);
      message.success('Due date updated');
    } catch (err: any) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? oldTask : t)));
      message.error(err?.message || 'Failed to update due date');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await DataService.deleteTask(projectId, taskId, user);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      message.success(isArabic ? 'تم حذف المهمة بنجاح' : 'Task deleted');
    } catch (err: any) {
      message.error(err?.message || (isArabic ? 'فشل حذف المهمة' : 'Failed to delete task'));
    }
  };

  // --- HTML5 Drag & Drop Handlers ---
  const handleDragOver = (e: React.DragEvent, colStatus: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colStatus) setDragOverCol(colStatus);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) handleQuickStatusChange(taskId, targetStatus);
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  // --- Table View Column Definitions ---
  const tableColumns: ColumnsType<Task> = useMemo(
    () => [
      {
        title: t('colStatus'),
        dataIndex: 'status',
        key: 'status',
        width: 140,
        render: (status: TaskStatus, record: Task) => {
          const canEdit =
            isOwner || record.createdBy === user?.uid || record.assigneeId === user?.uid;
          const color =
            status === 'done' ? 'success' : status === 'in_progress' ? 'processing' : 'default';
          const label = formatTaskStatus(status);

          if (!canEdit) {
            return <Tag color={color}>{label}</Tag>;
          }

          return (
            <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <Tooltip title={t('colStatus')}>
                <Select
                  size="middle"
                  value={status}
                  onChange={(val) => handleQuickStatusChange(record, val as TaskStatus)}
                  className="w-32 text-sm font-semibold"
                  options={[
                    { value: 'todo', label: t('statusTodo') },
                    { value: 'in_progress', label: t('statusInProgress') },
                    { value: 'done', label: t('statusDone') },
                  ]}
                />
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: t('colTitle'),
        dataIndex: 'title',
        key: 'title',
        render: (text: string, record: Task) => {
          const isOverdue = isTaskOverdue(record.dueDate, record.status);
          return (
            <div
              dir="auto"
              className="cursor-pointer"
              onClick={() => setInspectingTaskId(record.id)}
            >
              <div
                className={`font-semibold text-sm sm:text-base ${
                  record.status === 'done'
                    ? 'line-through text-slate-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {text}
                {isOverdue && (
                  <Tag color="error" className="ms-2 text-xs font-bold">
                    {t('overdueBadge')}
                  </Tag>
                )}
              </div>
              {record.description && (
                <div
                  dir="auto"
                  className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate max-w-md mt-0.5"
                >
                  {record.description}
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: t('colPriority'),
        dataIndex: 'priority',
        key: 'priority',
        width: 130,
        render: (priority: TaskPriority) => {
          return (
            <Tooltip title={`${t('colPriority')}: ${formatTaskPriority(priority)}`}>
              <span className="inline-flex cursor-default">
                <PrioritySignalBadge
                  priority={priority}
                  label={formatTaskPriority(priority)}
                  size="sm"
                />
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: t('colAssignee'),
        dataIndex: 'assigneeName',
        key: 'assigneeName',
        width: 170,
        render: (_: any, record: Task) => {
          if (!record.assigneeName) {
            return <span className="text-slate-400 text-sm italic">{t('unassigned')}</span>;
          }
          return (
            <Tooltip title={`${t('assignedToPrefix')} ${record.assigneeName}`}>
              <Space orientation="horizontal" size={6} className="cursor-default">
                <Avatar
                  size={26}
                  icon={<UserOutlined />}
                  className="bg-[#7A5818] dark:bg-[#D4B26E] text-white dark:text-[#1A1408] font-bold text-xs"
                >
                  {record.assigneeName.charAt(0).toUpperCase()}
                </Avatar>
                <span className="text-sm font-medium truncate max-w-[110px] text-[#1B1915] dark:text-[#EFE9DD]">
                  {record.assigneeName}
                </span>
              </Space>
            </Tooltip>
          );
        },
      },
      {
        title: t('colDueDate'),
        dataIndex: 'dueDate',
        key: 'dueDate',
        width: 150,
        render: (dueDate: string | null, record: Task) => {
          if (!dueDate) return <span className="text-slate-400 text-sm font-mono">—</span>;
          const isOverdue = isTaskOverdue(dueDate, record.status);
          return (
            <Tooltip title={isOverdue ? t('overdueFilter') : t('colDueDate')}>
              <span
                className={`text-sm font-mono cursor-default ${
                  isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <CalendarOutlined className="me-1" />
                {formatDateLocalized(dueDate)}
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: t('colActions'),
        key: 'actions',
        width: 110,
        render: (_: any, record: Task) => {
          const canEdit =
            isOwner || record.createdBy === user?.uid || record.assigneeId === user?.uid;
          const canDelete = isOwner || record.createdBy === user?.uid;

          return (
            <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <Space orientation="horizontal" size={4}>
                {canEdit && (
                  <Tooltip title={t('editAction')}>
                    <Button
                      type="text"
                      size="middle"
                      icon={<EditOutlined className="text-sm" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditTaskModal(record);
                      }}
                      aria-label={`Edit task ${record.title}`}
                      className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    />
                  </Tooltip>
                )}
                {canDelete && (
                  <Popconfirm
                    title={t('deleteTaskConfirmTitle')}
                    description={`${t('deleteTaskConfirmDesc')} ("${record.title}")`}
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDeleteTask(record.id);
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
                        aria-label={`Delete task ${record.title}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Tooltip>
                  </Popconfirm>
                )}
              </Space>
            </div>
          );
        },
      },
    ],
    [
      isOwner,
      user?.uid,
      t,
      formatTaskStatus,
      formatTaskPriority,
      formatDateLocalized,
      handleQuickStatusChange,
    ]
  );

  // --- Flat Guard Clauses ---
  if (loading || authLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <Card className="max-w-md mx-auto text-center py-12 mt-8 border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211]">
        <ExclamationCircleOutlined className="text-3xl text-[#EE8A78] mb-3" />
        <Title level={4} className="font-display !text-[#1B1915] dark:!text-[#EFE9DD]">
          Access Denied or Not Found
        </Title>
        <Text type="secondary" className="block mb-6 !text-[#5A5348] dark:!text-[#B5AC9C]">
          {error || 'Unable to open project'}
        </Text>
        <Link href="/dashboard">
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            className="!bg-[#7A5818] dark:!bg-[#D4B26E] !border-[#7A5818] dark:!border-[#D4B26E] !text-white dark:!text-[#1A1408] font-bold"
          >
            Return to Dashboard
          </Button>
        </Link>
      </Card>
    );
  }

  // Helper card renderer passed into columns
  const renderKanbanCardItem = (task: Task) => {
    const canEdit = isOwner || task.createdBy === user?.uid || task.assigneeId === user?.uid;
    const canDelete = isOwner || task.createdBy === user?.uid;
    const isDragging = draggedTaskId === task.id;

    return (
      <KanbanCard
        key={task.id}
        task={task}
        canEdit={Boolean(canEdit)}
        canDelete={Boolean(canDelete)}
        isDragging={isDragging}
        onInspect={(id) => setInspectingTaskId(id)}
        onEdit={openEditTaskModal}
        onDelete={handleDeleteTask}
        onStatusChange={(t, status) => handleQuickStatusChange(t.id, status)}
        onDragStart={(e, id) => {
          e.dataTransfer.setData('text/plain', id);
          setDraggedTaskId(id);
        }}
        onDragEnd={() => {
          setDraggedTaskId(null);
          setDragOverCol(null);
        }}
      />
    );
  };

  const isAnyFilterActive =
    filters.searchQuery ||
    filters.statusFilter !== 'all' ||
    filters.priorityFilter !== 'all' ||
    filters.assigneeFilter !== 'all' ||
    filters.overdueOnly ||
    filters.myTasksOnly ||
    filters.sortBy !== 'default';

  return (
    <div className={STYLES.container}>
      {/* Unified Project Workbench Header & Control Strip */}
      <div className="tactile-card border border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark rounded-xl p-4 sm:p-5 space-y-4">
        {/* Row 1: Project Identity, Telemetry Chips & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Title level={2} className={STYLES.pageTitle}>
              {project.name}
            </Title>
            <Tooltip
              title={
                isOwner
                  ? isArabic
                    ? 'مالك المشروع (صلاحيات كاملة)'
                    : 'Project Owner (Full Control)'
                  : isArabic
                  ? 'عضو في المشروع'
                  : 'Project Member'
              }
            >
              <Tag
                className="m-0 text-xs font-semibold border-[#DDDAD3] dark:border-[#2C2824] bg-[#EDECE8] dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD] cursor-default px-2.5 py-0.5"
                icon={
                  isOwner ? (
                    <CrownOutlined className="text-[#7A5818] dark:text-[#D4B26E]" />
                  ) : (
                    <UserOutlined />
                  )
                }
              >
                {isOwner ? t('owner') : t('member')}
              </Tag>
            </Tooltip>

            {/* Inline Sleek Telemetry Badges */}
            <div className="hidden sm:flex items-center gap-2 ps-1 text-xs font-medium text-[#736B5E] dark:text-[#9A9183]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EDECE8]/70 dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824]">
                <span className="font-bold text-[#1B1915] dark:text-[#EFE9DD] tnum">{tasks.length}</span> {t('totalTasks')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E3EDF8]/50 dark:bg-[#142136]/50 border border-[#8DB4E8]/20 text-[#1E4D8A] dark:text-[#8DB4E8]">
                <span className="font-bold tnum">{inProgressCount}</span> {t('statusInProgress')}
              </span>
              {overdueCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[#9C2E1F] dark:text-[#EE8A78]">
                  <span className="font-bold tnum">{overdueCount}</span> {t('overdueFilter')}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {isOwner && (
              <Tooltip title={t('projectSettingsTitle')}>
                <Link href={`/projects/${project.id}/settings`}>
                  <Button icon={<SettingOutlined />} size="middle" className={STYLES.secondaryButton}>
                    {t('settings')}
                  </Button>
                </Link>
              </Tooltip>
            )}
            <Tooltip title={t('addTask')}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                onClick={() => openCreateTaskModal('todo')}
                className={STYLES.primaryGoldButton}
              >
                {t('addTask')}
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Row 2: Description & Team Roster + Sprint Velocity Bar */}
        {(project.description || project.memberIds.length > 0 || tasks.length > 0) && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-[#DDDAD3]/70 dark:border-[#2C2824]/70">
            <div className="space-y-1.5 flex-1 min-w-0">
              {project.description && (
                <Paragraph className="text-xs sm:text-sm text-[#5A5348] dark:text-[#B5AC9C] !mb-0 max-w-2xl leading-relaxed">
                  {project.description}
                </Paragraph>
              )}

              {/* Team Roster tags */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <Text type="secondary" className="me-1 text-[#736B5E] dark:text-[#9A9183]">
                  <TeamOutlined /> {t('teamRoster')}:
                </Text>
                {project.memberIds.slice(0, CONFIG.teamRosterPreviewCount).map((mId) => {
                  const info = project.memberDetails?.[mId];
                  const isProjectOwner = mId === project.ownerId;
                  return (
                    <Tooltip
                      key={mId}
                      title={isArabic ? 'عرض تفاصيل أعضاء الفريق' : 'View team roster'}
                    >
                      <Tag
                        onClick={() => setIsTeamModalOpen(true)}
                        className="text-xs border-[#DDDAD3] dark:border-[#2C2824] bg-[#EDECE8] dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD] cursor-pointer hover:border-[#7A5818] dark:hover:border-[#D4B26E] transition-colors px-1.5 py-0"
                      >
                        {isProjectOwner && (
                          <CrownOutlined className="text-[#7A5818] dark:text-[#D4B26E] me-1" />
                        )}
                        {info?.displayName || mId}
                      </Tag>
                    </Tooltip>
                  );
                })}
                {project.memberIds.length > CONFIG.teamRosterPreviewCount && (
                  <Tooltip title={isArabic ? 'عرض جميع أعضاء الفريق' : 'View all team members'}>
                    <button
                      type="button"
                      onClick={() => setIsTeamModalOpen(true)}
                      className="tactile-btn inline-flex items-center px-1.5 py-0 rounded text-xs font-semibold bg-[#7A5818]/10 dark:bg-[#D4B26E]/15 hover:bg-[#7A5818]/20 text-[#7A5818] dark:text-[#D4B26E] border border-[#7A5818]/25 dark:border-[#D4B26E]/30 cursor-pointer transition-colors"
                    >
                      +{project.memberIds.length - CONFIG.teamRosterPreviewCount} {t('membersCount')}
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Compact Sprint Velocity */}
            {tasks.length > 0 && (
              <div className="w-full md:w-56 shrink-0 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5A5348] dark:text-[#B5AC9C] font-medium">
                    {t('sprintVelocity')}
                  </span>
                  <span className="font-bold text-[#7A5818] dark:text-[#D4B26E] tnum">
                    {completionPercent}% ({doneCount}/{tasks.length})
                  </span>
                </div>
                <Progress
                  percent={completionPercent}
                  showInfo={false}
                  strokeColor={themeMode === 'dark' ? '#D4B26E' : '#7A5818'}
                  railColor={
                    themeMode === 'dark' ? 'rgba(239, 233, 221, 0.1)' : 'rgba(27, 25, 21, 0.08)'
                  }
                  size={['100%', 5]}
                />
              </div>
            )}
          </div>
        )}

        {/* Row 3: Integrated Filter & View Controls */}
        <div className="pt-3 border-t border-[#DDDAD3]/70 dark:border-[#2C2824]/70 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Left: View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Segmented
              value={viewMode}
              onChange={(val) => setViewMode(val as ViewMode)}
              size="middle"
              options={[
                {
                  value: 'kanban',
                  label: <span className="font-semibold text-xs sm:text-sm px-1">{t('kanbanBoard')}</span>,
                  icon: <AppstoreOutlined className="text-xs sm:text-sm" />,
                },
                {
                  value: 'table',
                  label: <span className="font-semibold text-xs sm:text-sm px-1">{t('tableView')}</span>,
                  icon: <UnorderedListOutlined className="text-xs sm:text-sm" />,
                },
              ]}
            />
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-sm">
            <Tooltip
              title={
                isArabic
                  ? 'البحث عن طريق عنوان المهمة أو الوصف أو المسؤول'
                  : 'Search by task title, description, or assignee'
              }
            >
              <Input
                prefix={<SearchOutlined className="text-[#736B5E] dark:text-[#9A9183] me-1 text-sm" />}
                placeholder={t('filterTasksPlaceholder')}
                value={filters.searchQuery}
                onChange={(e) => updateFilterField('searchQuery', e.target.value)}
                allowClear
                size="middle"
                className="rounded text-sm bg-[#F4F4F2] dark:bg-[#1C1A17] border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]"
              />
            </Tooltip>
          </div>

          {/* Right: Quick Filters & Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Overdue Filter Button */}
            <Tooltip title={isArabic ? 'عرض المهام المتأخرة فقط' : 'Show only overdue tasks'}>
              <Button
                type={filters.overdueOnly ? 'primary' : 'default'}
                danger={filters.overdueOnly || overdueCount > 0}
                icon={<ClockCircleOutlined className="text-xs" />}
                onClick={() => updateFilterField('overdueOnly', !filters.overdueOnly)}
                size="middle"
                className="tactile-btn flex items-center gap-1 font-semibold text-xs border-[#DDDAD3] dark:border-[#2C2824] rounded"
              >
                {t('overdueFilter')}
                {overdueCount > 0 && (
                  <span className="ms-1 text-[11px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-[#9C2E1F] dark:text-[#EE8A78] tnum">
                    {overdueCount}
                  </span>
                )}
              </Button>
            </Tooltip>

            {/* Quick My Tasks Filter Button */}
            <Tooltip title={isArabic ? 'عرض المهام المسندة إلي فقط' : 'Show only tasks assigned to me'}>
              <Button
                type={filters.myTasksOnly ? 'primary' : 'default'}
                icon={<UserOutlined className="text-xs" />}
                onClick={() => updateFilterField('myTasksOnly', !filters.myTasksOnly)}
                size="middle"
                className={`tactile-btn flex items-center gap-1 font-semibold text-xs border-[#DDDAD3] dark:border-[#2C2824] rounded ${
                  filters.myTasksOnly
                    ? '!bg-[#7A5818] dark:!bg-[#D4B26E] !border-transparent !text-white dark:!text-[#1A1408] font-bold'
                    : ''
                }`}
              >
                {t('myTasksFilter')}
              </Button>
            </Tooltip>

            {/* Status Dropdown */}
            <Select
              value={filters.statusFilter}
              onChange={(val) => updateFilterField('statusFilter', val)}
              size="middle"
              className="w-28 text-xs font-semibold"
              options={[
                { value: 'all', label: t('allStatus') },
                { value: 'todo', label: t('statusTodo') },
                { value: 'in_progress', label: t('statusInProgress') },
                { value: 'done', label: t('statusDone') },
              ]}
            />

            {/* Priority Dropdown */}
            <Select
              value={filters.priorityFilter}
              onChange={(val) => updateFilterField('priorityFilter', val)}
              size="middle"
              className="w-28 text-xs font-semibold"
              options={[
                { value: 'all', label: t('allPriority') },
                {
                  value: 'high',
                  label: (
                    <div className="flex items-center justify-between gap-1">
                      <span>{t('priorityHigh')}</span>
                      <PrioritySignalIcon priority="high" size="sm" />
                    </div>
                  ),
                },
                {
                  value: 'medium',
                  label: (
                    <div className="flex items-center justify-between gap-1">
                      <span>{t('priorityMedium')}</span>
                      <PrioritySignalIcon priority="medium" size="sm" />
                    </div>
                  ),
                },
                {
                  value: 'low',
                  label: (
                    <div className="flex items-center justify-between gap-1">
                      <span>{t('priorityLow')}</span>
                      <PrioritySignalIcon priority="low" size="sm" />
                    </div>
                  ),
                },
              ]}
            />

            {/* Assignee Dropdown */}
            <Select
              value={filters.assigneeFilter}
              onChange={(val) => updateFilterField('assigneeFilter', val)}
              size="middle"
              className="w-32 text-xs font-semibold"
              options={[
                { value: 'all', label: t('allMembers') },
                { value: 'unassigned', label: t('unassigned') },
                ...project.memberIds.map((mId) => ({
                  value: mId,
                  label: project.memberDetails?.[mId]?.displayName || mId,
                })),
              ]}
            />

            {/* Sort Selector */}
            <Select
              value={filters.sortBy}
              onChange={(val) => updateFilterField('sortBy', val as SortByOption)}
              size="middle"
              className="w-32 text-xs font-semibold"
              options={[
                { value: 'default', label: t('sortDefault') },
                { value: 'priority', label: t('sortPriority') },
                { value: 'due_date', label: t('sortDueDate') },
                { value: 'title', label: t('sortTitle') },
              ]}
            />

            {isAnyFilterActive && (
              <Tooltip
                title={
                  isArabic ? 'إعادة ضبط كافة الفلاتر والبحث' : 'Reset all filters and search'
                }
              >
                <Button
                  type="link"
                  size="middle"
                  onClick={handleResetFilters}
                  className="!text-[#7A5818] dark:!text-[#D4B26E] font-bold text-xs"
                >
                  {t('resetFilters')}
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Main View: Kanban Board vs Table */}
      {viewMode === 'kanban' ? (
        <div>
          {/* Mobile Column Segmented Tab Bar */}
          <div className="md:hidden mb-4">
            <Segmented
              block
              size="middle"
              value={mobileKanbanCol}
              onChange={(val) => setMobileKanbanCol(val as MobileKanbanColumn)}
              options={[
                {
                  value: 'todo',
                  label: (
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      <span className="font-semibold text-sm">{t('statusTodo')}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 tnum">
                        {todoCount}
                      </span>
                    </div>
                  ),
                },
                {
                  value: 'in_progress',
                  label: (
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      <span className="font-semibold text-sm">{t('statusInProgress')}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#8DB4E8]/20 text-[#8DB4E8] tnum">
                        {inProgressCount}
                      </span>
                    </div>
                  ),
                },
                {
                  value: 'done',
                  label: (
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      <span className="font-semibold text-sm">{t('statusDone')}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#9CC5A1]/20 text-[#3b6e41] dark:text-[#9CC5A1] tnum">
                        {doneCount}
                      </span>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Column 1: TO DO (CRITICAL: showAddButton = true) */}
            <KanbanColumnShell
              status="todo"
              title={t('statusTodo')}
              count={todoTasks.length}
              tasks={todoTasks}
              dragOverCol={dragOverCol}
              mobileKanbanCol={mobileKanbanCol}
              showAddButton={true}
              emptyMessage={t('noTasksInQueue')}
              dropMessage={`${t('dropHereToMove')} ${t('statusTodo')}`}
              onAddTask={() => openCreateTaskModal('todo')}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              renderTaskCard={renderKanbanCardItem}
            />

            {/* Column 2: IN PROGRESS (CRITICAL: showAddButton = false) */}
            <KanbanColumnShell
              status="in_progress"
              title={t('statusInProgress')}
              count={inProgressTasks.length}
              tasks={inProgressTasks}
              dragOverCol={dragOverCol}
              mobileKanbanCol={mobileKanbanCol}
              showAddButton={false}
              emptyMessage={t('noTasksInProgress')}
              dropMessage={`${t('dropHereToMove')} ${t('statusInProgress')}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              renderTaskCard={renderKanbanCardItem}
            />

            {/* Column 3: DONE (CRITICAL: showAddButton = false) */}
            <KanbanColumnShell
              status="done"
              title={t('statusDone')}
              count={doneTasks.length}
              tasks={doneTasks}
              dragOverCol={dragOverCol}
              mobileKanbanCol={mobileKanbanCol}
              showAddButton={false}
              emptyMessage={t('noTasksCompleted')}
              dropMessage={`${t('dropHereToMove')} ${t('statusDone')}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              renderTaskCard={renderKanbanCardItem}
            />
          </div>
        </div>
      ) : (
        /* Table View */
        <Card variant="outlined" className={`${STYLES.card} overflow-hidden !p-0`}>
          <Table
            columns={tableColumns}
            dataSource={filteredTasks}
            rowKey="id"
            pagination={{ pageSize: CONFIG.tablePageSize }}
            onRow={(record) => ({
              onClick: () => setInspectingTaskId(record.id),
              className:
                'cursor-pointer hover:bg-[#EDECE8] dark:hover:bg-[#1C1A17] transition-colors',
            })}
          />
        </Card>
      )}

      {/* Task Creation & Edit Modal */}
      <Modal
        title={
          <div className="font-bold text-base pb-2 border-b border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]">
            {editingTask ? t('editTaskModalTitle') : t('createTaskModalTitle')}
          </div>
        }
        open={isTaskModalOpen}
        onCancel={() => setIsTaskModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleSaveTask}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              taskForm.submit();
            }
          }}
          className="mt-4 space-y-2"
        >
          <Form.Item
            name="title"
            label={
              <span className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                {t('taskTitleLabel')}
              </span>
            }
            rules={[
              { required: true, message: 'Task title is required' },
              { min: CONFIG.minTitleLength, message: 'Minimum 3 characters' },
              { max: CONFIG.maxTitleLength, message: 'Maximum 120 characters' },
            ]}
          >
            <Input
              size="middle"
              placeholder={t('taskTitlePlaceholder')}
              maxLength={CONFIG.maxTitleLength}
              showCount
              dir="auto"
              className={STYLES.inputBase}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                {t('taskDescLabel')}
              </span>
            }
            rules={[{ max: CONFIG.maxDescriptionLength, message: 'Max 1000 characters' }]}
          >
            <Input.TextArea
              placeholder={t('taskDescPlaceholder')}
              rows={3}
              maxLength={CONFIG.maxDescriptionLength}
              showCount
              dir="auto"
              className={STYLES.inputBase}
            />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Form.Item
              name="status"
              label={
                <span className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                  {t('colStatus')}
                </span>
              }
            >
              <Select
                size="middle"
                className="text-sm font-semibold"
                options={[
                  { value: 'todo', label: t('statusTodo') },
                  { value: 'in_progress', label: t('statusInProgress') },
                  { value: 'done', label: t('statusDone') },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label={
                <span className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                  {t('colPriority')}
                </span>
              }
            >
              <Select
                size="middle"
                className="text-sm font-semibold"
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
            </Form.Item>

            {/* Zero Emojis: Using only Ant Design vector icons for tags */}
            <Form.Item
              name="tag"
              label={
                <span className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                  {isArabic ? 'الوسم (Label)' : 'Label / Tag'}
                </span>
              }
            >
              <Select
                size="middle"
                allowClear
                placeholder={isArabic ? 'بدون وسم' : 'None'}
                className="text-sm font-semibold"
                options={[
                  { value: '', label: isArabic ? 'بدون وسم' : 'None' },
                  {
                    value: 'Bug',
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <BugOutlined className="text-xs text-rose-500" />
                        <span>Bug {isArabic ? '(خطأ برمجي)' : ''}</span>
                      </span>
                    ),
                  },
                  {
                    value: 'Feature',
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <RocketOutlined className="text-xs text-blue-500" />
                        <span>Feature {isArabic ? '(ميزة جديدة)' : ''}</span>
                      </span>
                    ),
                  },
                  {
                    value: 'Improvement',
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <ThunderboltOutlined className="text-xs text-emerald-500" />
                        <span>Improvement {isArabic ? '(تحسين)' : ''}</span>
                      </span>
                    ),
                  },
                ]}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              name="assigneeId"
              label={
                <span className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                  {t('colAssignee')}
                </span>
              }
            >
              <Select
                size="middle"
                allowClear
                placeholder={t('unassigned')}
                className="text-sm font-semibold"
                options={[
                  { value: '', label: t('unassigned') },
                  ...project.memberIds.map((mId) => ({
                    value: mId,
                    label: project.memberDetails?.[mId]?.displayName || mId,
                  })),
                ]}
              />
            </Form.Item>

            <Form.Item
              name="dueDate"
              label={
                <span className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                  {t('colDueDate')}
                </span>
              }
            >
              <Input
                type="date"
                size="middle"
                className="w-full text-sm font-mono rounded bg-[#F4F4F2] dark:bg-[#141211] border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]"
              />
            </Form.Item>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-[#DDDAD3] dark:border-[#2C2824]">
            <span className="text-[11px] font-mono text-[#736B5E] dark:text-[#9A9183]">
              {isArabic ? 'اضغط ⌘+Enter أو Ctrl+Enter للحفظ' : 'Press ⌘+Enter to save'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="middle"
                onClick={() => setIsTaskModalOpen(false)}
                className="rounded font-semibold text-sm"
              >
                {t('cancel')}
              </Button>
              <Button
                type="primary"
                size="middle"
                htmlType="submit"
                loading={taskSubmitting}
                className={STYLES.primaryGoldButton}
              >
                {editingTask ? t('saveChanges') : t('createTaskAction')}
              </Button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Slide-over Task Inspection Drawer */}
      <TaskDetailDrawer
        task={tasks.find((t) => t.id === inspectingTaskId) || null}
        project={project}
        canEdit={Boolean(
          isOwner ||
            tasks.find((t) => t.id === inspectingTaskId)?.createdBy === user?.uid ||
            tasks.find((t) => t.id === inspectingTaskId)?.assigneeId === user?.uid
        )}
        canDelete={Boolean(
          isOwner || tasks.find((t) => t.id === inspectingTaskId)?.createdBy === user?.uid
        )}
        onClose={() => setInspectingTaskId(null)}
        onEdit={(task) => {
          setInspectingTaskId(null);
          openEditTaskModal(task);
        }}
        onDelete={(taskId) => {
          setInspectingTaskId(null);
          handleDeleteTask(taskId);
        }}
        onStatusChange={(taskId, status) => handleQuickStatusChange(taskId, status)}
        onPriorityChange={(taskId, priority) => handleQuickPriorityChange(taskId, priority)}
        onAssigneeChange={(taskId, assigneeId) => handleQuickAssigneeChange(taskId, assigneeId)}
        onDueDateChange={(taskId, dueDate) => handleQuickDueDateChange(taskId, dueDate)}
      />

      {/* Team Roster Modal */}
      <TeamRosterModal
        open={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        project={project}
        currentUserId={user?.uid}
      />
    </div>
  );
}
