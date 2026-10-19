'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  LockOutlined,
  ThunderboltOutlined,
  UserOutlined,
  CrownOutlined,
  RightOutlined,
  CloseOutlined,
  ReloadOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { Button, Avatar, Progress, Tooltip } from 'antd';

interface DemoTask {
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

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filterQuery, setFilterQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'medium'>('all');
  const [simulatedRole, setSimulatedRole] = useState<'owner' | 'member'>('owner');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [demoTasks, setDemoTasks] = useState<DemoTask[]>([
    {
      id: 'task-1',
      key: 'TF-101',
      titleEn: 'Configure REST API endpoints and verify token authorization',
      titleAr: 'إعداد واجهات REST API وتأكيد صلاحيات الرموز البرمجية',
      status: 'done',
      priority: 'high',
      assignee: { nameEn: 'Sarah Al-Sharif', nameAr: 'سارة الشريف', initial: 'س' },
      dueDateEn: 'Today',
      dueDateAr: 'اليوم',
    },
    {
      id: 'task-2',
      key: 'TF-204',
      titleEn: 'Build responsive Kanban board with mobile segmented tabs',
      titleAr: 'تطوير لوحة كانبان تفاعلية مع تبويبات مخصصة للهواتف الذكية',
      status: 'in_progress',
      priority: 'urgent',
      assignee: { nameEn: 'Ahmad Al-Khatib', nameAr: 'أحمد الخطيب', initial: 'أ' },
      dueDateEn: 'Tomorrow',
      dueDateAr: 'غداً',
    },
    {
      id: 'task-3',
      key: 'TF-312',
      titleEn: 'Enforce role governance and project deletion confirmation',
      titleAr: 'تطبيق حوكمة الصلاحيات وتأكيد حذف المهام والمشاريع',
      status: 'todo',
      priority: 'medium',
      assignee: { nameEn: 'Mohammed Al-Saleh', nameAr: 'محمد الصالح', initial: 'م' },
      dueDateEn: 'Oct 24',
      dueDateAr: '24 أكتوبر',
    },
    {
      id: 'task-4',
      key: 'TF-405',
      titleEn: 'Optimize multi-tier rate limiting and persistent sessions',
      titleAr: 'ضبط محدد معدل الطلبات وحماية الجلسات المستمرة',
      status: 'in_progress',
      priority: 'high',
      assignee: { nameEn: 'Khaled Al-Salem', nameAr: 'خالد السالم', initial: 'خ' },
      dueDateEn: 'Oct 26',
      dueDateAr: '26 أكتوبر',
    },
  ]);

