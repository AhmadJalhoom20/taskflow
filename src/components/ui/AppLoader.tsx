'use client';

import React from 'react';

interface AppLoaderProps {
  tip?: React.ReactNode;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

export default function AppLoader({
  tip,
  size = 'default',
  className = '',
}: AppLoaderProps) {
  const dimensions = {
    small: 'w-4 h-4 border-2',
    default: 'w-5 h-5 border-2',
    large: 'w-8 h-8 border-[2.5px]',
  }[size] || 'w-5 h-5 border-2';

  return (
    <div className={`inline-flex items-center justify-center gap-2.5 text-[#5A5348] dark:text-[#9A9183] ${className}`} role="status">
      <div
        className={`${dimensions} rounded-full border-[#DDDAD3] dark:border-[#2C2824] border-t-[#7A5818] dark:border-t-[#D4B26E] animate-spin`}
        aria-hidden="true"
      />
      {tip ? (
        <span className="text-xs font-medium text-[#1B1915] dark:text-[#EFE9DD]">
          {tip}
        </span>
      ) : (
        <span className="sr-only">Loading...</span>
      )}
    </div>
  );
}
