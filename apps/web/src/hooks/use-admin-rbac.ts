'use client';

// Explore Bharat Safar — Admin RBAC Hook
// Reference: EBS-DOC-13-ADMIN Section 2, EBS-DOC-40-SEC-BLUEPRINT Section 4
// Never evaluate permissions in client-side JavaScript for security decisions.
// This hook provides UI-gating only; server enforces RBAC guards on all mutations.

import { useAuthStore } from '@/store/auth.store';
import { UserRole, type Permission } from '@ebs/types';

/**
 * Hook providing role-based UI gating for the administration platform.
 * All security-critical decisions are enforced server-side via RolesGuard.
 * This hook is used exclusively to show/hide UI elements.
 */
export function useAdminRbac() {
  const { user, hasRole, hasAnyRole } = useAuthStore();

  const isSuperAdmin = hasRole(UserRole.SUPER_ADMIN);
  const isSystemAdmin = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN]);
  const isBookingAdmin = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.BOOKING_ADMIN]);
  const isFinanceAdmin = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN]);
  const isModerator = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.MODERATOR]);
  const isVillageAdmin = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.VILLAGE_ADMIN]);
  const isContentEditor = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.CONTENT_EDITOR]);

  const canManageUsers = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN]);
  const canManageRoles = isSuperAdmin;
  const canViewAuditLogs = isSuperAdmin;
  const canToggleFeatureFlags = isSuperAdmin;
  const canConfigureSystem = isSuperAdmin;
  const canManagePayments = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN]);
  const canApproveRefunds = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN]);
  const canManageBookings = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.BOOKING_ADMIN]);
  const canVerifyAttendance = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.BOOKING_ADMIN]);
  const canModerateContent = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.MODERATOR]);
  const canManageVillages = hasAnyRole([
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.VILLAGE_ADMIN,
  ]);
  const canPublishContent = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.CONTENT_EDITOR]);
  const canManageCertificates = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.BOOKING_ADMIN]);
  const canViewRevenue = hasAnyRole([
    UserRole.SUPER_ADMIN,
    UserRole.FINANCE_ADMIN,
    UserRole.SYSTEM_ADMIN,
  ]);

  const hasPermission = (permission: Permission): boolean => {
    if (!user?.permissions) return isSuperAdmin;
    return isSuperAdmin || (user.permissions as Permission[]).includes(permission);
  };

  return {
    user,
    isSuperAdmin,
    isSystemAdmin,
    isBookingAdmin,
    isFinanceAdmin,
    isModerator,
    isVillageAdmin,
    isContentEditor,
    canManageUsers,
    canManageRoles,
    canViewAuditLogs,
    canToggleFeatureFlags,
    canConfigureSystem,
    canManagePayments,
    canApproveRefunds,
    canManageBookings,
    canVerifyAttendance,
    canModerateContent,
    canManageVillages,
    canPublishContent,
    canManageCertificates,
    canViewRevenue,
    hasPermission,
  };
}
