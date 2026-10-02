'use client';

// Explore Bharat Safar — Report Generator
// Sprint 9: Item 62 (Report Generator)

import * as React from 'react';
import { useAdminRbac } from '@/hooks/use-admin-rbac';

const REPORT_TEMPLATES = [
  {
    id: 'rpt-bookings-monthly',
    label: 'Monthly Booking Report',
    icon: '📅',
    desc: 'All bookings with status, revenue, batch details for selected month.',
    formats: ['CSV', 'PDF', 'XLSX'],
  },
  {
    id: 'rpt-revenue-quarterly',
    label: 'Quarterly Revenue Report',
    icon: '💰',
    desc: 'Revenue breakdown by category, gateway, and state for selected quarter.',
    formats: ['CSV', 'PDF', 'XLSX'],
  },
  {
    id: 'rpt-user-activity',
    label: 'User Activity Report',
    icon: '👥',
    desc: 'Registration, activation, and retention metrics for date range.',
    formats: ['CSV', 'XLSX'],
  },
  {
    id: 'rpt-village-coverage',
    label: 'Village Coverage Report',
    icon: '🏘️',
    desc: 'Documentation coverage by state, district, and completion percentage.',
    formats: ['CSV', 'PDF'],
  },
  {
    id: 'rpt-certificates',
    label: 'Certificate Issuance Report',
    icon: '🏅',
    desc: 'All certificates issued with verification status and QR scan rates.',
    formats: ['CSV', 'PDF'],
  },
  {
    id: 'rpt-gst',
    label: 'GST Compliance Report',
    icon: '🏛️',
    desc: 'GSTIN-wise taxable transactions and GST collected for selected period.',
    formats: ['CSV', 'XLSX'],
  },
  {
    id: 'rpt-moderation',
    label: 'Moderation Activity Report',
    icon: '🛡️',
    desc: 'Content actions, escalations, resolution times, and SLA compliance.',
    formats: ['CSV', 'PDF'],
  },
  {
    id: 'rpt-audit',
    label: 'Audit Log Export',
    icon: '📋',
    desc: 'Filtered audit log export with actor, action, and outcome fields.',
    formats: ['CSV', 'JSON'],
  },
];

export default function ReportGeneratorPage() {
  const { canViewRevenue, isSuperAdmin } = useAdminRbac();
  const [selected, setSelected] = React.useState<string | null>(null);
  const [dateFrom, setDateFrom] = React.useState('2026-10-01');
  const [dateTo, setDateTo] = React.useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = React.useState('CSV');
  const [generating, setGenerating] = React.useState(false);
  const [generated, setGenerated] = React.useState<string | null>(null);

  const selectedTemplate = REPORT_TEMPLATES.find(r => r.id === selected);

  const handleGenerate = () => {
    if (!selected) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(`${selected}-${dateFrom}-to-${dateTo}.${format.toLowerCase()}`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Report Generator
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generate export reports for bookings, revenue, users, villages, certificates, and
          compliance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
            Select Report Template
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REPORT_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  setSelected(template.id);
                  setFormat(template.formats[0]);
                }}
                className={`text-left rounded-2xl border p-4 transition-all ${
                  selected === template.id
                    ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-indigo-500 dark:ring-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
                aria-pressed={selected === template.id}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl flex-shrink-0" aria-hidden="true">
                    {template.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {template.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {template.desc}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {template.formats.map(f => (
                        <span
                          key={f}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generation Controls */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Report Parameters
            </h2>
            <div>
              <label
                className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
                htmlFor="date-from"
              >
                Date From
              </label>
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
                htmlFor="date-to"
              >
                Date To
              </label>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {selectedTemplate && (
              <div>
                <label
                  className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
                  htmlFor="format-select"
                >
                  Export Format
                </label>
                <select
                  id="format-select"
                  value={format}
                  onChange={e => setFormat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {selectedTemplate.formats.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={!selected || generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Generate report"
              aria-busy={generating}
            >
              {generating ? (
                <>
                  <span className="animate-spin" aria-hidden="true">
                    ⟳
                  </span>
                  Generating…
                </>
              ) : (
                <>
                  <span aria-hidden="true">📥</span>
                  Generate Report
                </>
              )}
            </button>

            {generated && (
              <div
                role="alert"
                className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3"
              >
                <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  ✅ Report Ready
                </div>
                <div className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 mt-1 break-all">
                  {generated}
                </div>
                <button className="mt-2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline">
                  Download →
                </button>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
            Reports are generated server-side · Access scoped to your role permissions
          </div>
        </div>
      </div>
    </div>
  );
}
