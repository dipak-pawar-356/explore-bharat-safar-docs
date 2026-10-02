'use client';

// Explore Bharat Safar — Admin User Management Table
// Reference: EBS-DOC-13-ADMIN Section 2 (Role Access Matrix)

import * as React from 'react';
import type { AdminUser } from '@ebs/types';
import { UserRole, AccountStatus } from '@ebs/types';

interface UserManagementTableProps {
  users: AdminUser[];
  isLoading?: boolean;
  onEditRoles?: (user: AdminUser) => void;
  onChangeStatus?: (user: AdminUser) => void;
  onViewDetails?: (user: AdminUser) => void;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}

function getStatusBadge(status: AccountStatus) {
  switch (status) {
    case AccountStatus.ACTIVE:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 uppercase">
          Active
        </span>
      );
    case AccountStatus.SUSPENDED:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 uppercase">
          Suspended
        </span>
      );
    case AccountStatus.LOCKED:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 uppercase">
          Locked
        </span>
      );
    case AccountStatus.PENDING_VERIFICATION:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 uppercase">
          Pending
        </span>
      );
    default:
      return null;
  }
}

function getRoleBadge(role: UserRole) {
  const map: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    [UserRole.SYSTEM_ADMIN]:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    [UserRole.BOOKING_ADMIN]:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    [UserRole.FINANCE_ADMIN]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    [UserRole.MODERATOR]:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    [UserRole.CONTENT_EDITOR]:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    [UserRole.VILLAGE_ADMIN]:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    [UserRole.LOCAL_GUIDE]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    [UserRole.TRAVELLER]: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    [UserRole.GUEST]: 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400',
  };
  return map[role] ?? '';
}

export function UserManagementTable({
  users,
  isLoading,
  onEditRoles,
  onChangeStatus,
  onViewDetails,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
}: UserManagementTableProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array<null>(10)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing {users.length} of {totalRecords.toLocaleString('en-IN')} users
        </span>
        <span className="font-mono">
          Page {currentPage} / {totalPages}
        </span>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-600">
          <div className="text-3xl mb-2">👤</div>
          <div className="text-sm font-medium">No users found</div>
          <div className="text-xs mt-1">Try adjusting your search or filter criteria</div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {user.fullName ?? user.email}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                        {user.email}
                      </div>
                      {user.assignedVillageId && (
                        <div className="text-emerald-600 dark:text-emerald-400 text-[10px] font-mono mt-0.5">
                          Village: {user.assignedVillageId.slice(0, 8)}…
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map(role => (
                          <span
                            key={role}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getRoleBadge(role)}`}
                          >
                            {role.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <span
                          className={`text-[10px] font-semibold ${user.isEmailVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}
                        >
                          {user.isEmailVerified ? '✓' : '✗'} Email
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span
                          className={`text-[10px] font-semibold ${user.isPhoneVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
                        >
                          {user.isPhoneVerified ? '✓' : '—'} Phone
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(user)}
                            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-[11px] font-medium"
                          >
                            View
                          </button>
                        )}
                        {onEditRoles && (
                          <button
                            onClick={() => onEditRoles(user)}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors text-[11px] font-medium"
                          >
                            Roles
                          </button>
                        )}
                        {onChangeStatus && (
                          <button
                            onClick={() => onChangeStatus(user)}
                            className={`transition-colors text-[11px] font-medium ${
                              user.status === AccountStatus.ACTIVE
                                ? 'text-red-600 hover:text-red-800 dark:text-red-400'
                                : 'text-emerald-600 hover:text-emerald-800 dark:text-emerald-400'
                            }`}
                          >
                            {user.status === AccountStatus.ACTIVE ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            ← Previous
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