  // Keyboard shortcut listener: '/' focuses search input, 'Escape' clears it
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
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  };

  const cycleTaskStatus = (id: string) => {
    setDemoTasks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next =
            item.status === 'todo'
              ? 'in_progress'
              : item.status === 'in_progress'
              ? 'done'
              : 'todo';
          return { ...item, status: next };
        }
        return item;
      })
    );
  };

  const todoTasks = demoTasks.filter((t) => t.status === 'todo');
  const inProgTasks = demoTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = demoTasks.filter((t) => t.status === 'done');
  const completionRate = Math.round((doneTasks.length / demoTasks.length) * 100);

  const filteredTasks = demoTasks.filter((t) => {
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    if (!matchesPriority) return false;
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      t.key.toLowerCase().includes(q) ||
      t.titleEn.toLowerCase().includes(q) ||
      t.titleAr.includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      
      {/* 1. BESPOKE PRECISION HERO & WORKBENCH */}
      <section className="pt-8 sm:pt-14 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (5 cols): High-Impact Value Proposition (NO EYE-BROW PILL, NO 3-METRIC ROW) */}
          <div className="lg:col-span-5 space-y-6 text-start">
            
            {/* Bold, Authoritative Headline - Stands on its own weight */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
              {isArabic ? (
                <>إدارة هندسية للمشاريع وتنسيق المهام البرمجية بدقة فورية.</>
              ) : (
                <>Engineering workflows orchestrated with deterministic speed.</>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {isArabic
                ? 'مسارات كانبان سريعة الاستجابة، وحوكمة صارمة للصلاحيات، وتخزين موثوق بتقنية SQLite WAL. صُمم خصيصاً لفرق التطوير عالية الإنتاجية.'
                : 'Instant-feel Kanban pipelines, strict role boundaries, and rock-solid SQLite WAL persistence. Built for software engineering teams that move with conviction.'}
            </p>

            {/* Tactile Action Buttons (Emil Kowalski Physics: active:scale-[0.98] with Top Hairline Specular Highlight) */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      type="primary"
                      size="large"
                      iconPlacement="end"
                      icon={<ArrowRightOutlined className="rtl:-scale-x-100" />}
                      className="!bg-amber-500 hover:!bg-amber-400 !border-amber-500 font-bold px-6 h-11 rounded-lg text-sm !text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] shadow-md shadow-amber-500/20 active:scale-[0.98] transition-transform duration-160"
                    >
                      {isArabic ? 'فتح مساحة العمل' : 'Open Workspace'}
                    </Button>
                  </Link>
                  <Link href="/projects/new">
                    <Button
                      size="large"
                      icon={<PlusOutlined />}
                      className="border-slate-300 dark:border-[#1b2336] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-semibold px-5 h-11 rounded-lg text-sm bg-white dark:bg-[#0e131f] active:scale-[0.98] transition-transform duration-160"
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
                      className="!bg-amber-500 hover:!bg-amber-400 !border-amber-500 font-bold px-6 h-11 rounded-lg text-sm !text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] shadow-md shadow-amber-500/20 active:scale-[0.98] transition-transform duration-160"
                    >
                      {isArabic ? 'ابدأ مساحة العمل' : 'Start Workspace'}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="large"
                      className="border-slate-300 dark:border-[#1b2336] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-semibold px-5 h-11 rounded-lg text-sm bg-white dark:bg-[#0e131f] active:scale-[0.98] transition-transform duration-160"
                    >
                      {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Understated Keyboard & Runtime Hints (Zero AI Slop Metric Row) */}
            <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {isArabic ? 'محرك فوري' : 'Live Engine'}
              </span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#141a29] border border-slate-200 dark:border-[#1f293d] text-slate-600 dark:text-slate-300 text-[10px]">
                /
              </kbd>
              <span>{isArabic ? 'تصفية المهام' : 'quick filter'}</span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
              <button
                type="button"
                onClick={triggerCommandPalette}
                className="hidden sm:inline-flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer active:scale-[0.98] transition-transform duration-160"
              >
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#141a29] border border-slate-200 dark:border-[#1f293d] text-slate-600 dark:text-slate-300 text-[10px]">
                  Cmd+K
                </kbd>
                <span>{isArabic ? 'لوحة الأوامر' : 'command bar'}</span>
              </button>
            </div>
          </div>

          {/* Right Column (7 cols): The Living Interactive Sprint Canvas */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-slate-200 dark:border-[#1b2336] bg-white dark:bg-[#0e131f] shadow-lg shadow-black/5 dark:shadow-black/40 overflow-hidden text-start">
              
              {/* Product Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#1b2336] bg-slate-50/90 dark:bg-[#141a29]/90 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white font-sans">
                    TaskFlow
                  </span>
                  <span className="text-slate-400 text-xs">/</span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {isArabic ? 'سبرنت المنظومة الأساسية' : 'Sprint 04 Core Engine'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    {isArabic ? 'نشط' : 'Active'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Switcher: Board vs Table */}
                  <div className="inline-flex p-0.5 rounded-md bg-slate-200/80 dark:bg-[#080b11] border border-slate-200 dark:border-[#1b2336]">
                    <button
                      type="button"
                      onClick={() => setViewMode('board')}
                      className={`px-2.5 py-1 rounded text-xs font-medium active:scale-[0.98] transition-transform duration-160 ${
                        viewMode === 'board'
                          ? 'bg-white dark:bg-[#161d2e] text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <AppstoreOutlined className="me-1.5" />
                      {isArabic ? 'اللوحة' : 'Board'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`px-2.5 py-1 rounded text-xs font-medium active:scale-[0.98] transition-transform duration-160 ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-[#161d2e] text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <UnorderedListOutlined className="me-1.5" />
                      {isArabic ? 'الجدول' : 'Table'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Interactive Filter Bar */}
              <div className="px-4 py-2 bg-white dark:bg-[#0c101a] border-b border-slate-200 dark:border-[#1b2336] flex flex-wrap items-center justify-between gap-2.5">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <SearchOutlined className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder={isArabic ? 'تصفية المهام السريعة...' : 'Filter demo tasks...'}
                    className="w-full ps-8 pe-7 py-1 text-xs rounded-md border border-slate-200 dark:border-[#1b2336] bg-slate-50 dark:bg-[#080b11] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                  {filterQuery ? (
                    <button
                      type="button"
                      onClick={() => setFilterQuery('')}
                      className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <CloseOutlined className="text-[10px]" />
                    </button>
                  ) : (
                    <kbd className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-slate-400 px-1 rounded bg-slate-200/50 dark:bg-[#161d2e]">
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
                        className={`px-2 py-0.5 rounded capitalize active:scale-[0.98] transition-transform duration-160 ${
                          active
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {pri === 'all'
                          ? isArabic ? 'الكل' : 'All'
                          : pri === 'urgent'
                          ? isArabic ? 'عاجل' : 'Urgent'
                          : pri === 'high'
                          ? isArabic ? 'عالي' : 'High'
                          : isArabic ? 'متوسط' : 'Medium'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sprint Velocity & Progress Bar */}
              <div className="px-4 py-2 bg-slate-100/50 dark:bg-[#080b11]/60 border-b border-slate-200 dark:border-[#1b2336] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">
                    {isArabic ? 'إنجاز السبرنت:' : 'Sprint Progress:'}
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {completionRate}%
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono tabular-nums">
                    ({doneTasks.length}/{demoTasks.length} {isArabic ? 'مهام مكتملة' : 'tasks done'})
                  </span>
                </div>
                <div className="w-28 sm:w-40">
                  <Progress
                    percent={completionRate}
                    size="small"
                    showInfo={false}
                    strokeColor="#f59e0b"
                  />
                </div>
              </div>

              {/* Interactive View Body */}
              <div className="p-4 bg-slate-50/40 dark:bg-[#0a0e18]">
                {viewMode === 'board' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Column 1: TODO */}
                    <div className="rounded-lg bg-slate-100/80 dark:bg-[#0e131f] border border-slate-200/90 dark:border-[#1b2336] p-2.5 flex flex-col min-h-[220px]">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-[#1b2336]">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {isArabic ? 'قيد الانتظار' : 'To Do'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#161d2e] text-slate-600 dark:text-slate-400 font-bold tabular-nums">
                          {todoTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {todoTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => cycleTaskStatus(task.id)}
                            className="p-2.5 rounded-md bg-white dark:bg-[#141a29] border border-slate-200 dark:border-[#1f293d] hover:border-amber-500/60 active:scale-[0.98] transition-transform duration-160 cursor-pointer shadow-xs space-y-2 select-none group"
                            title={isArabic ? 'انقر لنقل المهمة للحالة التالية' : 'Click to cycle task status'}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-slate-400">{task.key}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                              {isArabic ? task.titleAr : task.titleEn}
                            </p>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#1b2336] text-[10px] text-slate-400">
                              <span>{isArabic ? task.dueDateAr : task.dueDateEn}</span>
                              <Avatar size={18} className="bg-amber-500 text-slate-950 font-bold text-[9px]">
                                {task.assignee.initial}
                              </Avatar>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: IN PROGRESS */}
                    <div className="rounded-lg bg-slate-100/80 dark:bg-[#0e131f] border border-slate-200/90 dark:border-[#1b2336] p-2.5 flex flex-col min-h-[220px]">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-[#1b2336]">
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          {isArabic ? 'قيد التنفيذ' : 'In Progress'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold tabular-nums">
                          {inProgTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {inProgTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => cycleTaskStatus(task.id)}
                            className="p-2.5 rounded-md bg-white dark:bg-[#141a29] border border-amber-500/30 dark:border-amber-500/30 hover:border-amber-500 active:scale-[0.98] transition-transform duration-160 cursor-pointer shadow-xs space-y-2 select-none group"
                            title={isArabic ? 'انقر لنقل المهمة للحالة التالية' : 'Click to cycle task status'}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-amber-600 dark:text-amber-400 font-bold">{task.key}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                              {isArabic ? task.titleAr : task.titleEn}
                            </p>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#1b2336] text-[10px] text-slate-400">
                              <span>{isArabic ? task.dueDateAr : task.dueDateEn}</span>
                              <Avatar size={18} className="bg-amber-500 text-slate-950 font-bold text-[9px]">
                                {task.assignee.initial}
                              </Avatar>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: DONE */}
                    <div className="rounded-lg bg-slate-100/80 dark:bg-[#0e131f] border border-slate-200/90 dark:border-[#1b2336] p-2.5 flex flex-col min-h-[220px]">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-[#1b2336]">
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {isArabic ? 'مكتملة' : 'Done'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold tabular-nums">
                          {doneTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {doneTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => cycleTaskStatus(task.id)}
                            className="p-2.5 rounded-md bg-white/70 dark:bg-[#141a29]/60 border border-emerald-500/20 dark:border-emerald-500/20 hover:border-emerald-500 active:scale-[0.98] transition-transform duration-160 cursor-pointer shadow-xs space-y-2 opacity-85 select-none group"
                            title={isArabic ? 'انقر لإعادة المهمة إلى قائمة الانتظار' : 'Click to cycle task status'}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-emerald-600 dark:text-emerald-400 line-through">{task.key}</span>
                              <CheckCircleOutlined className="text-emerald-500 text-xs" />
                            </div>
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-through line-clamp-2 leading-snug">
                              {isArabic ? task.titleAr : task.titleEn}
                            </p>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#1b2336] text-[10px] text-slate-400">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{isArabic ? 'تم الإنجاز' : 'Shipped'}</span>
                              <Avatar size={18} className="bg-emerald-600 text-white font-bold text-[9px]">
                                {task.assignee.initial}
                              </Avatar>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Dense Data Table View */
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-start">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-[#1b2336] text-slate-400 font-mono text-[10px]">
                          <th className="py-2 px-3 text-start">KEY</th>
                          <th className="py-2 px-3 text-start">{isArabic ? 'العنوان' : 'TITLE'}</th>
                          <th className="py-2 px-3 text-start">{isArabic ? 'الحالة' : 'STATUS'}</th>
                          <th className="py-2 px-3 text-start">{isArabic ? 'الأولوية' : 'PRIORITY'}</th>
                          <th className="py-2 px-3 text-start">{isArabic ? 'المسؤول' : 'ASSIGNEE'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#1b2336]">
                        {filteredTasks.map((t) => (
                          <tr
                            key={t.id}
                            onClick={() => cycleTaskStatus(t.id)}
                            className="hover:bg-slate-100/60 dark:hover:bg-[#161d2e] cursor-pointer active:scale-[0.99] transition-transform duration-160 select-none"
                          >
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                              {t.key}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                              {isArabic ? t.titleAr : t.titleEn}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                  t.status === 'done'
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    : t.status === 'in_progress'
                                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                    : 'bg-slate-200 dark:bg-[#161d2e] text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {t.status === 'done'
                                  ? isArabic ? 'مكتملة' : 'DONE'
                                  : t.status === 'in_progress'
                                  ? isArabic ? 'قيد التنفيذ' : 'IN PROGRESS'
                                  : isArabic ? 'الانتظار' : 'TODO'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px]">
                              {t.priority.toUpperCase()}
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

                {/* Tactile interaction prompt */}
                <div className="mt-3 text-center">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isArabic
                      ? 'انقر على أي مهمة أعلاه لمشاهدة دورة الانتقال الفورية بين الأعمدة والنسب'
                      : 'Click any task above to cycle lifecycle state in real time'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. ASYMMETRIC SYSTEM ARCHITECTURE WORKBENCH (ZERO AI SLOP 3-CARD ROW) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-[#1b2336]">
        <div className="max-w-3xl mb-8 text-start">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {isArabic ? 'معمارية المنظومة ومحرك الحوكمة' : 'Core Architecture & Governance Engine'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            {isArabic
              ? 'ضمانات علائقية دقيقة تعزل العمليات الحساسة، وتحمي قاعدة البيانات من الاستنزاف مع التزام صارم بمعايير RFC 9457.'
              : 'Deterministic relational guarantees enforcing strict RBAC boundaries, multi-tier rate limiting, and zero internal stack trace leaks.'}
          </p>
        </div>

        {/* Asymmetric 7 / 5 Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Console (7 cols): Interactive RBAC Governance Simulator */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-[#1b2336] bg-white dark:bg-[#0e131f] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#1b2336]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-bold">
                    <SafetyCertificateOutlined />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-none">
                      {isArabic ? 'محاكي حوكمة الصلاحيات (RBAC)' : 'Interactive RBAC Security Matrix'}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                      {isArabic ? 'جرّب التبديل بين دور المالك والعضو:' : 'Simulate active role perspective:'}
                    </span>
                  </div>
                </div>

                {/* Role Switcher Segmented Control */}
                <div className="inline-flex p-0.5 rounded-md bg-slate-100 dark:bg-[#080b11] border border-slate-200 dark:border-[#1b2336]">
                  <button
                    type="button"
                    onClick={() => setSimulatedRole('owner')}
                    className={`px-3 py-1 rounded text-xs font-semibold active:scale-[0.98] transition-transform duration-160 ${
                      simulatedRole === 'owner'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <CrownOutlined className="me-1.5" />
                    {isArabic ? 'المالك (Owner)' : 'Owner'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedRole('member')}
                    className={`px-3 py-1 rounded text-xs font-semibold active:scale-[0.98] transition-transform duration-160 ${
                      simulatedRole === 'member'
                        ? 'bg-slate-800 text-white dark:bg-[#1f293d] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
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
                    <tr className="border-b border-slate-100 dark:border-[#1b2336] text-[10px] font-mono text-slate-400">
                      <th className="py-2 px-2 text-start">{isArabic ? 'العملية' : 'OPERATION'}</th>
                      <th className="py-2 px-2 text-start">{isArabic ? 'مستوى الصلاحية' : 'AUTHORITY'}</th>
                      <th className="py-2 px-2 text-end">{isArabic ? 'حالة التنفيذ' : 'SIMULATION'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1b2336] font-mono text-[11px]">
                    <tr>
                      <td className="py-2 px-2 font-sans font-medium text-slate-800 dark:text-slate-200">
                        {isArabic ? 'حذف المشروع نهائياً' : 'Permanent Project Deletion'}
                      </td>
                      <td className="py-2 px-2 text-slate-500">
                        {isArabic ? 'المالك فقط' : 'Owner Exclusive'}
                      </td>
                      <td className="py-2 px-2 text-end">
                        {simulatedRole === 'owner' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckOutlined /> {isArabic ? 'مسموح (مع تأكيد الاسم)' : 'Permitted (Guarded)'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <LockOutlined /> {isArabic ? 'محظور (بوابة 403)' : 'Blocked (403 Gate)'}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans font-medium text-slate-800 dark:text-slate-200">
                        {isArabic ? 'دعوة أعضاء جدد وتعيين الأدوار' : 'Invite Members & Role Grants'}
                      </td>
                      <td className="py-2 px-2 text-slate-500">
                        {isArabic ? 'المالك فقط' : 'Owner Exclusive'}
                      </td>
                      <td className="py-2 px-2 text-end">
                        {simulatedRole === 'owner' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckOutlined /> {isArabic ? 'مسموح' : 'Permitted'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <LockOutlined /> {isArabic ? 'عرض فقط' : 'View Only'}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans font-medium text-slate-800 dark:text-slate-200">
                        {isArabic ? 'إنشاء وتعديل ونقل المهام' : 'Create & Reorder Sprint Tasks'}
                      </td>
                      <td className="py-2 px-2 text-slate-500">
                        {isArabic ? 'كافة الأعضاء' : 'All Roles'}
                      </td>
                      <td className="py-2 px-2 text-end">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckOutlined /> {isArabic ? 'مسموح' : 'Permitted'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans font-medium text-slate-800 dark:text-slate-200">
                        {isArabic ? 'إدارة مفاتيح API وعناوين الخادم' : 'API Token & Server Switch'}
                      </td>
                      <td className="py-2 px-2 text-slate-500">
                        {isArabic ? 'المالك فقط' : 'Owner Exclusive'}
                      </td>
                      <td className="py-2 px-2 text-end">
                        {simulatedRole === 'owner' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckOutlined /> {isArabic ? 'مسموح' : 'Permitted'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <LockOutlined /> {isArabic ? 'محظور' : 'Restricted'}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1b2336] flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{isArabic ? 'التطبيق البرمجي: التحقق عبر JWT وتأكيد المعاملات' : 'Enforcement: JWT Claims + SQL Invariants'}</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">200 OK</span>
            </div>
          </div>

          {/* Right Console (5 cols): SQLite WAL & Rate Limiting Telemetry */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-[#1b2336] bg-white dark:bg-[#0e131f] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1b2336]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm font-bold">
                    <DatabaseOutlined />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-none">
                      {isArabic ? 'محرك البيانات وحماية الطلبات' : 'Data Engine & Defense'}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                      SQLite WAL Journal Mode
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              </div>

              {/* Protocol Readout Strip */}
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080b11] border border-slate-200/80 dark:border-[#1b2336] flex items-center justify-between">
                  <span className="text-slate-500">{isArabic ? 'محرك التخزين' : 'Storage Engine'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">SQLite 3.45 WAL</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080b11] border border-slate-200/80 dark:border-[#1b2336] flex items-center justify-between">
                  <span className="text-slate-500">{isArabic ? 'القيود العلائقية' : 'Relational Integrity'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">PRAGMA foreign_keys = ON</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080b11] border border-slate-200/80 dark:border-[#1b2336] flex items-center justify-between">
                  <span className="text-slate-500">{isArabic ? 'محدد الطلبات (طبقة 1)' : 'Rate Limit (Tier 1)'}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Cookie Token (5m)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080b11] border border-slate-200/80 dark:border-[#1b2336] flex items-center justify-between">
                  <span className="text-slate-500">{isArabic ? 'التصعيد الدفاعي (طبقة 2)' : 'Escalation (Tier 2)'}</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">IP Subnet (30m)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080b11] border border-slate-200/80 dark:border-[#1b2336] flex items-center justify-between">
                  <span className="text-slate-500">{isArabic ? 'معيار الأخطاء' : 'Error Standard'}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">RFC 9457 Safe Payloads</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1b2336] flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-400">{isArabic ? 'زمن الاستجابة للعمليات:' : 'Query latency:'}</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold tabular-nums">&lt; 2.4ms p99</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. LINEAR-STYLE KEYBOARD SHORTCUTS PALETTE STRIP */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-xl border border-slate-200 dark:border-[#1b2336] bg-slate-50/70 dark:bg-[#0e131f]/70 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={triggerCommandPalette}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336] text-slate-800 dark:text-slate-200 hover:border-amber-500 active:scale-[0.98] transition-transform duration-160 cursor-pointer shadow-xs"
            >
              <SearchOutlined className="text-amber-500" />
              <span>{isArabic ? 'فتح لوحة الأوامر' : 'Open Command Bar'}</span>
              <kbd className="font-mono text-[10px] text-slate-400 px-1 rounded bg-slate-100 dark:bg-[#080b11]">
                Cmd+K
              </kbd>
            </button>
            <span className="text-xs text-slate-500 hidden md:inline">
              {isArabic ? 'تنقل فوري وإدارة المهام والمشاريع دون لمس الفأرة' : 'Execute commands and switch workspaces without leaving your keyboard flow'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span className="text-slate-400 hidden sm:inline">{isArabic ? 'اختصارات:' : 'Shortcuts:'}</span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336]">
              <strong className="text-amber-600 dark:text-amber-400">N</strong> {isArabic ? 'مهمة' : 'New Task'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336]">
              <strong className="text-amber-600 dark:text-amber-400">P</strong> {isArabic ? 'مشاريع' : 'Projects'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336]">
              <strong className="text-amber-600 dark:text-amber-400">T</strong> {isArabic ? 'سمة' : 'Theme'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336]">
              <strong className="text-amber-600 dark:text-amber-400">S</strong> {isArabic ? 'خادم' : 'Failover'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. UNDERSTATED ARCHITECTURAL DISPATCH CONSOLE */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-[#1b2336]">
        <div className="rounded-xl border border-slate-200 dark:border-[#1b2336] bg-slate-50 dark:bg-[#0e131f] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 text-start">
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {isArabic ? 'ابدأ مساحة عملك الهندسية الآن' : 'Initialize your engineering workspace'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
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
                  className="!bg-amber-500 hover:!bg-amber-400 !border-amber-500 font-bold px-6 h-11 rounded-lg text-sm !text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] shadow-md shadow-amber-500/20 active:scale-[0.98] transition-transform duration-160"
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
                    className="!bg-amber-500 hover:!bg-amber-400 !border-amber-500 font-bold px-6 h-11 rounded-lg text-sm !text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] shadow-md shadow-amber-500/20 active:scale-[0.98] transition-transform duration-160"
                  >
                    {isArabic ? 'إنشاء حساب جديد' : 'Create Free Account'}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="large"
                    className="border-slate-300 dark:border-[#1b2336] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-semibold px-5 h-11 rounded-lg text-sm bg-white dark:bg-[#080b11] active:scale-[0.98] transition-transform duration-160"
                  >
                    {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 5. ARCHITECTURAL MINIMALIST FOOTER */}
      <footer className="py-6 px-4 border-t border-slate-200 dark:border-[#1b2336] text-center text-[11px] text-slate-500 font-mono">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>TaskFlow Engineering Runtime</span>
          <span>&bull;</span>
          <span>SQLite WAL Persistence</span>
          <span>&bull;</span>
          <span>Strict RBAC Governance</span>
          <span>&bull;</span>
          <span className="tabular-nums">v1.4.0</span>
        </div>
      </footer>
    </div>
  );
}