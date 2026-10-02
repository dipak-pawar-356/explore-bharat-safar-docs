'use client';

// Explore Bharat Safar — Revenue Analytics
// Reference: EBS-DOC-13-ADMIN Section 2, EBS-BLU-21-PAYMENT
// Sprint 9: Item 9 (Revenue Analytics)

import * as React from 'react';
import { AnalyticsPanel } from '@/components/admin/analytics-panel';
import { DateRangePreset } from '@ebs/types';

export default function RevenueAnalyticsPage() {
  const [datePreset, setDatePreset] = React.useState(DateRangePreset.THIS_MONTH);

  const metrics = [
    { label: 'Total Revenue', value: '₹4.71 Cr', change: 18.4, icon: '💰' },
    { label: 'Collected Upfront', value: '₹3.92 Cr', change: 16.2, icon: '✅' },
    { label: 'Pending Balance', value: '₹82.9L', change: -4.1, icon: '⏳' },
    { label: 'Refunds Issued', value: '₹12.4L', change: -8.3, icon: '↩️' },
    { label: 'Avg. Booking Value', value: '₹5,060', change: 3.7, icon: '📊' },
    { label: 'Transactions', value: 93_201, change: 14.2, icon: '💳' },
    { label: 'Failed Payments', value: 312, change: -22.1, icon: '❌' },
    { label: 'Net Revenue', value: '₹4.59 Cr', change: 19.1, icon: '💹' },
  ];

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      { label: 'Collections (₹L)', data: [92, 118, 134, 127], color: '#10b981' },
      { label: 'Refunds (₹L)', data: [3.1, 4.2, 2.8, 2.3], color: '#f97316' },
    ],
  };

  return (
    <AnalyticsPanel
      title="Revenue Analytics"
      description="Financial ledger overview, collection rates, refund analysis, and payment gateway performance"
      icon="💰"
      metrics={metrics}
      chartData={chartData}
      datePreset={datePreset}
      onDateChange={setDatePreset}
      onExportCsv={() => console.info('[EXPORT] Revenue analytics CSV')}
      onExportPdf={() => console.info('[EXPORT] Revenue analytics PDF')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Revenue by Category
          </h3>
          <div className="space-y-2.5">
            {[
              { label: 'Trek Expeditions', pct: 62, val: '₹2.92 Cr', color: 'bg-indigo-500' },
              { label: 'Heritage Tours', pct: 18, val: '₹84.7L', color: 'bg-amber-500' },
              { label: 'Adventure Sports', pct: 12, val: '₹56.5L', color: 'bg-emerald-500' },
              { label: 'Village Experiences', pct: 5, val: '₹23.5L', color: 'bg-teal-500' },
              { label: 'Other Experiences', pct: 3, val: '₹14.1L', color: 'bg-slate-400' },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-slate-600 dark:text-slate-400 truncate">{r.label}</span>
                    <span className="font-semibold text-slate-900 dark:text-white ml-2">
                      {r.val}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${r.color}`}
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Payment Gateway Split
          </h3>
          <div className="space-y-3">
            {[
              { gw: 'Razorpay', txns: 61_842, pct: '66.3%', success: '98.7%' },
              { gw: 'Stripe', txns: 18_640, pct: '20.0%', success: '99.1%' },
              { gw: 'UPI Direct', txns: 9_420, pct: '10.1%', success: '97.4%' },
              { gw: 'Net Banking', txns: 3_299, pct: '3.5%', success: '96.2%' },
            ].map(gw => (
              <div key={gw.gw} className="flex items-center gap-3 text-xs">
                <div className="flex-1 font-medium text-slate-700 dark:text-slate-300">{gw.gw}</div>
                <div className="tabular-nums text-slate-600 dark:text-slate-400">
                  {gw.txns.toLocaleString('en-IN')}
                </div>
                <div className="text-slate-400 w-12 text-right">{gw.pct}</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold w-14 text-right">
                  {gw.success}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnalyticsPanel>
  );
}
