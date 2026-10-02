'use client';

// Explore Bharat Safar — Super Admin Global Governance Dashboard
// Reference: EBS-DOC-13-ADMIN Section 1-6, EBS-DOC-40-SEC-BLUEPRINT Section 4
// Sprint 9: Items 1 (Super Admin Dashboard), 7 (KPI Widgets), 6 (Dashboard Analytics),
//           11 (Village Analytics), 20 (Admin Audit Logs), 50 (Feature Flags)

import * as React from 'react';
import {
  StatsOverview,
  AuditLogTable,
  SystemHealthPanel,
  FeatureFlagsPanel,
} from '@/features/admin-dashboard';
import { useAdminRbac } from '@/hooks/use-admin-rbac';
import type { AdminDashboardStats, AuditLogEntry, SystemHealth, FeatureFlag } from '@ebs/types';
import {
  SystemHealthStatus,
  ServiceStatus,
  AuditAction,
  AuditOutcome,
  AuditResourceType,
  FeatureFlagScope,
  UserRole,
} from '@ebs/types';
import Link from 'next/link';

// ─── Static mock data (connected to real API in production) ──────────────────

const MOCK_STATS: AdminDashboardStats = {
  totalUsers: 284_739,
  activeUsers: 47_182,
  totalPlaces: 128_440,
  totalVillages: 6_14_857,
  totalBookings: 93_201,
  confirmedBookings: 78_564,
  totalRevenue: 4_71_83_200,
  pendingRevenue: 8_29_500,
  certificatesIssued: 64_330,
  pendingModerations: 47,
  activeSocialPosts: 2_19_004,
  activeCommunities: 3_841,
  systemHealth: SystemHealthStatus.OPERATIONAL,
  timestamp: new Date().toISOString(),
};

const MOCK_HEALTH: SystemHealth = {
  status: SystemHealthStatus.OPERATIONAL,
  timestamp: new Date().toISOString(),
  uptime: 86400 * 14 + 3600 * 7,
  version: '1.9.0',
  services: [
    {
      name: 'PostgreSQL 16 Primary',
      status: ServiceStatus.UP,
      latencyMs: 2,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Redis 7 Cluster (mTLS)',
      status: ServiceStatus.UP,
      latencyMs: 1,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'NestJS API Gateway',
      status: ServiceStatus.UP,
      latencyMs: 18,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'GIS & Discovery Service',
      status: ServiceStatus.UP,
      latencyMs: 24,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Village Knowledge Service',
      status: ServiceStatus.UP,
      latencyMs: 12,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Booking & Slot Lock Service',
      status: ServiceStatus.UP,
      latencyMs: 15,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Payment & Invoicing Service',
      status: ServiceStatus.UP,
      latencyMs: 31,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Certificate Synthesis Service',
      status: ServiceStatus.UP,
      latencyMs: 8,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Social & Community Service',
      status: ServiceStatus.UP,
      latencyMs: 21,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'BullMQ Worker Pool',
      status: ServiceStatus.UP,
      latencyMs: 4,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Cloudflare Edge (WAF)',
      status: ServiceStatus.UP,
      latencyMs: 1,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'S3 Object Storage',
      status: ServiceStatus.UP,
      latencyMs: 7,
      lastChecked: new Date().toISOString(),
    },
  ],
};

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'al-001',
    actorUserId: 'u-sa-001',
    actorEmail: 'superadmin@ebs.in',
    actorRoles: [UserRole.SUPER_ADMIN],
    action: AuditAction.FEATURE_FLAG_TOGGLED,
    resourceType: AuditResourceType.FEATURE_FLAG,
    resourceId: 'ff-booking-v2',
    resourceLabel: 'Booking System V2',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.0.1',
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    id: 'al-002',
    actorUserId: 'u-ba-001',
    actorEmail: 'booking.admin@ebs.in',
    actorRoles: [UserRole.BOOKING_ADMIN],
    action: AuditAction.ATTENDANCE_MARKED,
    resourceType: AuditResourceType.BOOKING,
    resourceId: 'bk-harishchandragad-oct-2026',
    resourceLabel: 'Harishchandragad Trek Oct 2026',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.2.15',
    createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
  },
  {
    id: 'al-003',
    actorUserId: 'u-fa-001',
    actorEmail: 'finance@ebs.in',
    actorRoles: [UserRole.FINANCE_ADMIN],
    action: AuditAction.REFUND_INITIATED,
    resourceType: AuditResourceType.PAYMENT,
    resourceId: 'pay-0193ab',
    resourceLabel: '₹4,500 Refund — Traveller #TRV-00421',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.1.8',
    createdAt: new Date(Date.now() - 42 * 60_000).toISOString(),
  },
  {
    id: 'al-004',
    actorUserId: 'u-sa-001',
    actorEmail: 'superadmin@ebs.in',
    actorRoles: [UserRole.SUPER_ADMIN],
    action: AuditAction.UPFRONT_PERCENTAGE_CHANGED,
    resourceType: AuditResourceType.SYSTEM_CONFIG,
    resourceId: 'cfg-upfront-pct',
    resourceLabel: 'Chadar Trek: 50% → 100%',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.0.1',
    changes: { before: { percentage: 50 }, after: { percentage: 100 } },
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'al-005',
    actorUserId: 'u-mod-001',
    actorEmail: 'moderator@ebs.in',
    actorRoles: [UserRole.MODERATOR],
    action: AuditAction.POST_MODERATED,
    resourceType: AuditResourceType.POST,
    resourceId: 'pst-viral-001',
    resourceLabel: 'Post #pst-viral-001',
    outcome: AuditOutcome.SUCCESS,
    ipAddress: '10.0.3.22',
    createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
];

