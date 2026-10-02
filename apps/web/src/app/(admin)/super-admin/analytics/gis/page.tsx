'use client';
// Sprint 9: Item 16 — GIS Analytics
import * as React from 'react';
import { AnalyticsPanel } from '@/components/admin/analytics-panel';
import { DateRangePreset } from '@ebs/types';
export default function GisAnalyticsPage() {
  const [datePreset, setDatePreset] = React.useState(DateRangePreset.LAST_30_DAYS);
  return (
    <AnalyticsPanel
      title="GIS Analytics"
      description="PostGIS geographic data coverage, vector tile performance, coordinate validation, and spatial query health"
      icon="🗺️"
      metrics={[
        { label: 'States Mapped', value: '36/36', icon: '🗺️' },
        { label: 'Districts Mapped', value: '773/773', icon: '🏛️' },
        { label: 'Talukas Mapped', value: '6,432', change: 2.1, icon: '📍' },
        { label: 'GeoJSON Records', value: '142K', change: 4.8, icon: '📊' },
        { label: 'Coordinate Validated', value: '99.2%', change: 0.4, icon: '✅' },
        { label: 'Avg. Tile Load', value: '84ms', change: -22.1, icon: '⚡' },
        { label: 'PostGIS Queries/min', value: 4_840, change: 18.2, icon: '🐘' },
        { label: 'Boundary Gaps', value: 12, change: -48.0, icon: '⚠️' },
      ]}
      chartData={{
        labels: ['Oct 1', 'Oct 8', 'Oct 15', 'Oct 22', 'Oct 29'],
        datasets: [
          { label: 'Tile Requests (K)', data: [380, 420, 460, 490, 440], color: '#f59e0b' },
          { label: 'GIS Queries (K)', data: [92, 104, 118, 124, 116], color: '#6366f1' },
        ],
      }}
      datePreset={datePreset}
      onDateChange={setDatePreset}
      onExportCsv={() => console.info('[EXPORT] GIS analytics CSV')}
      onExportPdf={() => console.info('[EXPORT] GIS analytics PDF')}
    />
  );
}
