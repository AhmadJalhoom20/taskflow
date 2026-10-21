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
      'bg-[#EBEAE5] dark:bg-[#1C1A17] text-[#4F493F] dark:text-[#B8AFA0] border-[#DAD7CF] dark:border-[#2A2621]',
    text: 'text-[#4F493F] dark:text-[#B8AFA0]',
    border: 'border-[#DAD7CF] dark:border-[#2A2621]',
    level: 1,
    defaultArabic: 'منخفضة',
    defaultEnglish: 'Low',
  },
  medium: {
    container:
      'bg-[#E3EDF8] dark:bg-[#132034] text-[#174378] dark:text-[#8DB4E8] border-[#8DB4E8]/30 dark:border-[#8DB4E8]/30',
    text: 'text-[#174378] dark:text-[#8DB4E8]',
    border: 'border-[#8DB4E8]/30 dark:border-[#8DB4E8]/30',
    level: 2,
    defaultArabic: 'متوسطة',
    defaultEnglish: 'Medium',
  },
  high: {
    container:
      'bg-[#FCE8E5] dark:bg-[#2E1613] text-[#8E2517] dark:text-[#EE8A78] border-[#EE8A78]/30 dark:border-[#EE8A78]/30',
    text: 'text-[#8E2517] dark:text-[#EE8A78]',
    border: 'border-[#EE8A78]/30 dark:border-[#EE8A78]/30',
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
