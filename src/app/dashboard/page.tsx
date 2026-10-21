'use client';

// ============================================================================
// 1. الاستيرادات (Imports)
// بنجيب كل اللي بنحتاجه من ريأكت، نيكست، مكتبة ant design، والأيقونات
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
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
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { Card, Row, Col, Tag, Button, Typography, Progress, Avatar, Tooltip, Input } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DataService } from '@/services/dataStore';
import { Project, DashboardMetrics } from '@/types';
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';
import WorkspaceOnboarding from '@/components/ui/WorkspaceOnboarding';

// بنحمل مودال التيم وقت الحاجة بس (Lazy Load) عشان نخفف حجم الصفحة
const TeamRosterModal = dynamic(() => import('@/components/ui/TeamRosterModal'), { ssr: false });
const { Title, Text, Paragraph } = Typography;

// ============================================================================
// 2. منطقة التعديل السريع (Constants & Styles)
// هان حاططلك كل الإعدادات، مفاتيح الكاش، والستايلات عشان تعدل براحتك وبثواني
// ============================================================================
const CACHE_KEYS = {
  projects: 'taskflow_cached_projects',
  metrics: 'taskflow_cached_metrics',
};

// القيم الافتراضية للعدادات أول ما تفتح الصفحة قبل ما توصل الداتا
const DEFAULT_METRICS: DashboardMetrics = {
  totalProjects: 0,
  totalTasks: 0,
  todoCount: 0,
  inProgressCount: 0,
  doneCount: 0,
  overdueCount: 0,
};

// كلاسات وتنسيقات الستايل بالـ Tailwind - بتعدل الشكل والألوان من هان مباشرة
const STYLES = {
  kpiCardBase:
    'tactile-card border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark relative overflow-hidden !p-0 cursor-default',
  projectCard:
    'tactile-card h-full flex flex-col justify-between border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark relative overflow-hidden transition-all duration-200 hover:border-[#7A5818]/40 dark:hover:border-[#D4B26E]/40',
  headerButton:
    'tactile-btn border-[#DDDAD3] dark:border-[#2C2824] hover:border-[#7A5818] dark:hover:border-[#D4B26E] text-[#1B1915] dark:text-[#EFE9DD] font-semibold text-sm bg-white dark:bg-[#141211]',
};

// ============================================================================
// 3. الأنواع والواجهات (Types & Interfaces)
// واجهات واضحة وخفيفة عشان التايب سكريبت يضل مبسوط وما يرمي أخطاء
// ============================================================================
interface KpiCardItemProps {
  title: string;
  count: number;
  subtitle: React.ReactNode;
  icon: React.ReactNode;
  tooltipText: string;
  isOverdueAttention?: boolean;
}

interface ProjectCardProps {
  project: Project;
  currentUserId?: string;
  isArabic: boolean;
  isRTL: boolean;
  onOpenTeam: (project: Project) => void;
  formatDateLocalized: (date: string) => string;
  t: (key: any) => string;
}

// ============================================================================
// 4. دوال مساعدة (Helper Functions)
// قراءة وتخزين الكاش السريع بجلسة المتصفح عشان نسرع التحميل وما نثقل ع السيرفر
// ============================================================================
function readSessionCache<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeSessionCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // إذا الكاش مسكر أو مليان منتجاهل الخطأ عادي
  }
}

// بنفلتر المشاريع حسب الاسم أو الوصف اللي بيكتبه المستخدم بالبحث
function filterProjectsByQuery(projects: Project[], query: string): Project[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return projects;
  return projects.filter(
    (p) =>
      p.name.toLowerCase().includes(clean) ||
      (p.description && p.description.toLowerCase().includes(clean))
  );
}

// ============================================================================
// 5. المكونات الفرعية (Sub-Components)
// كروت الإحصائيات (KPI) وكرت المشروع الفردي
// ============================================================================

