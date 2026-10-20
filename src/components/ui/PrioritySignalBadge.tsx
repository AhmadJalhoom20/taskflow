'use client';

// ============================================================================
// 1. IMPORTS & DEPENDENCIES
// ============================================================================
import React from 'react';
import { TaskPriority } from '@/types';

// ============================================================================
// 2. CONFIGURATION & STYLE PRESETS
// ============================================================================
export const PRIORITY_SIGNAL_THEMES: Record<
  TaskPriority,
  {
    container: string;
    text: string;
    border: string;
    level: 1 | 2 | 3;
    defaultArabic: string;
    defaultEnglish: string;
  }
> = {
  low: {
    container:
      'bg-[#F0FDF4] dark:bg-[#062419]/70 text-[#16A34A] dark:text-[#4ADE80] border-[#BBF7D0] dark:border-[#14532D]/70',
    text: 'text-[#16A34A] dark:text-[#4ADE80]',
    border: 'border-[#BBF7D0] dark:border-[#14532D]/70',
    level: 1,
    defaultArabic: 'منخفضة',
    defaultEnglish: 'Low',
  },
  medium: {
    container:
      'bg-[#EFF6FF] dark:bg-[#0D1E3A]/70 text-[#2563EB] dark:text-[#60A5FA] border-[#BFDBFE] dark:border-[#1D4ED8]/60',
    text: 'text-[#2563EB] dark:text-[#60A5FA]',
    border: 'border-[#BFDBFE] dark:border-[#1D4ED8]/60',
    level: 2,
    defaultArabic: 'متوسطة',
    defaultEnglish: 'Medium',
  },
  high: {
    container:
      'bg-[#FEF2F2] dark:bg-[#2C0F13]/70 text-[#DC2626] dark:text-[#F87171] border-[#FECACA] dark:border-[#991B1B]/60',
    text: 'text-[#DC2626] dark:text-[#F87171]',
    border: 'border-[#FECACA] dark:border-[#991B1B]/60',
    level: 3,
    defaultArabic: 'عالية',
    defaultEnglish: 'High',
  },
};

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
export interface PrioritySignalIconProps {
  priority: TaskPriority | string;
  className?: string;
  size?: 'sm' | 'md';
}

export interface PrioritySignalBadgeProps {
  priority: TaskPriority | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
  iconOnly?: boolean;
}

// ============================================================================
// 4. SUB-COMPONENT: NETWORK SIGNAL BARS ICON
// ============================================================================
/**
 * Renders 3 cellular/network-style signal bars.
 * - Low: 1 bar active, 2 dimmed
 * - Medium: 2 bars active, 1 dimmed (as requested by user)
 * - High: 3 bars active
 */
export function PrioritySignalIcon({
  priority,
  className = '',
  size = 'md',
}: PrioritySignalIconProps) {
  const normalized = (priority?.toLowerCase() || 'medium') as TaskPriority;
  const config = PRIORITY_SIGNAL_THEMES[normalized] || PRIORITY_SIGNAL_THEMES.medium;
  const level = config.level;

  const width = size === 'sm' ? 11 : 12;
  const height = size === 'sm' ? 10 : 11;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 inline-block align-middle ${className}`}
      aria-hidden="true"
    >
      {/* Bar 1 (Shortest - 4px) */}
      <rect
        x="0.5"
        y="7"
        width="2.5"
        height="4"
        rx="0.8"
        fill="currentColor"
        opacity={level >= 1 ? 1 : 0.22}
      />
      {/* Bar 2 (Medium - 7px) */}
      <rect
        x="4.5"
        y="4"
        width="2.5"
        height="7"
        rx="0.8"
        fill="currentColor"
        opacity={level >= 2 ? 1 : 0.22}
      />
      {/* Bar 3 (Tallest - 10px) */}
      <rect
        x="8.5"
        y="1"
        width="2.5"
        height="10"
        rx="0.8"
        fill="currentColor"
        opacity={level >= 3 ? 1 : 0.22}
      />
    </svg>
  );
}

// ============================================================================
// 5. MAIN COMPONENT: PRIORITY SIGNAL BADGE
// ============================================================================
/**
 * Renders a pill badge containing the priority label and cellular signal indicator.
 * Displays in LTR internal order so the text is on the left and the signal bars
 * are on the right, matching the reference design: [ متوسطة  ılı ]
 */
export function PrioritySignalBadge({
  priority,
  label,
  size = 'md',
  className = '',
  iconOnly = false,
}: PrioritySignalBadgeProps) {
  const normalized = (priority?.toLowerCase() || 'medium') as TaskPriority;
  const config = PRIORITY_SIGNAL_THEMES[normalized] || PRIORITY_SIGNAL_THEMES.medium;

  const displayLabel = label || config.defaultArabic;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-0.5 text-xs gap-1.5';

  if (iconOnly) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full border p-1 ${config.container} ${className}`}
      >
        <PrioritySignalIcon priority={normalized} size={size} />
      </span>
    );
  }

  return (
    <span
      dir="ltr"
      className={`inline-flex items-center rounded-full border font-semibold tracking-tight transition-colors shadow-xs ${config.container} ${sizeClasses} ${className}`}
    >
      <span className="leading-tight truncate">{displayLabel}</span>
      <PrioritySignalIcon priority={normalized} size={size} />
    </span>
  );
}

export default PrioritySignalBadge;
