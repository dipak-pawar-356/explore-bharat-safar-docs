'use client';

// Explore Bharat Safar — Role Management Page
// Reference: EBS-DOC-13-ADMIN Section 2, EBS-DOC-40-SEC-BLUEPRINT Section 4
// Sprint 9: Item 18 (Role Management)

import * as React from 'react';
import { useAdminRbac } from '@/hooks/use-admin-rbac';
import { UserRole, Permission, ROLE_PERMISSIONS_MAP } from '@ebs/types';

const ROLE_DESCRIPTIONS: Record<UserRole, { desc: string; icon: string; color: string }> = {
  [UserRole.GUEST]: {
    desc: 'Unauthenticated public access — read-only discovery and public village data.',
    icon: '👤',
    color: 'slate',
  },
  [UserRole.TRAVELLER]: {
    desc: 'Authenticated traveller — can book, review, create social posts, and earn certificates.',
    icon: '🧳',
    color: 'indigo',
  },
  [UserRole.LOCAL_GUIDE]: {
    desc: 'Certified local guide — same as Traveller with guide profile visibility.',
    icon: '🗺️',
    color: 'teal',
  },
  [UserRole.VILLAGE_ADMIN]: {
    desc: 'Village representative — can submit updates for their assigned village only. VillageScopeGuard enforced.',
    icon: '🏘️',
    color: 'emerald',
  },
  [UserRole.MODERATOR]: {
    desc: 'Content moderator — reviews flagged posts, village submissions, and reports.',
    icon: '🛡️',
    color: 'orange',
  },
  [UserRole.CONTENT_EDITOR]: {
    desc: 'Content editor — manages CMS pages, banners, FAQs, and media library.',
    icon: '✏️',
    color: 'yellow',
  },
  [UserRole.BOOKING_ADMIN]: {
    desc: 'Booking administrator — manages expedition batches, manifests, attendance, and certificate releases.',
    icon: '📅',
    color: 'blue',
  },
  [UserRole.FINANCE_ADMIN]: {
    desc: 'Finance administrator — manages transaction ledger, refund approvals, and payment reconciliation.',
    icon: '💰',
    color: 'green',
  },
  [UserRole.SYSTEM_ADMIN]: {
    desc: 'System administrator — broad operational access. Cannot view audit logs or modify Super Admin configurations.',
    icon: '⚙️',
    color: 'purple',
  },
  [UserRole.SUPER_ADMIN]: {
    desc: 'Platform owner — unrestricted access with mandatory audit logging on every mutation.',
    icon: '🔴',
    color: 'red',
  },
};

const colorCls: Record<string, string> = {
  slate: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800',
  teal: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  orange: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
  yellow: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
  blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  green: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
  purple: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
  red: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
};

export default function RoleManagementPage() {
  const { isSuperAdmin } = useAdminRbac();
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);

  const displayRoles = Object.values(UserRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Role Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Platform role hierarchy and permission matrices · RBAC: SUPER_ADMIN only ·{' '}
          <span className="font-mono text-amber-600 dark:text-amber-400">
            Read-only in current session
          </span>
        </p>
      </div>

      {/* Access Gate */}
      {!isSuperAdmin && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-5 py-4 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <span aria-hidden="true">⚠️</span>
          Role management requires Super Admin privileges. You have view-only access.
        </div>
      )}

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayRoles.map(role => {
          const meta = ROLE_DESCRIPTIONS[role];
          const perms = ROLE_PERMISSIONS_MAP[role] ?? [];
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(isSelected ? null : role)}
              className={`text-left rounded-2xl border p-4 transition-all duration-150 hover:shadow-md ${colorCls[meta.color] ?? colorCls.slate} ${isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}
              aria-pressed={isSelected}
              aria-label={`${role} role details`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {role.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {meta.desc}
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-400 dark:text-slate-600">
                    {perms.length} permission{perms.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Expanded Permissions */}
              {isSelected && (
                <div className="mt-4 pt-3 border-t border-current/10">
                  <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Assigned Permissions
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {perms.map(p => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-white/60 dark:bg-black/20 text-slate-700 dark:text-slate-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* RBAC Matrix Reference */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Administration Module × Role Access Matrix (EBS-DOC-13-ADMIN §2)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-400 w-48">
                  Module
                </th>
                {[
                  'Super Admin',
                  'Booking Admin',
                  'Finance Admin',
                  'Village Admin',
                  'Moderator',
                  'Content Editor',
                ].map(r => (
                  <th
                    key={r}
                    className="px-3 py-2 text-center font-semibold text-slate-600 dark:text-slate-400"
                  >
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                ['Global System Settings', '✅ Full', '🚫', '🚫', '🚫', '🚫', '🚫'],
                ['Navigation Menu Builder', '✅ Full', '🚫', '🚫', '🚫', '🚫', '🚫'],
                ['Upfront Payment % Config', '✅ Full', '👁️ Read', '👁️ Read', '🚫', '🚫', '🚫'],
                ['Booking Toggle (is_enabled)', '✅ Full', '👁️ Read', '🚫', '🚫', '🚫', '🚫'],
                [
                  'Experience Catalog & Batches',
                  '✅ Full',
                  '✅ Full',
                  '👁️ Read',
                  '🚫',
                  '🚫',
                  '👁️ Read',
                ],
                ['Attendance & Manual Cert', '✅ Full', '✅ Full', '🚫', '🚫', '🚫', '🚫'],
                ['Transaction Ledger & Refunds', '✅ Full', '🚫', '✅ Full', '🚫', '🚫', '🚫'],
                ['Village Submission Queue', '✅ Full', '🚫', '🚫', '📤 Submit', '✅ Review', '🚫'],
                ['Flagged Content Queue', '✅ Full', '🚫', '🚫', '🚫', '✅ Full', '🚫'],
                ['Master Audit Log Inspector', '✅ Full', '🚫', '🚫', '🚫', '🚫', '🚫'],
              ].map(row => (
                <tr
                  key={row[0]}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-3 py-2 ${i === 0 ? 'font-medium text-slate-700 dark:text-slate-300' : 'text-center text-slate-500 dark:text-slate-400'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
