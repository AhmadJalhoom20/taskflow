'use client';

// ============================================================================
// 1. الاستيرادات (Imports)
// بنجيب المكونات الأساسية: النافبار، السايد بار، الدرج للموبايل، ومربع الأوامر
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
// 2. منطقة التعديل السريع (Constants & Styles)
// هان مفتاح الحفظ بالمتصفح، والصفحات العامة، والستايل الأساسي لهيكل الموقع
// ============================================================================
const CONFIG = {
  // مفتاح تخزين حالة السايد بار بالـ localStorage عشان يتذكر إذا كان مفتوح أو مطوي
  sidebarStorageKey: 'taskflow_sidebar_collapsed',
  // الصفحات العامة اللي ما بتحتاج سايد بار
  publicRoutes: ['/', '/login', '/register'],
} as const;

// الستايلات الأساسية - مثبتين الارتفاع h-screen و flex-row وموحدين الأرضية مع الكانفاس بدون أي تباين مصطنع
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
// بنجيب حالة السايد بار المحفوظة بالمتصفح أول ما يشتغل الموقع
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
// 5. المكونات الفرعية (Sub-Components)
// ============================================================================
// المكونات الفرعية مدمجة بشكل مباشر داخل الهيكل

// ============================================================================
// 6. المكون الرئيسي (AppShell)
// الهيكل العام: النافبار فوق على أرضية الكانفاس، وجواه السايد بار ع جنب والمحتوى بالنص
// ============================================================================
export default function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(getInitialSidebarCollapsed);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // أول ما يتغير الرابط بنسكر درج الموبايل تلقائيا عشان ما يضل مغطي الشاشة
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // اختصار الكيبورد السريع (Cmd+K أو Ctrl+K) لفتح باليت الأوامر والبحث من أي مكان
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

  // دالة فتح/تسكير السايد بار: بالتلفون بنفتح الـ Drawer، وبالكمبيوتر بنطوي السايد بار وبنحفظ الحالة
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
          // نتجاهل أي خطأ بحفظ الـ localStorage
        }
      }
      return next;
    });
  };

  const isPublicPage = !user || CONFIG.publicRoutes.includes(pathname as any);

  return (
    <div className={STYLES.rootContainer}>
      {/* النافبار العلوي المبني على نفس كانفاس الموقع بدون فريم زجاجي أو بلور مصطنع */}
      <Navbar
        onToggleSidebar={!isPublicPage ? handleToggleSidebar : undefined}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {isPublicPage ? (
        // إذا صفحة عامة (زي الهبوط أو تسجيل الدخول) بنعرض المحتوى لحاله بدون سايد بار
        <main className={STYLES.publicMain}>{children}</main>
      ) : (
        // جسم التطبيق لمساحة العمل
        <div className={STYLES.appBody}>
          {/* السايد بار بالديسكتوب: مثبت h-full و shrink-0 وموحد مع أرضية الكانفاس */}
          <div className="hidden md:flex h-full shrink-0">
            <AppSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleSidebar}
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            />
          </div>

          {/* درج السايد بار بالموبايل: بيفتح بسلاسة وبياخد اتجاه اليمين بالعربي والشمال بالإنجليزي */}
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

          {/* منطقة المحتوى الرئيسي والصفحات */}
          <main className={STYLES.appMain}>{children}</main>
        </div>
      )}

      {/* نافذة الأوامر السريعة والبحث الشامل */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
