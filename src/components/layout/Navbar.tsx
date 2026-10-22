'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  SearchOutlined,
  GlobalOutlined,
  MenuOutlined,
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Avatar, MenuProps, Tooltip, Badge, Popover } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import Logo from '@/components/ui/Logo';
import { NotificationService } from '@/services/notificationService';
import { DueSoonTaskItem } from '@/types';

// ============================================================================
// 2. CONFIGURATION & STYLES (EASY EDIT ZONE)
// ============================================================================
const STYLES = {
  header:
    'sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)] transition-colors select-none',
  container: 'w-full px-3 sm:px-5 flex items-center justify-between h-13',
  commandButton:
    'tactile-btn hidden md:flex items-center justify-between gap-2 px-2.5 py-1 text-xs text-[var(--text-2)] hover:text-[var(--text)] bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--line-strong)] rounded-md transition-all w-44 lg:w-48 cursor-pointer',
  languageButton:
    'tactile-btn flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-[var(--text)] hover:text-[var(--accent)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] border border-[var(--line)]',
  navIconBtn:
    'text-[var(--text-2)] hover:text-[var(--text)] flex items-center justify-center p-1 rounded-md hover:bg-[var(--surface-2)] transition-colors',
  breadcrumbItem:
    'text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text)] transition-colors truncate',
  breadcrumbActive:
    'text-xs font-bold text-[var(--text)] truncate',
};

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
export interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
}

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================
function DueTasksPopoverContent({
  tasks,
  isArabic,
  onNavigate,
}: {
  tasks: DueSoonTaskItem[];
  isArabic: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="w-72 max-w-[85vw] p-1 space-y-2 text-xs">
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
        <div className="flex items-center gap-1.5 font-bold text-[var(--text)]">
          <ClockCircleOutlined className="text-[var(--accent)]" />
          <span>{isArabic ? 'مهام تقترب من موعدها' : 'Approaching Deadlines'}</span>
        </div>
        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--line)]">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="py-4 text-center text-[var(--text-3)] italic">
          {isArabic ? 'لا توجد مهام تقترب من موعدها حالياً' : 'All deadlines are comfortably on track'}
        </div>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pe-1">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/projects/${task.projectId}`}
              onClick={onNavigate}
              className="block p-2 rounded-md border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]/50 transition-colors group"
            >
              <div className="font-medium text-[var(--text)] truncate group-hover:text-[var(--accent)]">
                {task.title}
              </div>
              <div className="flex items-center justify-between pt-1 text-[10px] text-[var(--text-3)] font-mono">
                <span className="truncate">{task.projectName || 'TaskFlow'}</span>
                <span className="text-[var(--accent)] font-semibold">{task.dueDate}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-[var(--line)] flex justify-between items-center text-[11px]">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="text-[var(--accent)] hover:underline font-semibold"
        >
          {isArabic ? 'إعدادات الإشعارات' : 'Notification Settings'}
        </Link>
        <span className="text-[10px] text-[var(--text-3)]">TaskFlow Engine</span>
      </div>
    </div>
  );
}

