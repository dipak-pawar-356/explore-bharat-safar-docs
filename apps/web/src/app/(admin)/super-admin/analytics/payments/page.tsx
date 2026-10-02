'use client';
// Sprint 9: Item 15 — Payment Analytics
import * as React from 'react';
import { AnalyticsPanel } from '@/components/admin/analytics-panel';
import { DateRangePreset } from '@ebs/types';
export default function PaymentAnalyticsPage() {
  const [datePreset, setDatePreset] = React.useState(DateRangePreset.THIS_MONTH);
  return (
    <AnalyticsPanel
      title="Payment Analytics"
      description="Gateway success rates, upfront deposit collection, refund pipeline, and balance settlement performance"
      icon="💳"
      metrics={[
        { label: 'Total Collections', value: '₹4.71 Cr', change: 18.4, icon: '💰' },
        { label: 'Upfront Collected', value: '₹3.92 Cr', change: 16.2, icon: '📥' },
        { label: 'Balance Cleared', value: '₹79.1L', change: 22.1, icon: '✅' },
        { label: 'Refunds Pipeline', value: '₹12.4L', change: -8.3, icon: '↩️' },
        { label: 'Gateway Success', value: '98.6%', change: 0.8, icon: '📊' },
        { label: 'Failed Transactions', value: 312, change: -22.1, icon: '❌' },
        { label: 'Offline Settlements', value: 84, change: -14.2, icon: '🏕️' },
        { label: 'GST Collected', value: '₹42.4L', change: 18.4, icon: '🏛️' },
      ]}
      chartData={{
        labels: ['Oct 1', 'Oct 8', 'Oct 15', 'Oct 22', 'Oct 29'],
        datasets: [
          { label: 'Collections (₹L)', data: [89, 94, 112, 124, 118], color: '#10b981' },
          { label: 'Refunds (₹L)', data: [2.8, 3.1, 2.4, 2.8, 1.3], color: '#ef4444' },
        ],
      }}
      datePreset={datePreset}
      onDateChange={setDatePreset}
      onExportCsv={() => console.info('[EXPORT] Payment analytics CSV')}
      onExportPdf={() => console.info('[EXPORT] Payment analytics PDF')}
    />
  );
}
