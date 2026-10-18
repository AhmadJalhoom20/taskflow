import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import AntdProvider from '@/components/providers/AntdProvider';
import Navbar from '@/components/layout/Navbar';
import TopProgressBar from '@/components/ui/TopProgressBar';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 transition-colors">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <LanguageProvider>
          <ThemeProvider>
            <AntdProvider>
              <AuthProvider>
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  {children}
                </main>
              </AuthProvider>
            </AntdProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
