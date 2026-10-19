'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import Logo from '@/components/ui/Logo';
import {
  DashboardOutlined,
  PlusOutlined,
  LogoutOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  SwapOutlined,
  DownOutlined,
  CrownOutlined,
  ApiOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Avatar, MenuProps, Popover, message, Tooltip, Segmented } from 'antd';
import { DataService } from '@/services/dataStore';
import { setApiBaseUrl, getApiBaseUrl, LOCAL_API_URL, PRODUCTION_API_URL } from '@/lib/api';
import CommandPalette from '@/components/ui/CommandPalette';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const pathname = usePathname();

  const [backendStatus, setBackendStatus] = React.useState<{
    connected: boolean;
    backendUrl: string;
    engine: string;
    database?: {
      type: string;
      status: string;
      tablesCount: number;
    };
    version?: string;
    security?: any;
    uptime?: number;
    timestamp?: string;
  }>({
    connected: false,
    backendUrl: 'http://localhost:5001/api',
    engine: 'Detecting...',
  });
  const [checkingStatus, setCheckingStatus] = React.useState(false);

  const getInitialMode = (): 'auto' | 'local' | 'cloud' => {
    if (typeof window === 'undefined') return 'auto';
    const saved = localStorage.getItem('taskflow_api_url');
    if (!saved) return 'auto';
    if (saved.includes('5001') || saved.includes('localhost')) return 'local';
    return 'cloud';
  };

  const [targetMode, setTargetMode] = React.useState<'auto' | 'local' | 'cloud'>('auto');

  React.useEffect(() => {
    setTargetMode(getInitialMode());
  }, []);

  const checkStatus = React.useCallback(async () => {
    try {
      const res = await DataService.checkBackendHealth();
      setBackendStatus(res);
    } catch {
      // ignore
    }
  }, []);

  const handleModeChange = async (mode: 'auto' | 'local' | 'cloud') => {
    setTargetMode(mode);
    if (mode === 'auto') {
      setApiBaseUrl(null);
    } else if (mode === 'local') {
      setApiBaseUrl(LOCAL_API_URL);
    } else if (mode === 'cloud') {
      setApiBaseUrl(PRODUCTION_API_URL);
    }
    await checkStatus();
    message.info(
      language === 'ar'
        ? mode === 'local'
          ? 'تم التحويل إلى السيرفر المحلي: http://localhost:5001'
          : mode === 'cloud'
          ? 'تم التحويل إلى السيرفر السحابي: https://taskflow-taqat.apps.taqat.academy'
          : 'تم تفعيل وضع التبديل التلقائي (Auto-Failover)'
        : mode === 'local'
        ? 'Switched to Local Server: http://localhost:5001'
        : mode === 'cloud'
        ? 'Switched to Cloud Link: https://taskflow-taqat.apps.taqat.academy'
        : 'Enabled Auto-Failover mode'
    );
  };

  const [commandOpen, setCommandOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handlePingBackend = async () => {
    setCheckingStatus(true);
    try {
      const res = await DataService.checkBackendHealth();
      setBackendStatus(res);
      if (res.connected) {
        const isLoc = res.backendUrl.includes('5001') || res.backendUrl.includes('localhost');
        message.success(
          language === 'ar'
            ? `خادم SQL نشط ومستقر (${isLoc ? 'محلي 5001' : 'سحابي Taqat'}) • مدة التشغيل: ${res.uptime || 0}ث`
            : `SQL Backend Live (${isLoc ? 'Local 5001' : 'Cloud Taqat'}) • Uptime: ${res.uptime || 0}s`
        );
      } else {
        message.warning(
          language === 'ar'
            ? 'تعذر الوصول إلى خادم SQL. يرجى التحقق من اتصال الخدمة.'
            : 'SQL Backend unreachable. Please verify server connection.'
        );
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  const languageButton = (
    <Tooltip title={t('switchLanguage')}>
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-[#161c26] dark:hover:bg-[#1f2838] border border-slate-200 dark:border-[#1e2430] transition-colors"
        aria-label={t('switchLanguage')}
      >
        <GlobalOutlined className="text-[11px]" />
        <span className="text-[11px] font-mono">{language === 'en' ? 'عربي' : 'EN'}</span>
      </button>
    </Tooltip>
  );

  const isLocalActive =
    backendStatus.backendUrl.includes('5001') || backendStatus.backendUrl.includes('localhost');

  const badgeText = backendStatus.connected
    ? isLocalActive
      ? language === 'ar'
        ? 'محلي 5001'
        : 'Local 5001'
      : language === 'ar'
      ? 'سحابي (الرابط)'
      : 'Cloud Link'
    : language === 'ar'
    ? 'غير متصل'
    : 'Offline';

  const badgeColor = backendStatus.connected
    ? isLocalActive
      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20'
      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
    : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20';

  const dotColor = backendStatus.connected
    ? isLocalActive
      ? 'bg-cyan-500'
      : 'bg-emerald-500'
    : 'bg-rose-500';

  const backendPopoverContent = (
    <div className="w-80 space-y-3 text-xs py-1">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
            {language === 'ar' ? 'الوجهة المستهدفة (Endpoint):' : 'Active Target Service:'}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {targetMode === 'auto'
              ? language === 'ar' ? 'تبديل ذكي' : 'Auto Failover'
              : targetMode === 'local'
              ? 'Localhost:5001'
              : 'Taqat Cloud'}
          </span>
        </div>
        <Segmented
          size="small"
          value={targetMode}
          onChange={(val) => handleModeChange(val as any)}
          block
          options={[
            { value: 'auto', label: language === 'ar' ? 'تلقائي' : 'Auto' },
            { value: 'local', label: language === 'ar' ? 'محلي (5001)' : 'Local' },
            { value: 'cloud', label: language === 'ar' ? 'سحابي (الرابط)' : 'Cloud' },
          ]}
        />
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#1e2430]">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">
            {language === 'ar' ? 'محرك الواجهة الخلفية:' : 'Backend Engine:'}
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            TaskFlow API Service
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">
            {language === 'ar' ? 'محرك قاعدة البيانات:' : 'Database Engine:'}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            <DatabaseOutlined className="text-xs text-amber-500" />
            <span>SQLite WAL Engine</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">
            {language === 'ar' ? 'الرابط النشط حالياً:' : 'Active Endpoint:'}
          </span>
          <span
            className="font-mono text-[10px] text-amber-600 dark:text-amber-400 truncate max-w-[170px]"
            title={backendStatus.backendUrl}
          >
            {backendStatus.backendUrl}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">
            {language === 'ar' ? 'بنية الأمان:' : 'Security Architecture:'}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            JWT + bcrypt + RBAC
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-[#1e2430] flex justify-between items-center">
        <span className="text-[10px] text-slate-400">
          {backendStatus.connected
            ? language === 'ar'
              ? `متصل (تشغيل: ${backendStatus.uptime || 0}ث)`
              : `Connected (Uptime: ${backendStatus.uptime || 0}s)`
            : language === 'ar'
            ? 'غير متصل / جارٍ إعادة الاتصال...'
            : 'Offline / Reconnecting...'}
        </span>
        <Button
          size="small"
          icon={<ReloadOutlined />}
          loading={checkingStatus}
          onClick={handlePingBackend}
        >
          {language === 'ar' ? 'فحص الاتصال' : 'Ping Service'}
        </Button>
      </div>
    </div>
  );

  const backendBadgeButton = (
    <Popover
      trigger="click"
      placement="bottomRight"
      title={
        <div className="flex items-center gap-2 font-semibold text-xs pb-1 border-b border-slate-100 dark:border-[#1e2430]">
          <DatabaseOutlined className="text-amber-500" />
          <span>
            {language === 'ar' ? 'إدارة الاتصال بالخادم' : 'Backend Connection'}
          </span>
        </div>
      }
      content={backendPopoverContent}
    >
      <div className="cursor-pointer">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono border transition-all ${badgeColor}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          <span className="hidden sm:inline">{badgeText}</span>
        </span>
      </div>
    </Popover>
  );

  if (!user) {
    return (
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#080b11]/90 backdrop-blur-xl transition-colors relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <Logo size="small" />
            </Link>

            <div className="flex items-center gap-2.5">
              {backendBadgeButton}
              {languageButton}
              <Button
                type="text"
                size="small"
                icon={themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                aria-label="Toggle theme"
              />
              {pathname !== '/login' && (
                <Link href="/login">
                  <Button
                    size="small"
                    className="border-slate-200 dark:border-[#1b2336] text-slate-700 dark:text-slate-200 font-medium text-xs bg-slate-50 hover:bg-slate-100 dark:bg-[#0e131f] dark:hover:bg-[#161d2e] rounded-lg"
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
                    className="!bg-amber-500 hover:!bg-amber-400 !border-0 font-semibold text-xs !text-slate-950 shadow-xs rounded-lg"
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

  const isOwner = user.role === 'owner';

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      type: 'group',
      label: (
        <div className="py-1">
          <p className="font-semibold text-slate-800 dark:text-slate-100">{user.displayName}</p>
          <p className="text-xs text-slate-400 font-mono">{user.email}</p>
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#080b11]/90 backdrop-blur-xl transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Left: Brand & Clean Contextual Breadcrumb */}
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <Logo size="small" />
            </Link>
            <span className="text-slate-300 dark:text-slate-700 text-xs font-light">/</span>
            <Link
              href="/dashboard"
              className={`text-xs transition-all ${
                pathname === '/dashboard'
                  ? 'px-2.5 py-1 rounded-md font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 shadow-xs'
                  : 'px-2 py-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'
              }`}
            >
              {t('dashboard')}
            </Link>
            {pathname === '/projects/new' && (
              <>
                <span className="text-slate-300 dark:text-slate-700 text-xs font-light">/</span>
                <span className="px-2.5 py-1 rounded-md font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 shadow-xs text-xs">
                  {t('newProject')}
                </span>
              </>
            )}
            {pathname?.startsWith('/projects/') && pathname !== '/projects/new' && (
              <>
                <span className="text-slate-300 dark:text-slate-700 text-xs font-light">/</span>
                <span className="px-2.5 py-1 rounded-md font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 shadow-xs text-xs">
                  {pathname.includes('/settings') ? t('projectSettingsTitle') : t('kanbanBoard')}
                </span>
              </>
            )}
          </div>

          {/* Right Actions: Search, Language Switcher, SQL status, Theme, User */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Compact Command Palette Trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center justify-between gap-2 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-[#0e131f] dark:hover:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336] rounded-lg transition-all w-36 sm:w-44 cursor-pointer shadow-xs hover:border-amber-400/40 dark:hover:border-amber-500/40"
              aria-label="Open command palette"
            >
              <span className="flex items-center gap-1.5 truncate">
                <SearchOutlined className="text-[11px] text-amber-500" />
                <span className="truncate">{t('searchPlaceholder')}</span>
              </span>
              <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#161d2e] text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-[#1b2336] shrink-0 font-medium">
                Cmd+K
              </kbd>
            </button>

            {/* Mobile Search Icon Button */}
            <div className="sm:hidden flex items-center">
              <Button
                type="text"
                size="small"
                icon={<SearchOutlined />}
                onClick={() => setCommandOpen(true)}
                className="text-slate-500"
                aria-label="Search"
              />
            </div>

            {/* Language Switcher Button */}
            {languageButton}

            {/* SQL Engine Status Badge & Endpoint Switcher */}
            {backendBadgeButton}

            {/* Dark / Light Toggle */}
            <Button
              type="text"
              size="small"
              icon={themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            />

            {/* User Profile Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#161b26] transition-colors">
                <Avatar
                  size={26}
                  style={{ backgroundColor: isOwner ? '#2563eb' : '#475569' }}
                  className="font-semibold text-xs"
                >
                  {user.displayName?.charAt(0).toUpperCase()}
                </Avatar>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </header>
  );
}
