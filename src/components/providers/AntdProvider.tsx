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
            colorPrimary: isDark ? '#D4B26E' : '#7A5818',
            colorPrimaryHover: isDark ? '#E2C88E' : '#946E24',
            colorPrimaryActive: isDark ? '#BFA05E' : '#5E420E',
            colorTextLightSolid: isDark ? '#1A1408' : '#FFFFFF',
            colorSuccess: isDark ? '#9CC5A1' : '#235832',
            colorWarning: isDark ? '#D4B26E' : '#7A5818',
            colorError: isDark ? '#EE8A78' : '#9C2E1F',
            colorInfo: isDark ? '#8DB4E8' : '#1E4D8A',
            borderRadius: 6,
            borderRadiusLG: 10,
            borderRadiusSM: 4,
            borderRadiusXS: 3,
            fontSize: isArabic ? 15.5 : 15,
            fontSizeSM: isArabic ? 13.5 : 13,
            fontSizeLG: isArabic ? 18 : 17.5,
            fontSizeXL: isArabic ? 22 : 21,
            controlHeight: 38,
            controlHeightSM: 30,
            controlHeightLG: 44,
            fontFamily: isArabic
              ? '"IBM Plex Sans Arabic", system-ui, -apple-system, sans-serif'
              : '"Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            colorBgContainer: isDark ? '#141210' : '#FFFFFF',
            colorBgElevated: isDark ? '#24211D' : '#FFFFFF',
            colorBgLayout: isDark ? '#0A0908' : '#F4F4F1',
            colorBorder: isDark ? '#2A2621' : '#DAD7CF',
            colorBorderSecondary: isDark ? '#3D3730' : '#BCB8AC',
            colorText: isDark ? '#F2EDE4' : '#141311',
            colorTextSecondary: isDark ? '#B8AFA0' : '#4F493F',
            colorTextDescription: isDark ? '#8F8575' : '#635B4E',
          },
          components: {
            Card: {
              headerBg: 'transparent',
              paddingLG: 20,
            },
            Button: {
              fontWeight: 600,
              controlHeight: 40,
              borderRadius: 6,
              defaultBorderColor: isDark ? '#2A2621' : '#DAD7CF',
              defaultGhostBorderColor: isDark ? '#2A2621' : '#DAD7CF',
              paddingInline: 16,
            },
            Table: {
              headerBg: isDark ? '#1C1A17' : '#EBEAE5',
              headerBorderRadius: 6,
              headerColor: isDark ? '#B8AFA0' : '#4F493F',
              rowHoverBg: isDark ? '#201E1A' : '#E5E3DC',
            },
            Tag: {
              borderRadiusSM: 4,
            },
            Modal: {
              contentBg: isDark ? '#24211D' : '#FFFFFF',
              headerBg: isDark ? '#24211D' : '#FFFFFF',
              borderRadiusLG: 12,
            },
            Segmented: {
              trackBg: isDark ? '#1C1A17' : '#EBEAE5',
              itemSelectedBg: isDark ? '#24211D' : '#FFFFFF',
              itemSelectedColor: isDark ? '#D4B26E' : '#7A5818',
              borderRadius: 6,
            },
            Select: {
              controlHeight: 40,
              borderRadius: 6,
            },
            Input: {
              controlHeight: 40,
              borderRadius: 6,
            },
            Drawer: {
              colorBgElevated: isDark ? '#1C1A17' : '#FFFFFF',
            },
            Tooltip: {
              colorBgSpotlight: isDark ? '#1C1A17' : '#1B1915',
              colorTextLightSolid: isDark ? '#EFE9DD' : '#FFFFFF',
              borderRadius: 6,
            },
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
