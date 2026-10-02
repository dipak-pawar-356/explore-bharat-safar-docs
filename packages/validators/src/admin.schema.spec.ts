// Explore Bharat Safar — Admin Validator Tests
// Reference: EBS-DOC-13-ADMIN, EBS-DOC-40-SEC-BLUEPRINT

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  UpdateUserRolesSchema,
  UpdateUserStatusSchema,
  ToggleFeatureFlagSchema,
  UpdateGlobalPaymentPercentageSchema,
  AdminModerationActionSchema,
  AuditLogQuerySchema,
  GenerateReportSchema,
  UserManagementFilterSchema,
  TogglePlaceBookingSchema,
} from './admin.schema';
import { UserRole, AccountStatus } from '@ebs/types';

describe('Admin Validation Schemas — Sprint 9', () => {
  describe('UpdateUserRolesSchema', () => {
    it('should accept valid single role assignment', () => {
      const result = UpdateUserRolesSchema.safeParse({ roles: [UserRole.TRAVELLER] });
      assert.ok(result.success);
    });

    it('should accept VILLAGE_ADMIN with assignedVillageId', () => {
      const result = UpdateUserRolesSchema.safeParse({
        roles: [UserRole.VILLAGE_ADMIN],
        assignedVillageId: '550e8400-e29b-41d4-a716-446655440000',
      });
      assert.ok(result.success);
    });

    it('should reject empty roles array', () => {
      const result = UpdateUserRolesSchema.safeParse({ roles: [] });
      assert.strictEqual(result.success, false);
    });

    it('should reject more than 5 simultaneous roles', () => {
      const result = UpdateUserRolesSchema.safeParse({
        roles: [
          UserRole.TRAVELLER,
          UserRole.VILLAGE_ADMIN,
          UserRole.BOOKING_ADMIN,
          UserRole.FINANCE_ADMIN,
          UserRole.MODERATOR,
          UserRole.CONTENT_EDITOR,
        ],
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid role name', () => {
      const result = UpdateUserRolesSchema.safeParse({ roles: ['INVALID_ROLE'] });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid assignedVillageId UUID format', () => {
      const result = UpdateUserRolesSchema.safeParse({
        roles: [UserRole.VILLAGE_ADMIN],
        assignedVillageId: 'not-a-valid-uuid',
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('UpdateUserStatusSchema', () => {
    it('should accept ACTIVE status', () => {
      const result = UpdateUserStatusSchema.safeParse({ status: AccountStatus.ACTIVE });
      assert.ok(result.success);
    });

    it('should accept SUSPENDED with reason', () => {
      const result = UpdateUserStatusSchema.safeParse({
        status: AccountStatus.SUSPENDED,
        reason: 'Multiple policy violations reported by users.',
      });
      assert.ok(result.success);
    });

    it('should reject invalid status value', () => {
      const result = UpdateUserStatusSchema.safeParse({ status: 'BANNED' });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing status field', () => {
      const result = UpdateUserStatusSchema.safeParse({});
      assert.strictEqual(result.success, false);
    });
  });

  describe('ToggleFeatureFlagSchema', () => {
    it('should accept isEnabled=true', () => {
      const result = ToggleFeatureFlagSchema.safeParse({ isEnabled: true });
      assert.ok(result.success);
    });

    it('should accept isEnabled=false with optional reason', () => {
      const result = ToggleFeatureFlagSchema.safeParse({
        isEnabled: false,
        reason: 'Rolling back due to critical bug in feature.',
      });
      assert.ok(result.success);
    });

    it('should reject non-boolean isEnabled value', () => {
      const result = ToggleFeatureFlagSchema.safeParse({ isEnabled: 'yes' });
      assert.strictEqual(result.success, false);
    });

    it('should reject rolloutPercentage above 100', () => {
      const result = ToggleFeatureFlagSchema.safeParse({
        isEnabled: true,
        rolloutPercentage: 150,
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject rolloutPercentage below 0', () => {
      const result = ToggleFeatureFlagSchema.safeParse({
        isEnabled: true,
        rolloutPercentage: -5,
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('UpdateGlobalPaymentPercentageSchema', () => {
    it('should accept valid 25% with reason', () => {
      const result = UpdateGlobalPaymentPercentageSchema.safeParse({
        percentage: 25,
        reason: 'Standard Q3 policy update.',
      });
      assert.ok(result.success);
    });

    it('should accept minimum 10%', () => {
      const result = UpdateGlobalPaymentPercentageSchema.safeParse({
        percentage: 10,
        reason: 'Minimum threshold promotional event.',
      });
      assert.ok(result.success);
    });

    it('should accept maximum 100%', () => {
      const result = UpdateGlobalPaymentPercentageSchema.safeParse({
        percentage: 100,
        reason: 'Full upfront for Everest Base Camp expeditions.',
      });
      assert.ok(result.success);
    });

    it('should reject percentage below 10 (< 10% is prohibited)', () => {
      const result = UpdateGlobalPaymentPercentageSchema.safeParse({
        percentage: 5,
        reason: 'Trying to set below minimum',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject percentage above 100', () => {
      const result = UpdateGlobalPaymentPercentageSchema.safeParse({
        percentage: 110,
        reason: 'Excess',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing reason field', () => {
      const result = UpdateGlobalPaymentPercentageSchema.safeParse({ percentage: 25 });
      assert.strictEqual(result.success, false);
    });
  });

  describe('AdminModerationActionSchema', () => {
    it('should accept APPROVE action', () => {
      const result = AdminModerationActionSchema.safeParse({ action: 'APPROVE' });
      assert.ok(result.success);
    });

    it('should accept REJECT with reason', () => {
      const result = AdminModerationActionSchema.safeParse({
        action: 'REJECT',
        reason: 'Content violates community guidelines on offensive language.',
      });
      assert.ok(result.success);
    });

    it('should accept REMOVE action', () => {
      const result = AdminModerationActionSchema.safeParse({
        action: 'REMOVE',
        reason: 'Illegal content detected',
        notes: 'Reported to cyber cell.',
      });
      assert.ok(result.success);
    });

    it('should accept ESCALATE action', () => {
      const result = AdminModerationActionSchema.safeParse({ action: 'ESCALATE' });
      assert.ok(result.success);
    });

    it('should reject invalid moderation action', () => {
      const result = AdminModerationActionSchema.safeParse({ action: 'DELETE' });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing action field', () => {
      const result = AdminModerationActionSchema.safeParse({ reason: 'No action provided' });
      assert.strictEqual(result.success, false);
    });
  });

  describe('AuditLogQuerySchema', () => {
    it('should apply defaults when no params provided', () => {
      const result = AuditLogQuerySchema.safeParse({});
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.page, 1);
        assert.strictEqual(result.data.limit, 50);
      }
    });

    it('should accept valid outcome filter', () => {
      const result = AuditLogQuerySchema.safeParse({ outcome: 'SUCCESS' });
      assert.ok(result.success);
    });

    it('should reject invalid outcome filter', () => {
      const result = AuditLogQuerySchema.safeParse({ outcome: 'MAYBE' });
      assert.strictEqual(result.success, false);
    });

    it('should reject limit above 200 for audit logs', () => {
      const result = AuditLogQuerySchema.safeParse({ limit: 500 });
      assert.strictEqual(result.success, false);
    });
  });

  describe('GenerateReportSchema', () => {
    it('should accept valid report type with default CSV format', () => {
      const result = GenerateReportSchema.safeParse({ reportType: 'BOOKING_SUMMARY' });
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.format, 'CSV');
      }
    });

    it('should accept REVENUE_SUMMARY with PDF format', () => {
      const result = GenerateReportSchema.safeParse({
        reportType: 'REVENUE_SUMMARY',
        format: 'PDF',
      });
      assert.ok(result.success);
    });

    it('should accept date range parameters', () => {
      const result = GenerateReportSchema.safeParse({
        reportType: 'AUDIT_LOG_EXPORT',
        format: 'CSV',
        fromDate: '2026-09-01T00:00:00.000Z',
        toDate: '2026-09-30T23:59:59.000Z',
      });
      assert.ok(result.success);
    });

    it('should reject invalid report type', () => {
      const result = GenerateReportSchema.safeParse({ reportType: 'FINANCIAL_MAGIC' });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid format', () => {
      const result = GenerateReportSchema.safeParse({
        reportType: 'BOOKING_SUMMARY',
        format: 'XML',
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('UserManagementFilterSchema', () => {
    it('should apply default page and limit', () => {
      const result = UserManagementFilterSchema.safeParse({});
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.page, 1);
        assert.strictEqual(result.data.limit, 20);
      }
    });

    it('should accept search with role and status', () => {
      const result = UserManagementFilterSchema.safeParse({
        search: 'sharma',
        role: UserRole.TRAVELLER,
        status: AccountStatus.ACTIVE,
        page: 1,
        limit: 50,
      });
      assert.ok(result.success);
    });

    it('should coerce string numbers for page and limit', () => {
      const result = UserManagementFilterSchema.safeParse({ page: '2', limit: '10' });
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.page, 2);
        assert.strictEqual(result.data.limit, 10);
      }
    });

    it('should reject limit above 100', () => {
      const result = UserManagementFilterSchema.safeParse({ limit: 200 });
      assert.strictEqual(result.success, false);
    });
  });

  describe('TogglePlaceBookingSchema', () => {
    it('should accept enabled=true with experienceId', () => {
      const result = TogglePlaceBookingSchema.safeParse({
        enabled: true,
        experienceId: '550e8400-e29b-41d4-a716-446655440000',
        reason: 'Opening bookings for Harishchandragad.',
      });
      assert.ok(result.success);
    });

    it('should accept enabled=false without experienceId', () => {
      const result = TogglePlaceBookingSchema.safeParse({
        enabled: false,
        reason: 'Seasonal closure for monsoon restoration.',
      });
      assert.ok(result.success);
    });

    it('should reject non-boolean enabled value', () => {
      const result = TogglePlaceBookingSchema.safeParse({ enabled: 'yes' });
      assert.strictEqual(result.success, false);
    });
  });
});
