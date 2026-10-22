'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  LockOutlined,
  UserOutlined,
  CrownOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Button, Avatar, Progress } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { PrioritySignalBadge } from '@/components/ui/PrioritySignalBadge';

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
// Edit demo sprint tasks, interactive permissions matrix, and styling presets here.
const DEFAULT_DEMO_TASKS = [
  {
    id: 'task-1',
    key: 'TF-101',
    titleEn: 'Verify SQL transaction durability and foreign key cascades',
    titleAr: 'التحقق من متانة معاملات SQL والتكامل المرجعي المتتالي',
    status: 'done' as const,
    priority: 'high' as const,
    assignee: { nameEn: 'Sarah Al-Sharif', nameAr: 'سارة الشريف', initial: 'س' },
    dueDateEn: 'Today',
    dueDateAr: 'اليوم',
  },
  {
    id: 'task-2',
    key: 'TF-204',
    titleEn: 'Implement tactile Kanban board with native drag-and-drop',
    titleAr: 'تطوير لوحة كانبان تفاعلية بفيزياء سحب وإفلات فورية',
    status: 'in_progress' as const,
    priority: 'urgent' as const,
    assignee: { nameEn: 'Ahmad Al-Khatib', nameAr: 'أحمد الخطيب', initial: 'أ' },
    dueDateEn: 'Tomorrow',
    dueDateAr: 'غداً',
  },
  {
    id: 'task-3',
    key: 'TF-312',
    titleEn: 'Enforce strict RBAC permission matrix on destructive routes',
    titleAr: 'تطبيق حوكمة الصلاحيات الصارمة على مسارات الحذف والإدارة',
    status: 'todo' as const,
    priority: 'medium' as const,
    assignee: { nameEn: 'Mohammed Al-Saleh', nameAr: 'محمد الصالح', initial: 'م' },
    dueDateEn: 'Oct 24',
    dueDateAr: '24 أكتوبر',
  },
  {
    id: 'task-4',
    key: 'TF-405',
    titleEn: 'Calibrate high-contrast design tokens for bilingual parity',
    titleAr: 'معايرة توكنز التصميم عالية التباين لدعم اللغتين بتطابق تام',
    status: 'in_progress' as const,
    priority: 'high' as const,
    assignee: { nameEn: 'Khaled Al-Salem', nameAr: 'خالد السالم', initial: 'خ' },
    dueDateEn: 'Oct 26',
    dueDateAr: '26 أكتوبر',
  },
];

const STYLES = {
  container: 'min-h-screen text-[#1B1915] dark:text-[#EFE9DD]',
  heroTitle:
    'text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1B1915] dark:text-[#EFE9DD] leading-[1.14] font-display',
  heroSubtitle: 'text-sm sm:text-base text-[#5A5348] dark:!text-[#B5AC9C] leading-relaxed font-normal',
  primaryActionButton:
    'tactile-btn !bg-[#7A5818] dark:!bg-[#D4B26E] hover:!bg-[#5e4310] dark:hover:!bg-[#e5c583] !border-[#7A5818] dark:!border-[#D4B26E] font-bold px-6 h-11 rounded-lg text-sm !text-white dark:!text-[#1A1408] shadow-xs',
  secondaryActionButton:
    'tactile-btn border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD] hover:text-[#7A5818] dark:hover:text-[#D4B26E] font-semibold px-5 h-11 rounded-lg text-sm bg-white dark:bg-[#141211]',
  tactileCard:
    'rounded-xl border border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark overflow-hidden text-start',
  badgePill:
    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#7A5818]/10 dark:bg-[#D4B26E]/10 text-[#7A5818] dark:text-[#D4B26E] border border-[#7A5818]/25 dark:border-[#D4B26E]/25',
} as const;

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
type PriorityFilter = 'all' | 'urgent' | 'high' | 'medium';
type DemoViewMode = 'board' | 'list';
type SimulatedRole = 'owner' | 'member';

interface DemoTaskItem {
  id: string;
  key: string;
  titleEn: string;
  titleAr: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'urgent' | 'high' | 'medium';
  assignee: { nameEn: string; nameAr: string; initial: string };
  dueDateEn: string;
  dueDateAr: string;
}

// ============================================================================
// 4. HELPER FUNCTIONS & HOOKS
// ============================================================================
function getNextStatus(
  status: 'todo' | 'in_progress' | 'done'
): 'todo' | 'in_progress' | 'done' {
  if (status === 'todo') return 'in_progress';
  if (status === 'in_progress') return 'done';
  return 'todo';
}