// ============================================================================
// 6. MAIN COMPONENT (Navbar)
// ============================================================================
export default function Navbar({
  onToggleSidebar,
  onOpenCommandPalette,
  onOpenShortcuts,
}: NavbarProps = {}) {
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const isArabic = language === 'ar';
  const isOwner = user?.role === 'owner';

  const [dueTasks, setDueTasks] = useState<DueSoonTaskItem[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Periodic due date verification & system push notification trigger
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    async function checkTasks() {
      try {
        const list = await NotificationService.checkApproachingTasksAndNotify(isArabic);
        if (isMounted) setDueTasks(list);
      } catch {
        // Fallback silently
      }
    }

    checkTasks();
    const timer = setInterval(checkTasks, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [user, isArabic]);

  // Public visitor topbar (Landing page, login, register)
  if (!user) {
    return (
      <header className={STYLES.header}>
        <div className={STYLES.container}>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <Logo size="small" />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Tooltip title={t('switchLanguage')}>
              <button
                onClick={toggleLanguage}
                className={STYLES.languageButton}
                aria-label={t('switchLanguage')}
              >
                <GlobalOutlined className="text-[11px]" />
                <span className="text-[11px] font-mono uppercase">
                  {language === 'en' ? 'عربي' : 'EN'}
                </span>
              </button>
            </Tooltip>

            <Tooltip
              title={
                themeMode === 'dark'
                  ? isArabic
                    ? 'الوضع النهاري'
                    : 'Light Mode'
                  : isArabic
                  ? 'الوضع الليلي'
                  : 'Dark Mode'
              }
            >
              <Button
                type="text"
                size="small"
                icon={themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                className="text-[var(--text-2)] hover:text-[var(--text)]"
                aria-label="Toggle theme"
              />
            </Tooltip>

            {pathname !== '/login' && (
              <Link href="/login">
                <Button
                  size="small"
                  className="tactile-btn border-[var(--line)] text-[var(--text)] font-semibold text-xs bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
                >
                  {t('signIn')}
                </Button>
              </Link>
            )}

            {pathname !== '/register' && (
              <Link href="/register">
                <Button
                  type="primary"
                  size="small"
                  className="tactile-btn !bg-[var(--accent)] hover:!bg-[var(--accent-hover)] !border-transparent font-bold text-xs !text-[var(--on-accent)] shadow-xs"
                >
                  {t('getStarted')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  // User Profile Dropdown Menu Items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      type: 'group',
      label: (
        <div className="py-1">
          <p className="font-semibold text-[var(--text)] text-sm">{user.displayName}</p>
          <p className="text-xs text-[var(--text-2)] font-mono">{user.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)]">
            {user.role === 'owner' || isOwner ? t('owner') : t('member')}
          </span>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'settings',
      icon: <SettingOutlined className="text-xs" />,
      label: isArabic ? 'إعدادات مساحة العمل' : 'Workspace Settings',
      onClick: () => router.push('/settings'),
    },
    {
      key: 'shortcuts',
      icon: <QuestionCircleOutlined className="text-xs" />,
      label: isArabic ? 'اختصارات لوحة المفاتيح (?)' : 'Keyboard Shortcuts (?)',
      onClick: () => onOpenShortcuts?.(),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-red-500 text-xs" />,
      label: t('signOut'),
      danger: true,
      onClick: () => logout(),
    },
  ];

  // Resolve Current Location Title cleanly without tacky clutter
  const getCurrentPageTitle = () => {
    if (pathname === '/dashboard') return t('dashboard');
    if (pathname === '/settings') return isArabic ? 'الإعدادات' : 'Settings';
    if (pathname === '/projects/new') return t('newProject');
    if (pathname?.includes('/settings')) return isArabic ? 'إعدادات المشروع' : 'Project Settings';
    if (pathname?.startsWith('/projects/')) return t('kanbanBoard');
    return t('dashboard');
  };

  return (
    <header className={STYLES.header}>
      <div className={STYLES.container}>
        {/* Left Section: Responsive Hamburger & Crisp Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {onToggleSidebar && (
            <Tooltip title={isRTL ? 'القائمة الجانبية' : 'Toggle Sidebar'}>
              <button
                type="button"
                onClick={onToggleSidebar}
                className={STYLES.navIconBtn}
                aria-label="Toggle sidebar"
              >
                <MenuOutlined className="text-sm" />
              </button>
            </Tooltip>
          )}

          {/* Desktop Breadcrumbs: Minimalist, Architectural Hierarchy */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <Link href="/dashboard" className={STYLES.breadcrumbItem}>
              {user.displayName ? `${user.displayName.split(' ')[0]}'s Workspace` : 'Workspace'}
            </Link>

            <span className="text-[var(--line-strong)] text-xs">/</span>

            <span className={STYLES.breadcrumbActive}>{getCurrentPageTitle()}</span>
          </div>

          {/* Mobile & iPad Viewport (< 640px): Ultra-Compact Title */}
          <div className="sm:hidden flex items-center min-w-0">
            <span className="text-xs font-bold text-[var(--text)] truncate max-w-[130px]">
              {getCurrentPageTitle()}
            </span>
          </div>
        </div>

        {/* Right Section: Command Palette, Notifications, Settings, Locale, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Desktop Search Button */}
          {onOpenCommandPalette && (
            <Tooltip title={`${t('searchPlaceholder')} (Cmd+K / Ctrl+K)`}>
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className={STYLES.commandButton}
                aria-label="Open command palette"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <SearchOutlined className="text-xs text-[var(--accent)]" />
                  <span className="truncate">{t('searchPlaceholder')}</span>
                </span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--line)] shrink-0 font-medium">
                  Cmd+K
                </kbd>
              </button>
            </Tooltip>
          )}

          {/* Mobile Search Icon */}
          {onOpenCommandPalette && (
            <div className="md:hidden flex items-center">
              <Tooltip title={t('searchPlaceholder')}>
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  className={STYLES.navIconBtn}
                  aria-label="Search"
                >
                  <SearchOutlined className="text-sm" />
                </button>
              </Tooltip>
            </div>
          )}

          {/* Due-Date Notifications Bell */}
          <Popover
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            content={
              <DueTasksPopoverContent
                tasks={dueTasks}
                isArabic={isArabic}
                onNavigate={() => setPopoverOpen(false)}
              />
            }
            trigger="click"
            placement={isRTL ? 'bottomLeft' : 'bottomRight'}
          >
            <Tooltip title={isArabic ? 'تنبيهات المواعيد النهائية' : 'Due Date Alerts'}>
              <button
                type="button"
                className={`${STYLES.navIconBtn} relative`}
                aria-label="Notifications"
              >
                <Badge
                  count={dueTasks.length}
                  size="small"
                  offset={[-2, 2]}
                  styles={{
                    indicator: {
                      backgroundColor: 'var(--accent)',
                      color: 'var(--on-accent)',
                      fontSize: '9px',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  <BellOutlined className="text-sm text-[var(--text-2)]" />
                </Badge>
              </button>
            </Tooltip>
          </Popover>

          {/* Direct Workspace Settings Icon Link */}
          <Tooltip title={isArabic ? 'إعدادات مساحة العمل' : 'Workspace Settings'}>
            <Link
              href="/settings"
              className={`${STYLES.navIconBtn} ${
                pathname === '/settings' ? 'text-[var(--accent)] bg-[var(--surface-2)]' : ''
              }`}
              aria-label="Settings"
            >
              <SettingOutlined className="text-sm" />
            </Link>
          </Tooltip>

          {/* Language Switcher */}
          <Tooltip title={t('switchLanguage')}>
            <button
              onClick={toggleLanguage}
              className={STYLES.languageButton}
              aria-label={t('switchLanguage')}
            >
              <GlobalOutlined className="text-[11px]" />
              <span className="text-[11px] font-mono uppercase">
                {language === 'en' ? 'عربي' : 'EN'}
              </span>
            </button>
          </Tooltip>

          {/* Theme Mode Switcher */}
          <Tooltip
            title={
              themeMode === 'dark'
                ? isArabic
                  ? 'الوضع النهاري'
                  : 'Light Mode'
                : isArabic
                ? 'الوضع الليلي'
                : 'Dark Mode'
            }
          >
            <button
              type="button"
              onClick={toggleTheme}
              className={STYLES.navIconBtn}
              aria-label="Toggle theme"
            >
              {themeMode === 'dark' ? (
                <SunOutlined className="text-sm" />
              ) : (
                <MoonOutlined className="text-sm" />
              )}
            </button>
          </Tooltip>

          {/* User Profile Avatar with Menu */}
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <button
              type="button"
              className="flex items-center gap-1.5 cursor-pointer p-0.5 rounded-md hover:bg-[var(--surface-2)] transition-colors shrink-0"
              aria-label="User profile menu"
            >
              <Avatar
                size={28}
                style={{
                  backgroundColor: isOwner ? 'var(--accent)' : 'var(--surface-2)',
                  color: isOwner ? 'var(--on-accent)' : 'var(--text)',
                  border: '1px solid var(--line)',
                }}
                className="font-bold text-xs"
              >
                {user.displayName?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
