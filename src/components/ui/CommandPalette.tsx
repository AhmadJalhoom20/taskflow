'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  SearchOutlined,
  DashboardOutlined,
  PlusOutlined,
  FolderOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  EnterOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Modal } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { DataService } from '@/services/dataStore';
import { Project } from '@/types';

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
const PALETTE_CONFIG = {
  modalWidth: 580,
  maxResultsHeight: 'max-h-[380px]',
};

const STYLES = {
  itemActive:
    'bg-[#7A5818]/15 dark:bg-[#D4B26E]/15 text-[#7A5818] dark:text-[#D4B26E]',
  itemIdle:
    'text-[#1B1915] dark:text-[#EFE9DD] hover:bg-[#EDECE8]/60 dark:hover:bg-[#1C1A17]',
  iconActive:
    'bg-[#7A5818] dark:bg-[#D4B26E] text-white dark:text-[#1A1408] font-bold shadow-sm',
  iconIdle:
    'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] border border-[#DDDAD3] dark:border-[#2C2824]',
  categoryBadge:
    'text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] border border-[#DDDAD3]/60 dark:border-[#2C2824]',
  kbd: 'font-mono text-xs px-1.5 py-0.5 rounded bg-white dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824]',
};

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
export interface CommandItem {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface CommandRowProps {
  item: CommandItem;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
}

// ============================================================================
// 4. HELPER FUNCTIONS
// ============================================================================
function filterCommandItems(items: CommandItem[], query: string): CommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
  );
}

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================
function CommandRowItem({ item, isSelected, onSelect, onHover }: CommandRowProps) {
  return (
    <div
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isSelected ? STYLES.itemActive : STYLES.itemIdle
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`text-base flex items-center justify-center w-8 h-8 rounded-md shrink-0 ${
            isSelected ? STYLES.iconActive : STYLES.iconIdle
          }`}
        >
          {item.icon}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate leading-tight">{item.title}</div>
          {item.subtitle && (
            <div className="text-xs text-[#5A5348] dark:text-[#B5AC9C] truncate mt-0.5">
              {item.subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pl-2 shrink-0">
        <span className={STYLES.categoryBadge}>{item.category}</span>
        {isSelected && (
          <span className="text-sm text-[#7A5818] dark:text-[#D4B26E]">
            <EnterOutlined />
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const isArabic = language === 'ar';

  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Fetch fresh projects on open
  useEffect(() => {
    if (open && user) {
      setQuery('');
      setSelectedIndex(0);
      DataService.getAccessibleProjects(user.uid)
        .then((projs) => setProjects(projs))
        .catch(() => {});
    }
  }, [open, user]);

  // Command items catalog
  const items: CommandItem[] = useMemo(() => {
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
      {
        id: 'action-create-task',
        category: isArabic ? 'الإجراءات السريعة' : 'Quick Actions',
        title: isArabic ? 'إنشاء مهمة جديدة' : 'Create New Task',
        subtitle: isArabic ? 'إضافة مهمة مباشرة إلى لوحة المهام' : 'Add a new task directly to sprint board',
        icon: <PlusOutlined />,
        action: () => {
          onClose();
          if (pathname?.startsWith('/projects/') && pathname !== '/projects/new') {
            window.dispatchEvent(new CustomEvent('taskflow:open-create-task'));
          } else if (projects.length > 0) {
            sessionStorage.setItem('taskflow_auto_create_task', 'true');
            router.push(`/projects/${projects[0].id}`);
          } else {
            router.push('/projects/new');
          }
        },
      },
      // Preferences
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

    // Accessible Projects Navigation
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
  }, [router, pathname, onClose, themeMode, toggleTheme, user, logout, projects, isArabic, toggleLanguage]);

  // Derived filtered list — Zero extra useEffect
  const filteredItems = useMemo(() => {
    return filterCommandItems(items, query);
  }, [items, query]);

  // Reset selected item pointer on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length]);

  function handleKeyDown(e: React.KeyboardEvent) {
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
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={PALETTE_CONFIG.modalWidth}
      centered
      className="taskflow-command-palette-modal"
      styles={{
        body: { padding: 0 },
      }}
    >
      <div
        className={`flex flex-col max-h-[480px] rounded-xl overflow-hidden ${
          themeMode === 'dark'
            ? 'bg-[#141211] text-[#EFE9DD] border border-[#2C2824]'
            : 'bg-white text-[#1B1915] border border-[#DDDAD3] shadow-2xl'
        }`}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#DDDAD3] dark:border-[#2C2824] flex items-center gap-3">
          <SearchOutlined className="text-[#7A5818] dark:text-[#D4B26E] text-base shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isArabic
                ? 'ابحث في الأوامر، المشاريع، الإجراءات...'
                : 'Search commands, projects, actions...'
            }
            className="flex-1 bg-transparent text-sm text-[#1B1915] dark:text-[#EFE9DD] placeholder-[#5A5348] dark:placeholder-[#B5AC9C] focus:outline-none"
            autoFocus
          />
          <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-[#5A5348] dark:text-[#B5AC9C]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div
          className={`overflow-y-auto p-2 divide-y divide-[#DDDAD3]/50 dark:divide-[#2C2824]/40 ${PALETTE_CONFIG.maxResultsHeight}`}
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#5A5348] dark:text-[#B5AC9C]">
              {isArabic
                ? 'لم يتم العثور على أوامر أو مشاريع مطابقة.'
                : 'No matching commands or projects found.'}
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <CommandRowItem
                key={item.id}
                item={item}
                isSelected={idx === selectedIndex}
                onSelect={item.action}
                onHover={() => setSelectedIndex(idx)}
              />
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-2.5 px-4 bg-[#EDECE8]/60 dark:bg-[#0C0B0A] border-t border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-between text-xs text-[#5A5348] dark:text-[#B5AC9C]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className={STYLES.kbd}>↑</kbd> <kbd className={STYLES.kbd}>↓</kbd>{' '}
              {isArabic ? 'تنقل' : 'Navigate'}
            </span>
            <span>
              <kbd className={STYLES.kbd}>↵</kbd> {isArabic ? 'اختيار' : 'Select'}
            </span>
            <span>
              <kbd className={STYLES.kbd}>Esc</kbd> {isArabic ? 'إغلاق' : 'Close'}
            </span>
          </div>
          <span className="text-xs text-[#736B5E] dark:text-[#9A9183] font-medium">TaskFlow</span>
        </div>
      </div>
    </Modal>
  );
}
