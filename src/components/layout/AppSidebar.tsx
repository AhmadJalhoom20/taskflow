'use client';

// ============================================================================
// 1. الاستيرادات (Imports)
// بنجيب الأيقونات وأزرار Ant Design والمساعدات من الـ Context
// ============================================================================
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  CrownOutlined,
  SearchOutlined,
  SettingOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  AppstoreOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { Button, Tooltip, Dropdown, MenuProps } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Project } from '@/types';
import { DataService } from '@/services/dataStore';

// ============================================================================
// 2. منطقة التعديل السريع (Constants & Styles)
// ستايلات السايد بار موحدة مع أرضية الكانفاس بدون أي تباين مصطنع أو فريم منفصل
// ============================================================================
const CACHE_KEY = 'taskflow_cached_projects';

const STYLES = {
  // السايد بار مثبت h-full ومبني مباشرة على نفس لون الكانفاس var(--bg) مع خط فاصل نحيف
  sidebarBase:
    'relative flex flex-col shrink-0 border-e border-[var(--line)] bg-[var(--bg)] transition-all duration-200 select-none z-30 h-full',
  primaryNewProjectBtn:
    'tactile-btn !bg-[var(--accent)] hover:!bg-[var(--accent-hover)] !border-transparent !text-[var(--on-accent)] font-bold text-sm shadow-xs',
  navLinkActive:
    'bg-[var(--accent-subtle)] text-[var(--accent)] font-bold border border-[var(--accent)]/20',
  navLinkInactive:
    'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] font-medium',
  kbdBadge:
    'text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--line)]',
};

// ============================================================================
// 3. الأنواع والواجهات (Types & Interfaces)
// ============================================================================
export interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCommandPalette?: () => void;
}

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  isOwner: boolean;
  collapsed: boolean;
  isRTL: boolean;
}

