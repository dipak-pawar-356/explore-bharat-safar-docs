'use client';

// Explore Bharat Safar — Admin Analytics Panel (Reusable)
// Reference: EBS-DOC-13-ADMIN Section 2, EBS-DOC-09-API Section 5.7
// Sprint 9: Items 8-16 (All Analytics Modules)

import * as React from 'react';
import type { DateRangePreset } from '@ebs/types';
import { DateRangePreset as DRP } from '@ebs/types';

export interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: number; // +/- percent
  unit?: string;
  icon?: string;
}

export interface AnalyticsChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

interface AnalyticsPanelProps {
  title: string;
  description: string;
  icon: string;
  metrics: AnalyticsMetric[];
  chartData?: AnalyticsChartData;
  datePreset: DRP;
  onDateChange: (preset: DRP) => void;
  exportEnabled?: boolean;
  onExportCsv?: () => void;
  onExportPdf?: () => void;
  children?: React.ReactNode;
}

const DATE_PRESETS: { label: string; value: DRP }[] = [
  { label: 'Today', value: DRP.TODAY },
  { label: 'Yesterday', value: DRP.YESTERDAY },
  { label: 'Last 7 Days', value: DRP.LAST_7_DAYS },
  { label: 'Last 30 Days', value: DRP.LAST_30_DAYS },
  { label: 'This Month', value: DRP.THIS_MONTH },
  { label: 'Last Month', value: DRP.LAST_MONTH },
  { label: 'This Year', value: DRP.THIS_YEAR },
];

function MetricCard({ metric }: { metric: AnalyticsMetric }) {
  const isPositive = (metric.change ?? 0) >= 0;
  const hasChange = metric.change !== undefined;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
          {metric.label}
        </span>
        {metric.icon && (
          <span className="text-lg" aria-hidden="true">
            {metric.icon}
          </span>
        )}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
          {typeof metric.value === 'number' ? metric.value.toLocaleString('en-IN') : metric.value}
        </span>
        {metric.unit && <span className="text-xs text-slate-400 mb-0.5">{metric.unit}</span>}
      </div>
      {hasChange && (
        <div
          className={`flex items-center gap-1 text-xs font-semibold ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          <span aria-hidden="true">{isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(metric.change!)}% vs previous period</span>
        </div>
      )}
    </div>
  );
}

// Simple bar-chart visual (pure CSS — no external chart library dependency)
function SimpleBarChart({ data }: { data: AnalyticsChartData }) {
  const maxVal = Math.max(...data.datasets.flatMap(d => d.data), 1);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Trend Chart</h3>
        <div className="flex items-center gap-3">
          {data.datasets.map(ds => (
            <div key={ds.label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: ds.color }}
                aria-hidden="true"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{ds.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-1 h-32">
        {data.labels.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex flex-col-reverse items-center gap-0.5 w-full h-24">
              {data.datasets.map(ds => {
                const pct = Math.max((ds.data[i] ?? 0) / maxVal, 0.02) * 100;
                return (
                  <div
                    key={ds.label}
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${pct}%`,
                      backgroundColor: ds.color,
                      opacity: 0.85,
                    }}
                    role="img"
                    aria-label={`${ds.label}: ${ds.data[i]?.toLocaleString('en-IN')}`}
                  />
                );
              })}
            </div>
            <span className="text-[8px] text-slate-400 dark:text-slate-600 text-center truncate w-full">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPanel({
  title,
  description,
  icon,
  metrics,
  chartData,
  datePreset,
  onDateChange,
  exportEnabled = true,
  onExportCsv,
  onExportPdf,
  children,
}: AnalyticsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {DATE_PRESETS.slice(0, 4).map(p => (
              <button
                key={p.value}
                onClick={() => onDateChange(p.value)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                  datePreset === p.value
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Export Controls */}
          {exportEnabled && (
            <div className="flex items-center gap-1">
              {onExportCsv && (
                <button
                  onClick={onExportCsv}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Export as CSV"
                >
                  📥 CSV
                </button>
              )}
              {onExportPdf && (
                <button
                  onClick={onExportPdf}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Export as PDF"
                >
                  📄 PDF
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        role="list"
        aria-label="Analytics metrics"
      >
        {metrics.map(m => (
          <div key={m.label} role="listitem">
            <MetricCard metric={m} />
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData && <SimpleBarChart data={chartData} />}

      {/* Additional Content */}
      {children}
    </div>
  );
}