const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'ff-001',
    key: 'booking_system_v2',
    displayName: 'Booking System V2',
    description: 'New batch booking engine with real-time slot locking and WebSocket updates.',
    isEnabled: true,
    scope: FeatureFlagScope.GLOBAL,
    lastModifiedBy: 'superadmin@ebs.in',
    lastModifiedAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
  },
  {
    id: 'ff-002',
    key: 'gis_vector_tiles_v3',
    displayName: 'GIS Vector Tiles V3',
    description: 'Next-generation vector tile renderer for the Bharat Discovery Engine.',
    isEnabled: true,
    scope: FeatureFlagScope.CANARY,
    rolloutPercentage: 25,
    lastModifiedBy: 'superadmin@ebs.in',
    lastModifiedAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 86400_000).toISOString(),
  },
  {
    id: 'ff-003',
    key: 'social_stories',
    displayName: 'Social Stories Feature',
    description: 'Instagram-style 24-hour stories for travellers to share trip moments.',
    isEnabled: true,
    scope: FeatureFlagScope.GLOBAL,
    createdAt: new Date(Date.now() - 30 * 86400_000).toISOString(),
  },
  {
    id: 'ff-004',
    key: 'certificate_qr_v2',
    displayName: 'Certificate QR V2',
    description:
      'Enhanced QR code with ECC 256 embedded certificate hash for offline verification.',
    isEnabled: false,
    scope: FeatureFlagScope.ROLE_BASED,
    affectedRoles: [UserRole.BOOKING_ADMIN],
    createdAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
  },
  {
    id: 'ff-005',
    key: 'maintenance_mode',
    displayName: 'Maintenance Mode',
    description: 'Activates global read-only maintenance banner across the public platform.',
    isEnabled: false,
    scope: FeatureFlagScope.GLOBAL,
    createdAt: new Date(Date.now() - 90 * 86400_000).toISOString(),
  },
  {
    id: 'ff-006',
    key: 'dpdp_consent_v2',
    displayName: 'DPDP Act 2023 Consent V2',
    description: 'Enhanced granular consent management compliant with DPDP Act 2023 Section 7.',
    isEnabled: true,
    scope: FeatureFlagScope.GLOBAL,
    createdAt: new Date(Date.now() - 45 * 86400_000).toISOString(),
  },
];

// ─── Quick Action Links ───────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'User Management', href: '/super-admin/users', icon: '👥', color: 'indigo' },
  {
    label: 'Moderation Queue',
    href: '/super-admin/moderation/reviews',
    icon: '⚠️',
    color: 'orange',
  },
  { label: 'Payment Controls', href: '/payment-admin/controls', icon: '💳', color: 'blue' },
  {
    label: 'Certificate Admin',
    href: '/certificate-admin/certificates',
    icon: '🏅',
    color: 'amber',
  },
  {
    label: 'Feature Flags',
    href: '/super-admin/system/feature-flags',
    icon: '🚩',
    color: 'purple',
  },
  { label: 'Report Generator', href: '/super-admin/reports', icon: '📊', color: 'emerald' },
  { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: '📋', color: 'red' },
  { label: 'Health Dashboard', href: '/super-admin/monitoring/health', icon: '💚', color: 'green' },
];

