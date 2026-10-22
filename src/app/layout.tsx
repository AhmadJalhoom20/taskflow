import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import AntdProvider from '@/components/providers/AntdProvider';
import AppShell from '@/components/layout/AppShell';
import TopProgressBar from '@/components/ui/TopProgressBar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'TaskFlow | Project & Task Management System',
  description:
    'Enterprise project and task management system built with Next.js, Ant Design, and Standalone SQL Backend Service.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link key="font-preconnect-1" rel="preconnect" href="https://fonts.googleapis.com" />
        <link key="font-preconnect-2" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          key="font-preload"
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Instrument+Sans:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap"
        />
        <link
          key="font-stylesheet"
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Instrument+Sans:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[#F4F4F2] dark:bg-[#0C0B0A] text-[#1B1915] dark:text-[#EFE9DD] transition-colors selection:bg-[#D4B26E]/30">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <LanguageProvider>
          <ThemeProvider>
            <AntdProvider>
              <AuthProvider>
                <AppShell>
                  {children}
                </AppShell>
              </AuthProvider>
            </AntdProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
