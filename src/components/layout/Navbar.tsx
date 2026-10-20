'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  SearchOutlined,
  GlobalOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Avatar, MenuProps, Tooltip } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import Logo from '@/components/ui/Logo';

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
const STYLES = {
  header:
    'sticky top-0 z-50 border-b border-[#DDDAD3] dark:border-[#2C2824] bg-[#FFFFFF]/95 dark:bg-[#11100E]/95 backdrop-blur-md transition-colors',
  commandButton:
    'tactile-btn hidden sm:flex items-center justify-between gap-2 px-3 py-1 text-sm text-[#5A5348] hover:text-[#1B1915] dark:text-[#B5AC9C] dark:hover:text-[#EFE9DD] bg-white dark:bg-[#141211] border border-[#DDDAD3] dark:border-[#2C2824] rounded-md transition-all w-44 sm:w-52 cursor-pointer hover:border-[#7A5818] dark:hover:border-[#D4B26E]',
  languageButton:
    'tactile-btn flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-[#1B1915] dark:text-[#EFE9DD] hover:text-[#7A5818] dark:hover:text-[#D4B26E] bg-white hover:bg-[#EDECE8] dark:bg-[#141211] dark:hover:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824]',
  activeBreadcrumb:
    'px-2.5 py-0.5 rounded font-bold bg-[#7A5818]/10 dark:bg-[#D4B26E]/15 text-[#7A5818] dark:text-[#D4B26E] border border-[#7A5818]/25 dark:border-[#D4B26E]/30 text-sm',
  inactiveBreadcrumb:
    'px-1.5 py-0.5 text-[#5A5348] hover:text-[#1B1915] dark:text-[#B5AC9C] dark:hover:text-[#EFE9DD] font-medium text-sm',
};

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
export interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenCommandPalette?: () => void;
}

