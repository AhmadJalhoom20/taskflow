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
            colorPrimary: '#f59e0b',
            colorPrimaryHover: '#fbbf24',
            colorPrimaryActive: '#d97706',
            colorTextLightSolid: '#090d16',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#f43f5e',
            colorInfo: '#06b6d4',
            borderRadius: 7,
            borderRadiusLG: 10,
            borderRadiusSM: 5,
            fontFamily: isArabic
              ? '"IBM Plex Sans Arabic", "Cairo", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            colorBgContainer: isDark ? '#0e131f' : '#ffffff',
            colorBgElevated: isDark ? '#161d2e' : '#ffffff',
            colorBgLayout: isDark ? '#080b11' : '#f7f8fa',
            colorBorder: isDark ? '#1b2336' : '#e2e6ee',
            colorBorderSecondary: isDark ? 'rgba(255, 255, 255, 0.07)' : '#edf0f6',
            colorText: isDark ? '#f8fafc' : '#090d16',
            colorTextSecondary: isDark ? '#94a3b8' : '#475569',
          },
          components: {
            Card: {
              headerBg: 'transparent',
              paddingLG: 22,
            },
            Button: {
              fontWeight: 600,
              controlHeight: 38,
              borderRadius: 7,
              defaultBorderColor: isDark ? '#1b2336' : '#e2e6ee',
              defaultGhostBorderColor: isDark ? '#1b2336' : '#e2e6ee',
            },
            Table: {
              headerBg: isDark ? '#141a29' : '#f0f3f8',
              headerBorderRadius: 7,
              headerColor: isDark ? '#94a3b8' : '#475569',
              rowHoverBg: isDark ? '#161d2e' : '#f7f8fa',
            },
            Tag: {
              borderRadiusSM: 4,
            },
            Modal: {
              contentBg: isDark ? '#0e131f' : '#ffffff',
              headerBg: isDark ? '#0e131f' : '#ffffff',
              borderRadiusLG: 12,
            },
            Segmented: {
              trackBg: isDark ? '#141a29' : '#f0f3f8',
              itemSelectedBg: isDark ? '#1b2336' : '#ffffff',
              borderRadius: 7,
            },
            Select: {
              controlHeight: 38,
              borderRadius: 7,
            },
            Input: {
              controlHeight: 38,
              borderRadius: 7,
            },
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
