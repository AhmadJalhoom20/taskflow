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
    <div className={`inline-flex items-center justify-center gap-2.5 text-slate-500 dark:text-slate-400 ${className}`} role="status">
      <div
        className={`${dimensions} rounded-full border-slate-300 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400 animate-spin`}
        aria-hidden="true"
      />
      {tip ? (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {tip}
        </span>
      ) : (
        <span className="sr-only">Loading...</span>
      )}
    </div>
  );
}
