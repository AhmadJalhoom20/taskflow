'use client';

// ============================================================================
// 1. الاستيرادات (Imports)
// ============================================================================
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Drawer } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import AppSidebar from '@/components/layout/AppSidebar';
import CommandPalette from '@/components/ui/CommandPalette';
import KeyboardShortcutsModal from '@/components/ui/KeyboardShortcutsModal';

// ============================================================================
// 2. منطقة التعديل السريع (Constants & Styles)
// ============================================================================
const CONFIG = {
  sidebarStorageKey: 'taskflow_sidebar_collapsed',
  publicRoutes: ['/', '/login', '/register'],
} as const;

const STYLES = {
  rootContainer:
    'h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors overflow-hidden',
  publicMain: 'flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto',
  appBody: 'flex-1 flex flex-row min-h-0 w-full overflow-hidden relative bg-[var(--bg)]',
  appMain: 'flex-1 min-w-0 p-3 sm:p-4 lg:p-5 w-full overflow-y-auto bg-[var(--bg)]',
} as const;

// ============================================================================
// 3. الأنواع والواجهات (Types & Interfaces)
// ============================================================================
interface AppShellProps {
  children: React.ReactNode;
}

// ============================================================================
// 4. دوال مساعدة (Helper Functions)
// ============================================================================
function getInitialSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem(CONFIG.sidebarStorageKey);
    return saved === 'true';
  } catch {
    return false;
  }
}

// ============================================================================
// 6. المكون الرئيسي (AppShell)
// ============================================================================
export default function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(getInitialSidebarCollapsed);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // إغلاق درج الموبايل عند التنقل
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // مستمع اختصارات الكيبورد الشاملة: Cmd+K للبحث و ? لدليل الاختصارات
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '?' && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileDrawerOpen((prev) => !prev);
      return;
    }
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CONFIG.sidebarStorageKey, String(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const isPublicPage = !user || CONFIG.publicRoutes.includes(pathname as any);

  return (
    <div className={STYLES.rootContainer}>
      {/* النافبار العلوي */}
      <Navbar
        onToggleSidebar={!isPublicPage ? handleToggleSidebar : undefined}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
      />

      {isPublicPage ? (
        <main className={STYLES.publicMain}>{children}</main>
      ) : (
        <div className={STYLES.appBody}>
          {/* السايد بار بالديسكتوب */}
          <div className="hidden md:flex h-full shrink-0">
            <AppSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleSidebar}
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            />
          </div>

          {/* درج السايد بار بالموبايل */}
          <Drawer
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            placement={isRTL ? 'right' : 'left'}
            width={280}
            closable={false}
            styles={{
              body: {
                padding: 0,
                backgroundColor: 'var(--bg)',
              },
            }}
            className="md:hidden"
          >
            <AppSidebar
              collapsed={false}
              onToggleCollapse={() => setMobileDrawerOpen(false)}
              onOpenCommandPalette={() => {
                setMobileDrawerOpen(false);
                setCommandPaletteOpen(true);
              }}
            />
          </Drawer>

          {/* منطقة المحتوى الرئيسي */}
          <main className={STYLES.appMain}>{children}</main>
        </div>
      )}

      {/* نافذة الأوامر السريعة والبحث الشامل */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* نافذة دليل اختصارات لوحة المفاتيح عبر زر ? */}
      <KeyboardShortcutsModal
        open={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
}
