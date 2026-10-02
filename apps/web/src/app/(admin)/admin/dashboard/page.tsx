'use client';

// Explore Bharat Safar — Admin Dashboard (Delegated Administrators)
// Reference: EBS-DOC-13-ADMIN Section 1-2 (Scoped Operational Consoles)
// Sprint 9: Item 2 (Admin Dashboard) — for Booking Admin, Finance Admin, Moderator, Content Editor

import * as React from 'react';
import Link from 'next/link';
import { useAdminRbac } from '@/hooks/use-admin-rbac';
import { UserRole } from '@ebs/types';

interface ScopedKpi {
  label: string;
  value: string;
  icon: string;
  sub: string;
  href: string;
  color: string;
}

const BOOKING_ADMIN_KPIS: ScopedKpi[] = [
  {
    label: 'Active Batches',
    value: '38',
    icon: '📅',
    sub: '12 accepting bookings',
    href: '/booking-admin/batches',
    color: 'indigo',
  },
  {
    label: 'Pending Manifests',
    value: '7',
    icon: '📋',
    sub: 'Attendance not marked',
    href: '/booking-admin/manifests',
    color: 'orange',
  },
  {
    label: 'Certificates Pending',
    value: '23',
    icon: '🏅',
    sub: 'Balance not cleared',
    href: '/certificate-admin/certificates',
    color: 'amber',
  },
  {
    label: "Today's Departures",
    value: '3',
    icon: '🏔️',
    sub: 'Harishchandragad, Rajmachi, Sinhagad',
    href: '/booking-admin/batches',
    color: 'emerald',
  },
];

const FINANCE_ADMIN_KPIS: ScopedKpi[] = [
  {
    label: 'Pending Refunds',
    value: '14',
    icon: '↩️',
    sub: '₹1,23,400 total',
    href: '/payment-admin/transactions',
    color: 'red',
  },
  {
    label: "Today's Collections",
    value: '₹8,42,100',
    icon: '💰',
    sub: '247 transactions',
    href: '/payment-admin/transactions',
    color: 'emerald',
  },
  {
    label: 'Upfront % (Global)',
    value: '25%',
    icon: '⚙️',
    sub: 'Default deposit rate',
    href: '/payment-admin/controls',
    color: 'indigo',
  },
  {
    label: 'Reconciliation Due',
    value: '3',
    icon: '📊',
    sub: 'End-of-day reports',
    href: '/super-admin/reports',
    color: 'amber',
  },
];

const MODERATOR_KPIS: ScopedKpi[] = [
  {
    label: 'Pending Reviews',
    value: '31',
    icon: '⭐',
    sub: 'Place & village reviews',
    href: '/super-admin/moderation/reviews',
    color: 'orange',
  },
  {
    label: 'Flagged Posts',
    value: '16',
    icon: '🚩',
    sub: '4 critical reports',
    href: '/super-admin/moderation/reports',
    color: 'red',
  },
  {
    label: 'Village Submissions',
    value: '12',
    icon: '🏘️',
    sub: 'In moderation queue',
    href: '/village-admin/moderation-queue',
    color: 'emerald',
  },
  {
    label: 'Stories Pending',
    value: '8',
    icon: '📖',
    sub: 'Traveller stories review',
    href: '/super-admin/moderation/stories',
    color: 'indigo',
  },
];

const CONTENT_EDITOR_KPIS: ScopedKpi[] = [
  {
    label: 'Draft Pages',
    value: '5',
    icon: '📄',
    sub: 'CMS drafts awaiting publish',
    href: '/super-admin/cms/pages',
    color: 'indigo',
  },
  {
    label: 'Banners Active',
    value: '8',
    icon: '🖼️',
    sub: '3 scheduled',
    href: '/super-admin/banners',
    color: 'amber',
  },
  {
    label: 'Media Items',
    value: '24,180',
    icon: '📁',
    sub: 'Total library assets',
    href: '/super-admin/media',
    color: 'emerald',
  },
  {
    label: 'FAQs Published',
    value: '142',
    icon: '❓',
    sub: '7 pending review',
    href: '/super-admin/cms/faqs',
    color: 'orange',
  },
];

const colorMap: Record<string, string> = {
  indigo:
    'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
  orange:
    'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
  emerald:
    'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  amber:
    'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
  red: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
};