function filterDemoTasks(
  tasks: DemoTaskItem[],
  query: string,
  priority: PriorityFilter
): DemoTaskItem[] {
  return tasks.filter((t) => {
    const matchesPriority = priority === 'all' || t.priority === priority;
    if (!matchesPriority) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      t.key.toLowerCase().includes(q) ||
      t.titleEn.toLowerCase().includes(q) ||
      t.titleAr.includes(q)
    );
  });
}

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================
interface DemoKanbanCardProps {
  task: DemoTaskItem;
  isArabic: boolean;
  onCycle: (id: string) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

function DemoKanbanCard({
  task,
  isArabic,
  onCycle,
  isDragging,
  onDragStart,
  onDragEnd,
}: DemoKanbanCardProps) {
  const isDone = task.status === 'done';
  const isInProgress = task.status === 'in_progress';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onCycle(task.id)}
      className={`tactile-card p-2.5 rounded-md border active:scale-[0.98] transition-all cursor-grab active:cursor-grabbing shadow-xs space-y-2 select-none group ${
        isDragging ? 'opacity-40 scale-95 border-dashed border-[var(--accent)]' : ''
      } ${
        isDone
          ? 'bg-white/70 dark:bg-[#1C1A17]/70 border-[#9CC5A1]/30 hover:border-[#9CC5A1] opacity-85'
          : isInProgress
          ? 'bg-white dark:bg-[#1C1A17] border-[#8DB4E8]/40 hover:border-[#8DB4E8]'
          : 'bg-white dark:bg-[#1C1A17] border-[#DDDAD3] dark:border-[#2C2824] hover:border-[#7A5818]/60 dark:hover:border-[#D4B26E]/60'
      }`}
      title={isArabic ? 'اسحب المهمة لعمود آخر أو انقر للنقل الفوري' : 'Drag card to another column or click to cycle'}
    >
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span
          className={
            isDone
              ? 'text-[#9CC5A1] line-through'
              : isInProgress
              ? 'text-[#8DB4E8] font-bold'
              : 'text-[#5A5348] dark:text-[#B5AC9C]'
          }
        >
          {task.key}
        </span>
        {isDone ? (
          <CheckCircleOutlined className="text-[#9CC5A1] text-xs" />
        ) : (
          <PrioritySignalBadge
            priority={task.priority}
            label={task.priority === 'urgent' ? (isArabic ? 'عاجلة' : 'URGENT') : undefined}
            size="sm"
          />
        )}
      </div>

      <p
        className={`text-xs font-medium line-clamp-2 leading-snug ${
          isDone
            ? 'line-through text-[#5A5348] dark:text-[#B5AC9C]'
            : 'text-[#1B1915] dark:text-[#EFE9DD]'
        }`}
      >
        {isArabic ? task.titleAr : task.titleEn}
      </p>

