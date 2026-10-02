'use client';

// Explore Bharat Safar — Booking Analytics
// Reference: EBS-DOC-13-ADMIN Section 2, EBS-BLU-43-BOOKING
// Sprint 9: Item 8 (Booking Analytics)

import * as React from 'react';
import { AnalyticsPanel } from '@/components/admin/analytics-panel';
import { DateRangePreset } from '@ebs/types';

export default function BookingAnalyticsPage() {
  const [datePreset, setDatePreset] = React.useState(DateRangePreset.LAST_30_DAYS);

  const metrics = [
    { label: 'Total Bookings', value: 93_201, change: 14.2, icon: '🎒' },
    { label: 'Confirmed', value: 78_564, change: 11.8, icon: '✅' },
    { label: 'Cancellations', value: 4_231, change: -3.4, icon: '❌' },
    { label: 'Avg. Batch Fill Rate', value: '84%', change: 5.1, icon: '📊' },
    { label: 'Active Batches', value: 38, change: 8.0, icon: '📅' },
    { label: 'Trek Completions', value: 64_330, change: 22.7, icon: '🏔️' },
    { label: 'Pending Attendance', value: 7, change: -12.0, icon: '📋' },
    { label: 'Avg. Group Size', value: '18.4', icon: '👥' },
  ];

  const chartData = {
    labels: ['Oct 1', 'Oct 5', 'Oct 10', 'Oct 15', 'Oct 20', 'Oct 25', 'Oct 30'],
    datasets: [
      { label: 'Confirmed', data: [1200, 1350, 1180, 1600, 1420, 1750, 1900], color: '#6366f1' },
      { label: 'Cancelled', data: [80, 95, 70, 110, 88, 102, 95], color: '#f97316' },
    ],
  };

  return (
    <AnalyticsPanel
      title="Booking Analytics"
      description="Expedition batch occupancy, confirmation rates, cancellation trends, and trek completion metrics"
      icon="🎒"
      metrics={metrics}
      chartData={chartData}
      datePreset={datePreset}
      onDateChange={setDatePreset}
      onExportCsv={() => console.info('[EXPORT] Booking analytics CSV requested')}
      onExportPdf={() => console.info('[EXPORT] Booking analytics PDF requested')}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Top Expeditions by Bookings
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Harishchandragad Trek', bookings: 4_820, fill: '91%' },
              { name: 'Valley of Flowers Explorer', bookings: 3_640, fill: '88%' },
              { name: 'Rajmachi Fort Trek', bookings: 3_210, fill: '76%' },
              { name: 'Chadar Frozen River Trek', bookings: 2_890, fill: '94%' },
              { name: 'Sinhagad Fort Day Trek', bookings: 2_540, fill: '82%' },
            ].map(exp => (
              <div key={exp.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {exp.name}
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: exp.fill }}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                    {exp.bookings.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">{exp.fill} full</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Booking Status Split
          </h3>
          <div className="space-y-2.5">
            {[
              { label: 'Confirmed', pct: 84, color: 'bg-emerald-500' },
              { label: 'Pending Payment', pct: 8, color: 'bg-amber-500' },
              { label: 'Cancelled', pct: 5, color: 'bg-red-500' },
              { label: 'Refunded', pct: 3, color: 'bg-slate-400' },
            ].map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400">{s.label}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{s.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color}`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnalyticsPanel>
  );
}
