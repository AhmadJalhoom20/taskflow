'use client';

import React from 'react';
import { Card, Row, Col } from 'antd';

export default function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb & Title Skeleton */}
      <div className="space-y-3 pb-3 border-b border-slate-200/80 dark:border-[#1e2430]">
        <div className="h-4 w-44 bg-slate-200 dark:bg-[#161c26] rounded" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-300 dark:bg-[#1e2636] rounded-lg" />
            <div className="h-3.5 w-80 bg-slate-100 dark:bg-[#12161f] rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-slate-200 dark:bg-[#161c26] rounded-lg" />
            <div className="h-9 w-32 bg-slate-200 dark:bg-[#161c26] rounded-lg" />
          </div>
        </div>
      </div>

      {/* Metrics Strip Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-100/60 dark:bg-[#121620] border border-slate-200 dark:border-[#1e2430]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1.5 p-2">
            <div className="h-3 w-16 bg-slate-200 dark:bg-[#1a2230] rounded" />
            <div className="h-6 w-12 bg-slate-300 dark:bg-[#20293a] rounded" />
          </div>
        ))}
      </div>

      {/* Filter / View Toolbar Skeleton */}
      <div className="flex justify-between items-center gap-3">
        <div className="h-9 w-44 bg-slate-200 dark:bg-[#161c26] rounded-lg" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-slate-100 dark:bg-[#161c26] rounded-lg" />
          <div className="h-9 w-28 bg-slate-100 dark:bg-[#161c26] rounded-lg" />
        </div>
      </div>

      {/* Kanban 3-Column Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col h-[520px] rounded-xl border border-slate-200 dark:border-[#1e2430] bg-slate-50/60 dark:bg-[#0e121a]/60 p-3 space-y-3"
          >
            <div className="flex justify-between items-center px-1 pb-2 border-b border-slate-200/60 dark:border-[#1a2230]">
              <div className="h-4 w-24 bg-slate-200 dark:bg-[#1a2230] rounded" />
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#1a2230]" />
            </div>

            {[1, 2].map((cardIndex) => (
              <Card
                key={cardIndex}
                variant="outlined"
                className="border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] rounded-lg p-3 space-y-2 shadow-none"
              >
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-[#1a2230] rounded" />
                <div className="h-3 w-full bg-slate-100 dark:bg-[#161c26] rounded" />
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 dark:border-[#181f2c]">
                  <div className="h-3 w-12 bg-slate-100 dark:bg-[#161c26] rounded" />
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#1a2230]" />
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
