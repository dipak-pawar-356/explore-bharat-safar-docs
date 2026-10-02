'use client';

// Explore Bharat Safar — Immutable Audit Log Viewer
// Reference: EBS-DOC-13-ADMIN Section 1.1 (Complete Audit Accountability)
// EBS-DOC-40-SEC-BLUEPRINT Section 4 (Authorization & RBAC)
// Sprint 9: Item 20 (Admin Audit Logs), Item 21 (System Activity Logs)

import * as React from 'react';
import { AuditLogTable } from '@/features/admin-dashboard';
import { useAdminRbac } from '@/hooks/use-admin-rbac';
import type { AuditLogEntry } from '@ebs/types';
import { AuditAction, AuditOutcome, AuditResourceType, UserRole } from '@ebs/types';

// Comprehensive mock audit log stream (in production: paginated from immutable audit_schema)
const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'al-100',
    actorUserId: 'u-sa-001',
    actorEmail: 'superadmin@ebs.in',
    actorRoles: [UserRole.SUPER_ADMIN],
    action: AuditAction.NAVIGATION_TREE_UPDATED,
    resourceType: AuditResourceType.NAVIGATION_TREE,
    resourceId: 'nav-tree-v18',
    resourceLabel: 'Moved Monsoon Treks to Position 1',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.0.1',
    sessionId: 'sess-sa-20261001',
    userAgent: 'Chrome/129.0 — Enterprise Admin',
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    changes: { before: { position: 3 }, after: { position: 1 } },
  },
  {
    id: 'al-101',
    actorUserId: 'u-sa-001',
    actorEmail: 'superadmin@ebs.in',
    actorRoles: [UserRole.SUPER_ADMIN],
    action: AuditAction.FEATURE_FLAG_TOGGLED,
    resourceType: AuditResourceType.FEATURE_FLAG,
    resourceId: 'ff-booking-v2',
    resourceLabel: 'booking_system_v2 → ENABLED',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.0.1',
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    changes: { before: { isEnabled: false }, after: { isEnabled: true } },
  },
  {
    id: 'al-102',
    actorUserId: 'u-ba-001',
    actorEmail: 'booking.admin@ebs.in',
    actorRoles: [UserRole.BOOKING_ADMIN],
    action: AuditAction.ATTENDANCE_MARKED,
    resourceType: AuditResourceType.BOOKING,
    resourceId: 'bk-harishchandragad-oct',
    resourceLabel: 'Harishchandragad Trek Oct 2026 — 24 participants',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.2.15',
    sessionId: 'sess-ba-20261001',
    createdAt: new Date(Date.now() - 28 * 60_000).toISOString(),
  },
  {
    id: 'al-103',
    actorUserId: 'u-fa-001',
    actorEmail: 'finance@ebs.in',
    actorRoles: [UserRole.FINANCE_ADMIN],
    action: AuditAction.REFUND_INITIATED,
    resourceType: AuditResourceType.PAYMENT,
    resourceId: 'pay-0193ab-refund',
    resourceLabel: '₹4,500 Refund — TRV-00421 (Medical Emergency)',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.1.8',
    createdAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    changes: { before: { status: 'CAPTURED' }, after: { status: 'REFUND_INITIATED' } },
  },
  {
    id: 'al-104',
    actorUserId: 'u-sa-001',
    actorEmail: 'superadmin@ebs.in',
    actorRoles: [UserRole.SUPER_ADMIN],
    action: AuditAction.UPFRONT_PERCENTAGE_CHANGED,
    resourceType: AuditResourceType.SYSTEM_CONFIG,
    resourceId: 'cfg-chadar-trek-upfront',
    resourceLabel: 'Chadar Trek: 50% → 100% upfront',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.0.1',
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    changes: { before: { percentage: 50 }, after: { percentage: 100 } },
  },
  {
    id: 'al-105',
    actorUserId: 'u-mod-001',
    actorEmail: 'moderator@ebs.in',
    actorRoles: [UserRole.MODERATOR],
    action: AuditAction.POST_MODERATED,
    resourceType: AuditResourceType.POST,
    resourceId: 'pst-flagged-001',
    resourceLabel: 'Post removed: Spam/Promotional content',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.3.22',
    createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    changes: { before: { status: 'ACTIVE' }, after: { status: 'REMOVED' } },
  },
  {
    id: 'al-106',
    actorUserId: 'u-va-001',
    actorEmail: 'village.admin.satara@ebs.in',
    actorRoles: [UserRole.VILLAGE_ADMIN],
    action: AuditAction.VILLAGE_UPDATE_SUBMITTED,
    resourceType: AuditResourceType.VILLAGE,
    resourceId: 'vl-mh-satara-wai-0001',
    resourceLabel: 'Wai Village — History & Culture section update',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '192.168.1.42',
    createdAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
  },
  {
    id: 'al-107',
    actorUserId: 'u-mod-001',
    actorEmail: 'moderator@ebs.in',
    actorRoles: [UserRole.MODERATOR],
    action: AuditAction.VILLAGE_UPDATE_APPROVED,
    resourceType: AuditResourceType.VILLAGE,
    resourceId: 'vl-mh-satara-wai-0001',
    resourceLabel: 'Wai Village — History approved & published',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.3.22',
    createdAt: new Date(Date.now() - 3.5 * 3600_000).toISOString(),
  },
  {
    id: 'al-108',
    actorUserId: 'u-unkn',
    actorEmail: 'attacker@evil.com',
    actorRoles: [],
    action: AuditAction.USER_LOGIN,
    resourceType: AuditResourceType.USER,
    resourceId: 'u-sa-001',
    resourceLabel: 'Failed login attempt — brute-force pattern',
    outcome: AuditOutcome.FAILURE,
    failureReason: 'Invalid credentials (attempt 8/10) — IP flagged',
    ipAddress: '203.0.113.42',
    createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: 'al-109',
    actorUserId: 'u-ba-001',
    actorEmail: 'booking.admin@ebs.in',
    actorRoles: [UserRole.BOOKING_ADMIN],
    action: AuditAction.CERTIFICATE_ISSUED,
    resourceType: AuditResourceType.CERTIFICATE,
    resourceId: 'cert-harishchandragad-2026-batch-14',
    resourceLabel: '24 certificates issued — Harishchandragad Trek Oct 2026',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.2.15',
    createdAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
  },
  {
    id: 'al-110',
    actorUserId: 'u-sa-001',
    actorEmail: 'superadmin@ebs.in',
    actorRoles: [UserRole.SUPER_ADMIN],
    action: AuditAction.USER_ROLE_CHANGED,
    resourceType: AuditResourceType.USER,
    resourceId: 'u-trv-002421',
    resourceLabel: 'User #TRV-002421: TRAVELLER → LOCAL_GUIDE',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.0.1',
    createdAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
    changes: { before: { roles: ['TRAVELLER'] }, after: { roles: ['TRAVELLER', 'LOCAL_GUIDE'] } },
  },
];

