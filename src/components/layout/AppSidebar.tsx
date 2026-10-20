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
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Project } from '@/types';
import { DataService } from '@/services/dataStore';

// ============================================================================
// 2. منطقة التعديل السريع (Constants & Styles)
// هان مفتاح الكاش وستايلات السايد بار عشان تعدل أي زر أو لون بسرعة
// ============================================================================
const CACHE_KEY = 'taskflow_cached_projects';

const STYLES = {
  // السايد بار مثبت h-full و shrink-0 عشان ما ينزل لتحت بالمرة
  sidebarBase:
    'relative flex flex-col shrink-0 border-e border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#11100E] transition-all duration-200 select-none z-30 h-full',
  primaryNewProjectBtn:
    'tactile-btn !bg-[#7A5818] hover:!bg-[#5E420E] dark:!bg-[#D4B26E] dark:hover:!bg-[#E2C88E] !border-transparent !text-white dark:!text-[#1A1408] font-bold text-sm shadow-xs',
  navLinkActive:
    'bg-[#7A5818]/10 dark:bg-[#D4B26E]/15 text-[#7A5818] dark:text-[#D4B26E] font-bold border border-[#7A5818]/25 dark:border-[#D4B26E]/30',
  navLinkInactive:
    'text-[#5A5348] hover:text-[#1B1915] dark:text-[#B5AC9C] dark:hover:text-[#EFE9DD] hover:bg-[#EDECE8] dark:hover:bg-[#1C1A17] font-medium',
  kbdBadge:
    'text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] border border-[#DDDAD3] dark:border-[#2C2824]',
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
        <div className="w-2 h-2 rounded-full bg-[#7A5818] dark:bg-[#D4B26E] shrink-0" />
        {!collapsed && (
          <div className="flex items-center justify-between flex-1 truncate">
            <span className="truncate text-xs sm:text-sm">{project.name}</span>
            {isOwner ? (
              <CrownOutlined className="text-[11px] text-[#7A5818] dark:text-[#D4B26E] shrink-0 opacity-70 group-hover:opacity-100" />
            ) : (
              <span className="text-[10px] font-mono text-[#736B5E] dark:text-[#9A9183] shrink-0">
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
        // preserve cache on network hitch
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSidebarProjects();

    return () => {
      isMounted = false;
    };
  }, [user, pathname]);

  // Guard clause for unauthenticated users
  if (!user) return null;

  const isOwner = user.role === 'owner';

  return (
    <aside
      className={`${STYLES.sidebarBase} ${collapsed ? 'w-16' : 'w-64'}`}
      aria-label={isArabic ? 'الشريط الجانبي' : 'Sidebar Navigation'}
    >
      {/* Workspace Header */}
      <div
        className={`p-3 border-b border-[#DDDAD3] dark:border-[#2C2824] flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#7A5818] dark:bg-[#D4B26E] text-white dark:text-[#1A1408] font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              TF
            </div>
            <div className="truncate">
              <div className="font-bold text-sm text-[#1B1915] dark:text-[#EFE9DD] truncate leading-tight font-display">
                {user.displayName ? `${user.displayName.split(' ')[0]}'s Workspace` : 'TaskFlow'}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#235832] dark:bg-[#9CC5A1]" />
                <span className="text-[11px] font-mono text-[#5A5348] dark:text-[#B5AC9C]">
                  {isOwner ? (isArabic ? 'مالك' : 'Owner') : isArabic ? 'عضو' : 'Member'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <Tooltip
            title={user.displayName ? `${user.displayName}'s Workspace` : 'Workspace'}
            placement={isRTL ? 'left' : 'right'}
          >
            <div className="w-8 h-8 rounded-lg bg-[#7A5818] dark:bg-[#D4B26E] text-white dark:text-[#1A1408] font-bold flex items-center justify-center text-sm shadow-xs cursor-pointer">
              TF
            </div>
          </Tooltip>
        )}

        {/* Collapse toggle button on top right of sidebar */}
        {!collapsed && (
          <Tooltip title={isArabic ? 'تصغير الشريط الجانبي' : 'Collapse Sidebar'}>
            <Button
              type="text"
              size="small"
              onClick={onToggleCollapse}
              icon={isRTL ? <RightOutlined className="text-xs" /> : <LeftOutlined className="text-xs" />}
              className="text-[#736B5E] hover:text-[#1B1915] dark:text-[#9A9183] dark:hover:text-[#EFE9DD]"
              aria-label="Collapse sidebar"
            />
          </Tooltip>
        )}
      </div>

      {/* Primary Action: + New Project */}
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

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {/* Dashboard Link */}
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

        {/* Command Palette Trigger */}
        {onOpenCommandPalette && (
          <Tooltip
            title={collapsed ? `${t('searchPlaceholder')} (Cmd+K)` : undefined}
            placement={isRTL ? 'left' : 'right'}
          >
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#5A5348] hover:text-[#1B1915] dark:text-[#B5AC9C] dark:hover:text-[#EFE9DD] hover:bg-[#EDECE8] dark:hover:bg-[#1C1A17] font-medium transition-all cursor-pointer ${
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

        {/* Projects List Section */}
        <div className="pt-4 pb-1">
          {!collapsed ? (
            <div className="flex items-center justify-between px-3 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#736B5E] dark:text-[#9A9183]">
                {isArabic ? 'المشاريع' : 'Projects'}
              </span>
              <span className="text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#EDECE8] dark:bg-[#1C1A17] text-[#736B5E] dark:text-[#9A9183]">
                {projects.length}
              </span>
            </div>
          ) : (
            <div className="w-8 mx-auto border-t border-[#DDDAD3] dark:border-[#2C2824] my-2" />
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
              <div className="px-3 py-2 text-xs text-[#736B5E] dark:text-[#9A9183] italic">
                {isArabic ? 'لا توجد مشاريع حالياً' : 'No projects yet'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Toggle */}
      <div className="p-2 border-t border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#11100E] shrink-0">
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
              className="text-[#736B5E] hover:text-[#1B1915] dark:text-[#9A9183] dark:hover:text-[#EFE9DD]"
              aria-label="Expand sidebar"
            />
          </Tooltip>
        ) : (
          <div className="flex items-center justify-end px-2 py-0.5">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="text-xs text-[#736B5E] hover:text-[#1B1915] dark:text-[#9A9183] dark:hover:text-[#EFE9DD] flex items-center gap-1.5 font-medium cursor-pointer py-1 px-2 rounded hover:bg-[#EDECE8] dark:hover:bg-[#1C1A17] transition-colors"
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