const colorVariants: Record<string, string> = {
  indigo:
    'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-950/50',
  orange:
    'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/50',
  blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50',
  amber:
    'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/50',
  purple:
    'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-950/50',
  emerald:
    'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50',
  red: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/50',
  green:
    'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/50',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SuperAdminDashboardPage() {
  const { isSuperAdmin } = useAdminRbac();
  const [auditPage, setAuditPage] = React.useState(1);
  const [flagPending, setFlagPending] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'health' | 'flags' | 'audit'>(
    'overview',
  );

  const handleFlagToggle = (key: string, _isEnabled: boolean) => {
    if (!isSuperAdmin) return;
    setFlagPending(true);
    // In production: call PATCH /api/v1/admin/feature-flags/:key
    setTimeout(() => setFlagPending(false), 800);
    console.info('[AUDIT] Feature flag toggle requested:', key, _isEnabled);
  };

  const tabs = [
    { id: 'overview', label: 'Platform Overview', icon: '🌐' },
    { id: 'health', label: 'System Health', icon: '💚' },
    { id: 'flags', label: 'Feature Flags', icon: '🚩' },
    { id: 'audit', label: 'Audit Stream', icon: '📋' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Super Admin Global Governance Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Platform telemetry · System invariants · Ecosystem vitals ·{' '}
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              Zero-Trust Active
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 hidden lg:block">
            {new Date().toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
              aria-hidden="true"
            />
            All Systems Operational
          </span>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <section aria-label="Quick actions">
        <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {QUICK_ACTIONS.map(action => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-150 text-center ${colorVariants[action.color] ?? colorVariants.indigo}`}
              aria-label={`Go to ${action.label}`}
            >
              <span className="text-xl" aria-hidden="true">
                {action.icon}
              </span>
              <span className="text-[10px] font-semibold leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex gap-0" role="tablist" aria-label="Dashboard sections">
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <div id="tabpanel-overview" role="tabpanel" aria-label="Platform Overview">
            <StatsOverview stats={MOCK_STATS} />
          </div>
        )}

        {activeTab === 'health' && (
          <div id="tabpanel-health" role="tabpanel" aria-label="System Health">
            <SystemHealthPanel
              health={MOCK_HEALTH}
              onRefresh={() => {
                // In production: revalidate /api/v1/admin/health
                console.info('[ADMIN] System health refresh requested');
              }}
            />
          </div>
        )}

        {activeTab === 'flags' && (
          <div id="tabpanel-flags" role="tabpanel" aria-label="Feature Flags">
            <FeatureFlagsPanel
              flags={MOCK_FEATURE_FLAGS}
              isLoading={flagPending}
              isSuperAdmin={isSuperAdmin}
              onToggle={handleFlagToggle}
            />
          </div>
        )}

        {activeTab === 'audit' && (
          <div id="tabpanel-audit" role="tabpanel" aria-label="Audit Stream">
            <AuditLogTable
              logs={MOCK_AUDIT_LOGS}
              currentPage={auditPage}
              totalPages={Math.ceil(MOCK_AUDIT_LOGS.length / 10)}
              totalRecords={MOCK_AUDIT_LOGS.length}
              onPageChange={setAuditPage}
            />
          </div>
        )}
      </div>

      {/* Security Invariants Notice */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="text-lg flex-shrink-0" aria-hidden="true">
            🔒
          </span>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active Security Invariants (EBS-DOC-40-SEC-BLUEPRINT)
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
              <div>• All actions are recorded in the append-only immutable audit ledger</div>
              <div>
                • VillageScopeGuard enforcing PostgreSQL Row-Level Security on all village tenants
              </div>
              <div>• mTLS enforced on all inter-service communication within Kubernetes mesh</div>
              <div>
                • Zero direct writes to production tables — staging queue mandatory for all content
                mutations
              </div>
              <div>
                • DPDP Act 2023 DLP pipeline active — personal identifiers auto-sanitized on
                ingestion
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
