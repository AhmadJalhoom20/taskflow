'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
// Brand name variations and sizing tokens.
const BRAND_NAMES = {
  en: { prefix: 'Task', suffix: 'Flow' },
  ar: { prefix: 'تاسك_', suffix: 'فلو' },
} as const;

const SIZE_PRESETS = {
  small: { icon: 22, text: 'text-sm', gap: 'gap-2' },
  medium: { icon: 28, text: 'text-base', gap: 'gap-2.5' },
  large: { icon: 36, text: 'text-xl', gap: 'gap-3' },
  xl: { icon: 44, text: 'text-2xl', gap: 'gap-3.5' },
  display: { icon: 52, text: 'text-3xl', gap: 'gap-4' },
} as const;

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
type LogoSize = keyof typeof SIZE_PRESETS;

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}

// ============================================================================
// 4. HELPER FUNCTIONS & HOOKS
// ============================================================================
// (Helper functions for SVG calculations if needed)

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================
interface GeometricMarkProps {
  dimension: number;
}

function GeometricMark({ dimension }: GeometricMarkProps) {
  return (
    <div className="relative flex-shrink-0 flex items-center justify-center">
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Base rounded squircle container */}
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="6"
          className="fill-[#11100E] stroke-[#2C2824]"
          strokeWidth="1"
        />
        {/* Crisp geometric task layers */}
        <rect x="7.5" y="8" width="17" height="2" rx="1" fill="#EFE9DD" />
        <rect x="7.5" y="14" width="12" height="2" rx="1" fill="#EFE9DD" fillOpacity="0.8" />
        <rect x="7.5" y="20" width="8" height="2" rx="1" fill="#EFE9DD" fillOpacity="0.55" />
        {/* Champagne Gold Focal Mark */}
        <circle cx="21" cy="20" r="2.75" fill="#D4B26E" />
      </svg>
    </div>
  );
}

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export default function Logo({
  size = 'medium',
  showText = true,
  className = '',
}: LogoProps) {
  let isArabic = false;
  try {
    const langContext = useLanguage();
    isArabic = langContext?.language === 'ar';
  } catch {
    isArabic = false;
  }

  const dimensions = SIZE_PRESETS[size] || SIZE_PRESETS.medium;
  const brand = isArabic ? BRAND_NAMES.ar : BRAND_NAMES.en;

  return (
    <div className={`inline-flex items-center ${dimensions.gap} select-none ${className}`}>
      {/* Precision Geometric Architectural Mark (Vector SVG) */}
      <GeometricMark dimension={dimensions.icon} />

      {/* Localized Brand Text */}
      {showText && (
        <div className="flex items-center">
          <span
            className={`font-sans font-bold tracking-tight text-[#1B1915] dark:text-[#EFE9DD] ${dimensions.text}`}
          >
            {brand.prefix}
            <span className="text-[#7A5818] dark:text-[#D4B26E]">{brand.suffix}</span>
          </span>
        </div>
      )}
    </div>
  );
}