function KpiCard({ kpi }: { kpi: ScopedKpi }) {
  return (
    <Link
      href={kpi.href}
      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.01] ${colorMap[kpi.color] ?? colorMap.indigo}`}
    >
      <span className="text-2xl flex-shrink-0" aria-hidden="true">
        {kpi.icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70 truncate">
          {kpi.label}
        </div>
        <div className="text-xl font-black mt-0.5">{kpi.value}</div>
        <div className="text-[10px] opacity-60 mt-0.5 truncate">{kpi.sub}</div>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { user, isBookingAdmin, isFinanceAdmin, isModerator, isContentEditor } = useAdminRbac();
  const roles = user?.roles ?? [];

  const primaryRole = roles.includes(UserRole.BOOKING_ADMIN)
    ? 'booking'
    : roles.includes(UserRole.FINANCE_ADMIN)
      ? 'finance'
      : roles.includes(UserRole.MODERATOR)
        ? 'moderation'
        : 'content';

  const kpis =
    primaryRole === 'booking'
      ? BOOKING_ADMIN_KPIS
      : primaryRole === 'finance'
        ? FINANCE_ADMIN_KPIS
        : primaryRole === 'moderation'
          ? MODERATOR_KPIS
          : CONTENT_EDITOR_KPIS;

  const dashboardTitle =
    primaryRole === 'booking'
      ? 'Booking Administration Console'
      : primaryRole === 'finance'
        ? 'Finance Ledger & Reconciliation'
        : primaryRole === 'moderation'
          ? 'Content Moderation Dashboard'
          : 'Content Editor Console';

  const dashboardDesc =
    primaryRole === 'booking'
      ? 'Batch schedules, manifests, attendance, and certificate releases'
      : primaryRole === 'finance'
        ? 'Transaction ledger, refund approvals, and payment reconciliation'
        : primaryRole === 'moderation'
          ? 'Review triage, report handling, and staged content queues'
          : 'CMS pages, banners, FAQ management, and media library';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {dashboardTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{dashboardDesc}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 text-[10px] font-mono text-slate-400">
          Scoped Console · {user?.email ?? '—'}
        </div>
      </div>

      {/* Scoped KPI Grid */}
      <section aria-label="Scoped KPI metrics">
        <h2 className="sr-only">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(kpi => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </div>
      </section>

      {/* Module Quick Links */}
      <section aria-label="Module quick links">
        <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-3">
          Module Quick Links
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {isBookingAdmin && (
            <>
              <Link
                href="/booking-admin/batches"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <span>📅</span> Batch Manager
              </Link>
              <Link
                href="/booking-admin/manifests"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <span>📋</span> Trek Manifests
              </Link>
              <Link
                href="/certificate-admin/certificates"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <span>🏅</span> Certificate Release
              </Link>
            </>
          )}
          {isFinanceAdmin && (
            <>
              <Link
                href="/payment-admin/transactions"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <span>💳</span> Transaction Ledger
              </Link>
              <Link
                href="/payment-admin/controls"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <span>⚙️</span> Payment Controls
              </Link>
              <Link
                href="/super-admin/reports"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <span>📊</span> Revenue Reports
              </Link>
            </>
          )}
          {isModerator && (
            <>
              <Link
                href="/super-admin/moderation/reviews"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              >
                <span>⭐</span> Review Queue
              </Link>
              <Link
                href="/super-admin/moderation/reports"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              >
                <span>🚩</span> Report Handling
              </Link>
              <Link
                href="/village-admin/moderation-queue"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              >
                <span>🏘️</span> Village Submissions
              </Link>
            </>
          )}
          {isContentEditor && !isModerator && (
            <>
              <Link
                href="/super-admin/cms/pages"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
              >
                <span>📄</span> CMS Pages
              </Link>
              <Link
                href="/super-admin/banners"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
              >
                <span>🖼️</span> Banners
              </Link>
              <Link
                href="/super-admin/media"
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
              >
                <span>📁</span> Media Library
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Scope Security Notice */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-3">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          <span aria-hidden="true">🔒</span>
          <span>
            Scoped Console — Actions are restricted to your authorized role. All mutations are
            recorded in the immutable audit ledger.{' '}
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              VillageScopeGuard Active
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