// كرت الـ KPI: هان وزعنا العناصر صح (الأيقونة فوق عاليمين والعنوان ع الشمال)،
// وعطينا الكرت flex و h-full عشان كل الكروت تيجي مسطرة بنفس الارتفاع بالزبط وما في كرت يكبر عن التاني
function KpiMetricCard({
  title,
  count,
  subtitle,
  icon,
  tooltipText,
  isOverdueAttention,
}: KpiCardItemProps) {
  // إذا في مهام متأخرة بنميز الكرت بلون تحذيري عشان ينتبهله المستخدم فورا
  const cardBorderClass = isOverdueAttention
    ? 'border-[#EE8A78]/80 dark:border-[#EE8A78]/40 bg-[#FCE8E5] dark:bg-[#331915]'
    : 'border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211]';

  return (
    <Tooltip title={tooltipText} className="w-full h-full block">
      <Card
        variant="outlined"
        styles={{ body: { height: '100%', padding: 0 } }}
        className={`tactile-card shadow-tactile-card dark:shadow-tactile-card-dark relative overflow-hidden transition-all !p-0 cursor-default h-full w-full flex flex-col justify-between ${cardBorderClass}`}
      >
        <div className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
          {/* السطر العلوي: العنوان والأيقونة المرتبة جنبه */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs uppercase tracking-wider font-semibold truncate ${
                isOverdueAttention
                  ? 'text-[#9C2E1F] dark:text-[#EE8A78]'
                  : 'text-[#736B5E] dark:text-[#9A9183]'
              }`}
            >
              {title}
            </span>
            <div className="shrink-0">{icon}</div>
          </div>

          {/* الجزء السفلي: الرقم العريض والنص التوضيحي ع كامل عرض الكرت */}
          <div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight tnum font-display ${
                isOverdueAttention
                  ? 'text-[#9C2E1F] dark:text-[#EE8A78]'
                  : 'text-[#1B1915] dark:text-[#EFE9DD]'
              }`}
            >
              {count}
            </div>
            <div className="text-xs text-[#5A5348] dark:text-[#B5AC9C] mt-1.5 flex items-center gap-1.5 min-h-[1.25rem] truncate">
              {subtitle}
            </div>
          </div>
        </div>
      </Card>
    </Tooltip>
  );
}

