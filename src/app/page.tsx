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

      {/* 3. CORE CAPABILITIES (3 Distinct Features, Zero Marketing Clichés) */}
      <section className="py-16 px-4 max-w-5xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
              <AppstoreOutlined />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isArabic ? 'لوحات كانبان تفاعلية' : 'Interactive Kanban Workflows'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              {isArabic
                ? 'تنظيم المهام وسحبها بين أعمدة الإنجاز، مع تتبع دقيق للأولويات وتاريخ الاستحقاق وتبويبات مخصصة للهواتف الذكية.'
                : 'Drag-and-drop task progression with clear priority indicators, due dates, and dedicated mobile viewports.'}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
              <TeamOutlined />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isArabic ? 'حوكمة وصلاحيات واضحة' : 'Team Role Governance'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              {isArabic
                ? 'فصل الصلاحيات بين مالك المشروع وأعضاء الفريق، مع حماية العمليات الحساسة وإعدادات الفريق من التعديل العشوائي.'
                : 'Clear permission boundaries between project owners and collaborators, safeguarding critical settings and records.'}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
              <DatabaseOutlined />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isArabic ? 'تشغيل مزدوج واستقرار دائم' : 'Dual Environment Reliability'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              {isArabic
                ? 'دعم التشغيل المحلي والسحابي مع عزل تام لرموز المصادقة، ومحدد طلبات ذكي يحمي المنصة من الاستخدام المكثف.'
                : 'Simultaneous support for local and cloud environments, scoped authentication tokens, and intelligent rate limiting.'}
            </p>
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