// ============================================================================
// 4. HELPER FUNCTIONS
// ============================================================================
// Pure navigation helpers

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================
function LanguageSwitchButton({
  language,
  toggleLanguage,
  tooltipText,
}: {
  language: string;
  toggleLanguage: () => void;
  tooltipText: string;
}) {
  return (
    <Tooltip title={tooltipText}>
      <button
        onClick={toggleLanguage}
        className={STYLES.languageButton}
        aria-label={tooltipText}
      >
        <GlobalOutlined className="text-[11px]" />
        <span className="text-[11px] font-mono uppercase">
          {language === 'en' ? 'عربي' : 'EN'}
        </span>
      </button>
    </Tooltip>
  );
}

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export default function Navbar({ onToggleSidebar, onOpenCommandPalette }: NavbarProps = {}) {
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const pathname = usePathname();

  const isArabic = language === 'ar';
  const isOwner = user?.role === 'owner';

  // Guard clause for guest user (public view)
  if (!user) {
    return (
      <header className={STYLES.header}>
        <div className="w-full px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                <Logo size="small" />
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <LanguageSwitchButton
                language={language}
                toggleLanguage={toggleLanguage}
                tooltipText={t('switchLanguage')}
              />

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
                  className="text-[#5A5348] hover:text-[#1B1915] dark:text-[#B5AC9C] dark:hover:text-[#EFE9DD]"
                  aria-label="Toggle theme"
                />
              </Tooltip>

              {pathname !== '/login' && (
                <Link href="/login">
                  <Button
                    size="middle"
                    className="tactile-btn border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD] font-semibold text-sm bg-white dark:bg-[#141211]"
                  >
                    {t('signIn')}
                  </Button>
                </Link>
              )}

              {pathname !== '/register' && (
                <Link href="/register">
                  <Button
                    type="primary"
                    size="middle"
                    className="tactile-btn !bg-[#7A5818] hover:!bg-[#5E420E] dark:!bg-[#D4B26E] dark:hover:!bg-[#E2C88E] !border-transparent font-bold text-sm !text-white dark:!text-[#1A1408] shadow-xs"
                  >
                    {t('getStarted')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Authenticated user menu dropdown items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      type: 'group',
      label: (
        <div className="py-1">
          <p className="font-semibold text-[#1B1915] dark:text-[#EFE9DD] text-sm">{user.displayName}</p>
          <p className="text-xs text-[#5A5348] dark:text-[#9A9183] font-mono">{user.email}</p>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#EDECE8] dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD] border border-[#DDDAD3] dark:border-[#2C2824] ${
              isArabic ? 'font-sans' : 'font-mono uppercase tracking-wider'
            }`}
          >
            {user.role === 'owner' || isOwner ? t('owner') : t('member')}
          </span>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-red-500" />,
      label: t('signOut'),
      danger: true,
      onClick: () => logout(),
    },
  ];

  return (
    <header className={STYLES.header}>
      <div className="w-full px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Left: Sidebar Toggle + Brand & Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {onToggleSidebar && (
              <Tooltip title={isRTL ? 'تبديل الشريط الجانبي' : 'Toggle Sidebar'}>
                <Button
                  type="text"
                  size="small"
                  onClick={onToggleSidebar}
                  icon={<MenuOutlined className="text-sm" />}
                  className="text-[#5A5348] hover:text-[#1B1915] dark:text-[#B5AC9C] dark:hover:text-[#EFE9DD] -ms-1"
                  aria-label="Toggle sidebar"
                />
              </Tooltip>
            )}

            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <Logo size="small" />
            </Link>

            <span className="text-[#DDDAD3] dark:text-[#3A352F] text-sm font-light">/</span>

            <Link
              href="/dashboard"
              className={pathname === '/dashboard' ? STYLES.activeBreadcrumb : STYLES.inactiveBreadcrumb}
            >
              {t('dashboard')}
            </Link>

            {pathname === '/projects/new' && (
              <>
                <span className="text-[#DDDAD3] dark:text-[#3A352F] text-sm font-light">/</span>
                <span className={STYLES.activeBreadcrumb}>{t('newProject')}</span>
              </>
            )}

            {pathname?.startsWith('/projects/') && pathname !== '/projects/new' && (
              <>
                <span className="text-[#DDDAD3] dark:text-[#3A352F] text-sm font-light">/</span>
                <span className={STYLES.activeBreadcrumb}>
                  {pathname.includes('/settings') ? t('projectSettingsTitle') : t('kanbanBoard')}
                </span>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Command Palette Trigger */}
            <Tooltip title={`${t('searchPlaceholder')} (Cmd+K / Ctrl+K)`}>
              <button
                onClick={() => onOpenCommandPalette?.()}
                className={STYLES.commandButton}
                aria-label="Open command palette"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <SearchOutlined className="text-xs text-[#7A5818] dark:text-[#D4B26E]" />
                  <span className="truncate">{t('searchPlaceholder')}</span>
                </span>
                <kbd className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] border border-[#DDDAD3] dark:border-[#2C2824] shrink-0 font-medium">
                  Cmd+K
                </kbd>
              </button>
            </Tooltip>

            {/* Mobile Search Button */}
            <div className="sm:hidden flex items-center">
              <Tooltip title={t('searchPlaceholder')}>
                <Button
                  type="text"
                  size="small"
                  icon={<SearchOutlined />}
                  onClick={() => onOpenCommandPalette?.()}
                  className="text-[#5A5348] dark:text-[#B5AC9C]"
                  aria-label="Search"
                />
              </Tooltip>
            </div>

            <LanguageSwitchButton
              language={language}
              toggleLanguage={toggleLanguage}
              tooltipText={t('switchLanguage')}
            />

            {/* Theme Toggle */}
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
                aria-label="Toggle theme"
                className="text-[#5A5348] hover:text-[#1B1915] dark:text-[#B5AC9C] dark:hover:text-[#EFE9DD]"
              />
            </Tooltip>

            {/* User Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <Tooltip
                title={`${user.displayName} (${user.role === 'owner' ? t('owner') : t('member')})`}
              >
                <div className="flex items-center gap-2 cursor-pointer p-0.5 rounded-md hover:bg-[#EDECE8] dark:hover:bg-[#1C1A17] transition-colors">
                  <Avatar
                    size={30}
                    style={{
                      backgroundColor: isOwner
                        ? themeMode === 'dark'
                          ? '#D4B26E'
                          : '#7A5818'
                        : themeMode === 'dark'
                        ? '#26231F'
                        : '#DDDAD3',
                      color: isOwner
                        ? themeMode === 'dark'
                          ? '#1A1408'
                          : '#FFFFFF'
                        : themeMode === 'dark'
                        ? '#EFE9DD'
                        : '#1B1915',
                    }}
                    className="font-bold text-sm"
                  >
                    {user.displayName?.charAt(0).toUpperCase()}
                  </Avatar>
                </div>
              </Tooltip>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}
