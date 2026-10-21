'use client';

// ============================================================================
// 1. الاستيرادات (Imports)
// بنجيب الأيقونات من Ant Design وأدوات التحكم بالمستخدم والثيم واللغة
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
// 2. منطقة التعديل السريع (Constants & Styles)
// ستايلات النافبار موحدة بالكامل مع توكنز الكانفاس بدون أي تباين زجاجي أو أكواد ألوان عشوائية
// ============================================================================
const STYLES = {
  header:
    'sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--bg)] transition-colors',
  commandButton:
    'tactile-btn hidden sm:flex items-center justify-between gap-2 px-3 py-1 text-sm text-[var(--text-2)] hover:text-[var(--text)] bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--line-strong)] rounded-md transition-all w-44 sm:w-52 cursor-pointer',
  languageButton:
    'tactile-btn flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-[var(--text)] hover:text-[var(--accent)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] border border-[var(--line)]',
  activeBreadcrumb:
    'px-2.5 py-0.5 rounded font-bold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20 text-sm',
  inactiveBreadcrumb:
    'px-1.5 py-0.5 text-[var(--text-2)] hover:text-[var(--text)] font-medium text-sm',
};

// ============================================================================
// 3. الأنواع والواجهات (Types & Interfaces)
// ============================================================================
export interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenCommandPalette?: () => void;
}

// ============================================================================
// 4. دوال مساعدة (Helper Functions)
// ============================================================================
// دوال مساعدة للتنقل والتحكم بالروابط

// ============================================================================
// 5. المكونات الفرعية (Sub-Components)
// زر تبديل اللغة السريع (عربي / English)
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
// 6. المكون الرئيسي (Navbar)
// الشريط العلوي الموحد: الشعار ومسار التنقل ع الشمال، والبحث والمظهر والبروفايل ع اليمين
// ============================================================================
export default function Navbar({ onToggleSidebar, onOpenCommandPalette }: NavbarProps = {}) {
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const pathname = usePathname();

  const isArabic = language === 'ar';
  const isOwner = user?.role === 'owner';

  // معالجة حالة الزائر غير المسجل (صفحات الهبوط وتسجيل الدخول)
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
                  className="text-[var(--text-2)] hover:text-[var(--text)]"
                  aria-label="Toggle theme"
                />
              </Tooltip>

              {pathname !== '/login' && (
                <Link href="/login">
                  <Button
                    size="middle"
                    className="tactile-btn border-[var(--line)] text-[var(--text)] font-semibold text-sm bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
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
                    className="tactile-btn !bg-[var(--accent)] hover:!bg-[var(--accent-hover)] !border-transparent font-bold text-sm !text-[var(--on-accent)] shadow-xs"
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

  // عناصر القائمة المنسدلة لملف المستخدم
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      type: 'group',
      label: (
        <div className="py-1">
          <p className="font-semibold text-[var(--text)] text-sm">{user.displayName}</p>
          <p className="text-xs text-[var(--text-2)] font-mono">{user.email}</p>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] ${
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
          {/* الجانب الأيمن أو الأيسر حسب اللغة: زر السايد بار والشعار ومسار التنقل */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {onToggleSidebar && (
              <Tooltip title={isRTL ? 'تبديل الشريط الجانبي' : 'Toggle Sidebar'}>
                <Button
                  type="text"
                  size="small"
                  onClick={onToggleSidebar}
                  icon={<MenuOutlined className="text-sm" />}
                  className="text-[var(--text-2)] hover:text-[var(--text)] -ms-1"
                  aria-label="Toggle sidebar"
                />
              </Tooltip>
            )}

            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <Logo size="small" />
            </Link>

            <span className="text-[var(--line-strong)] text-sm font-light">/</span>

            <Link
              href="/dashboard"
              className={pathname === '/dashboard' ? STYLES.activeBreadcrumb : STYLES.inactiveBreadcrumb}
            >
              {t('dashboard')}
            </Link>

            {pathname === '/projects/new' && (
              <>
                <span className="text-[var(--line-strong)] text-sm font-light">/</span>
                <span className={STYLES.activeBreadcrumb}>{t('newProject')}</span>
              </>
            )}

            {pathname?.startsWith('/projects/') && pathname !== '/projects/new' && (
              <>
                <span className="text-[var(--line-strong)] text-sm font-light">/</span>
                <span className={STYLES.activeBreadcrumb}>
                  {pathname.includes('/settings') ? t('projectSettingsTitle') : t('kanbanBoard')}
                </span>
              </>
            )}
          </div>

          {/* أدوات التحكم الجانبية: البحث واللغة والثيم والقائمة الشخصية */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* زر فتح لوحة الأوامر بالديسكتوب */}
            <Tooltip title={`${t('searchPlaceholder')} (Cmd+K / Ctrl+K)`}>
              <button
                onClick={() => onOpenCommandPalette?.()}
                className={STYLES.commandButton}
                aria-label="Open command palette"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <SearchOutlined className="text-xs text-[var(--accent)]" />
                  <span className="truncate">{t('searchPlaceholder')}</span>
                </span>
                <kbd className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--line)] shrink-0 font-medium">
                  Cmd+K
                </kbd>
              </button>
            </Tooltip>

            {/* أيقونة البحث بالموبايل */}
            <div className="sm:hidden flex items-center">
              <Tooltip title={t('searchPlaceholder')}>
                <Button
                  type="text"
                  size="small"
                  icon={<SearchOutlined />}
                  onClick={() => onOpenCommandPalette?.()}
                  className="text-[var(--text-2)]"
                  aria-label="Search"
                />
              </Tooltip>
            </div>

            <LanguageSwitchButton
              language={language}
              toggleLanguage={toggleLanguage}
              tooltipText={t('switchLanguage')}
            />

            {/* زر تبديل الوضع النهاري / الليلي */}
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
                className="text-[var(--text-2)] hover:text-[var(--text)]"
              />
            </Tooltip>

            {/* صورة الحساب والقائمة المنسدلة */}
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <Tooltip
                title={`${user.displayName} (${user.role === 'owner' ? t('owner') : t('member')})`}
              >
                <div className="flex items-center gap-2 cursor-pointer p-0.5 rounded-md hover:bg-[var(--surface-2)] transition-colors">
                  <Avatar
                    size={30}
                    style={{
                      backgroundColor: isOwner ? 'var(--accent)' : 'var(--surface-2)',
                      color: isOwner ? 'var(--on-accent)' : 'var(--text)',
                      border: '1px solid var(--line)',
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