// كرت المشروع الفردي: كرت تفاعلي بعرض اسم المشروع، شارة المالك، عدد الأعضاء، ووصف مختصر وزر لفتح الكانبان
function ProjectCard({
  project,
  currentUserId,
  isArabic,
  isRTL,
  onOpenTeam,
  formatDateLocalized,
  t,
}: ProjectCardProps) {
  const isOwner = project.ownerId === currentUserId;

  return (
    <Card
      hoverable
      variant="outlined"
      className={STYLES.projectCard}
      title={
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold truncate text-base text-[#1B1915] dark:text-[#EFE9DD] font-display">
            {project.name}
          </span>
          <Tooltip
            title={
              isOwner
                ? isArabic
                  ? 'مالك المشروع (صلاحيات كاملة)'
                  : 'Project Owner (Full Access)'
                : isArabic
                ? 'عضو في الفريق'
                : 'Team Member'
            }
          >
            <Tag
              color="default"
              icon={
                isOwner ? (
                  <CrownOutlined className="text-[#7A5818] dark:text-[#D4B26E]" />
                ) : (
                  <UserOutlined />
                )
              }
              className="m-0 text-xs font-semibold border-[#DDDAD3] dark:border-[#2C2824] bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] cursor-default px-2 py-0.5"
            >
              {isOwner ? t('owner') : t('member')}
            </Tag>
          </Tooltip>
        </div>
      }
      extra={
        <Tooltip
          title={
            isArabic
              ? 'عرض تفاصيل أعضاء الفريق وأدوارهم'
              : 'View team roster and member roles'
          }
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTeam(project);
            }}
            className="text-sm text-[#5A5348] dark:text-[#B5AC9C] hover:text-[#7A5818] dark:hover:text-[#D4B26E] flex items-center gap-1 font-mono tnum cursor-pointer transition-colors"
            title={t('teamRoster')}
          >
            <TeamOutlined /> {project.memberIds.length}
          </button>
        </Tooltip>
      }
    >
      <Paragraph
        ellipsis={{ rows: 2 }}
        className="text-sm !text-[#5A5348] dark:!text-[#B5AC9C] min-h-[40px] !mb-3 leading-relaxed"
      >
        {project.description || t('noProjectDescription')}
      </Paragraph>

      {/* صور وأفاتار أعضاء المشروع مع عداد إضافي إذا كان عددهم كبير */}
      <div
        className="flex items-center justify-between pb-3 cursor-pointer group/roster"
        onClick={(e) => {
          e.stopPropagation();
          onOpenTeam(project);
        }}
        title={t('teamRoster')}
      >
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {project.memberIds.slice(0, 5).map((mId) => {
            const info = project.memberDetails?.[mId];
            const name = info?.displayName || mId;
            const isProjectOwner = mId === project.ownerId;
            return (
              <Tooltip
                key={mId}
                title={`${name} (${isProjectOwner ? t('owner') : t('member')})`}
              >
                <Avatar
                  size={24}
                  className={`text-xs border border-white dark:border-[#141211] font-semibold ${
                    isProjectOwner
                      ? 'bg-[#7A5818] dark:bg-[#D4B26E] text-white dark:text-[#1A1408]'
                      : 'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD]'
                  }`}
                >
                  {name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            );
          })}
          {project.memberIds.length > 5 && (
            <Tooltip
              title={
                isArabic
                  ? `${project.memberIds.length - 5} أعضاء إضافيون`
                  : `${project.memberIds.length - 5} more members`
              }
            >
              <span className="text-xs ms-1.5 px-2 py-0.5 rounded font-mono font-semibold text-[#7A5818] dark:text-[#D4B26E] bg-[#7A5818]/10 dark:bg-[#D4B26E]/10 group-hover/roster:bg-[#7A5818]/20 dark:group-hover/roster:bg-[#D4B26E]/20 border border-[#7A5818]/25 dark:border-[#D4B26E]/25 tnum transition-colors">
                +{project.memberIds.length - 5}
              </span>
            </Tooltip>
          )}
        </div>
        <span className="text-xs text-[#5A5348] dark:text-[#B5AC9C] group-hover/roster:text-[#7A5818] dark:group-hover/roster:text-[#D4B26E] font-mono tnum transition-colors">
          {project.memberIds.length}{' '}
          {project.memberIds.length === 1 ? t('memberSingular') : t('membersCount')}
        </span>
      </div>

      {/* تاريخ التحديث وزر فتح لوحة الكانبان مباشرة */}
      <div className="pt-3 border-t border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-between text-xs sm:text-sm">
        <span className="text-[#5A5348] dark:text-[#B5AC9C] text-xs tnum">
          {t('updated')} {formatDateLocalized(project.updatedAt)}
        </span>
        <Link href={`/projects/${project.id}`}>
          <Tooltip
            title={
              isArabic
                ? 'فتح لوحة الكانبان لإدارة وتتبع المهام'
                : 'Open Kanban board to manage tasks'
            }
          >
            <Button
              type="link"
              size="small"
              iconPlacement="end"
              icon={isRTL ? <ArrowLeftOutlined /> : <ArrowRightOutlined />}
              className="!text-[#7A5818] dark:!text-[#D4B26E] font-bold !px-0 hover:underline text-xs sm:text-sm"
            >
              {t('openKanban')}
            </Button>
          </Tooltip>
        </Link>
      </div>
    </Card>
  );
}

