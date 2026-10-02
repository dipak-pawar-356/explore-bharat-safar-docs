'use client';

// Explore Bharat Safar — System Configuration Console
// Reference: EBS-DOC-13-ADMIN Section 1.1 (Zero Hardcoding principle)
// EBS-DOC-40-SEC-BLUEPRINT Section 4
// Sprint 9: Item 45 (System Configuration), Item 48 (Maintenance Mode)
// All configuration values must be stored in database, never hardcoded.

import * as React from 'react';
import { useAdminRbac } from '@/hooks/use-admin-rbac';

interface SystemConfigEntry {
  key: string;
  displayName: string;
  description: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'percentage';
  category: string;
  isEditable: boolean;
  requiresRestart?: boolean;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

const MOCK_CONFIGS: SystemConfigEntry[] = [
  // Booking Controls
  {
    key: 'UPFRONT_PAYMENT_PCT_DEFAULT',
    displayName: 'Default Upfront Payment Percentage',
    description:
      'Global default deposit percentage required at booking time. Can be overridden per-expedition.',
    value: '25',
    type: 'percentage',
    category: 'Booking Controls',
    isEditable: true,
    lastModifiedBy: 'superadmin@ebs.in',
    lastModifiedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    key: 'BOOKING_ENABLED_GLOBAL',
    displayName: 'Booking System Enabled (Global)',
    description:
      'Master switch for the entire booking system. When disabled, all "Book Now" CTAs are removed from DOM (not hidden).',
    value: 'true',
    type: 'boolean',
    category: 'Booking Controls',
    isEditable: true,
    lastModifiedBy: 'superadmin@ebs.in',
    lastModifiedAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
  },
  {
    key: 'SLOT_LOCK_TTL_SECONDS',
    displayName: 'Booking Slot Lock TTL (seconds)',
    description: 'Time-to-live for optimistic slot locks during payment processing.',
    value: '600',
    type: 'number',
    category: 'Booking Controls',
    isEditable: true,
  },
  {
    key: 'MAX_BOOKINGS_PER_USER',
    displayName: 'Max Active Bookings Per User',
    description:
      'Maximum number of active (unpaid/confirmed) bookings a single user can hold simultaneously.',
    value: '5',
    type: 'number',
    category: 'Booking Controls',
    isEditable: true,
  },
  // Security Controls
  {
    key: 'SESSION_IDLE_TIMEOUT_MINUTES',
    displayName: 'Session Idle Timeout (minutes)',
    description:
      'Admin sessions expire after this period of inactivity. Applies to all admin roles.',
    value: '15',
    type: 'number',
    category: 'Security',
    isEditable: true,
    requiresRestart: false,
    lastModifiedBy: 'superadmin@ebs.in',
    lastModifiedAt: new Date(Date.now() - 30 * 86400_000).toISOString(),
  },
  {
    key: 'MFA_REQUIRED_FOR_ADMIN',
    displayName: 'MFA Required for Admin Roles',
    description: 'Enforces TOTP MFA for all administrative accounts (BOOKING_ADMIN and above).',
    value: 'true',
    type: 'boolean',
    category: 'Security',
    isEditable: true,
  },
  {
    key: 'RATE_LIMIT_LOGIN_ATTEMPTS',
    displayName: 'Login Rate Limit (attempts / 15 min)',
    description: 'Max failed login attempts before IP is flagged for Cloudflare WAF challenge.',
    value: '10',
    type: 'number',
    category: 'Security',
    isEditable: true,
  },
  // Platform
  {
    key: 'PLATFORM_NAME',
    displayName: 'Platform Name',
    description: 'Display name used across emails, certificates, and public pages.',
    value: 'Explore Bharat Safar',
    type: 'string',
    category: 'Platform',
    isEditable: true,
  },
  {
    key: 'SUPPORT_EMAIL',
    displayName: 'Support Email Address',
    description: 'Public support contact email address.',
    value: 'support@explorebharatsafar.com',
    type: 'string',
    category: 'Platform',
    isEditable: true,
  },
  {
    key: 'MAINTENANCE_MODE',
    displayName: 'Maintenance Mode',
    description:
      'When enabled, shows maintenance banner across all public pages. Admins bypass the banner.',
    value: 'false',
    type: 'boolean',
    category: 'Platform',
    isEditable: true,
  },
  // Certificate
  {
    key: 'CERTIFICATE_AUTO_RELEASE',
    displayName: 'Auto-Release Certificates',
    description:
      'Automatically issue certificates when balance payment is cleared. If false, requires manual release.',
    value: 'true',
    type: 'boolean',
    category: 'Certificates',
    isEditable: true,
  },
];

const CATEGORIES = [...new Set(MOCK_CONFIGS.map(c => c.category))];

export default function SystemConfigPage() {
  const { canConfigureSystem } = useAdminRbac();
  const [activeCategory, setActiveCategory] = React.useState(CATEGORIES[0]);
  const [editingKey, setEditingKey] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');
  const [saved, setSaved] = React.useState<string | null>(null);

  const filtered = MOCK_CONFIGS.filter(c => c.category === activeCategory);

  const handleEdit = (config: SystemConfigEntry) => {
    if (!canConfigureSystem) return;
    setEditingKey(config.key);
    setEditValue(config.value);
  };

  const handleSave = (config: SystemConfigEntry) => {
    // In production: PATCH /api/v1/admin/config/:key with audit trail
    console.info('[AUDIT] System config changed:', config.key, '→', editValue);
    setSaved(config.key);
    setEditingKey(null);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Database-driven platform configuration · Zero Hardcoding principle (EBS-DOC-13-ADMIN §1.1)
          · All changes are audit-logged · RBAC: SUPER_ADMIN only
        </p>
      </div>

      {!canConfigureSystem && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-5 py-3 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <span aria-hidden="true">⚠️</span>
          System configuration requires Super Admin privileges. View-only access.
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200 dark:border-slate-800 pb-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeCategory === cat
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300 dark:border-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            role="tab"
            aria-selected={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Config Items */}
      <div className="space-y-3">
        {filtered.map(config => {
          const isEditing = editingKey === config.key;
          const wasSaved = saved === config.key;
          return (
            <div
              key={config.key}
              className={`bg-white dark:bg-slate-900 rounded-2xl border ${wasSaved ? 'border-emerald-400 dark:border-emerald-600' : 'border-slate-200 dark:border-slate-800'} p-5 transition-all`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {config.displayName}
                    </div>
                    {config.requiresRestart && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 uppercase">
                        Requires Restart
                      </span>
                    )}
                    <span className="font-mono text-[9px] text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {config.key}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {config.description}
                  </p>
                  {config.lastModifiedBy && (
                    <div className="text-[9px] font-mono text-slate-300 dark:text-slate-700 mt-1">
                      Last modified by {config.lastModifiedBy} ·{' '}
                      {config.lastModifiedAt
                        ? new Date(config.lastModifiedAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <input
                        type={
                          config.type === 'number' || config.type === 'percentage'
                            ? 'number'
                            : 'text'
                        }
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-xs border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32 text-right font-mono"
                        aria-label={`Edit ${config.displayName}`}
                      />
                      <button
                        onClick={() => handleSave(config)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        aria-label="Save configuration change"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        aria-label="Cancel editing"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {config.type === 'boolean' ? (
                          <span
                            className={
                              config.value === 'true'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400'
                            }
                          >
                            {config.value === 'true' ? '✓ Enabled' : '✗ Disabled'}
                          </span>
                        ) : config.type === 'percentage' ? (
                          `${config.value}%`
                        ) : (
                          config.value
                        )}
                      </div>
                      {config.isEditable && canConfigureSystem && (
                        <button
                          onClick={() => handleEdit(config)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          aria-label={`Edit ${config.displayName}`}
                        >
                          Edit
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
        All configuration changes are recorded in the immutable audit ledger · Denial-by-default:
        config mutations require @Roles(SUPER_ADMIN) decorator
      </div>
    </div>
  );
}