const ACTION_FILTER_OPTIONS = [
  { label: 'All Actions', value: '' },
  { label: 'User Login', value: AuditAction.USER_LOGIN },
  { label: 'Role Changed', value: AuditAction.USER_ROLE_CHANGED },
  { label: 'Village Submitted', value: AuditAction.VILLAGE_UPDATE_SUBMITTED },
  { label: 'Village Approved', value: AuditAction.VILLAGE_UPDATE_APPROVED },
  { label: 'Attendance Marked', value: AuditAction.ATTENDANCE_MARKED },
  { label: 'Refund Initiated', value: AuditAction.REFUND_INITIATED },
  { label: 'Certificate Issued', value: AuditAction.CERTIFICATE_ISSUED },
  { label: 'Feature Flag Toggled', value: AuditAction.FEATURE_FLAG_TOGGLED },
  { label: 'Post Moderated', value: AuditAction.POST_MODERATED },
];

export default function AuditLogsPage() {
  const { canViewAuditLogs } = useAdminRbac();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [actionFilter, setActionFilter] = React.useState('');
  const [outcomeFilter, setOutcomeFilter] = React.useState('');
  const [actorSearch, setActorSearch] = React.useState('');

  const filtered = MOCK_AUDIT_LOGS.filter(log => {
    const matchAction = !actionFilter || log.action === actionFilter;
    const matchOutcome = !outcomeFilter || log.outcome === outcomeFilter;
    const matchActor = !actorSearch || log.actorEmail.includes(actorSearch);
    return matchAction && matchOutcome && matchActor;
  });

  if (!canViewAuditLogs) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="text-5xl" aria-hidden="true">
          🔒
        </span>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Access Restricted</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
          The Master Audit Log Inspector is accessible only to Super Administrators. This
          restriction is enforced server-side by the RBAC guard (EBS-DOC-40-SEC §4).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Immutable Audit Log Inspector
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Append-only security event stream · Administrative action ledger ·{' '}
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              audit_schema (PostgreSQL)
            </span>
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
          onClick={() => console.info('[EXPORT] Audit log export requested')}
          aria-label="Export audit log as CSV"
        >
          <span aria-hidden="true">📥</span>
          Export CSV
        </button>
      </div>

      {/* Immutability Banner */}
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-5 py-3 flex items-center gap-2">
        <span className="text-sm" aria-hidden="true">
          🔐
        </span>
        <span className="text-xs text-red-700 dark:text-red-300">
          <strong>Immutability Guarantee:</strong> Audit records are append-only. No delete or
          update operations are permitted on audit_schema. Operational administrators cannot modify
          these tables (EBS-DOC-40-SEC §1, §4).
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="relative min-w-[200px]">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            aria-hidden="true"
          >
            👤
          </span>
          <input
            type="search"
            value={actorSearch}
            onChange={e => setActorSearch(e.target.value)}
            placeholder="Filter by actor email…"
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filter by actor email"
          />
        </div>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Filter by action type"
        >
          {ACTION_FILTER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={outcomeFilter}
          onChange={e => setOutcomeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Filter by outcome"
        >
          <option value="">All Outcomes</option>
          <option value={AuditOutcome.SUCCESS}>Success</option>
          <option value={AuditOutcome.FAILURE}>Failed</option>
          <option value={AuditOutcome.PARTIAL}>Partial</option>
        </select>
        {(actionFilter || outcomeFilter || actorSearch) && (
          <button
            onClick={() => {
              setActionFilter('');
              setOutcomeFilter('');
              setActorSearch('');
            }}
            className="px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            aria-label="Clear all filters"
          >
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Audit Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <AuditLogTable
          logs={filtered}
          currentPage={currentPage}
          totalPages={Math.ceil(filtered.length / 10)}
          totalRecords={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
        Grafana alert active: &gt;100 failed login attempts/minute triggers automated incident ·
        Session: {filtered.length.toLocaleString()} records in view
      </div>
    </div>
  );
}
