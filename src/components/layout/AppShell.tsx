'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Drawer } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import AppSidebar from '@/components/layout/AppSidebar';
import CommandPalette from '@/components/ui/CommandPalette';

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
const CONFIG = {
  sidebarStorageKey: 'taskflow_sidebar_collapsed',
  publicRoutes: ['/', '/login', '/register'],
} as const;

const STYLES = {
  rootContainer:
    'h-screen flex flex-col bg-[#F4F4F2] dark:bg-[#0C0B0A] text-[#1B1915] dark:text-[#EFE9DD] transition-colors overflow-hidden',
  publicMain: 'flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto',
  appBody: 'flex-1 flex min-h-0 w-full overflow-hidden relative',
  appMain: 'flex-1 min-w-0 p-3 sm:p-4 lg:p-5 w-full overflow-y-auto',
} as const;

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
interface AppShellProps {
  children: React.ReactNode;
}

// ============================================================================
// 4. HELPER FUNCTIONS & HOOKS
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
// 5. SUB-COMPONENTS
// ============================================================================
// (Sub-components can be extracted here as shell grows)

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export default function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(getInitialSidebarCollapsed);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Global Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
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
      <Navbar
        onToggleSidebar={!isPublicPage ? handleToggleSidebar : undefined}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {isPublicPage ? (
        <main className={STYLES.publicMain}>{children}</main>
      ) : (
        <div className={STYLES.appBody}>
          {/* Desktop Workspace Sidebar */}
          <div className="hidden md:flex h-full shrink-0">
            <AppSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleSidebar}
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            />
          </div>

          {/* Mobile Workspace Drawer */}
          <Drawer
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            placement={isRTL ? 'right' : 'left'}
            width={280}
            closable={false}
            styles={{ body: { padding: 0 } }}
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

          {/* Main Content Viewport */}
          <main className={STYLES.appMain}>{children}</main>
        </div>
      )}

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
