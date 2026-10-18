'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme, App } from 'antd';
import enUS from 'antd/locale/en_US';
import arEG from 'antd/locale/ar_EG';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  const { themeMode } = useTheme();
  const { language, direction } = useLanguage();

  const isDark = themeMode === 'dark';
  const isArabic = language === 'ar';

  return (
    <AntdRegistry>
      <ConfigProvider
        locale={isArabic ? arEG : enUS}
        direction={direction}
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: isDark ? '#3b82f6' : '#2563eb',
            colorPrimaryHover: isDark ? '#60a5fa' : '#1d4ed8',
            colorPrimaryActive: isDark ? '#2563eb' : '#1e40af',
            colorSuccess: isDark ? '#10b981' : '#059669',
            colorWarning: isDark ? '#f59e0b' : '#d97706',
            colorError: isDark ? '#f43f5e' : '#e11d48',
            colorInfo: isDark ? '#38bdf8' : '#0284c7',
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 6,
            fontFamily: isArabic
              ? '"IBM Plex Sans Arabic", "Cairo", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            colorBgContainer: isDark ? '#111827' : '#ffffff',
            colorBgElevated: isDark ? '#162032' : '#ffffff',
            colorBgLayout: isDark ? '#0b0f19' : '#f8fafc',
            colorBorder: isDark ? '#1f293d' : '#e2e8f0',
            colorBorderSecondary: isDark ? '#192233' : '#edf2f7',
            colorText: isDark ? '#f8fafc' : '#0f172a',
            colorTextSecondary: isDark ? '#94a3b8' : '#64748b',
          },
          components: {
            Card: {
              headerBg: 'transparent',
              paddingLG: 22,
            },
            Button: {
              fontWeight: 500,
              controlHeight: 38,
              borderRadius: 8,
              defaultBorderColor: isDark ? '#1f293d' : '#e2e8f0',
              defaultGhostBorderColor: isDark ? '#1f293d' : '#e2e8f0',
            },
            Table: {
              headerBg: isDark ? '#162032' : '#f8fafc',
              headerBorderRadius: 8,
              headerColor: isDark ? '#94a3b8' : '#64748b',
              rowHoverBg: isDark ? '#172236' : '#f1f5f9',
            },
            Tag: {
              borderRadiusSM: 5,
            },
            Modal: {
              contentBg: isDark ? '#111827' : '#ffffff',
              headerBg: isDark ? '#111827' : '#ffffff',
              borderRadiusLG: 14,
            },
            Segmented: {
              trackBg: isDark ? '#162032' : '#f1f5f9',
              itemSelectedBg: isDark ? '#1f293d' : '#ffffff',
              borderRadius: 8,
            },
            Select: {
              controlHeight: 38,
              borderRadius: 8,
            },
            Input: {
              controlHeight: 38,
              borderRadius: 8,
            },
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
