'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/services/dataStore';
import { Project, Task, TaskStatus, TaskPriority } from '@/types';
import { isTaskOverdue, formatDate } from '@/lib/utils';
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
  RightOutlined,
  LeftOutlined,
  CheckOutlined,
  RollbackOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  SortAscendingOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  Card,
  Table,
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
  message,
  Spin,
  Segmented,
  Progress,
  Tooltip,
  Drawer,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import TeamRosterModal from '@/components/ui/TeamRosterModal';
import { useLanguage } from '@/context/LanguageContext';
import { KanbanCard } from '@/components/kanban/KanbanCard';
import { TaskDetailDrawer } from '@/components/kanban/TaskDetailDrawer';
import ProjectDetailSkeleton from '@/components/ui/ProjectDetailSkeleton';

const { Title, Text, Paragraph } = Typography;

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, language, formatTaskStatus, formatTaskPriority, formatDateLocalized, isRTL } = useLanguage();
  const [taskForm] = Form.useForm();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: Kanban vs Table
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Responsive Mobile Kanban Column Tab State
  const [mobileKanbanCol, setMobileKanbanCol] = useState<'todo' | 'in_progress' | 'done'>('todo');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  // Live Evaluation Exercise: Overdue Tasks Filter (Section 18)
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  const [myTasksOnly, setMyTasksOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'default' | 'priority' | 'due_date' | 'title'>('default');

  // Task Slide-over Inspection Drawer State
  const [inspectingTaskId, setInspectingTaskId] = useState<string | null>(null);

  // Kanban HTML5 Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Full Team Roster Modal State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && projectId) {
      loadProjectData();
    }
  }, [user, authLoading, projectId]);

  const loadProjectData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const proj = await DataService.getProjectById(projectId, user.uid);
      if (!proj) {
        setError('Project not found or no longer exists.');
        return;
      }
      setProject(proj);
      const projTasks = await DataService.getProjectTasks(projectId, user.uid);
      setTasks(projTasks);
    } catch (err: any) {
      setError(err?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = project && user ? project.ownerId === user.uid : false;

  // Dynamic inspected task resolver
  const currentInspectedTask = useMemo(() => {
    if (!inspectingTaskId) return null;
    return tasks.find((t) => t.id === inspectingTaskId) || null;
  }, [inspectingTaskId, tasks]);

  // Filtered tasks calculation with linear sorting and personal views
  const filteredTasks = useMemo(() => {
    let list = tasks.filter((t) => {
      // 1. Live Overdue Filter: due date before today and status != 'done'
      if (overdueOnly && !isTaskOverdue(t.dueDate, t.status)) {
        return false;
      }
      // 2. Personal Filter: Tasks assigned to logged in user
      if (myTasksOnly && t.assigneeId !== user?.uid) {
        return false;
      }
      // 3. Search query by title
      if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return false;
      }
      // 4. Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }
      // 5. Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
        return false;
      }
      // 6. Assignee filter
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned') {
          if (t.assigneeId) return false;
        } else if (t.assigneeId !== assigneeFilter) {
          return false;
        }
      }
      return true;
    });

    if (sortBy === 'priority') {
      const pWeights: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
      list = [...list].sort((a, b) => (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0));
    } else if (sortBy === 'due_date') {
      list = [...list].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, overdueOnly, myTasksOnly, sortBy, user]);

  const overdueCount = useMemo(() => {
    return tasks.filter((t) => isTaskOverdue(t.dueDate, t.status)).length;
  }, [tasks]);

  const doneCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'done').length;
  }, [tasks]);

  const inProgressCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'in_progress').length;
  }, [tasks]);

  const todoCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'todo').length;
  }, [tasks]);

  const completionPercent = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  // Open Modal with optional initial column status
  const openCreateTaskModal = (initialStatus?: TaskStatus | React.MouseEvent) => {
    const statusVal: TaskStatus =
      initialStatus === 'in_progress' || initialStatus === 'done' ? initialStatus : 'todo';
    setEditingTask(null);
    taskForm.resetFields();
    taskForm.setFieldsValue({
      status: statusVal,
      priority: 'medium',
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

    setEditingTask(task);
    taskForm.setFieldsValue({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate || '',
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (values: any) => {
    if (!user || !project || taskSubmitting) return;
    const title = values.title?.trim() || '';

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

    // Optimistic UI update for instant feedback
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));

    try {
      await DataService.updateTask(projectId, taskId, { status: nextStatus }, user);
      message.success(`Status updated to ${nextStatus.replace('_', ' ')}`);
    } catch (err: any) {
      // Revert on error
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
      message.success(language === 'ar' ? 'تم حذف المهمة بنجاح' : 'Task deleted');
    } catch (err: any) {
      message.error(err?.message || (language === 'ar' ? 'فشل حذف المهمة' : 'Failed to delete task'));
    }
  };

  // Ant Design Table Columns Configuration
  const columns: ColumnsType<Task> = [
    {
      title: t('colStatus'),
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: TaskStatus, record: Task) => {
        const canEdit = isOwner || record.createdBy === user?.uid || record.assigneeId === user?.uid;
        const color = status === 'done' ? 'success' : status === 'in_progress' ? 'processing' : 'default';
        const label = formatTaskStatus(status);

        if (!canEdit) {
          return <Tag color={color}>{label}</Tag>;
        }

        return (
          <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <Select
              size="small"
              value={status}
              onChange={(val) => handleQuickStatusChange(record, val as TaskStatus)}
              className="w-28"
              options={[
                { value: 'todo', label: t('statusTodo') },
                { value: 'in_progress', label: t('statusInProgress') },
                { value: 'done', label: t('statusDone') },
              ]}
            />
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
          <div dir="auto">
            <div className={`font-semibold text-xs sm:text-sm ${record.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {text}
              {isOverdue && (
                <Tag color="error" className="ml-2 text-[10px]">
                  {t('overdueBadge')}
                </Tag>
              )}
            </div>
            {record.description && (
              <div dir="auto" className="text-[11px] text-slate-400 truncate max-w-md">
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
      width: 100,
      render: (priority: TaskPriority) => {
        const color = priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'default';
        return <Tag color={color} className="uppercase font-semibold text-[10px]">{formatTaskPriority(priority)}</Tag>;
      },
    },
    {
      title: t('colAssignee'),
      dataIndex: 'assigneeName',
      key: 'assigneeName',
      width: 160,
      render: (_: any, record: Task) => {
        if (!record.assigneeName) {
          return <span className="text-slate-400 text-xs italic">{t('unassigned')}</span>;
        }
        return (
          <Space orientation="horizontal" size={6}>
            <Avatar size="small" icon={<UserOutlined />} className="bg-blue-500">
              {record.assigneeName.charAt(0).toUpperCase()}
            </Avatar>
            <span className="text-xs font-medium truncate max-w-[100px]">{record.assigneeName}</span>
          </Space>
        );
      },
    },
    {
      title: t('colDueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 140,
      render: (dueDate: string | null, record: Task) => {
        if (!dueDate) return <span className="text-slate-400 text-xs">—</span>;
        const isOverdue = isTaskOverdue(dueDate, record.status);
        return (
          <span className={`text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
            <CalendarOutlined className="mr-1" />
            {formatDateLocalized(dueDate)}
          </span>
        );
      },
    },
    {
      title: t('colActions'),
      key: 'actions',
      width: 100,
      render: (_: any, record: Task) => {
        const canEdit = isOwner || record.createdBy === user?.uid || record.assigneeId === user?.uid;
        const canDelete = isOwner || record.createdBy === user?.uid;

        return (
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Space orientation="horizontal" size={4}>
              {canEdit && (
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditTaskModal(record);
                  }}
                  aria-label={`Edit task ${record.title}`}
                />
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
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    aria-label={`Delete task ${record.title}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              )}
            </Space>
          </div>
        );
      },
    },
  ];

  if (loading || authLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <Card className="max-w-md mx-auto text-center py-12 mt-8">
        <ExclamationCircleOutlined className="text-3xl text-red-500 mb-3" />
        <Title level={4}>Access Denied or Not Found</Title>
        <Text type="secondary" className="block mb-6">{error || 'Unable to open project'}</Text>
        <Link href="/dashboard">
          <Button type="primary" icon={<ArrowLeftOutlined />}>Return to Dashboard</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { title: <Link href="/dashboard">{t('dashboard')}</Link> },
          { title: project.name },
        ]}
      />

      {/* Project Header Card with Velocity Progress */}
      <Card variant="outlined" className="border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Title level={2} className="!mb-0 !text-xl !font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {project.name}
              </Title>
              <Tag
                className="m-0 text-[11px] font-medium border-slate-200 dark:border-[#1e2430] bg-slate-50 dark:bg-[#171c26]"
                icon={isOwner ? <CrownOutlined className="text-amber-500" /> : <UserOutlined />}
              >
                {isOwner ? t('owner') : t('member')}
              </Tag>
            </div>

            {project.description && (
              <Paragraph className="text-xs text-slate-500 dark:text-slate-400 !mb-0 max-w-2xl leading-relaxed">
                {project.description}
              </Paragraph>
            )}

            {/* Team Roster tags (Max 5 with +more modal) */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <Text type="secondary" className="me-1 text-slate-400"><TeamOutlined /> {t('teamRoster')}:</Text>
              {project.memberIds.slice(0, 5).map((mId) => {
                const info = project.memberDetails?.[mId];
                const isProjectOwner = mId === project.ownerId;
                return (
                  <Tag
                    key={mId}
                    onClick={() => setIsTeamModalOpen(true)}
                    className="text-[11px] border-slate-200 dark:border-[#1e2430] bg-slate-50 dark:bg-[#171c26] text-slate-600 dark:text-slate-300 cursor-pointer hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title={t('teamRoster')}
                  >
                    {isProjectOwner && <CrownOutlined className="text-amber-500 me-1" />}
                    {info?.displayName || mId}
                  </Tag>
                );
              })}
              {project.memberIds.length > 5 && (
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(true)}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 cursor-pointer transition-colors"
                >
                  +{project.memberIds.length - 5} {t('membersCount')}
                </button>
              )}
            </div>
          </div>

          {/* Right Header Actions & Velocity Progress */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:border-s lg:border-slate-100 lg:dark:border-[#1e2430] lg:ps-6">
            <div className="w-full sm:w-44 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('sprintVelocity')}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 tnum">{completionPercent}%</span>
              </div>
              <Progress
                percent={completionPercent}
                showInfo={false}
                strokeColor="#2563eb"
                railColor="rgba(100, 116, 139, 0.2)"
                size={['100%', 6]}
              />
              <div className="text-[11px] text-slate-400 tnum">
                {doneCount} of {tasks.length} {t('completed')}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <Link href={`/projects/${project.id}/settings`}>
                  <Button icon={<SettingOutlined />} size="middle" className="border-slate-200 dark:border-[#1e2430]">
                    {t('settings')}
                  </Button>
                </Link>
              )}
              <Button type="primary" icon={<PlusOutlined />} size="middle" onClick={() => openCreateTaskModal('todo')} className="!bg-blue-600 !border-blue-600">
                {t('addTask')}
              </Button>
            </div>
          </div>
        </div>

        {/* Task Velocity Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-[#1e2430] text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#171c26] border border-slate-200/80 dark:border-[#1e2430]">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">{t('totalTasks')}</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200 tnum">{tasks.length}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#171c26] border border-slate-200/80 dark:border-[#1e2430]">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">{t('statusTodo')}</span>
            <span className="text-base font-bold text-slate-600 dark:text-slate-300 tnum">{todoCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-600 dark:text-amber-400 block text-[10px] uppercase font-semibold tracking-wider">{t('statusInProgress')}</span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400 tnum">{inProgressCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-600 dark:text-emerald-400 block text-[10px] uppercase font-semibold tracking-wider">{t('statusDone')}</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tnum">{doneCount}</span>
          </div>
          <div className={`p-2.5 rounded-lg ${overdueCount > 0 ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-slate-50 dark:bg-[#171c26] border border-slate-200/80 dark:border-[#1e2430]'}`}>
            <span className={`block text-[10px] uppercase font-semibold tracking-wider ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>{t('overdueFilter')}</span>
            <span className={`text-base font-bold tnum ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>{overdueCount}</span>
          </div>
        </div>
      </Card>

      {/* Search, Filter Toolbar & View Switcher */}
      <Card variant="outlined" className="border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-none">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Segmented
              value={viewMode}
              onChange={(val) => setViewMode(val as 'kanban' | 'table')}
              options={[
                {
                  value: 'kanban',
                  label: <span className="font-semibold text-xs px-1">{t('kanbanBoard')}</span>,
                  icon: <AppstoreOutlined />,
                },
                {
                  value: 'table',
                  label: <span className="font-semibold text-xs px-1">{t('tableView')}</span>,
                  icon: <UnorderedListOutlined />,
                },
              ]}
            />
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder={t('filterTasksPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>

          {/* Right: Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-slate-400 text-xs ps-1">
              <FilterOutlined className="text-xs" />
            </div>

            {/* Quick Overdue Filter Button */}
            <Button
              type={overdueOnly ? 'primary' : 'default'}
              danger={overdueOnly || overdueCount > 0}
              icon={<ClockCircleOutlined />}
              onClick={() => setOverdueOnly(!overdueOnly)}
              className="flex items-center gap-1.5 font-medium text-xs border-slate-200 dark:border-[#1e2430]"
            >
              {t('overdueFilter')}
              {overdueCount > 0 && (
                <span className="ms-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 tnum">
                  {overdueCount}
                </span>
              )}
            </Button>

            {/* Quick My Tasks Filter Button */}
            <Button
              type={myTasksOnly ? 'primary' : 'default'}
              icon={<UserOutlined />}
              onClick={() => setMyTasksOnly(!myTasksOnly)}
              className={`flex items-center gap-1.5 font-medium text-xs border-slate-200 dark:border-[#1e2430] ${
                myTasksOnly ? '!bg-blue-600 !border-blue-600 text-white' : ''
              }`}
            >
              {t('myTasksFilter')}
            </Button>

            {/* Dropdown Filters */}
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-28"
              options={[
                { value: 'all', label: t('allStatus') },
                { value: 'todo', label: t('statusTodo') },
                { value: 'in_progress', label: t('statusInProgress') },
                { value: 'done', label: t('statusDone') },
              ]}
            />

            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              className="w-28"
              options={[
                { value: 'all', label: t('allPriority') },
                { value: 'high', label: t('priorityHigh') },
                { value: 'medium', label: t('priorityMedium') },
                { value: 'low', label: t('priorityLow') },
              ]}
            />

            <Select
              value={assigneeFilter}
              onChange={setAssigneeFilter}
              className="w-32"
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
              value={sortBy}
              onChange={setSortBy}
              className="w-32"
              options={[
                { value: 'default', label: t('sortDefault') },
                { value: 'priority', label: t('sortPriority') },
                { value: 'due_date', label: t('sortDueDate') },
                { value: 'title', label: t('sortTitle') },
              ]}
            />

            {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || overdueOnly || myTasksOnly || sortBy !== 'default') && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setAssigneeFilter('all');
                  setOverdueOnly(false);
                  setMyTasksOnly(false);
                  setSortBy('default');
                }}
                className="!text-blue-600 dark:!text-blue-400"
              >
                {t('resetFilters')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Reusable Draggable Kanban Card Renderer */}
      {(() => {
        const renderKanbanCard = (task: Task) => {
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

        return viewMode === 'kanban' ? (
          <div>
            {/* Mobile Column Segmented Tab Bar (<768px) */}
            <div className="md:hidden mb-4">
              <Segmented
                block
                size="middle"
                value={mobileKanbanCol}
                onChange={(val) => setMobileKanbanCol(val as 'todo' | 'in_progress' | 'done')}
                options={[
                  {
                    value: 'todo',
                    label: (
                      <div className="flex items-center justify-center gap-1.5 py-1" title={language === 'ar' ? 'قيد الانتظار' : 'To Do'}>
                        <span className="font-semibold text-xs">
                          {language === 'ar' ? 'قيد الانتظار' : 'To Do'}
                        </span>
                        <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 tnum">
                          {todoCount}
                        </span>
                      </div>
                    ),
                  },
                  {
                    value: 'in_progress',
                    label: (
                      <div className="flex items-center justify-center gap-1.5 py-1" title={language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}>
                        <span className="font-semibold text-xs">
                          {language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
                        </span>
                        <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 tnum">
                          {inProgressCount}
                        </span>
                      </div>
                    ),
                  },
                  {
                    value: 'done',
                    label: (
                      <div className="flex items-center justify-center gap-1.5 py-1" title={language === 'ar' ? 'مكتملة' : 'Done'}>
                        <span className="font-semibold text-xs">
                          {language === 'ar' ? 'مكتملة' : 'Done'}
                        </span>
                        <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 tnum">
                          {doneCount}
                        </span>
                      </div>
                    ),
                  },
                ]}
              />
            </div>

            {/* Kanban Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              {/* Column 1: TO DO */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverCol !== 'todo') setDragOverCol('todo');
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  setDragOverCol(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData('text/plain');
                  if (taskId) handleQuickStatusChange(taskId, 'todo');
                  setDraggedTaskId(null);
                  setDragOverCol(null);
                }}
                className={`${
                  mobileKanbanCol === 'todo' ? 'block' : 'hidden md:block'
                } rounded-xl border p-4 space-y-3.5 transition-all duration-150 relative overflow-hidden ${
                  dragOverCol === 'todo'
                    ? 'border-blue-600 bg-blue-500/10 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200/90 dark:border-white/[0.08] bg-slate-50/90 dark:bg-[#0b0f19]/90 shadow-card-elevation dark:shadow-card-elevation-dark'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-[#1f293d]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                      {t('statusTodo')}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-[#162032] text-slate-700 dark:text-slate-300 tnum">
                      {filteredTasks.filter((t) => t.status === 'todo').length}
                    </span>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => openCreateTaskModal('todo')}
                    className="text-xs text-slate-400 hover:text-blue-600 rounded-lg"
                  />
                </div>

                <div className="space-y-2.5 min-h-[140px]">
                  {filteredTasks.filter((t) => t.status === 'todo').length === 0 ? (
                    <div
                      className={`text-center py-10 text-xs italic rounded-xl border border-dashed transition-colors ${
                        dragOverCol === 'todo'
                          ? 'border-blue-600 text-blue-600 bg-blue-50/5 font-semibold'
                          : 'border-slate-200 dark:border-[#1f293d] text-slate-400'
                      }`}
                    >
                      {dragOverCol === 'todo' ? `${t('dropHereToMove')} ${t('statusTodo')}` : t('noTasksInQueue')}
                    </div>
                  ) : (
                    filteredTasks.filter((t) => t.status === 'todo').map((task) => renderKanbanCard(task))
                  )}
                </div>
              </div>

              {/* Column 2: IN PROGRESS */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverCol !== 'in_progress') setDragOverCol('in_progress');
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  setDragOverCol(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData('text/plain');
                  if (taskId) handleQuickStatusChange(taskId, 'in_progress');
                  setDraggedTaskId(null);
                  setDragOverCol(null);
                }}
                className={`${
                  mobileKanbanCol === 'in_progress' ? 'block' : 'hidden md:block'
                } rounded-xl border p-4 space-y-3.5 transition-all duration-150 relative overflow-hidden ${
                  dragOverCol === 'in_progress'
                    ? 'border-blue-600 bg-blue-500/10 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200/90 dark:border-white/[0.08] bg-amber-500/[0.02] dark:bg-[#0b0f19]/90 shadow-card-elevation dark:shadow-card-elevation-dark'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-[#1f293d]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                      {t('statusInProgress')}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 tnum">
                      {filteredTasks.filter((t) => t.status === 'in_progress').length}
                    </span>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => openCreateTaskModal('in_progress')}
                    className="text-xs text-slate-400 hover:text-amber-600 rounded-lg"
                    title="Add task to In Progress"
                  />
                </div>

                <div className="space-y-2.5 min-h-[140px]">
                  {filteredTasks.filter((t) => t.status === 'in_progress').length === 0 ? (
                    <div
                      className={`text-center py-10 text-xs italic rounded-xl border border-dashed transition-colors ${
                        dragOverCol === 'in_progress'
                          ? 'border-blue-600 text-blue-600 bg-blue-50/5 font-semibold'
                          : 'border-slate-200 dark:border-[#1f293d] text-slate-400'
                      }`}
                    >
                      {dragOverCol === 'in_progress' ? `${t('dropHereToMove')} ${t('statusInProgress')}` : t('noTasksInProgress')}
                    </div>
                  ) : (
                    filteredTasks.filter((t) => t.status === 'in_progress').map((task) => renderKanbanCard(task))
                  )}
                </div>
              </div>

              {/* Column 3: DONE */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverCol !== 'done') setDragOverCol('done');
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  setDragOverCol(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData('text/plain');
                  if (taskId) handleQuickStatusChange(taskId, 'done');
                  setDraggedTaskId(null);
                  setDragOverCol(null);
                }}
                className={`${
                  mobileKanbanCol === 'done' ? 'block' : 'hidden md:block'
                } rounded-xl border p-4 space-y-3.5 transition-all duration-150 relative overflow-hidden ${
                  dragOverCol === 'done'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200/90 dark:border-white/[0.08] bg-emerald-500/[0.02] dark:bg-[#0b0f19]/90 shadow-card-elevation dark:shadow-card-elevation-dark'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-[#1f293d]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                      {t('statusDone')}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 tnum">
                      {filteredTasks.filter((t) => t.status === 'done').length}
                    </span>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => openCreateTaskModal('done')}
                    className="text-xs text-slate-400 hover:text-emerald-600 rounded-lg"
                    title="Add task to Done"
                  />
                </div>

                <div className="space-y-2.5 min-h-[140px]">
                  {filteredTasks.filter((t) => t.status === 'done').length === 0 ? (
                    <div
                      className={`text-center py-10 text-xs italic rounded-xl border border-dashed transition-colors ${
                        dragOverCol === 'done'
                          ? 'border-emerald-500 text-emerald-600 bg-emerald-50/5 font-semibold'
                          : 'border-slate-200 dark:border-[#1f293d] text-slate-400'
                      }`}
                    >
                      {dragOverCol === 'done' ? `${t('dropHereToMove')} ${t('statusDone')}` : t('noTasksCompleted')}
                    </div>
                  ) : (
                    filteredTasks.filter((t) => t.status === 'done').map((task) => renderKanbanCard(task))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tasks Table */
          <Card variant="outlined" className="border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-none">
            <Table
              dataSource={filteredTasks}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: false }}
              locale={{ emptyText: 'No tasks matching the selected filters.' }}
              onRow={(record) => ({
                onClick: () => setInspectingTaskId(record.id),
                className: 'cursor-pointer hover:bg-slate-50 dark:hover:bg-[#161b26] transition-colors',
              })}
            />
          </Card>
        );
      })()}

      {/* Slide-over Task Quick Inspection Drawer */}
      <TaskDetailDrawer
        task={currentInspectedTask}
        project={project}
        canEdit={Boolean(
          currentInspectedTask &&
            (isOwner || currentInspectedTask.createdBy === user?.uid || currentInspectedTask.assigneeId === user?.uid)
        )}
        canDelete={Boolean(
          currentInspectedTask &&
            (isOwner || currentInspectedTask.createdBy === user?.uid)
        )}
        onClose={() => setInspectingTaskId(null)}
        onEdit={openEditTaskModal}
        onDelete={handleDeleteTask}
        onStatusChange={handleQuickStatusChange}
        onPriorityChange={handleQuickPriorityChange}
        onAssigneeChange={handleQuickAssigneeChange}
        onDueDateChange={handleQuickDueDateChange}
      />

      {/* Task Creation & Edit Modal - Linear Grade Precision */}
      <Modal
        title={
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-[#1e2430]">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <div className="min-w-0">
              <div className="text-xs font-mono text-slate-400">
                {project.name} &bull; {editingTask ? `TASK-${editingTask.id.slice(0, 6)}` : t('createTaskTitle')}
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingTask ? t('editTaskTitle') : t('createTaskTitle')}
              </div>
            </div>
          </div>
        }
        open={isTaskModalOpen}
        onCancel={() => !taskSubmitting && setIsTaskModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={560}
        centered
        closable={!taskSubmitting}
        mask={{ closable: !taskSubmitting }}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleSaveTask}
          requiredMark="optional"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              taskForm.submit();
            }
          }}
          className="pt-2 space-y-1"
        >
          <Form.Item
            name="title"
            label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('taskTitleLabel')}</span>}
            rules={[
              { required: true, message: language === 'ar' ? 'يرجى إدخال عنوان المهمة' : 'Please enter a task title' },
              { min: 3, message: language === 'ar' ? 'الحد الأدنى 3 أحرف' : 'Minimum 3 characters required' },
              { max: 120, message: language === 'ar' ? 'الحد الأقصى 120 حرفاً' : 'Maximum 120 characters allowed' },
            ]}
          >
            <Input
              showCount
              maxLength={120}
              placeholder={t('taskTitlePlaceholder')}
              size="large"
              className="rounded-lg text-sm bg-slate-50/50 dark:bg-[#161b26] border-slate-200 dark:border-[#222938] font-medium"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('taskDescLabel')}</span>}
          >
            <Input.TextArea
              rows={3}
              maxLength={1000}
              placeholder={t('taskDescPlaceholder')}
              className="rounded-lg text-sm bg-slate-50/50 dark:bg-[#161b26] border-slate-200 dark:border-[#222938]"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3.5">
            <Form.Item
              name="status"
              label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('initialStatusLabel')}</span>}
              rules={[{ required: true }]}
            >
              <Select
                size="large"
                className="rounded-lg text-sm"
                options={[
                  { value: 'todo', label: t('statusTodo') },
                  { value: 'in_progress', label: t('statusInProgress') },
                  { value: 'done', label: t('statusDone') },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('priorityLevelLabel')}</span>}
              rules={[{ required: true }]}
            >
              <Select
                size="large"
                className="rounded-lg text-sm"
                options={[
                  { value: 'low', label: t('priorityLow') },
                  { value: 'medium', label: t('priorityMedium') },
                  { value: 'high', label: t('priorityHigh') },
                ]}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Form.Item
              name="assigneeId"
              label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('assigneeLabel')}</span>}
            >
              <Select
                size="large"
                placeholder={t('assigneeLabel')}
                className="rounded-lg text-sm"
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
              label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('targetDueDateLabel')}</span>}
            >
              <Input
                type="date"
                size="large"
                className="rounded-lg text-sm bg-slate-50/50 dark:bg-[#161b26] border-slate-200 dark:border-[#222938]"
              />
            </Form.Item>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#1e2430]">
            <span className="text-[11px] font-mono text-slate-400">
              {t('pressCmdEnter')}
            </span>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsTaskModalOpen(false)} className="border-slate-200 dark:border-[#1e2430] rounded-lg">
                {t('cancel')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={taskSubmitting}
                className="!bg-blue-600 hover:!bg-blue-500 !border-blue-600 font-medium px-5 rounded-lg text-white shadow-none"
              >
                {editingTask ? t('saveChanges') : t('createTaskBtn')}
              </Button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Full Team Roster Modal */}
      <TeamRosterModal
        open={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        project={project}
        currentUserId={user?.uid}
      />
    </div>
  );
}
