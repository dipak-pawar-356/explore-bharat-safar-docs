'use client';

// Explore Bharat Safar — Feature Flags Administration Page
// Reference: EBS-DOC-13-ADMIN Section 1.1 (Zero Hardcoding)
// Sprint 9: Item 46 (Feature Flags Administration)

import * as React from 'react';
import { FeatureFlagsPanel } from '@/features/admin-dashboard';
import { useAdminRbac } from '@/hooks/use-admin-rbac';
import type { FeatureFlag } from '@ebs/types';
import { FeatureFlagScope, UserRole } from '@ebs/types';

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
  {
    id: 'ff-007',
    key: 'new_admin_ui',
    displayName: 'New Admin UI (Sprint 9)',
    description: 'Enterprise governance console with role-based navigation and analytics panels.',
    isEnabled: true,
    scope: FeatureFlagScope.ROLE_BASED,
    affectedRoles: [UserRole.SUPER_ADMIN],
    createdAt: new Date(Date.now() - 1 * 86400_000).toISOString(),
  },
  {
    id: 'ff-008',
    key: 'offline_cert_verify',
    displayName: 'Offline Certificate Verification',
    description: 'Allow offline QR certificate verification without internet connection.',
    isEnabled: false,
    scope: FeatureFlagScope.CANARY,
    rolloutPercentage: 0,
    createdAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
  },
];

export default function FeatureFlagsPage() {
  const { canToggleFeatureFlags, isSuperAdmin } = useAdminRbac();
  const [flags, setFlags] = React.useState<FeatureFlag[]>(MOCK_FEATURE_FLAGS);

  const handleToggle = (key: string, isEnabled: boolean) => {
    if (!canToggleFeatureFlags) return;
    // In production: PATCH /api/v1/admin/feature-flags/:key — triggers audit log
    setFlags(prev => prev.map(f => (f.key === key ? { ...f, isEnabled } : f)));
    console.info('[AUDIT] Feature flag toggled:', key, '→', isEnabled);
  };

  const enabledCount = flags.filter(f => f.isEnabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Feature Flags
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Database-driven feature toggles · Zero Hardcoding (EBS-DOC-13-ADMIN §1.1) ·
            {enabledCount}/{flags.length} enabled · RBAC: SUPER_ADMIN only for toggles
          </p>
        </div>
        {isSuperAdmin && (
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Create new feature flag"
          >
            <span aria-hidden="true">➕</span>
            New Flag
          </button>
        )}
      </div>

      {/* Scope Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] font-mono text-slate-500 dark:text-slate-400">
        {Object.values(FeatureFlagScope).map(scope => (
          <div key={scope} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-600"
              aria-hidden="true"
            />
            <span>{scope}</span>
          </div>
        ))}
      </div>

      {/* Feature Flags Panel */}
      <FeatureFlagsPanel flags={flags} isSuperAdmin={isSuperAdmin} onToggle={handleToggle} />

      {/* Policy Note */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-4">
        <div className="flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          <span aria-hidden="true">🔏</span>
          <div className="space-y-1">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              Feature Flag Policy
            </div>
            <div>
              All flag toggles are recorded in the immutable audit ledger with actor identity,
              timestamp, and change delta.
            </div>
            <div>
              Flags with CANARY scope use rolling percentage — rolloutPercentage controls the
              fraction of users who receive the feature.
            </div>
            <div>
              The &ldquo;maintenance_mode&rdquo; flag removes interactive elements from the DOM (not
              CSS hidden) — this is a security requirement per EBS-DOC-13-ADMIN §1.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