// ============================================================================
// 6. المكون الرئيسي (Dashboard Page)
// هون منطق الصفحة كامل: تحميل البيانات، فلاتر البحث، والتقسيم النظيف
// ============================================================================
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, language, formatDateLocalized, isRTL } = useLanguage();
  const isArabic = language === 'ar';

  // بنقرأ المشاريع والإحصائيات من كاش المتصفح أول إشي عشان تفتح الصفحة بلمح البصر
  const [projects, setProjects] = useState<Project[]>(() =>
    readSessionCache<Project[]>(CACHE_KEYS.projects, [])
  );
  const [metrics, setMetrics] = useState<DashboardMetrics>(() =>
    readSessionCache<DashboardMetrics>(CACHE_KEYS.metrics, DEFAULT_METRICS)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamProject, setSelectedTeamProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem(CACHE_KEYS.projects);
    }
    return true;
  });

  // أول ما يدخل المستخدم بنشيك ع تسجيل الدخول وبنجيب الداتا الجديدة من السيرفر
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  // دالة جلب المشاريع والعدادات مع تخزينها بالكاش فورا
  async function loadData() {
    if (!user) return;
    try {
      const [projs, m] = await Promise.all([
        DataService.getAccessibleProjects(user.uid),
        DataService.getDashboardMetrics(user.uid),
      ]);
      setProjects(projs);
      setMetrics(m);
      writeSessionCache(CACHE_KEYS.projects, projs);
      writeSessionCache(CACHE_KEYS.metrics, m);
    } catch (err) {
      console.error('صار خطأ بتحميل بيانات الداشبورد:', err);
    } finally {
      setLoading(false);
    }
  }

  // حساب نسبة الإنجاز والفلترة مباشرة (Derived State) بدون ما نعمل useEffect زيادة يعلق الدنيا
  const completionRate = useMemo(() => {
    if (!metrics.totalTasks) return 0;
    return Math.round((metrics.doneCount / metrics.totalTasks) * 100);
  }, [metrics.totalTasks, metrics.doneCount]);

  const filteredProjects = useMemo(() => {
    return filterProjectsByQuery(projects, searchQuery);
  }, [projects, searchQuery]);

  // شروط الحماية البسيطة (Guard Clauses) - إذا بحمل أو مش مسجل بنعرض الـ Skeleton ع السريع
  if (authLoading && !user) {
    return <DashboardSkeleton />;
  }

  if (loading && projects.length === 0) {
    return <DashboardSkeleton />;
  }

  // إذا ما في مشاريع بالمرة، بنعرضله شاشة البداية عشان يعمل أول مشروع اله
  if (projects.length === 0) {
    return (
      <div className="py-4">
        <WorkspaceOnboarding userName={user?.displayName} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الشريط العلوي: ترحيب بالمستخدم، إيميله، وزر عمل مشروع جديد */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDDAD3] dark:border-[#2C2824]">
        <div>
          <Title
            level={2}
            className="!mb-0 !text-2xl !font-bold tracking-tight text-[#1B1915] dark:text-[#EFE9DD] font-display"
          >
            {t('workspaceOverview')}
          </Title>
          <Text type="secondary" className="text-sm text-[#5A5348] dark:text-[#9A9183]">
            {t('signedInAs')}{' '}
            <strong className="text-[#1B1915] dark:text-[#EFE9DD]">{user?.displayName}</strong>{' '}
            ({user?.email})
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title={t('newProject')}>
            <Link href="/projects/new">
              <Button icon={<PlusOutlined />} size="middle" className={STYLES.headerButton}>
                {t('newProject')}
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* قسم الإحصائيات لمساحة العمل الحالية */}
      <div className="space-y-6">
        {/* كروت الإحصائيات الأربعة (KPI): معطيينها items-stretch وكل عمود flex عشان يطلعوا كلهم نفس الطول مسطرة وما في كرت أطول من التاني */}
        <Row gutter={[16, 16]} className="items-stretch">
          <Col xs={24} sm={12} lg={6} className="flex flex-col">
            <KpiMetricCard
              title={t('activeProjects')}
              count={metrics.totalProjects}
              subtitle={
                <>
                  <span className="w-2 h-2 rounded-full bg-[#1E4D8A] dark:bg-[#8DB4E8] shrink-0" />
                  <span className="truncate">{t('accessibleWorkspaces')}</span>
                </>
              }
              icon={
                <div className="w-8 h-8 rounded-md bg-[#E3EDF8] dark:bg-[#142136] border border-[#8DB4E8]/20 flex items-center justify-center text-[#1E4D8A] dark:text-[#8DB4E8] text-sm shadow-xs">
                  <FolderOutlined />
                </div>
              }
              tooltipText={
                isArabic
                  ? 'المشاريع المتاحة لك بحسب صلاحيات الوصول'
                  : 'Accessible workspace projects for your account'
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6} className="flex flex-col">
            <KpiMetricCard
              title={t('totalTasks')}
              count={metrics.totalTasks}
              subtitle={
                <>
                  <span className="w-2 h-2 rounded-full bg-[#7A5818] dark:bg-[#D4B26E] shrink-0" />
                  <span className="truncate">
                    {metrics.doneCount} {t('completed')} ({completionRate}%)
                  </span>
                </>
              }
              icon={
                <div className="w-8 h-8 rounded-md bg-[#7A5818]/10 dark:bg-[#D4B26E]/15 border border-[#7A5818]/25 dark:border-[#D4B26E]/30 flex items-center justify-center text-[#7A5818] dark:text-[#D4B26E] text-sm shadow-xs">
                  <CheckSquareOutlined />
                </div>
              }
              tooltipText={
                isArabic
                  ? `إجمالي المهام عبر جميع المشاريع (${completionRate}% مكتملة)`
                  : `All tasks across your accessible projects (${completionRate}% done)`
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6} className="flex flex-col">
            <KpiMetricCard
              title={t('inProgress')}
              count={metrics.inProgressCount}
              subtitle={
                <>
                  <span className="w-2 h-2 rounded-full bg-[#1E4D8A] dark:bg-[#8DB4E8] shrink-0" />
                  <span className="truncate">
                    {metrics.todoCount} {t('pendingInQueue')}
                  </span>
                </>
              }
              icon={
                <div className="w-8 h-8 rounded-md bg-[#E3EDF8] dark:bg-[#142136] border border-[#8DB4E8]/20 flex items-center justify-center text-[#1E4D8A] dark:text-[#8DB4E8] text-sm shadow-xs">
                  <SyncOutlined spin={metrics.inProgressCount > 0} />
                </div>
              }
              tooltipText={
                isArabic
                  ? 'المهام التي يتم العمل عليها حالياً'
                  : 'Tasks actively being worked on'
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6} className="flex flex-col">
            <KpiMetricCard
              title={t('overdueTasks')}
              count={metrics.overdueCount}
              isOverdueAttention={metrics.overdueCount > 0}
              subtitle={
                <>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      metrics.overdueCount > 0
                        ? 'bg-[#9C2E1F] dark:bg-[#EE8A78]'
                        : 'bg-[#235832] dark:bg-[#9CC5A1]'
                    }`}
                  />
                  <span className="truncate">
                    {metrics.overdueCount > 0 ? t('requiresAttention') : t('deadlinesOnTrack')}
                  </span>
                </>
              }
              icon={
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-sm shadow-xs ${
                    metrics.overdueCount > 0
                      ? 'bg-[#FCE8E5] border border-[#EE8A78]/30 text-[#9C2E1F] dark:text-[#EE8A78]'
                      : 'bg-[#E1EFE4] dark:bg-[#152618] border border-[#9CC5A1]/20 text-[#235832] dark:text-[#9CC5A1]'
                  }`}
                >
                  {metrics.overdueCount > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
                </div>
              }
              tooltipText={
                metrics.overdueCount > 0
                  ? isArabic
                    ? 'تنبيه: مهام تجاوزت الموعد النهائي المحدد'
                    : 'Attention: tasks overdue past deadline'
                  : isArabic
                  ? 'جميع المواعيد النهائية منتظمة ولا يوجد تأخير'
                  : 'All task deadlines on track'
              }
            />
          </Col>
        </Row>

        {/* القسم الرئيسي: مشاريعك ع الشمال (8 أعمدة)، ولوحة سرعة الإنجاز والمهام ع اليمين (4 أعمدة) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
          {/* الـ 8 أعمدة: قائمة المشاريع والبحث السريع */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DDDAD3] dark:border-[#2C2824]">
              <div className="flex items-center gap-2">
                <Title
                  level={4}
                  className="!mb-0 !text-base !font-bold text-[#1B1915] dark:text-[#EFE9DD] font-display"
                >
                  {t('yourAccessibleProjects')}
                </Title>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-[#5A5348] dark:text-[#B5AC9C] tnum">
                  {projects.length}
                </span>
              </div>
              {projects.length > 0 && (
                <Tooltip
                  title={
                    isArabic
                      ? 'البحث عن طريق اسم المشروع أو الوصف'
                      : 'Filter projects by name or description'
                  }
                >
                  <Input
                    placeholder={t('filterProjects')}
                    prefix={
                      <FilterOutlined className="text-[#5A5348] dark:text-[#B5AC9C] text-xs shrink-0" />
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                    size="middle"
                    className="w-full sm:w-60 text-xs rounded-md border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] text-[#1B1915] dark:text-[#EFE9DD]"
                  />
                </Tooltip>
              )}
            </div>

            {filteredProjects.length === 0 ? (
              <Card
                variant="outlined"
                className="text-center py-12 border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-none"
              >
                <div className="max-w-sm mx-auto space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-center text-[#7A5818] dark:text-[#D4B26E]">
                    <SearchOutlined className="text-lg" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-[#1B1915] dark:text-[#EFE9DD] text-base">
                      {t('noMatchingProjects')}
                    </div>
                    <div className="text-sm text-[#5A5348] dark:text-[#B5AC9C]">
                      {t('adjustSearch')}
                    </div>
                  </div>
                  <Button
                    size="middle"
                    onClick={() => setSearchQuery('')}
                    className="font-semibold border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD] text-sm"
                  >
                    {t('clearFilter')}
                  </Button>
                </div>
              </Card>
            ) : (
              <div
                className={
                  filteredProjects.length === 1
                    ? 'space-y-4'
                    : 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                }
              >
                {filteredProjects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    currentUserId={user?.uid}
                    isArabic={isArabic}
                    isRTL={isRTL}
                    onOpenTeam={setSelectedTeamProject}
                    formatDateLocalized={formatDateLocalized}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>

          {/* الـ 4 أعمدة: كرت سرعة الإنجاز (Sprint Velocity) وتفصيل حالات المهام */}
          <div className="lg:col-span-4 space-y-4">
            {/* كرت سرعة الإنجاز والنسبة المئوية */}
            <Card
              variant="outlined"
              className="tactile-card border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark"
              title={
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1B1915] dark:text-[#EFE9DD] font-display">
                    {t('sprintVelocity')}
                  </span>
                  <span className="font-bold text-sm text-[#7A5818] dark:text-[#D4B26E] font-mono tnum">
                    {completionRate}%
                  </span>
                </div>
              }
            >
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-[#5A5348] dark:text-[#B5AC9C] mb-1.5 font-medium">
                    <span>{t('progress')}</span>
                    <span className="font-mono">
                      {metrics.doneCount} / {metrics.totalTasks} {t('completed')}
                    </span>
                  </div>
                  <Progress
                    percent={completionRate}
                    showInfo={false}
                    strokeColor="#D4B26E"
                    railColor="rgba(44, 40, 36, 0.2)"
                    size={['100%', 7]}
                  />
                </div>

                {/* Task breakdown list */}
                <div className="pt-2 border-t border-[#DDDAD3] dark:border-[#2C2824] space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-2 text-[#5A5348] dark:text-[#B5AC9C]">
                      <span className="w-2 h-2 rounded-full bg-[#736B5E] dark:bg-[#9A9183]" />
                      {t('statusTodo')}
                    </span>
                    <span className="font-bold font-mono text-[#1B1915] dark:text-[#EFE9DD]">
                      {metrics.todoCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-2 text-[#5A5348] dark:text-[#B5AC9C]">
                      <span className="w-2 h-2 rounded-full bg-[#1E4D8A] dark:bg-[#8DB4E8]" />
                      {t('statusInProgress')}
                    </span>
                    <span className="font-bold font-mono text-[#1E4D8A] dark:text-[#8DB4E8]">
                      {metrics.inProgressCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-2 text-[#5A5348] dark:text-[#B5AC9C]">
                      <span className="w-2 h-2 rounded-full bg-[#235832] dark:bg-[#9CC5A1]" />
                      {t('statusDone')}
                    </span>
                    <span className="font-bold font-mono text-[#235832] dark:text-[#9CC5A1]">
                      {metrics.doneCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-2 text-[#5A5348] dark:text-[#B5AC9C]">
                      <span className="w-2 h-2 rounded-full bg-[#9C2E1F] dark:bg-[#EE8A78]" />
                      {t('overdueTasks')}
                    </span>
                    <span
                      className={`font-bold font-mono ${
                        metrics.overdueCount > 0
                          ? 'text-[#9C2E1F] dark:text-[#EE8A78]'
                          : 'text-[#5A5348] dark:text-[#B5AC9C]'
                      }`}
                    >
                      {metrics.overdueCount}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <TeamRosterModal
        open={Boolean(selectedTeamProject)}
        onClose={() => setSelectedTeamProject(null)}
        project={selectedTeamProject}
        currentUserId={user?.uid}
      />
    </div>
  );
}
