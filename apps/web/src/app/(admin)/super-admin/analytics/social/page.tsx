'use client';
// Sprint 9: Item 13 (Social Analytics), 14 (Certificate Analytics), 15 (Payment Analytics), 16 (GIS Analytics)
import * as React from 'react';
import { AnalyticsPanel } from '@/components/admin/analytics-panel';
import { DateRangePreset } from '@ebs/types';
export default function SocialAnalyticsPage() {
  const [datePreset, setDatePreset] = React.useState(DateRangePreset.LAST_30_DAYS);
  return (
    <AnalyticsPanel
      title="Social Analytics"
      description="Traveller community engagement, post volumes, story reach, community health, and moderation efficiency"
      icon="💬"
      metrics={[
        { label: 'Active Posts', value: 219_004, change: 31.2, icon: '📝' },
        { label: 'Stories Published', value: 84_210, change: 44.1, icon: '📖' },
        { label: 'Active Communities', value: 3_841, change: 18.4, icon: '🤝' },
        { label: 'Total Followers', value: '1.2M', change: 22.8, icon: '👥' },
        { label: 'Flagged Content', value: 312, change: -28.4, icon: '🚩' },
        { label: 'Moderation SLA', value: '2.4h avg', change: -18.1, icon: '⏱️' },
        { label: 'Engagement Rate', value: '7.8%', change: 3.2, icon: '📊' },
        { label: 'Top Community', value: 'Maharashtra Treks', icon: '🏔️' },
      ]}
      chartData={{
        labels: ['Oct 1', 'Oct 8', 'Oct 15', 'Oct 22', 'Oct 29'],
        datasets: [
          { label: 'Posts', data: [6200, 7100, 7800, 8100, 7900], color: '#8b5cf6' },
          { label: 'Stories', data: [2400, 2800, 3100, 3400, 3200], color: '#06b6d4' },
        ],
      }}
      datePreset={datePreset}
      onDateChange={setDatePreset}
      onExportCsv={() => console.info('[EXPORT] Social analytics CSV')}
      onExportPdf={() => console.info('[EXPORT] Social analytics PDF')}
    />
  );
}
