'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl' | 'display';
  showText?: boolean;
  className?: string;
}

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

  const dimensions = {
    small: { icon: 22, text: 'text-sm', badge: 'text-[9px]', gap: 'gap-2' },
    medium: { icon: 28, text: 'text-base', badge: 'text-[10px]', gap: 'gap-2.5' },
    large: { icon: 36, text: 'text-xl', badge: 'text-[11px]', gap: 'gap-3' },
    xl: { icon: 44, text: 'text-2xl', badge: 'text-xs', gap: 'gap-3.5' },
    display: { icon: 52, text: 'text-3xl', badge: 'text-xs', gap: 'gap-4' },
  }[size] || { icon: 28, text: 'text-base', badge: 'text-[10px]', gap: 'gap-2.5' };

  return (
    <div className={`inline-flex items-center ${dimensions.gap} select-none ${className}`}>
      {/* Precision Geometric Architectural Mark */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
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
            rx="7"
            className="fill-slate-900 dark:fill-blue-600"
          />
          {/* Crisp geometric task layers */}
          <rect x="8" y="8" width="16" height="3" rx="1.5" fill="#ffffff" />
          <rect x="8" y="14.5" width="11" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.85" />
          <rect x="8" y="21" width="7" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.65" />
          {/* Leading directional mark */}
          <circle cx="21.5" cy="19.5" r="2.5" fill="#38bdf8" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center">
            <span className={`font-black tracking-tight text-slate-950 dark:text-white ${dimensions.text} font-sans`}>
              Task<span className="text-blue-600 dark:text-blue-400 font-black">Flow</span>
            </span>
          </div>
          <span className={`uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold font-mono ${dimensions.badge}`}>
            {isArabic ? 'طاقات المؤسسية' : 'TAQAT Enterprise'}
          </span>
        </div>
      )}
    </div>
  );
}
