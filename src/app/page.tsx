'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Logo from '@/components/ui/Logo';
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
} from '@ant-design/icons';
import { Button, Avatar, Tag } from 'antd';

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
  const [demoTasks, setDemoTasks] = useState<DemoTask[]>([
    {
      id: 'task-1',
      key: 'API-101',
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
      key: 'UI-204',
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
      key: 'SEC-312',
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
      key: 'DAT-405',
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
      prev.map((t) => {
        if (t.id === id) {
          const next =
            t.status === 'todo' ? 'in_progress' : t.status === 'in_progress' ? 'done' : 'todo';
          return { ...t, status: next };
        }
        return t;
      })
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      {/* 1. HERO SECTION - Clean, Authoritative, Zero AI Slop */}
      <section className="pt-12 sm:pt-20 pb-16 px-4 max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Logo size="display" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight mb-5 font-sans">
          {isArabic
            ? 'إدارة المشاريع والمهام الهندسية بدقة ووضوح'
            : 'Engineering project and task management built for velocity'}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
          {isArabic
            ? 'مساحة عمل متكاملة تجمع بين لوحات كانبان التفاعلية، الصلاحيات المحددة، والاستقرار التام لبياناتك محلياً وسحابياً.'
            : 'An intuitive workspace combining interactive Kanban boards, explicit role governance, and dependable local or cloud persistence.'}
        </p>

        {/* Action Pair */}
        <div className="flex items-center justify-center gap-3 mb-16 flex-wrap">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button
                  type="primary"
                  size="large"
                  iconPlacement="end"
                  icon={<ArrowRightOutlined className="rtl:-scale-x-100" />}
                  className="!bg-blue-600 hover:!bg-blue-500 !border-blue-600 font-medium px-6 h-11 rounded-lg text-sm text-white"
                >
                  {isArabic ? 'فتح لوحة التحكم' : 'Open Dashboard'}
                </Button>
              </Link>
              <Link href="/projects/new">
                <Button
                  size="large"
                  icon={<PlusOutlined />}
                  className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium px-6 h-11 rounded-lg text-sm bg-white dark:bg-[#111827]"
                >
                  {isArabic ? 'إنشاء مشروع' : 'New Project'}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button
                  type="primary"
                  size="large"
                  className="!bg-slate-900 hover:!bg-slate-800 dark:!bg-white dark:!text-slate-950 dark:hover:!bg-slate-100 !border-0 font-medium px-6 h-11 rounded-lg text-sm text-white"
                >
                  {isArabic ? 'إنشاء حساب جديد' : 'Create Free Account'}
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="large"
                  className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium px-6 h-11 rounded-lg text-sm bg-white dark:bg-[#111827]"
                >
                  {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* 2. THE PRODUCT CANVAS (Realistic Interactive Preview) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden text-start">
          {/* Authentic Application Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#162032]/60 gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">TaskFlow</span>
              <span className="text-slate-400 text-xs font-light">/</span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {isArabic ? 'سبرنت المنظومة الأساسية' : 'Core Platform Sprint'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                {isArabic ? 'نشط' : 'Active'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* View Switcher: Board vs Table */}
              <div className="inline-flex p-0.5 rounded-lg bg-slate-200/80 dark:bg-[#1f293d] border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('board')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === 'board'
                      ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <AppstoreOutlined className="me-1" />
                  {isArabic ? 'لوحة كانبان' : 'Board'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <UnorderedListOutlined className="me-1" />
                  {isArabic ? 'عرض الجدول' : 'Table'}
                </button>
              </div>

              {/* Team Avatars */}
              <div className="hidden sm:flex items-center -space-x-1.5 rtl:space-x-reverse ps-2 border-s border-slate-200 dark:border-slate-700">
                <Avatar size={22} className="bg-blue-600 text-[10px] text-white">س</Avatar>
                <Avatar size={22} className="bg-indigo-600 text-[10px] text-white">أ</Avatar>
                <Avatar size={22} className="bg-slate-700 text-[10px] text-white">م</Avatar>
                <span className="text-[10px] font-mono text-slate-500 ps-2 tnum">+2</span>
              </div>
            </div>
          </div>

          {/* Interactive Work Area */}
          <div className="p-4 sm:p-5">
            {viewMode === 'board' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['todo', 'in_progress', 'done'] as const).map((laneKey) => {
                  const title =
                    laneKey === 'todo'
                      ? isArabic ? 'قيد الانتظار' : 'To Do'
                      : laneKey === 'in_progress'
                      ? isArabic ? 'قيد التنفيذ' : 'In Progress'
                      : isArabic ? 'مكتملة' : 'Completed';
                  const laneTasks = demoTasks.filter((t) => t.status === laneKey);
                  const accentColor =
                    laneKey === 'todo' ? 'bg-slate-400' : laneKey === 'in_progress' ? 'bg-amber-500' : 'bg-emerald-500';

                  return (
                    <div
                      key={laneKey}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0b0f19] p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${accentColor}`} />
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            {title}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-slate-200/80 dark:bg-[#162032] text-slate-700 dark:text-slate-300 tnum">
                          {laneTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 min-h-[140px]">
                        {laneTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => cycleTaskStatus(t.id)}
                            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-lg p-3 space-y-2 shadow-xs hover:border-blue-400/60 cursor-pointer transition-all"
                            title={isArabic ? 'انقر لتغيير حالة المهمة' : 'Click to cycle status'}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                                {t.key}
                              </span>
                              <span
                                className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                                  t.priority === 'high'
                                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {t.priority === 'high' ? (isArabic ? 'عالية' : 'High') : (isArabic ? 'عادية' : 'Normal')}
                              </span>
                            </div>

                            <p
                              className={`text-xs font-medium leading-snug line-clamp-2 ${
                                t.status === 'done'
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {isArabic ? t.titleAr : t.titleEn}
                            </p>

                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-500">
                              <span className="flex items-center gap-1 font-mono">
                                <CalendarOutlined />
                                {isArabic ? t.dueDateAr : t.dueDateEn}
                              </span>
                              <div className="flex items-center gap-1">
                                <Avatar size={16} className="bg-slate-700 text-[8px] text-white">
                                  {t.assignee.initial}
                                </Avatar>
                                <span className="truncate max-w-[80px]">{t.assignee.name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold text-[11px]">
                      <th className="py-2.5 px-3 text-start">{isArabic ? 'المعرف' : 'Key'}</th>
                      <th className="py-2.5 px-3 text-start">{isArabic ? 'عنوان المهمة' : 'Title'}</th>
                      <th className="py-2.5 px-3 text-start">{isArabic ? 'الحالة' : 'Status'}</th>
                      <th className="py-2.5 px-3 text-start">{isArabic ? 'الأولوية' : 'Priority'}</th>
                      <th className="py-2.5 px-3 text-start">{isArabic ? 'المسؤول' : 'Assignee'}</th>
                      <th className="py-2.5 px-3 text-start">{isArabic ? 'الموعد' : 'Due Date'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {demoTasks.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => cycleTaskStatus(t.id)}
                        className="hover:bg-slate-50 dark:hover:bg-[#162032] cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-500">
                          {t.key}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                          {isArabic ? t.titleAr : t.titleEn}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              t.status === 'done'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : t.status === 'in_progress'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                t.status === 'done'
                                  ? 'bg-emerald-500'
                                  : t.status === 'in_progress'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {t.status === 'done'
                              ? isArabic ? 'مكتملة' : 'Done'
                              : t.status === 'in_progress'
                              ? isArabic ? 'قيد التنفيذ' : 'In Progress'
                              : isArabic ? 'قيد الانتظار' : 'To Do'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-semibold ${
                              t.priority === 'high' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                            }`}
                          >
                            {t.priority === 'high' ? (isArabic ? 'عالية' : 'High') : (isArabic ? 'عادية' : 'Normal')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {t.assignee.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          {isArabic ? t.dueDateAr : t.dueDateEn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-3 text-center">
              <span className="text-[11px] text-slate-400">
                {isArabic
                  ? 'انقر على أي مهمة في النموذج أعلاه لتغيير حالتها وملاحظة التفاعل المباشر'
                  : 'Click any task above to cycle status across lanes'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE CAPABILITIES (Asymmetric Bento Architecture, Zero AI Slop) */}
      <section className="py-16 px-4 max-w-5xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-2">
            <ThunderboltOutlined />
            <span>{isArabic ? 'القدرات الهندسية الأساسية' : 'Core Architecture'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isArabic ? 'بنية تشغيلية مصممة لفرق البرمجة عالية الإنتاجية' : 'Engineered for high-throughput development teams'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {isArabic
              ? 'تخلص من التعقيد الزائد والقوالب الجاهزة مع واجهات حقيقية صممت للدقة، الأمان، وسرعة الاستجابة.'
              : 'Eliminate unnecessary bloat and synthetic templates with interfaces crafted for speed, data density, and security.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bento Item 1: Wide (2 cols) - Interactive Kanban Pipeline */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#111827] p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-semibold">
                    <AppstoreOutlined />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isArabic ? 'محرك مسارات كانبان التفاعلي' : 'Interactive Kanban Lifecycle'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tnum">
                  99.8% SLA
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {isArabic
                  ? 'سحب وإفلات فوري، تبويبات استجابة ذكية لشاشات الهواتف (<768px)، ومزامنة حالة المهام دون وميض أو تأخير في العرض.'
                  : 'Zero-latency drag-and-drop orchestration, viewport-adaptive mobile segmented tabs, and optimistic status reconciliation.'}
              </p>
            </div>

            {/* Visual Mini Pipeline Artifact */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1e2430]">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#162032] border border-slate-200/80 dark:border-[#1f293d] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{isArabic ? 'الانتظار' : 'TODO'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                    {isArabic ? 'مراجعة معمارية' : 'Code audit'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/[0.04] dark:bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-amber-600 dark:text-amber-400">
                    <span>{isArabic ? 'قيد التنفيذ' : 'IN PROG'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                    {isArabic ? 'تكامل الواجهات' : 'REST API hook'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/[0.04] dark:bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    <span>{isArabic ? 'مكتملة' : 'DONE'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                    {isArabic ? 'فحص الأمان' : 'Auth rate limit'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Compact (1 col) - RBAC Role Governance */}
          <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#111827] p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-semibold">
                  <SafetyCertificateOutlined />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isArabic ? 'حوكمة الصلاحيات (RBAC)' : 'Multi-Tenant RBAC'}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {isArabic
                  ? 'عزل صارم للعمليات الحساسة مع حماية تأكيد الحذف ومنع التعديلات العشوائية.'
                  : 'Fine-grained permission boundaries guarding destructive operations with confirmation gates.'}
              </p>
            </div>

            {/* Matrix of capabilities */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1e2430] space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#1e2430]">
                <span className="text-slate-500">{isArabic ? 'حذف المشروع' : 'Delete Project'}</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{isArabic ? 'المالك فقط' : 'Owner Only'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#1e2430]">
                <span className="text-slate-500">{isArabic ? 'دعوة أعضاء' : 'Invite Members'}</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{isArabic ? 'المالك فقط' : 'Owner Only'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">{isArabic ? 'تنفيذ المهام' : 'Execute Tasks'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isArabic ? 'الجميع' : 'All Roles'}</span>
              </div>
            </div>
          </div>

          {/* Bento Item 3: Full Width (3 cols) - Dual Environment & Telemetry */}
          <div className="lg:col-span-3 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#111827] p-6 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-semibold">
                  <DatabaseOutlined />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isArabic ? 'بنية تشغيلية مزدوجة مع محدد طلبات ذكي' : 'Dual Environment Engine & Hardened Security'}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    SQLite WAL Journal &bull; RFC 9457 &bull; Multi-tier Limiter (Cookie/IP)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono bg-slate-100 dark:bg-[#162032] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1f293d] tnum">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Local :5001 &bull; Cloud Auto-Failover
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-[#1e2430] text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/70 dark:border-[#1f293d]">
                <span className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">
                  {isArabic ? 'عزل البيانات المحلي' : 'Local Persistence'}
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {isArabic ? 'قاعدة بيانات SQLite محلية دون حاجة لاتصال خارجي' : 'Zero-dependency local SQLite file with foreign keys'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/70 dark:border-[#1f293d]">
                <span className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">
                  {isArabic ? 'محدد طلبات متعدد الطبقات' : 'Multi-tier Limiting'}
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {isArabic ? 'حظر ملف تعريف الارتباط أولاً ثم تصعيد الحظر للـ IP' : 'Tier 1 Cookie block (5m) escalating to Tier 2 IP block (30m)'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/70 dark:border-[#1f293d]">
                <span className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">
                  {isArabic ? 'استجابات معيارية RFC 9457' : 'Standard Errors'}
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {isArabic ? 'أخطاء معيارية بدون تسريب لمسارات النظام أو الشيفرة' : 'Strict schema contracts with zero internal trace leaks'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. UNDERSTATED CALL TO ACTION */}
      <section className="py-16 px-4 max-w-3xl mx-auto text-center border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
          {isArabic ? 'جاهز لتنظيم مهام فريقك؟' : 'Ready to organize your team workflow?'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
          {isArabic
            ? 'ابدأ مساحة عملك في ثوانٍ مع كامل التحكم والخصوصية.'
            : 'Initialize your workspace in seconds with complete data control.'}
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link href="/register">
            <Button
              type="primary"
              size="middle"
              className="!bg-blue-600 hover:!bg-blue-500 !border-blue-600 font-medium px-5 h-10 rounded-lg text-xs text-white"
            >
              {isArabic ? 'إنشاء حساب جديد' : 'Create Free Account'}
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="middle"
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium px-5 h-10 rounded-lg text-xs bg-white dark:bg-[#111827]"
            >
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </Button>
          </Link>
        </div>
      </section>

      {/* 5. MINIMALIST FOOTER */}
      <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 font-mono">
        <div>TaskFlow Enterprise &bull; Project &amp; Task Management System</div>
      </footer>
    </div>
  );
}
