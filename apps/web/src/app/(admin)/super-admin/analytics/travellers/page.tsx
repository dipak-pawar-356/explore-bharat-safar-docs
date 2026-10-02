'use client';

// Explore Bharat Safar — Traveller Analytics
// Sprint 9: Item 10

import * as React from 'react';
import { AnalyticsPanel } from '@/components/admin/analytics-panel';
import { DateRangePreset } from '@ebs/types';

export default function TravellerAnalyticsPage() {
  const [datePreset, setDatePreset] = React.useState(DateRangePreset.LAST_30_DAYS);
  const metrics = [
    { label: 'Total Travellers', value: 284_739, change: 8.4, icon: '👤' },
    { label: 'New Registrations', value: 12_840, change: 18.2, icon: '✨' },
    { label: 'Active (30d)', value: 47_182, change: 11.1, icon: '🟢' },
    { label: 'Verified Email', value: '94.2%', change: 1.3, icon: '✉️' },
    { label: 'Completed Treks', value: 64_330, change: 22.7, icon: '🏔️' },
    { label: 'Avg. Treks/User', value: '2.8', change: 4.2, icon: '📊' },
    { label: 'Suspended Accounts', value: 231, change: -18.4, icon: '🚫' },
    { label: 'MFA Enabled', value: '38.7%', change: 12.0, icon: '🔐' },
  ];
  const chartData = {
    labels: ['Oct 1', 'Oct 8', 'Oct 15', 'Oct 22', 'Oct 29'],
    datasets: [
      { label: 'New Registrations', data: [2200, 2640, 2890, 2480, 2630], color: '#6366f1' },
      { label: 'Active Users', data: [41000, 43500, 46200, 47100, 47182], color: '#10b981' },
    ],
  };
  return (
    <AnalyticsPanel
      title="Traveller Analytics"
      description="User registrations, activity rates, verification status, and account health metrics"
      icon="👤"
      metrics={metrics}
      chartData={chartData}
      datePreset={datePreset}
      onDateChange={setDatePreset}
      onExportCsv={() => console.info('[EXPORT] Traveller analytics CSV')}
      onExportPdf={() => console.info('[EXPORT] Traveller analytics PDF')}
    />
  );
}
