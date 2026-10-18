'use client';

import React from 'react';
import { Card, Row, Col, Skeleton } from 'antd';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/80 dark:border-[#1e2430]">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-[#161c26] rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-[#12161f] rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 bg-slate-200 dark:bg-[#161c26] rounded-lg" />
        </div>
      </div>

      {/* 4 Metrics Cards Skeleton */}
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card
              variant="outlined"
              className="border-slate-200/80 dark:border-[#1e2430] bg-white dark:bg-[#12161f] rounded-xl p-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="h-3 w-20 bg-slate-200 dark:bg-[#1a2230] rounded" />
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#161c26]" />
              </div>
              <div className="h-8 w-16 bg-slate-300 dark:bg-[#20293a] rounded-lg my-2" />
              <div className="h-2 w-full bg-slate-100 dark:bg-[#161c26] rounded-full mt-3" />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Projects Grid Skeleton */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <div className="h-5 w-36 bg-slate-200 dark:bg-[#161c26] rounded" />
          <div className="h-8 w-64 bg-slate-100 dark:bg-[#161c26] rounded-lg hidden sm:block" />
        </div>

        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} md={12} lg={8} key={i}>
              <Card
                variant="outlined"
                className="border-slate-200/80 dark:border-[#1e2430] bg-white dark:bg-[#12161f] rounded-xl p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-3/4 bg-slate-200 dark:bg-[#1e2636] rounded" />
                    <div className="h-3 w-full bg-slate-100 dark:bg-[#161c26] rounded" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-[#1a2230]" />
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-[#161c26] rounded-full" />
                <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-[#181f2c]">
                  <div className="h-4 w-20 bg-slate-100 dark:bg-[#161c26] rounded" />
                  <div className="h-4 w-16 bg-slate-100 dark:bg-[#161c26] rounded" />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