// ============================================================================
// 4. دوال مساعدة (Helper Functions)
// ============================================================================
// بنجيب قائمة المشاريع من الكاش أول إشي عشان ما يضل السايد بار فاضي وهو بحمل
function readCachedProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ============================================================================
// 5. المكونات الفرعية (Sub-Components)
// عنصر المشروع بالسايد بار: رابط مختصر لفتح المشروع، وإذا مطوي بنعرض تلميح بالاسم
// ============================================================================
function SidebarProjectItem({
  project,
  isActive,
  isOwner,
  collapsed,
  isRTL,
}: ProjectItemProps) {
  return (
    <Tooltip
      title={collapsed ? project.name : undefined}
      placement={isRTL ? 'left' : 'right'}
    >
      <Link
        href={`/projects/${project.id}`}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-all group ${
          isActive ? STYLES.navLinkActive : STYLES.navLinkInactive
        } ${collapsed ? 'justify-center !px-0' : ''}`}
      >
        <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
        {!collapsed && (
          <div className="flex items-center justify-between flex-1 truncate">
            <span className="truncate text-xs sm:text-sm">{project.name}</span>
            {isOwner ? (
              <CrownOutlined className="text-[11px] text-[var(--accent)] shrink-0 opacity-80 group-hover:opacity-100" />
            ) : (
              <span className="text-[10px] font-mono text-[var(--text-3)] shrink-0">
                {project.memberIds.length}
              </span>
            )}
          </div>
        )}
      </Link>
    </Tooltip>
  );
}

// ============================================================================
// 6. المكون الرئيسي (AppSidebar)
// السايد بار كامل: رأس مساحة العمل، زر مشروع جديد، رابط الداشبورد، وقائمة المشاريع
// ============================================================================
export default function AppSidebar({
  collapsed,
  onToggleCollapse,
  onOpenCommandPalette,
}: AppSidebarProps) {
  const { user } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const pathname = usePathname();
  const isArabic = language === 'ar';

  const [projects, setProjects] = useState<Project[]>(readCachedProjects);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('taskflow_filter_project_id') || 'all';
      setSelectedProjectId(saved);

      const handleStorageChange = (e: CustomEvent<{ projectId: string }>) => {
        if (e.detail?.projectId !== undefined) {
          setSelectedProjectId(e.detail.projectId);
        }
      };
      window.addEventListener('taskflow_project_filter_change' as any, handleStorageChange);
      return () => {
        window.removeEventListener('taskflow_project_filter_change' as any, handleStorageChange);
      };
    }
  }, []);

  const handleSelectProjectFilter = (projId: string) => {
    setSelectedProjectId(projId);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('taskflow_filter_project_id', projId);
      window.dispatchEvent(
        new CustomEvent('taskflow_project_filter_change', {
          detail: { projectId: projId },
        })
      );
    }
  };

  const selectedProjectObj = projects.find((p) => p.id === selectedProjectId);
  const activeLabel =
    selectedProjectId === 'all'
      ? (isArabic ? 'جميع المشاريع' : 'All Projects')
      : (selectedProjectObj?.name || 'Engineering Core');

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    async function fetchSidebarProjects() {
      try {
        setLoading(true);
        const data = await DataService.getAccessibleProjects(user!.uid);
        if (isMounted) {
          setProjects(data);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
          }
        }
      } catch {
        // بنحافظ على الكاش في حال صار أي بطء بالشبكة
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSidebarProjects();

    return () => {
      isMounted = false;
    };
  }, [user, pathname]);

  // حارس أمان في حال المستخدم مش مسجل دخول
  if (!user) return null;

  const isOwner = user.role === 'owner';

  return (
    <aside
      className={`${STYLES.sidebarBase} ${collapsed ? 'w-16' : 'w-64'}`}
      aria-label={isArabic ? 'الشريط الجانبي' : 'Sidebar Navigation'}
    >
      {/* رأس مساحة العمل والمعلومات */}
      <div
        className={`p-2.5 border-b border-[var(--line)] bg-[var(--bg)] flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed ? (
          <div className="flex-1 me-1">
            <Dropdown
              trigger={['click']}
              placement="bottomLeft"
              menu={{
                items: [
                  {
                    key: 'all',
                    label: (
                      <div className="flex items-center justify-between gap-3 py-1 font-sans">
                        <div className="flex items-center gap-2">
                          <AppstoreOutlined className="text-sm text-[var(--accent)]" />
                          <span className="font-semibold text-xs text-[#1B1915] dark:text-[#EFE9DD]">
                            {isArabic ? 'جميع المشاريع' : 'All Projects'}
                          </span>
                        </div>
                        {selectedProjectId === 'all' && (
                          <CheckOutlined className="text-xs text-[var(--accent)]" />
                        )}
                      </div>
                    ),
                    onClick: () => handleSelectProjectFilter('all'),
                  },
                  {
                    type: 'divider',
                  },
                  ...projects.map((proj) => ({
                    key: proj.id,
                    label: (
                      <div className="flex items-center justify-between gap-3 py-1 font-sans min-w-[180px]">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                          <span className="truncate text-xs text-[#1B1915] dark:text-[#EFE9DD]">
                            {proj.name}
                          </span>
                        </div>
                        {selectedProjectId === proj.id && (
                          <CheckOutlined className="text-xs text-[var(--accent)] shrink-0" />
                        )}
                      </div>
                    ),
                    onClick: () => handleSelectProjectFilter(proj.id),
                  })),
                ],
              }}
            >
              <div
                role="button"
                tabIndex={0}
                className="flex items-center justify-between p-2 rounded-lg border border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] hover:border-[#7A5818]/40 dark:hover:border-[#D4B26E]/40 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#1B1915] dark:text-[#EFE9DD] truncate leading-tight font-display">
                      {activeLabel}
                    </div>
                    <div className="text-[10px] font-mono text-[#5A5348] dark:text-[#9A9183] leading-none mt-0.5">
                      {selectedProjectId === 'all'
                        ? `${projects.length} ${isArabic ? 'مشاريع' : 'projects'}`
                        : 'v2.4 / active'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col text-[8px] text-[#5A5348] dark:text-[#9A9183] shrink-0 opacity-70 group-hover:opacity-100">
                  <CaretUpOutlined className="leading-none" />
                  <CaretDownOutlined className="leading-none -mt-1" />
                </div>
              </div>
            </Dropdown>
          </div>
        ) : (
          <Tooltip
            title={user.displayName ? `${user.displayName}'s Workspace` : 'Workspace'}
            placement={isRTL ? 'left' : 'right'}
          >
            <div className="relative w-8 h-8 rounded-lg bg-[var(--accent)] text-[var(--on-accent)] font-bold flex items-center justify-center text-sm shadow-xs cursor-pointer">
              TF
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[var(--bg)]" />
            </div>
          </Tooltip>
        )}

        {/* زر طي السايد بار بالرأس عند عدم الطي */}
        {!collapsed && (
          <Tooltip title={isArabic ? 'تصغير الشريط الجانبي' : 'Collapse Sidebar'}>
            <Button
              type="text"
              size="small"
              onClick={onToggleCollapse}
              icon={isRTL ? <RightOutlined className="text-xs" /> : <LeftOutlined className="text-xs" />}
              className="text-[var(--text-3)] hover:text-[var(--text)] shrink-0"
              aria-label="Collapse sidebar"
            />
          </Tooltip>
        )}
      </div>

      {/* الزر الرئيسي: إنشاء مشروع جديد */}
      <div className="p-3">
        {!collapsed ? (
          <Link href="/projects/new">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              block
              size="middle"
              className={STYLES.primaryNewProjectBtn}
            >
              {t('newProject')}
            </Button>
          </Link>
        ) : (
          <Tooltip title={t('newProject')} placement={isRTL ? 'left' : 'right'}>
            <Link href="/projects/new">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                size="middle"
                className={STYLES.primaryNewProjectBtn}
                aria-label={t('newProject')}
              />
            </Link>
          </Tooltip>
        )}
      </div>

      {/* روابط التنقل الرئيسية */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {/* رابط لوحة التحكم */}
        <Tooltip title={collapsed ? t('dashboard') : undefined} placement={isRTL ? 'left' : 'right'}>
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              pathname === '/dashboard' ? STYLES.navLinkActive : STYLES.navLinkInactive
            } ${collapsed ? 'justify-center !px-0' : ''}`}
          >
            <DashboardOutlined className="text-base shrink-0" />
            {!collapsed && <span className="truncate">{t('dashboard')}</span>}
          </Link>
        </Tooltip>

        {/* زر فتح لوحة الأوامر السريعة */}
        {onOpenCommandPalette && (
          <Tooltip
            title={collapsed ? `${t('searchPlaceholder')} (Cmd+K)` : undefined}
            placement={isRTL ? 'left' : 'right'}
          >
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] font-medium transition-all cursor-pointer ${
                collapsed ? 'justify-center !px-0' : ''
              }`}
            >
              <SearchOutlined className="text-base shrink-0" />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <span className="truncate">{isArabic ? 'البحث والأوامر' : 'Commands'}</span>
                  <kbd className={STYLES.kbdBadge}>Cmd+K</kbd>
                </div>
              )}
            </button>
          </Tooltip>
        )}

        {/* رابط إعدادات مساحة العمل */}
        <Tooltip title={collapsed ? (isArabic ? 'الإعدادات' : 'Settings') : undefined} placement={isRTL ? 'left' : 'right'}>
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              pathname === '/settings' ? STYLES.navLinkActive : STYLES.navLinkInactive
            } ${collapsed ? 'justify-center !px-0' : ''}`}
          >
            <SettingOutlined className="text-base shrink-0" />
            {!collapsed && <span className="truncate">{isArabic ? 'الإعدادات' : 'Settings'}</span>}
          </Link>
        </Tooltip>

        {/* قسم قائمة المشاريع */}
        <div className="pt-4 pb-1">
          {!collapsed ? (
            <div className="flex items-center justify-between px-3 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]">
                {isArabic ? 'المشاريع' : 'Projects'}
              </span>
              <span className="text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--line)]">
                {projects.length}
              </span>
            </div>
          ) : (
            <div className="w-8 mx-auto border-t border-[var(--line)] my-2" />
          )}

          <div className="space-y-0.5">
            {projects.map((proj) => {
              const isActive =
                pathname === `/projects/${proj.id}` ||
                pathname === `/projects/${proj.id}/settings`;
              const isProjectOwner = proj.ownerId === user.uid;

              return (
                <SidebarProjectItem
                  key={proj.id}
                  project={proj}
                  isActive={isActive}
                  isOwner={isProjectOwner}
                  collapsed={collapsed}
                  isRTL={isRTL}
                />
              );
            })}

            {projects.length === 0 && !collapsed && (
              <div className="px-3 py-2 text-xs text-[var(--text-3)] italic">
                {isArabic ? 'لا توجد مشاريع حالياً' : 'No projects yet'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* أسفل السايد بار: زر الطي والتوسيع */}
      <div className="p-2 border-t border-[var(--line)] bg-[var(--bg)] shrink-0">
        {collapsed ? (
          <Tooltip
            title={isArabic ? 'توسيع الشريط الجانبي' : 'Expand Sidebar'}
            placement={isRTL ? 'left' : 'right'}
          >
            <Button
              type="text"
              block
              size="middle"
              onClick={onToggleCollapse}
              icon={isRTL ? <LeftOutlined className="text-xs" /> : <RightOutlined className="text-xs" />}
              className="text-[var(--text-3)] hover:text-[var(--text)]"
              aria-label="Expand sidebar"
            />
          </Tooltip>
        ) : (
          <div className="flex items-center justify-end px-2 py-0.5">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="text-xs text-[var(--text-3)] hover:text-[var(--text)] flex items-center gap-1.5 font-medium cursor-pointer py-1 px-2 rounded hover:bg-[var(--surface-2)] transition-colors"
            >
              <span>{isArabic ? 'تصغير القائمة' : 'Collapse'}</span>
              {isRTL ? <RightOutlined className="text-[10px]" /> : <LeftOutlined className="text-[10px]" />}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
