'use client';
// Sprint 9: Item 14 — Certificate Analytics
import * as React from 'react';
import { AnalyticsPanel } from '@/components/admin/analytics-panel';
import { DateRangePreset } from '@ebs/types';
export default function CertificateAnalyticsPage() {
  const [datePreset, setDatePreset] = React.useState(DateRangePreset.THIS_MONTH);
  return (
    <AnalyticsPanel
      title="Certificate Analytics"
      description="Digital trek completion certificate issuance rates, verification scans, revocations, and reissuance workflows"
      icon="🏅"
      metrics={[
        { label: 'Certificates Issued', value: 64_330, change: 22.7, icon: '🏅' },
        { label: 'This Month', value: 8_420, change: 14.1, icon: '📅' },
        { label: 'QR Scans (Verified)', value: 31_840, change: 38.2, icon: '🔍' },
        { label: 'Revoked', value: 48, change: -12.4, icon: '❌' },
        { label: 'Pending Release', value: 23, icon: '⏳' },
        { label: 'Reissued', value: 184, change: 4.1, icon: '🔄' },
        { label: 'Avg. Issue Time', value: '1.2h', change: -28.4, icon: '⚡' },
        { label: 'Validity Success', value: '99.93%', icon: '✅' },
      ]}
      chartData={{
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          { label: 'Issued', data: [1820, 2140, 2380, 2080], color: '#f59e0b' },
          { label: 'Verified', data: [7200, 8400, 9100, 7140], color: '#10b981' },
        ],
      }}
      datePreset={datePreset}
      onDateChange={setDatePreset}
      onExportCsv={() => console.info('[EXPORT] Certificate analytics CSV')}
      onExportPdf={() => console.info('[EXPORT] Certificate analytics PDF')}
    />
  );
}
