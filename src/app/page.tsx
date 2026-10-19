'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  CheckOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  CodeOutlined,
  LockOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { Button, Avatar, Progress, Tooltip } from 'antd';

interface DemoTask {
  id: string;
  key: string;
  titleEn: string;
  titleAr: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  assignee: { name: string; initial: string };
  dueDateEn: string;
  dueDateAr: string;
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filterQuery, setFilterQuery] = useState('');
  const [demoTasks, setDemoTasks] = useState<DemoTask[]>([
    {
      id: 'task-1',
      key: 'TF-101',
      titleEn: 'Configure REST API endpoints and verify token authorization',
      titleAr: 'إعداد واجهات REST API وتأكيد صلاحيات الرموز البرمجية',
      status: 'done',
      priority: 'high',
      assignee: { name: 'سارة الشريف', initial: 'س' },
      dueDateEn: 'Today',
      dueDateAr: 'اليوم',
    },
    {
      id: 'task-2',
      key: 'TF-204',
      titleEn: 'Build responsive Kanban board with mobile segmented tabs',
      titleAr: 'تطوير لوحة كانبان تفاعلية مع تبويبات مخصصة للهواتف الذكية',
      status: 'in_progress',
      priority: 'high',
      assignee: { name: 'أحمد الخطيب', initial: 'أ' },
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
      assignee: { name: 'محمد الصالح', initial: 'م' },
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
      assignee: { name: 'خالد السالم', initial: 'خ' },
      dueDateEn: 'Oct 26',
      dueDateAr: '26 أكتوبر',
    },
  ]);

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
      {/* 1. ASYMMETRIC SPLIT HERO - THE LIVING PRODUCT ENGINE */}
      <section className="pt-10 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (5 cols): High-Craft Value Proposition */}
          <div className="lg:col-span-5 space-y-6 text-start">
            {/* Live Telemetry Ticker Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/25">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                {isArabic
                  ? 'محرك تشغيلي فوري • SQLite WAL • بلا تباطؤ'
                  : 'Live Runtime • SQLite WAL • Zero Latency'}
              </span>
            </div>

            {/* Confident Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
              {isArabic ? (
                <>
                  إدارة هندسية دقيقة للمشاريع والمهام.
                </>
              ) : (
                <>
                  Engineering sprints orchestrated with zero latency.
                </>
              )}
            </h1>

            {/* Authentic Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {isArabic
                ? 'لوحات كانبان فورية، حوكمة صارمة للصلاحيات، وتخزين محلي وسحابي مصمم خصيصاً لفرق التطوير عالية الإنتاجية.'
                : 'Instant-feel Kanban pipelines, strict role boundaries, and rock-solid local or cloud persistence built for fast-moving engineering teams.'}
            </p>

            {/* Action Group */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      type="primary"
                      size="large"
                      iconPlacement="end"
                      icon={<ArrowRightOutlined className="rtl:-scale-x-100" />}
                      className="!bg-amber-500 hover:!bg-amber-400 !border-amber-500 font-bold px-6 h-12 rounded-lg text-sm !text-slate-950 shadow-md shadow-amber-500/20"
                    >
                      {isArabic ? 'فتح مساحة العمل' : 'Open Workspace'}
                    </Button>
                  </Link>
                  <Link href="/projects/new">
                    <Button
                      size="large"
                      icon={<PlusOutlined />}
                      className="border-slate-300 dark:border-[#1b2336] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-semibold px-6 h-12 rounded-lg text-sm bg-white dark:bg-[#0e131f]"
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
                      className="!bg-amber-500 hover:!bg-amber-400 !border-amber-500 font-bold px-6 h-12 rounded-lg text-sm !text-slate-950 shadow-md shadow-amber-500/20"
                    >
                      {isArabic ? 'ابدأ مجاناً الآن' : 'Start Free Workspace'}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="large"
                      className="border-slate-300 dark:border-[#1b2336] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-semibold px-6 h-12 rounded-lg text-sm bg-white dark:bg-[#0e131f]"
                    >
                      {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Architecture Metrics Strip */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#1b2336] grid grid-cols-3 gap-3">
              <div className="space-y-0.5">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white tnum">
                  &lt;12ms
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {isArabic ? 'استجابة محرك البيانات' : 'Query execution'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 tnum">
                  RBAC
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {isArabic ? 'حوكمة الصلاحيات' : 'Role boundaries'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tnum">
                  WAL Mode
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {isArabic ? 'استقرار SQLite التام' : 'Zero lock-in'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): The Living Interactive Sprint Canvas */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-slate-200 dark:border-[#1b2336] bg-white dark:bg-[#0e131f] shadow-lg shadow-black/5 dark:shadow-black/40 overflow-hidden text-start">
              
              {/* Product Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#1b2336] bg-slate-50/90 dark:bg-[#141a29]/90 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
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

                <div className="flex items-center gap-2.5">
                  {/* View Switcher: Board vs Table */}
                  <div className="inline-flex p-0.5 rounded-md bg-slate-200/80 dark:bg-[#080b11] border border-slate-200 dark:border-[#1b2336]">
                    <button
                      type="button"
                      onClick={() => setViewMode('board')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
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
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
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

              {/* Sprint Velocity & Progress Bar */}
              <div className="px-4 py-2.5 bg-slate-100/50 dark:bg-[#080b11]/60 border-b border-slate-200 dark:border-[#1b2336] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">
                    {isArabic ? 'إنجاز السبرنت:' : 'Sprint Progress:'}
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tnum">
                    {completionRate}%
                  </span>
                  <span className="text-slate-400 text-[11px] tnum">
                    ({doneTasks.length}/{demoTasks.length} {isArabic ? 'مهام مكتملة' : 'tasks done'})
                  </span>
                </div>
                <div className="w-32 sm:w-44">
                  <Progress
                    percent={completionRate}
                    size="small"
                    showInfo={false}
                    strokeColor="#f59e0b"
                    trailColor={language === 'ar' ? 'rgba(255,255,255,0.08)' : undefined}
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
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#161d2e] text-slate-600 dark:text-slate-400 font-bold tnum">
                          {todoTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {todoTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => cycleTaskStatus(task.id)}
                            className="p-2.5 rounded-md bg-white dark:bg-[#141a29] border border-slate-200 dark:border-[#1f293d] hover:border-amber-500/60 transition-all cursor-pointer shadow-xs space-y-2 group"
                            title={isArabic ? 'انقر لنقل المهمة للحالة التالية' : 'Click to cycle task status'}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-slate-400">{task.key}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
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
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold tnum">
                          {inProgTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {inProgTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => cycleTaskStatus(task.id)}
                            className="p-2.5 rounded-md bg-white dark:bg-[#141a29] border border-amber-500/30 dark:border-amber-500/30 hover:border-amber-500 transition-all cursor-pointer shadow-xs space-y-2 group"
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
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold tnum">
                          {doneTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {doneTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => cycleTaskStatus(task.id)}
                            className="p-2.5 rounded-md bg-white/70 dark:bg-[#141a29]/60 border border-emerald-500/20 dark:border-emerald-500/20 hover:border-emerald-500 transition-all cursor-pointer shadow-xs space-y-2 opacity-85 group"
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
                            className="hover:bg-slate-100/60 dark:hover:bg-[#161d2e] cursor-pointer transition-colors"
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
                              {t.assignee.name}
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

      {/* 2. THE COMMAND RUNTIME INTERACTIVE DEMO (Linear-Style Ergonomics) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-200 dark:border-[#1b2336]">
        <div className="rounded-xl border border-slate-200 dark:border-[#1b2336] bg-slate-50 dark:bg-[#0e131f] p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                {isArabic ? 'لوحة الأوامر السريعة (Cmd+K)' : 'Command Palette Architecture (Cmd+K)'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {isArabic ? 'تنقل فوري وإدارة المهام دون لمس الفأرة' : 'Keyboard-driven speed without leaving your flow'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="text-xs font-mono px-2 py-1 rounded bg-white dark:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336] text-slate-700 dark:text-slate-300 font-bold shadow-xs">
                Cmd + K
              </kbd>
            </div>
          </div>

          {/* Interactive Mock Input */}
          <div className="relative">
            <SearchOutlined className="absolute start-3.5 top-3.5 text-amber-500 text-sm" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={
                isArabic
                  ? 'اكتب لتصفية مهام السبرنت التفاعلي أعلاه (مثال: TF-101، كانبان، أمان...)'
                  : 'Type to filter demo sprint tasks above (e.g., TF-101, Kanban, rate limit...)'
              }
              className="w-full ps-10 pe-4 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-[#1b2336] bg-white dark:bg-[#080b11] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Shortcut Tags */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-slate-500">
            <span className="text-slate-400">{isArabic ? 'أوامر سريعة:' : 'Quick Shortcuts:'}</span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336]">
              <strong className="text-amber-600 dark:text-amber-400">N</strong> {isArabic ? 'مهمة جديدة' : 'New Task'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336]">
              <strong className="text-amber-600 dark:text-amber-400">P</strong> {isArabic ? 'المشاريع' : 'Projects'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336]">
              <strong className="text-amber-600 dark:text-amber-400">T</strong> {isArabic ? 'السمة' : 'Theme'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336]">
              <strong className="text-amber-600 dark:text-amber-400">S</strong> {isArabic ? 'الخادم' : 'Server Switch'}
            </span>
          </div>
        </div>
      </section>

      {/* 3. ASYMMETRIC WORKBENCH ARCHITECTURE (Zero AI Slop 3-Card Row) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-[#1b2336]">
        <div className="max-w-2xl mb-10 text-start">
          <span className="text-[10px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider block mb-1">
            {isArabic ? 'معمارية المنظومة' : 'Core Architecture'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {isArabic ? 'أدوات هندسية صممت للأداء العالي والأمان الحازم' : 'Engineered for throughput, ergonomics, and data safety'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Block 1 (8 cols): Drag-and-drop & Responsive Mobile Tabs */}
          <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-[#1b2336] bg-white dark:bg-[#0e131f] p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-bold">
                    <AppstoreOutlined />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isArabic ? 'محرك كانبان التفاعلي والتبويبات الذكية' : 'Interactive Kanban Lifecycle Engine'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 tnum">
                  60 FPS Smooth
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {isArabic
                  ? 'سحب وإفلات بدقة متناهية، ومزامنة فورية لحالة المهام مع تبويبات مخصصة للهواتف الذكية (<768px) تضمن تصفحاً مرناً دون ازدحام شاشة العرض.'
                  : 'Zero-latency drag-and-drop orchestration, optimistic status updates, and viewport-adaptive mobile segmented tabs that ensure crisp scanning on smaller devices.'}
              </p>
            </div>

            {/* Visual Mini Board Fragment */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1b2336]">
              <div className="grid grid-cols-3 gap-2.5 text-start font-mono text-[10px]">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#141a29] border border-slate-200 dark:border-[#1f293d] space-y-1">
                  <span className="text-slate-400">{isArabic ? 'الانتظار' : 'TODO'}</span>
                  <p className="font-sans font-medium text-slate-800 dark:text-slate-200 text-xs truncate">
                    {isArabic ? 'فحص الشيفرة' : 'Code audit'}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/25 space-y-1">
                  <span className="text-amber-600 dark:text-amber-400">{isArabic ? 'التنفيذ' : 'IN PROG'}</span>
                  <p className="font-sans font-medium text-slate-900 dark:text-slate-100 text-xs truncate">
                    {isArabic ? 'واجهات API' : 'REST hooks'}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                  <span className="text-emerald-600 dark:text-emerald-400">{isArabic ? 'مكتملة' : 'DONE'}</span>
                  <p className="font-sans font-medium text-slate-900 dark:text-slate-100 text-xs truncate">
                    {isArabic ? 'ضبط الأمان' : 'Auth rate limit'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Block 2 (4 cols): RBAC Permission Matrix & Safe Deletion */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-[#1b2336] bg-white dark:bg-[#0e131f] p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm font-bold">
                  <SafetyCertificateOutlined />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isArabic ? 'حوكمة الصلاحيات (RBAC)' : 'Fine-Grained RBAC'}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {isArabic
                  ? 'عزل صارم للعمليات الحساسة مع حماية تأكيد الحذف ومنع التعديلات العشوائية.'
                  : 'Fine-grained permission boundaries guarding destructive operations with confirmation gates.'}
              </p>
            </div>

            {/* Matrix Table */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1b2336] space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#1b2336]">
                <span className="text-slate-500">{isArabic ? 'حذف المشروع' : 'Delete Project'}</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{isArabic ? 'المالك فقط' : 'Owner Only'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#1b2336]">
                <span className="text-slate-500">{isArabic ? 'دعوة أعضاء' : 'Invite Members'}</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{isArabic ? 'المالك فقط' : 'Owner Only'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">{isArabic ? 'تنفيذ المهام' : 'Execute Tasks'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isArabic ? 'الجميع' : 'All Roles'}</span>
              </div>
            </div>
          </div>

          {/* Block 3 (12 cols): Dual Persistence Engine & Multi-Tier Limiter */}
          <div className="lg:col-span-12 rounded-xl border border-slate-200 dark:border-[#1b2336] bg-white dark:bg-[#0e131f] p-6 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm font-bold">
                  <DatabaseOutlined />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isArabic ? 'محرك بيانات مزدوج مع محدد طلبات ذكي' : 'Dual-Engine Persistence & Multi-Tier Protection'}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    SQLite WAL Journal &bull; Auto-Failover &bull; Multi-tier Limiter (Cookie/IP)
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 tnum">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Localhost:5001 &bull; Taqat Cloud Link
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-[#1b2336] text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080b11] border border-slate-200/70 dark:border-[#1b2336] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                  {isArabic ? 'عزل البيانات المحلي' : 'Local Persistence'}
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed block">
                  {isArabic ? 'قاعدة بيانات SQLite محلية دون حاجة لاتصال خارجي' : 'Zero-dependency local SQLite file with foreign keys'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080b11] border border-slate-200/70 dark:border-[#1b2336] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                  {isArabic ? 'محدد طلبات متعدد الطبقات' : 'Multi-tier Limiter'}
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed block">
                  {isArabic ? 'حظر ملف تعريف الارتباط أولاً ثم تصعيد الحظر للـ IP' : 'Tier 1 Cookie block (5m) escalating to Tier 2 IP block (30m)'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080b11] border border-slate-200/70 dark:border-[#1b2336] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                  {isArabic ? 'استجابات معيارية RFC 9457' : 'Standard Errors'}
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed block">
                  {isArabic ? 'أخطاء معيارية بدون تسريب لمسارات النظام أو الشيفرة' : 'Strict schema contracts with zero internal trace leaks'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. UNDERSTATED DIRECT CALL TO ACTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-slate-200 dark:border-[#1b2336]">
        <div className="rounded-2xl border border-slate-200 dark:border-[#1b2336] bg-slate-50 dark:bg-[#0e131f] p-8 sm:p-12 shadow-sm space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {isArabic ? 'ابدأ مساحة عملك الهندسية الآن' : 'Ready to orchestrate your engineering sprints?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {isArabic
              ? 'تحكم كامل ببياناتك، سرعة فائقة في الأداء، وحوكمة دقيقة للمهام والمشاريع.'
              : 'Complete control of your data, lightning speed, and fine-grained project governance.'}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/register">
              <Button
                type="primary"
                size="large"
                className="!bg-amber-500 hover:!bg-amber-400 !border-amber-500 font-bold px-7 h-11 rounded-lg text-sm !text-slate-950 shadow-md shadow-amber-500/20"
              >
                {isArabic ? 'إنشاء حساب جديد' : 'Create Free Account'}
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="large"
                className="border-slate-300 dark:border-[#1b2336] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-semibold px-6 h-11 rounded-lg text-sm bg-white dark:bg-[#080b11]"
              >
                {isArabic ? 'تسجيل الدخول' : 'Sign In'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. MINIMALIST ARCHITECTURAL FOOTER */}
      <footer className="py-8 px-4 border-t border-slate-200 dark:border-[#1b2336] text-center text-xs text-slate-500 font-mono">
        <div>TaskFlow Engineering Runtime &bull; Project &amp; Sprint Management</div>
      </footer>
    </div>
  );
}
