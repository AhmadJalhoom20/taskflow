'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, Typography } from 'antd';
import { RiseOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { CompletionTrendPoint } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

const { Title, Text } = Typography;

// ============================================================================
// 2. CONFIGURATION & STYLES (EASY EDIT ZONE)
// ============================================================================
const CHART_THEME = {
  dark: {
    accentLine: '#D4B26E',
    secondaryLine: '#8DB4E8',
    gridColor: 'rgba(44, 40, 36, 0.4)',
    tickColor: '#9A9183',
    tooltipBg: '#141211',
    tooltipBorder: '#2C2824',
    tooltipText: '#EFE9DD',
  },
  light: {
    accentLine: '#7A5818',
    secondaryLine: '#1E4D8A',
    gridColor: 'rgba(221, 218, 211, 0.6)',
    tickColor: '#736B5E',
    tooltipBg: '#FFFFFF',
    tooltipBorder: '#DDDAD3',
    tooltipText: '#1B1915',
  },
} as const;

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
export interface CompletionTrendChartProps {
  data?: CompletionTrendPoint[];
  isLoading?: boolean;
}

interface ChartThemeTokens {
  accentLine: string;
  secondaryLine: string;
  gridColor: string;
  tickColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isArabic: boolean;
  theme: ChartThemeTokens;
}

// ============================================================================
// 4. HELPER FUNCTIONS
// ============================================================================
function generateFallback7DayData(): CompletionTrendPoint[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const list: CompletionTrendPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    list.push({
      date: d.toISOString().split('T')[0],
      day: days[d.getDay()],
      completed: 0,
      created: 0,
    });
  }
  return list;
}

function localizeDayName(dayEn: string, isArabic: boolean): string {
  if (!isArabic) return dayEn;
  const map: Record<string, string> = {
    Sun: 'الأحد',
    Mon: 'الإثنين',
    Tue: 'الثلاثاء',
    Wed: 'الأربعاء',
    Thu: 'الخميس',
    Fri: 'الجمعة',
    Sat: 'السبت',
  };
  return map[dayEn] || dayEn;
}

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================
function CustomChartTooltip({
  active,
  payload,
  label,
  isArabic,
  theme,
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const completedVal = payload.find((p) => p.dataKey === 'completed')?.value ?? 0;
  const createdVal = payload.find((p) => p.dataKey === 'created')?.value ?? 0;

  return (
    <div
      style={{
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        color: theme.tooltipText,
      }}
      className="p-3 rounded-lg border shadow-tactile-card text-xs space-y-1.5 font-sans min-w-[140px]"
    >
      <div className="font-bold border-b border-[var(--line)] pb-1 text-[11px] font-mono">
        {label}
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[var(--text-2)]">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.accentLine }}
          />
          {isArabic ? 'المهام المنجزة:' : 'Completed:'}
        </span>
        <span className="font-bold font-mono text-[var(--accent)] tnum">
          {completedVal}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[var(--text-2)]">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.secondaryLine }}
          />
          {isArabic ? 'المهام المنشأة:' : 'Created:'}
        </span>
        <span className="font-bold font-mono text-[var(--st-prog-fg)] tnum">
          {createdVal}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export default function CompletionTrendChart({
  data,
  isLoading,
}: CompletionTrendChartProps) {
  const { language } = useLanguage();
  const { themeMode } = useTheme();
  const isArabic = language === 'ar';

  const currentTheme = themeMode === 'dark' ? CHART_THEME.dark : CHART_THEME.light;

  const chartData = React.useMemo(() => {
    const source = data && data.length > 0 ? data : generateFallback7DayData();
    return source.map((point) => ({
      ...point,
      displayDay: localizeDayName(point.day, isArabic),
      shortDate: point.date.slice(5), // 'MM-DD'
    }));
  }, [data, isArabic]);

  const total7DayCompleted = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.completed, 0);
  }, [chartData]);

  const total7DayCreated = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.created, 0);
  }, [chartData]);

  return (
    <Card
      variant="outlined"
      className="tactile-card border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark overflow-hidden"
    >
      <div className="p-1 space-y-4">
        {/* Header with Title and 7-Day Summary Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDDAD3] dark:border-[#2C2824]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <Title
                level={4}
                className="!mb-0 !text-sm sm:!text-base !font-bold text-[#1B1915] dark:text-[#EFE9DD] font-display"
              >
                {isArabic ? 'مؤشر إنجاز المهام (آخر 7 أيام)' : 'Task Completion Trends (Last 7 Days)'}
              </Title>
            </div>
            <Text className="text-xs text-[#5A5348] dark:text-[#9A9183]">
              {isArabic
                ? 'تحليل ديناميكي لسرعة إنجاز المهام اليومية ونسبة تدفق العمل'
                : 'Deterministic daily throughput and completed sprint lifecycle units'}
            </Text>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-xs font-mono">
              <CheckCircleOutlined className="text-[#235832] dark:text-[#9CC5A1]" />
              <span className="text-[#5A5348] dark:text-[#9A9183]">
                {isArabic ? 'إجمالي المنجز:' : 'Done:'}
              </span>
              <span className="font-bold text-[#7A5818] dark:text-[#D4B26E] tnum">
                {total7DayCompleted}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-xs font-mono">
              <RiseOutlined className="text-[#1E4D8A] dark:text-[#8DB4E8]" />
              <span className="text-[#5A5348] dark:text-[#9A9183]">
                {isArabic ? 'المنشأ:' : 'Created:'}
              </span>
              <span className="font-bold text-[#1E4D8A] dark:text-[#8DB4E8] tnum">
                {total7DayCreated}
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-56 pt-2 select-none" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                stroke={currentTheme.gridColor}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="displayDay"
                stroke={currentTheme.tickColor}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: currentTheme.gridColor }}
              />
              <YAxis
                allowDecimals={false}
                stroke={currentTheme.tickColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={
                  <CustomChartTooltip
                    isArabic={isArabic}
                    theme={currentTheme}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="completed"
                name={isArabic ? 'مكتمل' : 'Completed'}
                stroke={currentTheme.accentLine}
                strokeWidth={2.5}
                dot={{
                  r: 3.5,
                  fill: currentTheme.tooltipBg,
                  stroke: currentTheme.accentLine,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: currentTheme.accentLine,
                  stroke: currentTheme.tooltipBg,
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                dataKey="created"
                name={isArabic ? 'منشأ' : 'Created'}
                stroke={currentTheme.secondaryLine}
                strokeWidth={1.75}
                strokeDasharray="4 4"
                dot={{
                  r: 2.5,
                  fill: currentTheme.tooltipBg,
                  stroke: currentTheme.secondaryLine,
                  strokeWidth: 1.5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
