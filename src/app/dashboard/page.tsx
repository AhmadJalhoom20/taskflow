'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DataService } from '@/services/dataStore';
import { Project, DashboardMetrics } from '@/types';
import Link from 'next/link';
import {
  FolderOutlined,
  CheckSquareOutlined,
  SyncOutlined,
  WarningOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  CrownOutlined,
  UserOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CompassOutlined,
  BugOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Card, Row, Col, Statistic, Tag, Button, Empty, Spin, Typography, Progress, Avatar, Tooltip, Input } from 'antd';
import TeamRosterModal from '@/components/ui/TeamRosterModal';
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';

const { Title, Text, Paragraph } = Typography;

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, language, formatDateLocalized, isRTL } = useLanguage();

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamProject, setSelectedTeamProject] = useState<Project | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0,
    totalTasks: 0,
    todoCount: 0,
    inProgressCount: 0,
    doneCount: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const projs = await DataService.getAccessibleProjects(user.uid);
      setProjects(projs);

      const m = await DataService.getDashboardMetrics(user.uid);
      setMetrics(m);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  const completionRate =
    metrics.totalTasks > 0 ? Math.round((metrics.doneCount / metrics.totalTasks) * 100) : 0;

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1e2430]">
        <div>
          <div className="flex items-center gap-2">
            <Title level={2} className="!mb-0 !text-xl !font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {t('workspaceOverview')}
            </Title>
          </div>
          <Text type="secondary" className="text-xs">
            {t('signedInAs')} <strong className="text-slate-700 dark:text-slate-300">{user?.displayName}</strong> ({user?.email})
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/projects/new">
            <Button type="primary" icon={<PlusOutlined />} size="middle" className="!bg-blue-600 !border-blue-600">
              {t('newProject')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Conditionally Render: Onboarding Launchpad (0 projects) vs Production Analytics (1+ projects) */}
      {projects.length === 0 ? (
        <div className="space-y-6">
          {/* Welcome Hero Canvas */}
          <div className="relative rounded-2xl border border-slate-200 dark:border-[#1e2430] bg-gradient-to-b from-slate-50 to-white dark:from-[#111622] dark:to-[#0d1017] p-6 sm:p-8 overflow-hidden">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {t('welcomeTitle')}, {user?.displayName || 'Engineer'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {t('welcomeSubtitle')}
              </p>
            </div>
          </div>

          {/* 3 Interactive Quick-Start Templates */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('selectStarterTemplate')}
              </span>
              <Link href="/projects/new" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                {t('orBuildFromScratch')} &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Template 1: Engineering Sprint */}
              <Card
                variant="outlined"
                className="taskflow-card-hover border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-none flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <AppstoreOutlined className="text-lg" />
                    </div>
                    <Tag color="blue" className="m-0 text-[10px] font-semibold uppercase tracking-wider">
                      Recommended
                    </Tag>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {t('engineeringSprint')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t('sprintDesc')}
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{t('sprintFeat1')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{t('sprintFeat2')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{t('sprintFeat3')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-[#1e2430]">
                  <Link href="/projects/new?template=sprint">
                    <Button type="primary" block className="!bg-blue-600 !border-blue-600 font-medium">
                      {t('useSprintTemplate')}
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Template 2: Product & UX Roadmap */}
              <Card
                variant="outlined"
                className="taskflow-card-hover border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-none flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <CompassOutlined className="text-lg" />
                    </div>
                    <Tag color="purple" className="m-0 text-[10px] font-semibold uppercase tracking-wider">
                      Discovery &amp; Specs
                    </Tag>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {t('productRoadmap')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t('roadmapDesc')}
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>{t('roadmapFeat1')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>{t('roadmapFeat2')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>{t('roadmapFeat3')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-[#1e2430]">
                  <Link href="/projects/new?template=roadmap">
                    <Button block className="border-slate-300 dark:border-[#222938] font-medium hover:!border-purple-500 hover:!text-purple-600">
                      {t('useRoadmapTemplate')}
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Template 3: Architecture & Bug Triage */}
              <Card
                variant="outlined"
                className="taskflow-card-hover border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-none flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <BugOutlined className="text-lg" />
                    </div>
                    <Tag color="green" className="m-0 text-[10px] font-semibold uppercase tracking-wider">
                      Reliability &amp; Ops
                    </Tag>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {t('architectureTriage')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t('triageDesc')}
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{t('triageFeat1')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{t('triageFeat2')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{t('triageFeat3')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-[#1e2430]">
                  <Link href="/projects/new?template=triage">
                    <Button block className="border-slate-300 dark:border-[#222938] font-medium hover:!border-emerald-500 hover:!text-emerald-600">
                      {t('useTriageTemplate')}
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Architecture Guarantee Callout */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <DatabaseOutlined />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('pureRelationalArchitecture')}
                </span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px]">
                  {t('zeroVendorLockin')}
                </p>
              </div>
            </div>
            <Link href="/projects/new">
              <Button size="small" icon={<PlusOutlined />} className="border-slate-300 dark:border-[#222938] whitespace-nowrap">
                {t('initCustomProject')}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Analytics & Active Workspaces for 1+ Projects */
        <div className="space-y-6">
          {/* 4-KPI Metric Cards - Cyber Sapphire & Obsidian Architecture */}
          <Row gutter={[16, 16]}>
            {/* Active Projects */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                variant="outlined"
                className="taskflow-card-hover border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#111827] shadow-card-elevation dark:shadow-card-elevation-dark relative overflow-hidden !p-0"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        {t('activeProjects')}
                      </span>
                      <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5 tnum font-sans">
                        {metrics.totalProjects}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{t('accessibleWorkspaces')}</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 text-base shadow-xs">
                      <FolderOutlined />
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Total Tasks */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                variant="outlined"
                className="taskflow-card-hover border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#111827] shadow-card-elevation dark:shadow-card-elevation-dark relative overflow-hidden !p-0"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        {t('totalTasks')}
                      </span>
                      <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5 tnum font-sans">
                        {metrics.totalTasks}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>{metrics.doneCount} {t('completed')} ({completionRate}%)</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-base shadow-xs">
                      <CheckSquareOutlined />
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* In Progress */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                variant="outlined"
                className="taskflow-card-hover border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#111827] shadow-card-elevation dark:shadow-card-elevation-dark relative overflow-hidden !p-0"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        {t('inProgress')}
                      </span>
                      <div className="text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 mt-1.5 tnum font-sans">
                        {metrics.inProgressCount}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>{metrics.todoCount} {t('pendingInQueue')}</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 text-base shadow-xs">
                      <SyncOutlined spin={metrics.inProgressCount > 0} />
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Overdue Tasks */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                variant="outlined"
                className={`taskflow-card-hover shadow-card-elevation dark:shadow-card-elevation-dark relative overflow-hidden transition-all !p-0 ${
                  metrics.overdueCount > 0
                    ? 'border-rose-400/80 dark:border-rose-800/60 bg-rose-50/30 dark:bg-rose-950/20'
                    : 'border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#111827]'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[11px] uppercase tracking-wider font-semibold ${
                          metrics.overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {t('overdueTasks')}
                      </span>
                      <div
                        className={`text-3xl font-extrabold tracking-tight mt-1.5 tnum font-sans ${
                          metrics.overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {metrics.overdueCount}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            metrics.overdueCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span>{metrics.overdueCount > 0 ? t('requiresAttention') : t('deadlinesOnTrack')}</span>
                      </div>
                    </div>
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-base shadow-xs ${
                        metrics.overdueCount > 0
                          ? 'bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {metrics.overdueCount > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Sprint Velocity Metric */}
          {metrics.totalTasks > 0 && (
            <Card
              variant="outlined"
              className="border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-none"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 w-full md:w-auto">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {t('sprintVelocity')}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {metrics.doneCount} of {metrics.totalTasks} {t('velocitySubtext')}
                  </div>
                </div>
                <div className="w-full md:w-64 space-y-1">
                  <div className="flex justify-between text-xs font-semibold tnum">
                    <span className="text-slate-500">{t('progress')}</span>
                    <span className="text-blue-600 dark:text-blue-400">{completionRate}%</span>
                  </div>
                  <Progress
                    percent={completionRate}
                    showInfo={false}
                    strokeColor="#2563eb"
                    railColor="rgba(100, 116, 139, 0.2)"
                    size={['100%', 6]}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Projects Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Title level={4} className="!mb-0 !text-base !font-bold text-slate-900 dark:text-slate-100">
                    {t('yourAccessibleProjects')}
                  </Title>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#171c26] border border-slate-200/80 dark:border-[#1e2430] text-slate-500 dark:text-slate-400 tnum">
                    {projects.length}
                  </span>
                </div>
                <Text type="secondary" className="text-xs">
                  {t('projectsSubtitle')}
                </Text>
              </div>
              <div className="flex items-center gap-2.5">
                {projects.length > 0 && (
                  <Input
                    placeholder={t('filterProjects')}
                    prefix={<FilterOutlined className="text-slate-400 text-xs shrink-0" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                    size="small"
                    className="w-52 text-xs rounded-md"
                  />
                )}
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <Card variant="outlined" className="text-center py-12 border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-none">
                <div className="max-w-sm mx-auto space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-slate-100 dark:bg-[#161c26] flex items-center justify-center text-slate-400">
                    <SearchOutlined />
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                      {t('noMatchingProjects')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {t('adjustSearch')}
                    </div>
                  </div>
                  <Button size="small" onClick={() => setSearchQuery('')}>
                    {t('clearFilter')}
                  </Button>
                </div>
              </Card>
            ) : (
              <Row gutter={[16, 16]}>
                {filteredProjects.map((proj) => {
                  const isOwner = proj.ownerId === user?.uid;
                  return (
                    <Col xs={24} md={12} lg={8} key={proj.id}>
                      <Card
                        hoverable
                        variant="outlined"
                        className="taskflow-card-hover h-full flex flex-col justify-between border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#111827] shadow-card-elevation dark:shadow-card-elevation-dark relative overflow-hidden"
                        title={
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold truncate text-sm text-slate-900 dark:text-white">
                              {proj.name}
                            </span>
                            <Tag
                              color="default"
                              icon={isOwner ? <CrownOutlined className="text-amber-500" /> : <UserOutlined />}
                              className="m-0 text-[11px] border-slate-200/80 dark:border-[#1f293d] bg-slate-50 dark:bg-[#162032] text-slate-700 dark:text-slate-200"
                            >
                              {isOwner ? t('owner') : t('member')}
                            </Tag>
                          </div>
                        }
                        extra={
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTeamProject(proj);
                            }}
                            className="text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-mono tnum cursor-pointer transition-colors"
                            title={t('teamRoster')}
                          >
                            <TeamOutlined /> {proj.memberIds.length}
                          </button>
                        }
                      >
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px] !mb-3 leading-relaxed"
                        >
                          {proj.description || t('noProjectDescription')}
                        </Paragraph>

                        {/* Member Avatars Stack - Clickable to open full roster modal */}
                        <div
                          className="flex items-center justify-between pb-3 cursor-pointer group/roster"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTeamProject(proj);
                          }}
                          title={t('teamRoster')}
                        >
                          <div className="flex items-center -space-x-1.5 overflow-hidden">
                            {proj.memberIds.slice(0, 5).map((mId) => {
                              const info = proj.memberDetails?.[mId];
                              const name = info?.displayName || mId;
                              const isProjectOwner = mId === proj.ownerId;
                              return (
                                <Tooltip key={mId} title={`${name} (${isProjectOwner ? t('owner') : t('member')})`}>
                                  <Avatar
                                    size={22}
                                    className={`text-[10px] border-2 border-white dark:border-[#111827] font-semibold ${
                                      isProjectOwner ? 'bg-amber-600 text-white' : 'bg-slate-700 text-white'
                                    }`}
                                  >
                                    {name.charAt(0).toUpperCase()}
                                  </Avatar>
                                </Tooltip>
                              );
                            })}
                            {proj.memberIds.length > 5 && (
                              <span className="text-[10px] ml-1.5 px-1.5 py-0.2 rounded font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 group-hover/roster:bg-blue-500/20 border border-blue-500/20 tnum transition-colors">
                                +{proj.memberIds.length - 5}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 group-hover/roster:text-blue-600 dark:group-hover/roster:text-blue-400 font-mono tnum transition-colors">
                            {proj.memberIds.length} {proj.memberIds.length === 1 ? t('memberSingular') : t('membersCount')}
                          </span>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-[#1e2430] flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px] tnum">
                            {t('updated')} {formatDateLocalized(proj.updatedAt)}
                          </span>
                          <Link href={`/projects/${proj.id}`}>
                            <Button
                              type="link"
                              size="small"
                              iconPlacement="end"
                              icon={isRTL ? <ArrowLeftOutlined /> : <ArrowRightOutlined />}
                              className="!text-blue-600 dark:!text-blue-400 font-medium !px-0 hover:underline"
                            >
                              {t('openKanban')}
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </div>
        </div>
      )}

      <TeamRosterModal
        open={Boolean(selectedTeamProject)}
        onClose={() => setSelectedTeamProject(null)}
        project={selectedTeamProject}
        currentUserId={user?.uid}
      />
    </div>
  );
}
