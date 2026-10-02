'use client';

// Explore Bharat Safar — User Management Page
// Reference: EBS-DOC-13-ADMIN Section 2 (Role Access Matrix)
// EBS-DOC-40-SEC-BLUEPRINT Section 4 (RBAC)
// Sprint 9: Item 17 (User Management)

import * as React from 'react';
import { UserManagementTable } from '@/features/admin-dashboard';
import { useAdminRbac } from '@/hooks/use-admin-rbac';
import type { AdminUser } from '@ebs/types';
import { UserRole, AccountStatus } from '@ebs/types';

const MOCK_USERS: AdminUser[] = [
  {
    id: 'u-001',
    email: 'rajesh.kumar@gmail.com',
    fullName: 'Rajesh Kumar',
    status: AccountStatus.ACTIVE,
    roles: [UserRole.TRAVELLER],
    isEmailVerified: true,
    isPhoneVerified: true,
    loginCount: 48,
    createdAt: '2026-01-15T09:23:00Z',
    updatedAt: '2026-09-28T14:10:00Z',
  },
  {
    id: 'u-002',
    email: 'priya.sharma@outlook.com',
    fullName: 'Priya Sharma',
    status: AccountStatus.ACTIVE,
    roles: [UserRole.TRAVELLER, UserRole.LOCAL_GUIDE],
    isEmailVerified: true,
    isPhoneVerified: false,
    loginCount: 122,
    createdAt: '2025-11-02T11:45:00Z',
    updatedAt: '2026-09-29T08:22:00Z',
  },
  {
    id: 'u-003',
    email: 'village.admin.satara@ebs.in',
    fullName: 'Anand Patil (Satara)',
    status: AccountStatus.ACTIVE,
    roles: [UserRole.VILLAGE_ADMIN],
    assignedVillageId: 'vl-mh-satara-wai-0001',
    isEmailVerified: true,
    isPhoneVerified: true,
    loginCount: 214,
    createdAt: '2025-10-10T07:30:00Z',
    updatedAt: '2026-09-30T10:00:00Z',
  },
  {
    id: 'u-004',
    email: 'booking.admin@ebs.in',
    fullName: 'Sunita Desai',
    status: AccountStatus.ACTIVE,
    roles: [UserRole.BOOKING_ADMIN],
    isEmailVerified: true,
    isPhoneVerified: true,
    loginCount: 892,
    createdAt: '2025-08-01T08:00:00Z',
    updatedAt: '2026-09-30T12:30:00Z',
  },
  {
    id: 'u-005',
    email: 'spam.user42@temp.com',
    fullName: undefined,
    status: AccountStatus.SUSPENDED,
    roles: [UserRole.TRAVELLER],
    isEmailVerified: false,
    isPhoneVerified: false,
    loginCount: 3,
    createdAt: '2026-09-25T21:14:00Z',
    updatedAt: '2026-09-26T09:00:00Z',
  },
  {
    id: 'u-006',
    email: 'finance@ebs.in',
    fullName: 'Meera Iyer',
    status: AccountStatus.ACTIVE,
    roles: [UserRole.FINANCE_ADMIN],
    isEmailVerified: true,
    isPhoneVerified: true,
    loginCount: 441,
    createdAt: '2025-09-15T10:00:00Z',
    updatedAt: '2026-09-30T09:15:00Z',
  },
  {
    id: 'u-007',
    email: 'moderator@ebs.in',
    fullName: 'Arjun Singh',
    status: AccountStatus.ACTIVE,
    roles: [UserRole.MODERATOR],
    isEmailVerified: true,
    isPhoneVerified: true,
    loginCount: 628,
    createdAt: '2025-10-20T09:00:00Z',
    updatedAt: '2026-09-30T11:00:00Z',
  },
  {
    id: 'u-008',
    email: 'locked.user@gmail.com',
    fullName: 'Test User (Locked)',
    status: AccountStatus.LOCKED,
    roles: [UserRole.TRAVELLER],
    isEmailVerified: true,
    isPhoneVerified: false,
    loginCount: 7,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-09-20T14:00:00Z',
  },
];

export default function UserManagementPage() {
  const { canManageUsers, canManageRoles } = useAdminRbac();
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('ALL');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | null>(null);
  const [notification, setNotification] = React.useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch =
      !search ||
      u.email.includes(search) ||
      (u.fullName ?? '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.roles.includes(roleFilter as UserRole);
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleEditRoles = (user: AdminUser) => {
    if (!canManageRoles) return;
    setSelectedUser(user);
    setNotification({
      msg: `Role editor for ${user.email} — in production: opens role assignment modal.`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChangeStatus = (user: AdminUser) => {
    if (!canManageUsers) return;
    const newStatus = user.status === AccountStatus.ACTIVE ? 'Suspended' : 'Activated';
    setNotification({
      msg: `Account ${newStatus}: ${user.email} — in production: calls PATCH /api/v1/admin/users/${user.id}/status.`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage traveller accounts, assign roles, control account status · RBAC: SYSTEM_ADMIN+
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
          disabled={!canManageUsers}
          aria-label="Invite new user"
        >
          <span aria-hidden="true">➕</span>
          Invite User
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          role="alert"
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          <span aria-hidden="true">{notification.type === 'success' ? '✅' : '❌'}</span>
          {notification.msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex-1 min-w-[200px] relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            aria-hidden="true"
          >
            🔍
          </span>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email or name…"
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Search users"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Filter by role"
        >
          <option value="ALL">All Roles</option>
          {Object.values(UserRole).map(r => (
            <option key={r} value={r}>
              {r.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Filter by status"
        >
          <option value="ALL">All Statuses</option>
          {Object.values(AccountStatus).map(s => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <UserManagementTable
          users={filtered}
          currentPage={currentPage}
          totalPages={Math.ceil(filtered.length / 10)}
          totalRecords={filtered.length}
          onPageChange={setCurrentPage}
          onEditRoles={canManageRoles ? handleEditRoles : undefined}
          onChangeStatus={canManageUsers ? handleChangeStatus : undefined}
          onViewDetails={user => setSelectedUser(user)}
        />
      </div>

      {/* RBAC notice */}
      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
        All account mutations are recorded in the immutable audit ledger (EBS-DOC-40-SEC §4) ·
        Denial-by-default on all endpoints lacking explicit @Roles decorators
      </div>
    </div>
  );
}
