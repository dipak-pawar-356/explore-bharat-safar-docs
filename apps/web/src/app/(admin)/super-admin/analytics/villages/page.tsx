'use client';
// Explore Bharat Safar — Village Analytics — Sprint 9: Item 11
import * as React from 'react';
import { AnalyticsPanel } from '@/components/admin/analytics-panel';
import { DateRangePreset } from '@ebs/types';
export default function VillageAnalyticsPage() {
  const [datePreset, setDatePreset] = React.useState(DateRangePreset.THIS_MONTH);
  return (
    <AnalyticsPanel
      title="Village Analytics"
      description="Rural Bharat knowledge coverage, update velocity, moderation throughput, and geographic reach"
      icon="🏘️"
      metrics={[
        { label: 'Villages Documented', value: 614_857, change: 5.1, icon: '🏘️' },
        { label: 'Updated This Month', value: 4_280, change: 12.4, icon: '✏️' },
        { label: 'Pending Moderation', value: 312, change: -8.1, icon: '⏳' },
        { label: 'Village Admins Active', value: 8_420, change: 6.8, icon: '👤' },
        { label: 'Photos Uploaded', value: 142_840, change: 18.2, icon: '📸' },
        { label: 'States Covered', value: '36/36', icon: '🗺️' },
        { label: 'GIS-Tagged', value: '84.2%', change: 3.1, icon: '📍' },
        { label: 'Approval Rate', value: '91.4%', change: 2.3, icon: '✅' },
      ]}
      chartData={{
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          { label: 'New Villages', data: [820, 1040, 1180, 1240], color: '#10b981' },
          { label: 'Moderated', data: [780, 980, 1100, 1200], color: '#6366f1' },
        ],
      }}
      datePreset={datePreset}
      onDateChange={setDatePreset}
      onExportCsv={() => console.info('[EXPORT] Village analytics CSV')}
      onExportPdf={() => console.info('[EXPORT] Village analytics PDF')}
    />
  );
}
