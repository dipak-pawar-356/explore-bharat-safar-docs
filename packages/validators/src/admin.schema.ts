// Explore Bharat Safar — Admin Validation Schemas
// Conforms to EBS-DOC-13-ADMIN, EBS-DOC-40-SEC-BLUEPRINT

import { z } from 'zod';
import { UserRole, AccountStatus } from '@ebs/types';

// ---------------------------------------------------------------------------
// User Management Schemas
// ---------------------------------------------------------------------------

export const UpdateUserRolesSchema = z.object({
  roles: z
    .array(z.nativeEnum(UserRole))
    .min(1, 'At least one role must be assigned')
    .max(5, 'A user cannot hold more than 5 simultaneous roles'),
  assignedVillageId: z.string().uuid('assignedVillageId must be a valid UUID').optional(),
});

export const UpdateUserStatusSchema = z.object({
  status: z.nativeEnum(AccountStatus),
  reason: z
    .string()
    .min(5, 'Status change reason must be at least 5 characters')
    .max(500)
    .optional(),
});

export const UserManagementFilterSchema = z.object({
  search: z.string().max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'lastLoginAt', 'email', 'fullName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ---------------------------------------------------------------------------
// System Configuration Schemas
// ---------------------------------------------------------------------------

export const ToggleFeatureFlagSchema = z.object({
  isEnabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  reason: z.string().min(5).max(500).optional(),
});

export const UpdateSystemConfigSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean()]),
  reason: z.string().min(5).max(500),
});

// ---------------------------------------------------------------------------
// Navigation Tree Schema
// ---------------------------------------------------------------------------

const NavigationSectionSchema: z.ZodType<{
  id: string;
  slug: string;
  label: string;
  icon?: string;
  position: number;
  isVisible: boolean;
  href?: string;
  children?: unknown[];
  requiredRoles?: UserRole[];
}> = z.lazy(() =>
  z.object({
    id: z.string().min(1).max(100),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/u, 'Slug must be lowercase alphanumeric with hyphens'),
    label: z.string().min(1).max(120),
    icon: z.string().max(50).optional(),
    position: z.number().int().min(0).max(999),
    isVisible: z.boolean(),
    href: z.string().max(255).optional(),
    children: z.array(NavigationSectionSchema).max(50).optional(),
    requiredRoles: z.array(z.nativeEnum(UserRole)).optional(),
  }),
);

export const UpdateNavigationTreeSchema = z.object({
  sections: z.array(NavigationSectionSchema).min(1).max(50),
});

// ---------------------------------------------------------------------------
// Payment Configuration Schemas
// ---------------------------------------------------------------------------

export const UpdateGlobalPaymentPercentageSchema = z.object({
  percentage: z
    .number()
    .int()
    .min(10, 'Upfront percentage cannot be less than 10%')
    .max(100, 'Upfront percentage cannot exceed 100%'),
  reason: z.string().min(5).max(500),
});

export const UpdateExperiencePaymentPercentageSchema = z.object({
  experienceId: z.string().uuid('experienceId must be a valid UUID'),
  percentage: z.number().int().min(10).max(100),
  reason: z.string().min(5).max(500),
});

// ---------------------------------------------------------------------------
// Moderation Schemas
// ---------------------------------------------------------------------------

export const AdminModerationActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REMOVE', 'WARN_USER', 'SUSPEND_USER', 'ESCALATE']),
  reason: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// Audit Log Query Schemas
// ---------------------------------------------------------------------------

export const AuditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  actorUserId: z.string().uuid().optional(),
  action: z.string().max(100).optional(),
  resourceType: z.string().max(100).optional(),
  resourceId: z.string().max(255).optional(),
  outcome: z.enum(['SUCCESS', 'FAILURE', 'PARTIAL']).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

// ---------------------------------------------------------------------------
// Report Generation Schemas
// ---------------------------------------------------------------------------

export const GenerateReportSchema = z.object({
  reportType: z.enum([
    'BOOKING_SUMMARY',
    'REVENUE_SUMMARY',
    'USER_ACTIVITY',
    'VILLAGE_ACTIVITY',
    'CERTIFICATE_ISSUANCE',
    'PAYMENT_RECONCILIATION',
    'MODERATION_ACTIVITY',
    'AUDIT_LOG_EXPORT',
    'SYSTEM_HEALTH',
    'SOCIAL_ANALYTICS',
    'GIS_ANALYTICS',
  ]),
  format: z.enum(['CSV', 'PDF', 'JSON', 'XLSX']).default('CSV'),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// Place Booking Toggle Schema
// ---------------------------------------------------------------------------

export const TogglePlaceBookingSchema = z.object({
  enabled: z.boolean(),
  experienceId: z.string().uuid().optional(),
  reason: z.string().min(5).max(500).optional(),
});

// ---------------------------------------------------------------------------
// Exported Types from Schemas
// ---------------------------------------------------------------------------

export type UpdateUserRolesInput = z.infer<typeof UpdateUserRolesSchema>;
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>;
export type UserManagementFilterInput = z.infer<typeof UserManagementFilterSchema>;
export type ToggleFeatureFlagInput = z.infer<typeof ToggleFeatureFlagSchema>;
export type UpdateSystemConfigInput = z.infer<typeof UpdateSystemConfigSchema>;
export type UpdateNavigationTreeInput = z.infer<typeof UpdateNavigationTreeSchema>;
export type UpdateGlobalPaymentPercentageInput = z.infer<
  typeof UpdateGlobalPaymentPercentageSchema
>;
export type UpdateExperiencePaymentPercentageInput = z.infer<
  typeof UpdateExperiencePaymentPercentageSchema
>;
export type AdminModerationActionInput = z.infer<typeof AdminModerationActionSchema>;
export type AuditLogQueryInput = z.infer<typeof AuditLogQuerySchema>;
export type GenerateReportInput = z.infer<typeof GenerateReportSchema>;
export type TogglePlaceBookingInput = z.infer<typeof TogglePlaceBookingSchema>;