      <div className="flex items-center justify-between pt-1 border-t border-[#DDDAD3] dark:border-[#2C2824] text-[10px] text-[#5A5348] dark:text-[#B5AC9C]">
        <span>{isDone ? (isArabic ? 'تم الإنجاز' : 'Shipped') : isArabic ? task.dueDateAr : task.dueDateEn}</span>
        <Avatar
          size={18}
          className={`font-bold text-[9px] ${
            isDone
              ? 'bg-[#9CC5A1] text-[#141211]'
              : isInProgress
              ? 'bg-[#8DB4E8] text-[#141211]'
              : 'bg-[#7A5818] dark:bg-[#D4B26E] text-white dark:text-[#1A1408]'
          }`}
        >
          {task.assignee.initial}
        </Avatar>
      </div>
    </div>
  );
}

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export default function HomePage() {
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const [viewMode, setViewMode] = useState<DemoViewMode>('board');
  const [filterQuery, setFilterQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [simulatedRole, setSimulatedRole] = useState<SimulatedRole>('owner');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [demoTasks, setDemoTasks] = useState<DemoTaskItem[]>(DEFAULT_DEMO_TASKS);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<'todo' | 'in_progress' | 'done' | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(id);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, col: 'todo' | 'in_progress' | 'done') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== col) {
      setDragOverCol(col);
    }
  };

  const handleDropTask = (e: React.DragEvent, targetStatus: 'todo' | 'in_progress' | 'done') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    setDragOverCol(null);
    setDraggingTaskId(null);
    if (!taskId) return;

    setDemoTasks((prev) =>
      prev.map((item) => (item.id === taskId ? { ...item, status: targetStatus } : item))
    );
  };

  // --- Keyboard Shortcuts Listeners ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
    );
  };

  const cycleTaskStatus = (id: string) => {
    setDemoTasks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, status: getNextStatus(item.status) };
        }
        return item;
      })
    );
  };

  // --- Derived Calculations (No synced state loops) ---
  const todoTasks = useMemo(() => demoTasks.filter((t) => t.status === 'todo'), [demoTasks]);
  const inProgTasks = useMemo(
    () => demoTasks.filter((t) => t.status === 'in_progress'),
    [demoTasks]
  );
  const doneTasks = useMemo(() => demoTasks.filter((t) => t.status === 'done'), [demoTasks]);
  const completionRate =
    demoTasks.length > 0 ? Math.round((doneTasks.length / demoTasks.length) * 100) : 0;

  const filteredTasks = useMemo(
    () => filterDemoTasks(demoTasks, filterQuery, priorityFilter),
    [demoTasks, filterQuery, priorityFilter]
  );

  // --- Early Guard Return ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 rounded-full border-2 border-[#DDDAD3] dark:border-[#2C2824] border-t-[#7A5818] dark:border-t-[#D4B26E] animate-spin" />
      </div>
    );
  }

  return (
    <div className={STYLES.container}>
      {/* 1. PRECISION HERO & INTERACTIVE WORKBENCH */}
      <section className="pt-8 sm:pt-14 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 cols): Direct Value Proposition */}
          <div className="lg:col-span-5 space-y-6 text-start">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-[11px] font-mono font-medium text-[#5A5348] dark:text-[#B5AC9C]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>{isArabic ? 'النظام متصل: محرك SQLite WAL الفوري' : 'System Live: Sub-3ms SQLite WAL Engine'}</span>
                <span className="text-[#DDDAD3] dark:text-[#2C2824]">|</span>
                <span className="text-[#7A5818] dark:text-[#D4B26E] font-semibold">{isArabic ? 'بدون قفل سحابي' : 'Zero Cloud Lock-in'}</span>
              </div>
              <h1 className={STYLES.heroTitle}>
                {isArabic ? (
                  <>إدارة هندسية للمشاريع وتنسيق المهام البرمجية بدقة فورية.</>
                ) : (
                  <>Engineering workflows orchestrated with deterministic speed.</>
                )}
              </h1>
            </div>

            <p className={STYLES.heroSubtitle}>
              {isArabic
                ? 'مسارات كانبان سريعة الاستجابة، وحوكمة صارمة للصلاحيات، وتخزين موثوق بتقنية SQLite WAL. صُمم خصيصاً لفرق التطوير عالية الإنتاجية.'
                : 'Instant-feel Kanban pipelines, strict role boundaries, and rock-solid SQLite WAL persistence. Built for software engineering teams that move with conviction.'}
            </p>

            {/* Tactile Action Buttons */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      type="primary"
                      size="large"
                      iconPlacement="end"
                      icon={<ArrowRightOutlined className="rtl:-scale-x-100" />}
                      className={STYLES.primaryActionButton}
                    >
                      {isArabic ? 'فتح مساحة العمل' : 'Open Workspace'}
                    </Button>
                  </Link>
                  <Link href="/projects/new">
                    <Button
                      size="large"
                      icon={<PlusOutlined />}
                      className={STYLES.secondaryActionButton}
                    >
                      {isArabic ? 'مشروع جديد' : 'New Project'}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register">
                    <Button
                      type="primary"
                      size="large"
                      iconPlacement="end"
                      icon={<ArrowRightOutlined className="rtl:-scale-x-100" />}
                      className={STYLES.primaryActionButton}
                    >
                      {isArabic ? 'ابدأ مساحة العمل' : 'Start Workspace'}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="large" className={STYLES.secondaryActionButton}>
                      {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Keyboard & Runtime Readout */}
            <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-[#5A5348] dark:text-[#B5AC9C] select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9CC5A1] shrink-0" />
              <span className="font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                {isArabic ? 'محرك فوري' : 'Live Engine'}
              </span>
              <span className="text-[#DDDAD3] dark:text-[#2C2824]">/</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-[#5A5348] dark:text-[#B5AC9C] text-[10px]">
                /
              </kbd>
              <span>{isArabic ? 'تصفية المهام' : 'quick filter'}</span>
              <span className="text-[#DDDAD3] dark:text-[#2C2824] hidden sm:inline">/</span>
              <button
                type="button"
                onClick={triggerCommandPalette}
                className="hidden sm:inline-flex items-center gap-1 hover:text-[#7A5818] dark:hover:text-[#D4B26E] cursor-pointer active:scale-[0.98] transition-transform"
              >
                <kbd className="px-1.5 py-0.5 rounded bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-[#5A5348] dark:text-[#B5AC9C] text-[10px]">
                  Cmd+K
                </kbd>
                <span>{isArabic ? 'لوحة الأوامر' : 'command bar'}</span>
              </button>
            </div>
          </div>

          {/* Right Column (7 cols): The Living Interactive Sprint Canvas */}
          <div className="lg:col-span-7">
            <div className={STYLES.tactileCard}>
              {/* Product Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-[#DDDAD3] dark:border-[#2C2824] bg-[#EDECE8]/60 dark:bg-[#11100E] gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#7A5818] dark:bg-[#D4B26E] shrink-0" />
                  <span className="font-bold text-xs text-[#1B1915] dark:text-[#EFE9DD] font-display">
                    TaskFlow
                  </span>
                  <span className="text-[#5A5348] dark:text-[#B5AC9C] text-xs">/</span>
                  <span className="text-xs text-[#5A5348] dark:text-[#B5AC9C] font-medium">
                    {isArabic ? 'سبرنت المنظومة الأساسية' : 'Sprint 04 Core Engine'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#9CC5A1]/15 text-[#3b6e41] dark:text-[#9CC5A1] border border-[#9CC5A1]/30">
                    {isArabic ? 'نشط' : 'Active'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Switcher: Board vs Table */}
                  <div className="inline-flex p-0.5 rounded-md bg-[#EDECE8] dark:bg-[#0C0B0A] border border-[#DDDAD3] dark:border-[#2C2824]">
                    <button
                      type="button"
                      onClick={() => setViewMode('board')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold active:scale-[0.98] transition-transform ${
                        viewMode === 'board'
                          ? 'bg-white dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD] shadow-xs'
                          : 'text-[#5A5348] hover:text-[#1B1915] dark:hover:text-[#EFE9DD]'
                      }`}
                    >
                      <AppstoreOutlined className="me-1.5" />
                      {isArabic ? 'اللوحة' : 'Board'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold active:scale-[0.98] transition-transform ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD] shadow-xs'
                          : 'text-[#5A5348] hover:text-[#1B1915] dark:hover:text-[#EFE9DD]'
                      }`}
                    >
                      <UnorderedListOutlined className="me-1.5" />
                      {isArabic ? 'الجدول' : 'Table'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Interactive Filter Bar */}
              <div className="px-4 py-2.5 bg-white dark:bg-[#141211] border-b border-[#DDDAD3] dark:border-[#2C2824] flex flex-wrap items-center justify-between gap-2.5">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <SearchOutlined className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-[#5A5348] dark:text-[#B5AC9C] text-xs" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder={isArabic ? 'تصفية مهام السبرنت...' : 'Filter sprint tasks...'}
                    className="w-full ps-8 pe-7 py-1 text-xs rounded-md border border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD] placeholder:text-[#5A5348] dark:placeholder:text-[#B5AC9C] focus:outline-none focus:border-[#7A5818] dark:focus:border-[#D4B26E]"
                  />
                  {filterQuery ? (
                    <button
                      type="button"
                      onClick={() => setFilterQuery('')}
                      className="absolute end-2 top-1/2 -translate-y-1/2 text-[#5A5348] hover:text-[#1B1915] dark:hover:text-[#EFE9DD]"
                    >
                      <CloseOutlined className="text-[10px]" />
                    </button>
                  ) : (
                    <kbd className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#5A5348] dark:text-[#B5AC9C] px-1 rounded bg-[#EDECE8] dark:bg-[#1C1A17]">
                      /
                    </kbd>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-medium">
                  {(['all', 'urgent', 'high', 'medium'] as const).map((pri) => {
                    const active = priorityFilter === pri;
                    return (
                      <button
                        key={pri}
                        type="button"
                        onClick={() => setPriorityFilter(pri)}
                        className={`px-2 py-0.5 rounded capitalize active:scale-[0.98] transition-transform ${
                          active
                            ? 'bg-[#1B1915] dark:bg-[#EFE9DD] text-white dark:text-[#1A1408] font-semibold'
                            : 'text-[#5A5348] hover:text-[#1B1915] dark:hover:text-[#EFE9DD]'
                        }`}
                      >
                        {pri === 'all'
                          ? isArabic
                            ? 'الكل'
                            : 'All'
                          : pri === 'urgent'
                          ? isArabic
                            ? 'عاجل'
                            : 'Urgent'
                          : pri === 'high'
                          ? isArabic
                            ? 'عالي'
                            : 'High'
                          : isArabic
                          ? 'متوسط'
                          : 'Medium'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sprint Velocity Bar */}
              <div className="px-4 py-2 bg-[#EDECE8]/60 dark:bg-[#11100E] border-b border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#5A5348] dark:text-[#B5AC9C]">
                    {isArabic ? 'إنجاز السبرنت:' : 'Sprint Progress:'}
                  </span>
                  <span className="font-mono font-bold text-[#7A5818] dark:text-[#D4B26E] tabular-nums">
                    {completionRate}%
                  </span>
                  <span className="text-[#5A5348] dark:text-[#B5AC9C] text-[11px] font-mono tabular-nums">
                    ({doneTasks.length}/{demoTasks.length} {isArabic ? 'مكتملة' : 'done'})
                  </span>
                </div>
                <div className="w-28 sm:w-40">
                  <Progress
                    percent={completionRate}
                    size="small"
                    showInfo={false}
                    strokeColor="#D4B26E"
                    railColor="rgba(44, 40, 36, 0.2)"
                  />
                </div>
              </div>

              {/* Interactive View Body */}
              <div className="p-4 bg-[#EDECE8]/30 dark:bg-[#0C0B0A]">
                {viewMode === 'board' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Column 1: TODO */}
                    <div
                      onDragOver={(e) => handleDragOver(e, 'todo')}
                      onDragLeave={() => setDragOverCol(null)}
                      onDrop={(e) => handleDropTask(e, 'todo')}
                      className={`rounded-lg bg-[#EDECE8] dark:bg-[#141211] border transition-all p-3 flex flex-col min-h-[220px] ${
                        dragOverCol === 'todo'
                          ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30 bg-[var(--accent)]/5'
                          : 'border-[#DDDAD3] dark:border-[#2C2824]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DDDAD3] dark:border-[#2C2824]">
                        <span className="text-xs font-semibold text-[#5A5348] dark:text-[#B5AC9C]">
                          {isArabic ? 'قيد الانتظار' : 'To Do'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD] font-bold tabular-nums">
                          {todoTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {todoTasks.map((task) => (
                          <DemoKanbanCard
                            key={task.id}
                            task={task}
                            isArabic={isArabic}
                            onCycle={cycleTaskStatus}
                            isDragging={draggingTaskId === task.id}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Column 2: IN PROGRESS */}
                    <div
                      onDragOver={(e) => handleDragOver(e, 'in_progress')}
                      onDragLeave={() => setDragOverCol(null)}
                      onDrop={(e) => handleDropTask(e, 'in_progress')}
                      className={`rounded-lg bg-[#EDECE8] dark:bg-[#141211] border transition-all p-3 flex flex-col min-h-[220px] ${
                        dragOverCol === 'in_progress'
                          ? 'border-[#8DB4E8] ring-2 ring-[#8DB4E8]/30 bg-[#8DB4E8]/5'
                          : 'border-[#DDDAD3] dark:border-[#2C2824]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DDDAD3] dark:border-[#2C2824]">
                        <span className="text-xs font-semibold text-[#8DB4E8]">
                          {isArabic ? 'قيد التنفيذ' : 'In Progress'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#8DB4E8]/20 text-[#8DB4E8] font-bold tabular-nums">
                          {inProgTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {inProgTasks.map((task) => (
                          <DemoKanbanCard
                            key={task.id}
                            task={task}
                            isArabic={isArabic}
                            onCycle={cycleTaskStatus}
                            isDragging={draggingTaskId === task.id}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Column 3: DONE */}
                    <div
                      onDragOver={(e) => handleDragOver(e, 'done')}
                      onDragLeave={() => setDragOverCol(null)}
                      onDrop={(e) => handleDropTask(e, 'done')}
                      className={`rounded-lg bg-[#EDECE8] dark:bg-[#141211] border transition-all p-3 flex flex-col min-h-[220px] ${
                        dragOverCol === 'done'
                          ? 'border-[#9CC5A1] ring-2 ring-[#9CC5A1]/30 bg-[#9CC5A1]/5'
                          : 'border-[#DDDAD3] dark:border-[#2C2824]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DDDAD3] dark:border-[#2C2824]">
                        <span className="text-xs font-semibold text-[#9CC5A1]">
                          {isArabic ? 'مكتملة' : 'Done'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#9CC5A1]/20 text-[#3b6e41] dark:text-[#9CC5A1] font-bold tabular-nums">
                          {doneTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {doneTasks.map((task) => (
                          <DemoKanbanCard
                            key={task.id}
                            task={task}
                            isArabic={isArabic}
                            onCycle={cycleTaskStatus}
                            isDragging={draggingTaskId === task.id}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Dense Data Table View */
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-start">
                      <thead>
                        <tr className="border-b border-[#DDDAD3] dark:border-[#2C2824] text-[#5A5348] dark:text-[#B5AC9C] font-mono text-[10px]">
                          <th className="py-2 px-3 text-start">KEY</th>
                          <th className="py-2 px-3 text-start">{isArabic ? 'العنوان' : 'TITLE'}</th>
                          <th className="py-2 px-3 text-start">{isArabic ? 'الحالة' : 'STATUS'}</th>
                          <th className="py-2 px-3 text-start">
                            {isArabic ? 'الأولوية' : 'PRIORITY'}
                          </th>
                          <th className="py-2 px-3 text-start">{isArabic ? 'المسؤول' : 'ASSIGNEE'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DDDAD3] dark:divide-[#2C2824]">
                        {filteredTasks.map((t) => (
                          <tr
                            key={t.id}
                            onClick={() => cycleTaskStatus(t.id)}
                            className="hover:bg-[#EDECE8]/60 dark:hover:bg-[#1C1A17] cursor-pointer active:scale-[0.99] transition-transform select-none"
                          >
                            <td className="py-2.5 px-3 font-mono font-bold text-[#7A5818] dark:text-[#D4B26E]">
                              {t.key}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-[#1B1915] dark:text-[#EFE9DD]">
                              {isArabic ? t.titleAr : t.titleEn}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                  t.status === 'done'
                                    ? 'bg-[#9CC5A1]/15 text-[#3b6e41] dark:text-[#9CC5A1] border border-[#9CC5A1]/30'
                                    : t.status === 'in_progress'
                                    ? 'bg-[#8DB4E8]/15 text-[#8DB4E8] border border-[#8DB4E8]/30'
                                    : 'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C]'
                                }`}
                              >
                                {t.status === 'done'
                                  ? isArabic
                                    ? 'مكتملة'
                                    : 'DONE'
                                  : t.status === 'in_progress'
                                  ? isArabic
                                    ? 'قيد التنفيذ'
                                    : 'IN PROGRESS'
                                  : isArabic
                                  ? 'الانتظار'
                                  : 'TODO'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <PrioritySignalBadge priority={t.priority} size="sm" />
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                              {isArabic ? t.assignee.nameAr : t.assignee.nameEn}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Tactile prompt */}
                <div className="mt-3 text-center">
                  <span className="text-[11px] text-[#5A5348] dark:text-[#9A9183] font-mono">
                    {isArabic
                      ? 'اسحب وأفلت المهام بين الأعمدة أو انقر عليها للتحديث الفوري لحالة السبرنت'
                      : 'Drag & drop tasks across sprint columns or click to transition lifecycle state'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SYSTEM ARCHITECTURE & GOVERNANCE */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDDAD3] dark:border-[#2C2824]">
        <div className="max-w-3xl mb-8 text-start">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1B1915] dark:text-[#EFE9DD] font-display">
            {isArabic ? 'معمارية المنظومة ومحرك الحوكمة' : 'Core Architecture & Governance Engine'}
          </h2>
          <p className="mt-2 text-sm text-[#5A5348] dark:text-[#B5AC9C] leading-relaxed font-normal">
            {isArabic
              ? 'ضمانات علائقية دقيقة تعزل العمليات الحساسة، وتحمي قاعدة البيانات من الاستنزاف مع التزام صارم بمعايير RFC 9457.'
              : 'Deterministic relational guarantees enforcing strict RBAC boundaries, multi-tier rate limiting, and zero internal stack trace leaks.'}
          </p>
        </div>

        {/* Asymmetric 7 / 5 Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Console (7 cols): Interactive RBAC Security Matrix */}
          <div className="lg:col-span-7 rounded-xl border border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDDAD3] dark:border-[#2C2824]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#7A5818]/10 dark:bg-[#D4B26E]/10 text-[#7A5818] dark:text-[#D4B26E] flex items-center justify-center text-sm font-bold">
                    <SafetyCertificateOutlined />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#1B1915] dark:text-[#EFE9DD] font-display leading-none">
                      {isArabic ? 'محاكي حوكمة الصلاحيات (RBAC)' : 'Interactive RBAC Security Matrix'}
                    </h3>
                    <span className="text-[11px] text-[#5A5348] dark:text-[#B5AC9C] font-mono mt-1 block">
                      {isArabic ? 'جرّب التبديل بين دور المالك والعضو:' : 'Simulate active role perspective:'}
                    </span>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="inline-flex p-0.5 rounded-md bg-[#EDECE8] dark:bg-[#0C0B0A] border border-[#DDDAD3] dark:border-[#2C2824]">
                  <button
                    type="button"
                    onClick={() => setSimulatedRole('owner')}
                    className={`px-3 py-1 rounded text-xs font-semibold active:scale-[0.98] transition-transform ${
                      simulatedRole === 'owner'
                        ? 'bg-[#7A5818] dark:bg-[#D4B26E] text-white dark:text-[#1A1408] font-bold shadow-xs'
                        : 'text-[#5A5348] hover:text-[#1B1915] dark:hover:text-[#EFE9DD]'
                    }`}
                  >
                    <CrownOutlined className="me-1.5" />
                    {isArabic ? 'المالك (Owner)' : 'Owner'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedRole('member')}
                    className={`px-3 py-1 rounded text-xs font-semibold active:scale-[0.98] transition-transform ${
                      simulatedRole === 'member'
                        ? 'bg-[#1B1915] text-white dark:bg-[#2C2824] shadow-xs'
                        : 'text-[#5A5348] hover:text-[#1B1915] dark:hover:text-[#EFE9DD]'
                    }`}
                  >
                    <UserOutlined className="me-1.5" />
                    {isArabic ? 'عضو الفريق (Member)' : 'Member'}
                  </button>
                </div>
              </div>

              {/* Reactive Permission Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="border-b border-[#DDDAD3] dark:border-[#2C2824] text-[10px] font-mono text-[#5A5348] dark:text-[#B5AC9C]">
                      <th className="py-2 px-2 text-start">{isArabic ? 'العملية' : 'OPERATION'}</th>
                      <th className="py-2 px-2 text-start">{isArabic ? 'مستوى الصلاحية' : 'AUTHORITY'}</th>
                      <th className="py-2 px-2 text-end">{isArabic ? 'حالة التنفيذ' : 'SIMULATION'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDDAD3] dark:divide-[#2C2824] font-mono text-[11px]">
                    <tr>
                      <td className="py-2.5 px-2 font-sans font-medium text-[#1B1915] dark:text-[#EFE9DD]">
                        {isArabic ? 'حذف المشروع نهائياً' : 'Permanent Project Deletion'}
                      </td>
                      <td className="py-2.5 px-2 text-[#5A5348] dark:text-[#B5AC9C]">
                        {isArabic ? 'المالك فقط' : 'Owner Exclusive'}
                      </td>
                      <td className="py-2.5 px-2 text-end">
                        {simulatedRole === 'owner' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#9CC5A1]/15 text-[#3b6e41] dark:text-[#9CC5A1] border border-[#9CC5A1]/30">
                            <CheckOutlined /> {isArabic ? 'مسموح (مع تأكيد الاسم)' : 'Permitted (Guarded)'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EE8A78]/15 text-[#c24b37] dark:text-[#EE8A78] border border-[#EE8A78]/30">
                            <LockOutlined /> {isArabic ? 'محظور (بوابة 403)' : 'Blocked (403 Gate)'}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2 font-sans font-medium text-[#1B1915] dark:text-[#EFE9DD]">
                        {isArabic ? 'دعوة أعضاء جدد وتعيين الأدوار' : 'Invite Members & Role Grants'}
                      </td>
                      <td className="py-2.5 px-2 text-[#5A5348] dark:text-[#B5AC9C]">
                        {isArabic ? 'المالك فقط' : 'Owner Exclusive'}
                      </td>
                      <td className="py-2.5 px-2 text-end">
                        {simulatedRole === 'owner' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#9CC5A1]/15 text-[#3b6e41] dark:text-[#9CC5A1] border border-[#9CC5A1]/30">
                            <CheckOutlined /> {isArabic ? 'مسموح' : 'Permitted'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EE8A78]/15 text-[#c24b37] dark:text-[#EE8A78] border border-[#EE8A78]/30">
                            <LockOutlined /> {isArabic ? 'عرض فقط' : 'View Only'}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2 font-sans font-medium text-[#1B1915] dark:text-[#EFE9DD]">
                        {isArabic ? 'إنشاء وتعديل ونقل المهام' : 'Create & Reorder Sprint Tasks'}
                      </td>
                      <td className="py-2.5 px-2 text-[#5A5348] dark:text-[#B5AC9C]">
                        {isArabic ? 'كافة الأعضاء' : 'All Roles'}
                      </td>
                      <td className="py-2.5 px-2 text-end">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#9CC5A1]/15 text-[#3b6e41] dark:text-[#9CC5A1] border border-[#9CC5A1]/30">
                          <CheckOutlined /> {isArabic ? 'مسموح' : 'Permitted'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2 font-sans font-medium text-[#1B1915] dark:text-[#EFE9DD]">
                        {isArabic ? 'إدارة مفاتيح API وعناوين الخادم' : 'API Token & Server Switch'}
                      </td>
                      <td className="py-2.5 px-2 text-[#5A5348] dark:text-[#B5AC9C]">
                        {isArabic ? 'المالك فقط' : 'Owner Exclusive'}
                      </td>
                      <td className="py-2.5 px-2 text-end">
                        {simulatedRole === 'owner' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#9CC5A1]/15 text-[#3b6e41] dark:text-[#9CC5A1] border border-[#9CC5A1]/30">
                            <CheckOutlined /> {isArabic ? 'مسموح' : 'Permitted'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EE8A78]/15 text-[#c24b37] dark:text-[#EE8A78] border border-[#EE8A78]/30">
                            <LockOutlined /> {isArabic ? 'محظور' : 'Restricted'}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-between text-[11px] text-[#5A5348] dark:text-[#B5AC9C] font-mono">
              <span>
                {isArabic
                  ? 'التحقق البرمجي: JWT Claims + SQL Invariants'
                  : 'Enforcement: JWT Claims + SQL Invariants'}
              </span>
              <span className="text-[#7A5818] dark:text-[#D4B26E] font-bold">200 OK</span>
            </div>
          </div>

          {/* Right Console (5 cols): SQLite WAL & Telemetry */}
          <div className="lg:col-span-5 rounded-xl border border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD3] dark:border-[#2C2824]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#8DB4E8]/10 text-[#8DB4E8] flex items-center justify-center text-sm font-bold">
                    <DatabaseOutlined />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#1B1915] dark:text-[#EFE9DD] font-display leading-none">
                      {isArabic ? 'محرك البيانات وحماية الطلبات' : 'Data Engine & Defense'}
                    </h3>
                    <span className="text-[11px] text-[#5A5348] dark:text-[#B5AC9C] font-mono mt-1 block">
                      SQLite WAL Journal Mode
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#9CC5A1] animate-pulse" />
              </div>

              {/* Protocol Readout Strip */}
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#EDECE8] dark:bg-[#0C0B0A] border border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-between">
                  <span className="text-[#5A5348] dark:text-[#B5AC9C]">
                    {isArabic ? 'محرك التخزين' : 'Storage Engine'}
                  </span>
                  <span className="font-bold text-[#1B1915] dark:text-[#EFE9DD]">SQLite 3 WAL</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#EDECE8] dark:bg-[#0C0B0A] border border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-between">
                  <span className="text-[#5A5348] dark:text-[#B5AC9C]">
                    {isArabic ? 'القيود العلائقية' : 'Relational Integrity'}
                  </span>
                  <span className="text-[#3b6e41] dark:text-[#9CC5A1] font-bold">
                    PRAGMA foreign_keys = ON
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#EDECE8] dark:bg-[#0C0B0A] border border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-between">
                  <span className="text-[#5A5348] dark:text-[#B5AC9C]">
                    {isArabic ? 'حماية الرؤوس' : 'Security Headers'}
                  </span>
                  <span className="text-[#7A5818] dark:text-[#D4B26E] font-bold">
                    Helmet + HSTS + CSP
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#EDECE8] dark:bg-[#0C0B0A] border border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-between">
                  <span className="text-[#5A5348] dark:text-[#B5AC9C]">
                    {isArabic ? 'معيار الأخطاء' : 'Error Standard'}
                  </span>
                  <span className="text-[#1B1915] dark:text-[#EFE9DD] font-bold">
                    RFC 9457 Safe Payloads
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#5A5348] dark:text-[#B5AC9C]">
                {isArabic ? 'زمن الاستجابة للعمليات:' : 'Query latency:'}
              </span>
              <span className="text-[#8DB4E8] font-bold tabular-nums">&lt; 2.4ms p99</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 ARCHITECTURAL CONTRAST MATRIX (ZERO AI SLOP CRAFT) */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-xl border border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] p-6 sm:p-8 shadow-xs">
          <div className="max-w-2xl mb-6 text-start">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#7A5818] dark:text-[#D4B26E] block mb-1">
              {isArabic ? 'المقارنة المعمارية والهندسية' : 'ARCHITECTURAL BENCHMARK'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1B1915] dark:text-[#EFE9DD] font-display">
              {isArabic ? 'لماذا تختار الفرق التقنية TaskFlow بدلاً من الأدوات التقليدية؟' : 'Why high-velocity squads choose TaskFlow over legacy trackers'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5348] dark:text-[#B5AC9C] mt-1.5 leading-relaxed">
              {isArabic
                ? 'مقارنة فنية مباشرة بين محرك TaskFlow المحلي المستقل وأنظمة SaaS السحابية البطيئة الممتلئة بالتعقيد.'
                : 'Direct architectural comparison between TaskFlow standalone SQL engine and bloated, sluggish multi-tenant trackers.'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-[#DDDAD3] dark:border-[#2C2824] text-[10px] font-mono text-[#5A5348] dark:text-[#B5AC9C]">
                  <th className="py-3 px-3 text-start w-1/4">{isArabic ? 'المعيار المعماري' : 'ENGINEERING CRITERIA'}</th>
                  <th className="py-3 px-3 text-start w-3/8 text-[#7A5818] dark:text-[#D4B26E] font-bold">{isArabic ? 'منظومة TaskFlow' : 'TASKFLOW ARCHITECTURE'}</th>
                  <th className="py-3 px-3 text-start w-3/8 text-[#736B5E] dark:text-[#9A9183]">{isArabic ? 'الأنظمة التقليدية (Jira / Monday / Asana)' : 'LEGACY SAAS TRACKERS'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDDAD3] dark:divide-[#2C2824] text-[12px]">
                <tr>
                  <td className="py-3.5 px-3 font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                    {isArabic ? 'زمن استجابة العمليات (Latency)' : 'Query & UI Latency'}
                  </td>
                  <td className="py-3.5 px-3 text-[#3b6e41] dark:text-[#9CC5A1] font-mono font-bold">
                    &lt; 2.4ms p99 (محلي فوري مباشر)
                  </td>
                  <td className="py-3.5 px-3 text-[#736B5E] dark:text-[#9A9183] font-mono">
                    800ms – 2400ms (انتظار شبكي سحابي مستمر)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                    {isArabic ? 'محرك تخزين البيانات' : 'Persistence & Ownership'}
                  </td>
                  <td className="py-3.5 px-3 text-[#1B1915] dark:text-[#EFE9DD] font-medium">
                    SQLite 3 WAL مع تكامل مرجعي علائقي صارم
                  </td>
                  <td className="py-3.5 px-3 text-[#736B5E] dark:text-[#9A9183]">
                    قواعد بيانات سحابية مغلقة مع احتكار كامل للبيانات (Vendor Lock-in)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                    {isArabic ? 'التحكم عبر لوحة المفاتيح' : 'Keyboard Ergonomics'}
                  </td>
                  <td className="py-3.5 px-3 text-[#7A5818] dark:text-[#D4B26E] font-mono">
                    لوحة أوامر كاملة (Cmd+K) + اختصارات ⌘+Enter
                  </td>
                  <td className="py-3.5 px-3 text-[#736B5E] dark:text-[#9A9183]">
                    اعتماد كامل على الفأرة مع نوافذ منبثقة متداخلة معقدة
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                    {isArabic ? 'العناية باللغة العربية (RTL)' : 'Bilingual RTL Craft'}
                  </td>
                  <td className="py-3.5 px-3 text-[#1B1915] dark:text-[#EFE9DD] font-medium">
                    IBM Plex Sans Arabic مع تباعد متناسق يمنع تقطع الحروف وتكبير بصري 10%
                  </td>
                  <td className="py-3.5 px-3 text-[#736B5E] dark:text-[#9A9183]">
                    ترجمة آلية سطحية مع تشوه في محاذاة الأيقونات وتداخل الحروف
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                    {isArabic ? 'الحمل البصري والتشويش' : 'Visual Noise & AI Slop'}
                  </td>
                  <td className="py-3.5 px-3 text-[#1B1915] dark:text-[#EFE9DD] font-medium">
                    صفر إيموجي، تدرجات سويسرية هادئة (Obsidian & Pearl)، وشارات إشارة شبكية
                  </td>
                  <td className="py-3.5 px-3 text-[#736B5E] dark:text-[#9A9183]">
                    توهجات نيونية، إيموجيات مشتتة، ومؤثرات زجاجية تستهلك طاقة المعالج
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. KEYBOARD SHORTCUTS PALETTE STRIP */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-xl border border-[#DDDAD3] dark:border-[#2C2824] bg-white/70 dark:bg-[#141211]/70 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={triggerCommandPalette}
              className="tactile-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD] hover:border-[#7A5818] dark:hover:border-[#D4B26E] cursor-pointer shadow-xs"
            >
              <SearchOutlined className="text-[#7A5818] dark:text-[#D4B26E]" />
              <span>{isArabic ? 'فتح لوحة الأوامر' : 'Open Command Bar'}</span>
              <kbd className="font-mono text-[10px] text-[#5A5348] dark:text-[#B5AC9C] px-1 rounded bg-[#EDECE8] dark:bg-[#0C0B0A]">
                Cmd+K
              </kbd>
            </button>
            <span className="text-xs text-[#5A5348] dark:text-[#B5AC9C] hidden md:inline">
              {isArabic
                ? 'تنقل فوري وإدارة المهام والمشاريع دون مغادرة لوحة المفاتيح'
                : 'Execute commands and switch workspaces without leaving your keyboard flow'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#5A5348] dark:text-[#B5AC9C]">
            <span className="text-[#5A5348] dark:text-[#B5AC9C] hidden sm:inline">
              {isArabic ? 'اختصارات:' : 'Shortcuts:'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824]">
              <strong className="text-[#7A5818] dark:text-[#D4B26E]">N</strong>{' '}
              {isArabic ? 'مهمة' : 'New Task'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824]">
              <strong className="text-[#7A5818] dark:text-[#D4B26E]">P</strong>{' '}
              {isArabic ? 'مشاريع' : 'Projects'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824]">
              <strong className="text-[#7A5818] dark:text-[#D4B26E]">T</strong>{' '}
              {isArabic ? 'سمة' : 'Theme'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824]">
              <strong className="text-[#7A5818] dark:text-[#D4B26E]">S</strong>{' '}
              {isArabic ? 'خادم' : 'Failover'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. ARCHITECTURAL DISPATCH CONSOLE */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDDAD3] dark:border-[#2C2824]">
        <div className="rounded-xl border border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 text-start">
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-[#1B1915] dark:text-[#EFE9DD] font-display">
              {isArabic ? 'ابدأ مساحة عملك الهندسية الآن' : 'Initialize your engineering workspace'}
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5348] dark:text-[#B5AC9C] max-w-xl leading-relaxed">
              {isArabic
                ? 'انطلق مع قاعدة بيانات SQLite المحلية المباشرة أو اتصل بالمزامنة السحابية فوراً بلا أي قيود خارجية.'
                : 'Deploy with zero-dependency SQLite local persistence or connect to cloud synchronization with zero vendor lock-in.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <Link href="/dashboard">
                <Button
                  type="primary"
                  size="large"
                  iconPlacement="end"
                  icon={<ArrowRightOutlined className="rtl:-scale-x-100" />}
                  className={STYLES.primaryActionButton}
                >
                  {isArabic ? 'فتح لوحة التحكم' : 'Open Dashboard'}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button
                    type="primary"
                    size="large"
                    iconPlacement="end"
                    icon={<ArrowRightOutlined className="rtl:-scale-x-100" />}
                    className={STYLES.primaryActionButton}
                  >
                    {isArabic ? 'إنشاء حساب جديد' : 'Create Free Account'}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="large" className={STYLES.secondaryActionButton}>
                    {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 5. ARCHITECTURAL MINIMALIST FOOTER */}
      <footer className="py-6 px-4 border-t border-[#DDDAD3] dark:border-[#2C2824] text-center text-[11px] text-[#5A5348] dark:text-[#B5AC9C] font-mono">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>TaskFlow Enterprise Runtime</span>
          <span>&bull;</span>
          <span>SQLite WAL Persistence</span>
          <span>&bull;</span>
          <span>Strict RBAC Governance</span>
          <span>&bull;</span>
          <span className="tabular-nums">v3.0.0</span>
        </div>
      </footer>
    </div>
  );
}
