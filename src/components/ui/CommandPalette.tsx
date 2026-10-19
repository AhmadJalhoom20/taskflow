'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { DataService } from '@/services/dataStore';
import { Project } from '@/types';
import { Modal, Input, message } from 'antd';
import { useLanguage } from '@/context/LanguageContext';
import {
  SearchOutlined,
  DashboardOutlined,
  PlusOutlined,
  FolderOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  ApiOutlined,
  ArrowRightOutlined,
  EnterOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

interface CommandItem {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (open && user) {
      setQuery('');
      setSelectedIndex(0);
      DataService.getAccessibleProjects(user.uid)
        .then((projs) => setProjects(projs))
        .catch(() => {});
    }
  }, [open, user]);

  const items: CommandItem[] = useMemo(() => {
    const isArabic = language === 'ar';
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-dashboard',
        category: isArabic ? 'التنقل' : 'Navigation',
        title: isArabic ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard',
        subtitle: isArabic ? 'عرض مساحة العمل والإحصائيات' : 'View workspace overview and statistics',
        icon: <DashboardOutlined />,
        action: () => {
          router.push('/dashboard');
          onClose();
        },
      },
      {
        id: 'nav-create-project',
        category: isArabic ? 'التنقل' : 'Navigation',
        title: isArabic ? 'إنشاء مشروع جديد' : 'Create New Project',
        subtitle: isArabic ? 'تهيئة مساحة عمل مشتركة جديدة' : 'Initialize a new collaborative workspace',
        icon: <PlusOutlined />,
        action: () => {
          router.push('/projects/new');
          onClose();
        },
      },
      // Theme & Language & Engine
      {
        id: 'sys-language',
        category: isArabic ? 'النظام والتفضيلات' : 'System & Preferences',
        title: isArabic ? 'Switch to English' : 'التحويل إلى اللغة العربية',
        subtitle: isArabic ? 'Change app language to English' : 'تغيير لغة التطبيق إلى العربية',
        icon: <GlobalOutlined />,
        action: () => {
          toggleLanguage();
          onClose();
        },
      },
      {
        id: 'sys-theme',
        category: isArabic ? 'النظام والتفضيلات' : 'System & Preferences',
        title: isArabic
          ? `التحويل إلى الوضع ${themeMode === 'dark' ? 'الفاتح' : 'الداكن'}`
          : `Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: isArabic ? 'تبديل المظهر العام' : 'Toggle global color scheme',
        icon: themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />,
        action: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'sys-ping-backend',
        category: isArabic ? 'النظام والتفضيلات' : 'System & Preferences',
        title: isArabic ? 'فحص اتصال خادم SQL (:5001)' : 'Check SQL Backend Health (:5001)',
        subtitle: isArabic ? 'التحقق من حالة قاعدة بيانات SQLite' : 'Verify SQLite relational database status and response latency',
        icon: <ApiOutlined />,
        action: async () => {
          onClose();
          const res = await DataService.checkBackendHealth();
          if (res.connected) {
            message.success(
              isArabic
                ? `خادم SQL نشط: المنفذ 5001 (تشغيل: ${res.uptime}ث)`
                : `SQL Backend Live: Port 5001 (Uptime: ${res.uptime}s, Tables: ${res.database?.tablesCount || 4})`
            );
          } else {
            message.warning(
              isArabic
                ? 'خادم SQL غير متصل. يرجى التحقق من تشغيله.'
                : 'SQL Backend is offline. Please ensure server is running on port 5001.'
            );
          }
        },
      },
      // Account
      {
        id: 'acc-signout',
        category: isArabic ? 'الحساب' : 'Account',
        title: isArabic ? 'تسجيل الخروج من مساحة العمل' : 'Sign Out of Workspace',
        subtitle: `${isArabic ? 'مسجل الدخول باسم' : 'Currently signed in as'} ${user?.email || 'User'}`,
        icon: <LogoutOutlined className="text-rose-500" />,
        action: () => {
          onClose();
          logout();
        },
      },
    ];

    // Accessible Projects
    projects.forEach((proj) => {
      list.push({
        id: `proj-${proj.id}`,
        category: isArabic ? 'المشاريع' : 'Projects',
        title: proj.name,
        subtitle: proj.description || `${proj.memberIds.length} ${isArabic ? 'أعضاء' : 'members'}`,
        icon: <FolderOutlined />,
        action: () => {
          router.push(`/projects/${proj.id}`);
          onClose();
        },
      });
    });

    return list;
  }, [router, onClose, themeMode, toggleTheme, user, logout, projects, language, toggleLanguage]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [items, query]);

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={580}
      centered
      className="taskflow-command-palette-modal"
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div
        className={`flex flex-col max-h-[480px] rounded-xl overflow-hidden ${
          themeMode === 'dark' ? 'bg-[#0e131f] text-slate-100 border border-[#1b2336]' : 'bg-white text-slate-900'
        }`}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-[#1b2336] flex items-center gap-3">
          <SearchOutlined className="text-amber-500 text-base" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, projects, actions..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#161d2e] border border-slate-200 dark:border-[#1b2336] text-slate-500 dark:text-slate-400">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100/50 dark:divide-[#1b2336]/40 max-h-[380px]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching commands or projects found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-[#161d2e]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-sm flex items-center justify-center w-7 h-7 rounded-md ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-100 dark:bg-[#161d2e] text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate leading-tight">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#171c26] text-slate-400 border border-slate-200/60 dark:border-[#1e2430]">
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        <EnterOutlined />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-2.5 px-4 bg-slate-50 dark:bg-[#0e121a] border-t border-slate-200 dark:border-[#1e2430] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-white dark:bg-[#171c26] border border-slate-200 dark:border-[#1e2430]">↑</kbd>{' '}
              <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-white dark:bg-[#171c26] border border-slate-200 dark:border-[#1e2430]">↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-white dark:bg-[#171c26] border border-slate-200 dark:border-[#1e2430]">↵</kbd>{' '}
              Select
            </span>
          </div>
          <span>Linear Fast Navigation</span>
        </div>
      </div>
    </Modal>
  );
}
