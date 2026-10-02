'use client';

// Explore Bharat Safar — Village Admin Dashboard
// Reference: EBS-DOC-13-ADMIN Section 3 (Village Admin Console)
// EBS-DOC-40-SEC-BLUEPRINT Section 4 (VillageScopeGuard)
// Sprint 9: Item 3 (Village Admin Dashboard), Item 26 (Village Knowledge Management),
//           Item 27 (Village Moderation Queue), Item 28 (Village Analytics)
//
// SECURITY INVARIANT: Village Admin can ONLY view/update data for their
// assignedVillageId. VillageScopeGuard enforces this at the PostgreSQL RLS level.

import * as React from 'react';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

const MOCK_VILLAGE_DATA = {
  id: 'vl-mh-satara-wai-0001',
  name: 'Wai',
  district: 'Satara',
  state: 'Maharashtra',
  isPublished: true,
  lastUpdated: new Date(Date.now() - 3.5 * 3600_000).toISOString(),
  completionPct: 78,
  pendingSubmissions: 2,
  approvedSubmissions: 14,
  totalPhotos: 84,
  totalRevenue: 0, // Village section is directory-only (Sprint 4 invariant)
  bookingEnabled: false, // IMMUTABLE: Sprint 4 invariant — village homestays are directory-only
};

interface VillageStatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  href?: string;
}

function VillageStatCard({ label, value, icon, color, href }: VillageStatCardProps) {
  const colorCls: Record<string, string> = {
    emerald:
      'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    amber:
      'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    indigo:
      'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
    slate:
      'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300',
  };
  const cls = colorCls[color] ?? colorCls.slate;
  const content = (
    <div
      className={`rounded-2xl border p-4 ${cls} ${href ? 'hover:scale-[1.01] transition-transform cursor-pointer' : ''}`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
        <span className="text-xl font-black tabular-nums">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </span>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} aria-label={label}>
      {content}
    </Link>
  ) : (
    content
  );
}

export default function VillageAdminDashboardPage() {
  const { user } = useAuthStore();
  const assignedVillageId = user?.assignedVillageId ?? MOCK_VILLAGE_DATA.id;
  const v = MOCK_VILLAGE_DATA;

  return (
    <div className="space-y-6">
      {/* Security Scope Banner */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <span aria-hidden="true">🔒</span>
          <span>
            <strong>VillageScopeGuard Active</strong> — You are scoped to:{' '}
            <code className="font-mono bg-white/40 dark:bg-black/20 px-1 rounded">
              {assignedVillageId}
            </code>
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
          RLS Policy: village_scope_policy
        </span>
      </div>

      {/* Village Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {v.name} Village
              </h1>
              {v.isPublished ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 uppercase">
                  Published
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 uppercase">
                  Draft
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {v.district} District · {v.state} · Village Admin Console
            </p>
          </div>
          <Link
            href="/village-admin/profile/edit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Edit village profile"
          >
            <span aria-hidden="true">✏️</span>
            Edit Village
          </Link>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Profile Completion
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {v.completionPct}%
            </span>
          </div>
          <div
            className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
            role="progressbar"
            aria-valuenow={v.completionPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${v.completionPct}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Complete History, Local Cuisine, and Cultural Events sections to reach 100%
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <VillageStatCard
          label="Pending Submissions"
          value={v.pendingSubmissions}
          icon="⏳"
          color="amber"
          href="/village-admin/submissions"
        />
        <VillageStatCard
          label="Approved Updates"
          value={v.approvedSubmissions}
          icon="✅"
          color="emerald"
        />
        <VillageStatCard
          label="Total Photos"
          value={v.totalPhotos}
          icon="📸"
          color="indigo"
          href="/village-admin/media"
        />
        <VillageStatCard
          label="Last Updated"
          value={new Date(v.lastUpdated).toLocaleDateString('en-IN')}
          icon="🕐"
          color="slate"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              label: 'Submit Village Update',
              href: '/village-admin/submissions/new',
              icon: '📤',
              desc: 'Submit new content for moderator review',
              color: 'indigo',
            },
            {
              label: 'Upload Photos',
              href: '/village-admin/media',
              icon: '📸',
              desc: 'Add new photos to the village gallery',
              color: 'emerald',
            },
            {
              label: 'Update Cultural Events',
              href: '/village-admin/events',
              icon: '🎭',
              desc: 'Add or update village festivals and events',
              color: 'amber',
            },
            {
              label: 'Edit Contact Details',
              href: '/village-admin/contact',
              icon: '📬',
              desc: 'Update village contact information',
              color: 'slate',
            },
            {
              label: 'View Moderation Queue',
              href: '/village-admin/moderation-queue',
              icon: '👁️',
              desc: 'Track status of submitted updates',
              color: 'orange',
            },
            {
              label: 'Village Analytics',
              href: '/super-admin/analytics/villages',
              icon: '📊',
              desc: 'View platform-wide village insights (read-only)',
              color: 'purple',
            },
          ].map(action => {
            const clsMap: Record<string, string> = {
              indigo: 'hover:border-indigo-300 dark:hover:border-indigo-700',
              emerald: 'hover:border-emerald-300 dark:hover:border-emerald-700',
              amber: 'hover:border-amber-300 dark:hover:border-amber-700',
              orange: 'hover:border-orange-300 dark:hover:border-orange-700',
              purple: 'hover:border-purple-300 dark:hover:border-purple-700',
              slate: 'hover:border-slate-300 dark:hover:border-slate-600',
            };
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`flex items-start gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${clsMap[action.color] ?? ''} transition-all group`}
              >
                <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
                  {action.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                    {action.label}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {action.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sprint 4 Invariant Notice */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-3">
        <div className="flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          <span aria-hidden="true">ℹ️</span>
          <span>
            <strong>Directory-Only Mode (Sprint 4 Invariant):</strong> Village homestay listings are
            informational only. The &ldquo;Book Now&rdquo; feature is not available for village
            homestays. This invariant is enforced at the data and UI layer per EBS-DOC-13-ADMIN §1
            &amp; Sprint 4 completion requirements.
          </span>
        </div>
      </div>
    </div>
  );
}
