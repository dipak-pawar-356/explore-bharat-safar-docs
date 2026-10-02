'use client';

// Explore Bharat Safar — Permission Management Page
// Reference: EBS-DOC-40-SEC-BLUEPRINT Section 4
// Sprint 9: Item 19 (Permission Management)

import * as React from 'react';
import { Permission, ROLE_PERMISSIONS_MAP, type UserRole } from '@ebs/types';
import { useAdminRbac } from '@/hooks/use-admin-rbac';

const PERMISSION_GROUPS: { label: string; perms: Permission[] }[] = [
  {
    label: 'Authentication',
    perms: [
      Permission.AUTH_LOGIN,
      Permission.AUTH_REGISTER,
      Permission.AUTH_REFRESH,
      Permission.AUTH_LOGOUT,
    ],
  },
  {
    label: 'User Management',
    perms: [
      Permission.USER_READ_SELF,
      Permission.USER_UPDATE_SELF,
      Permission.USER_READ_ALL,
      Permission.USER_MANAGE_ROLES,
    ],
  },
  {
    label: 'Village Operations',
    perms: [Permission.VILLAGE_READ, Permission.VILLAGE_WRITE_SCOPED, Permission.VILLAGE_APPROVE],
  },
  {
    label: 'Booking System',
    perms: [
      Permission.BOOKING_CREATE,
      Permission.BOOKING_READ_SELF,
      Permission.BOOKING_READ_ALL,
      Permission.BOOKING_VERIFY_ATTENDANCE,
    ],
  },
  {
    label: 'Payments',
    perms: [Permission.PAYMENT_READ, Permission.PAYMENT_REFUND],
  },
  {
    label: 'Social & Reviews',
    perms: [Permission.REVIEW_SUBMIT, Permission.SOCIAL_POST_CREATE],
  },
  {
    label: 'Administration',
    perms: [Permission.ADMIN_ALL],
  },
];

function getRolesForPermission(permission: Permission): UserRole[] {
  return Object.entries(ROLE_PERMISSIONS_MAP)
    .filter(([, perms]) => (perms as Permission[]).includes(permission))
    .map(([role]) => role as UserRole);
}

export default function PermissionManagementPage() {
  const { isSuperAdmin } = useAdminRbac();
  const [searchPerm, setSearchPerm] = React.useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Permission Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Canonical permission definitions and role assignments · RBAC: SUPER_ADMIN only
        </p>
      </div>

      {!isSuperAdmin && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-5 py-4 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <span aria-hidden="true">⚠️</span>
          Permission management requires Super Admin privileges. View-only access granted.
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
          aria-hidden="true"
        >
          🔍
        </span>
        <input
          type="search"
          value={searchPerm}
          onChange={e => setSearchPerm(e.target.value)}
          placeholder="Search permissions…"
          className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Search permissions"
        />
      </div>

      {/* Permission Groups */}
      <div className="space-y-4">
        {PERMISSION_GROUPS.map(group => {
          const filtered = group.perms.filter(
            p => !searchPerm || p.toLowerCase().includes(searchPerm.toLowerCase()),
          );
          if (filtered.length === 0) return null;
          return (
            <div
              key={group.label}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {group.label} Permissions
                </h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(perm => {
                  const rolesWithPerm = getRolesForPermission(perm);
                  return (
                    <div key={perm} className="flex items-start gap-4 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">
                          {perm}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {rolesWithPerm.map(role => (
                            <span
                              key={role}
                              className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 uppercase"
                            >
                              {role.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 flex-shrink-0">
                        {rolesWithPerm.length} role{rolesWithPerm.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
        Permissions are enforced server-side via @Permissions() decorators on NestJS controllers ·
        Denial-by-default (EBS-DOC-40-SEC §4) · Never evaluated client-side for security decisions
      </div>
    </div>
  );
}
