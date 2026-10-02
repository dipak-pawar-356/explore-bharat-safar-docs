'use client';
// Explore Bharat Safar — Discovery Analytics — Sprint 9: Item 12
import * as React from 'react';
import { AnalyticsPanel } from '@/components/admin/analytics-panel';
import { DateRangePreset } from '@ebs/types';
export default function DiscoveryAnalyticsPage() {
  const [datePreset, setDatePreset] = React.useState(DateRangePreset.LAST_30_DAYS);
  return (
    <AnalyticsPanel
      title="Discovery Analytics"
      description="Bharat Discovery Engine map interactions, place views, search queries, and geographic engagement heatmap"
      icon="📍"
      metrics={[
        { label: 'Places Indexed', value: 128_440, change: 3.2, icon: '📍' },
        { label: 'Map Sessions', value: 892_340, change: 24.1, icon: '🗺️' },
        { label: 'Unique Searchers', value: 142_800, change: 18.7, icon: '🔍' },
        { label: 'States Viewed', value: 36, icon: '🌐' },
        { label: 'Place Page Views', value: '4.2M', change: 21.4, icon: '👁️' },
        { label: 'Avg. Session Depth', value: '4.8 levels', change: 8.2, icon: '📊' },
        { label: 'Booking CTAs Clicked', value: 34_210, change: 19.8, icon: '🎯' },
        { label: 'Top Category', value: 'Forts', icon: '🏰' },
      ]}
      chartData={{
        labels: ['Oct 1', 'Oct 8', 'Oct 15', 'Oct 22', 'Oct 29'],
        datasets: [
          { label: 'Map Sessions (K)', data: [180, 195, 210, 220, 190], color: '#f59e0b' },
          { label: 'Searches (K)', data: [28, 31, 34, 36, 33], color: '#6366f1' },
        ],
      }}
      datePreset={datePreset}
      onDateChange={setDatePreset}
      onExportCsv={() => console.info('[EXPORT] Discovery analytics CSV')}
      onExportPdf={() => console.info('[EXPORT] Discovery analytics PDF')}
    />
  );
}
