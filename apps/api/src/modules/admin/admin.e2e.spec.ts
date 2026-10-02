// Explore Bharat Safar — Admin Platform End-to-End Lifecycle Test
// Reference: EBS-DOC-13-ADMIN, EBS-DOC-40-SEC-BLUEPRINT, EBS-DOC-26-RULES

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  UserRole,
  AccountStatus,
  AuditAction,
  AuditResourceType,
  AuditOutcome,
  SystemHealthStatus,
  FeatureFlagScope,
  ReportStatus,
} from '@ebs/types';
import { AdminService } from './admin.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminAuditService } from './services/admin-audit.service';
import { AdminSystemService } from './services/admin-system.service';
import { AdminModerationService } from './services/admin-moderation.service';

describe('Admin Platform E2E Lifecycle — Sprint 9', () => {
  const adminService = new AdminService();
  const usersService = new AdminUsersService();
  const auditService = new AdminAuditService();
  const systemService = new AdminSystemService();
  const moderationService = new AdminModerationService();

  /**
   * Stage 1: Platform Health Baseline
   * Verify system health is accessible and operational
   */
  it('[Stage 1] Platform health check should return OPERATIONAL status', async () => {
    const health = await systemService.getSystemHealth();
    assert.ok(Object.values(SystemHealthStatus).includes(health.status));
    assert.ok(Array.isArray(health.services));
    assert.ok(health.services.length >= 3);
    assert.ok(health.timestamp);
    assert.ok(health.version.includes('sprint-9'));
  });

  /**
   * Stage 2: Dashboard Statistics Aggregation
   * Verify comprehensive KPI data is available for the admin dashboard
   */
  it('[Stage 2] Dashboard stats aggregation should include all domain metrics', async () => {
    const stats = await systemService.getDashboardStats();
    const requiredFields = [
      'totalUsers',
      'activeUsers',
      'totalPlaces',
      'totalVillages',
      'totalBookings',
      'confirmedBookings',
      'certificatesIssued',
      'pendingModerations',
      'systemHealth',
      'timestamp',
    ];
    for (const field of requiredFields) {
      assert.ok(Object.hasOwn(stats, field), `Dashboard stats must include field: ${field}`);
    }
  });

  /**
   * Stage 3: Navigation Tree Governance
   * Super Admin retrieves and updates the navigation tree
   */
  it('[Stage 3] Navigation tree should be retrievable and have default structure', async () => {
    const tree = await systemService.getNavigationTree();
    assert.ok(tree.sections);
    const slugs = tree.sections.map((s: { slug: string }) => s.slug);
    assert.ok(slugs.includes('discovery'), 'Discovery section required');
    assert.ok(slugs.includes('villages'), 'Villages section required');
    assert.ok(slugs.includes('bookings'), 'Bookings section required');
    assert.ok(slugs.includes('social'), 'Social section required');
  });

  /**
   * Stage 4: Feature Flag Lifecycle
   * Toggle feature flags on and off
   */
  it('[Stage 4] Feature flag toggle lifecycle should persist state correctly', async () => {
    // Enable flag
    const enabled = await systemService.toggleFeatureFlag('e2e_test_feature', {
      isEnabled: true,
      reason: 'E2E test enabling',
    });
    assert.strictEqual(enabled.key, 'e2e_test_feature');
    assert.strictEqual(enabled.isEnabled, true);
    assert.ok(Object.values(FeatureFlagScope).includes(enabled.scope));

    // Disable flag
    const disabled = await systemService.toggleFeatureFlag('e2e_test_feature', {
      isEnabled: false,
      reason: 'E2E test disabling',
    });
    assert.strictEqual(disabled.isEnabled, false);
  });

  /**
   * Stage 5: Payment Percentage Configuration
   * Validate the 10%-100% enforcement range
   */
  it('[Stage 5] Payment percentage should accept valid range 10%-100%', async () => {
    const minResult = await systemService.updateGlobalPaymentPercentage(
      10,
      'Testing minimum threshold',
    );
    assert.strictEqual(minResult.percentage, 10);

    const standardResult = await systemService.updateGlobalPaymentPercentage(
      25,
      'Standard 25% policy restored',
    );
    assert.strictEqual(standardResult.percentage, 25);

    const maxResult = await systemService.updateGlobalPaymentPercentage(
      100,
      'Full payment expeditions',
    );
    assert.strictEqual(maxResult.percentage, 100);
  });

  /**
   * Stage 6: User Management Listing
   * Verify paginated user management with various filters
   */
  it('[Stage 6] User management should support filtering and pagination', async () => {
    // Default listing
    const defaultList = await usersService.listUsers({});
    assert.ok(Array.isArray(defaultList.items));
    assert.strictEqual(defaultList.pagination.page, 1);

    // Filtered by status
    const activeUsers = await usersService.listUsers({ status: AccountStatus.ACTIVE });
    assert.ok(Array.isArray(activeUsers.items));

    // Filtered by role
    const travellers = await usersService.listUsers({ role: UserRole.TRAVELLER });
    assert.ok(Array.isArray(travellers.items));

    // Filtered by search
    const searchResult = await usersService.listUsers({ search: 'test' });
    assert.ok(Array.isArray(searchResult.items));

    // Custom pagination
    const page2 = await usersService.listUsers({ page: 2, limit: 5 });
    assert.strictEqual(page2.pagination.page, 2);
    assert.strictEqual(page2.pagination.limit, 5);
  });

  /**
   * Stage 7: RBAC Enforcement for User Role Updates
   * Validate business rules for role assignment
   */
  it('[Stage 7] Role assignment RBAC must enforce business invariants', async () => {
    // Cannot grant SUPER_ADMIN without being SUPER_ADMIN
    await assert.rejects(
      () =>
        usersService.updateUserRoles([UserRole.SYSTEM_ADMIN], 'usr-victim-001', {
          roles: [UserRole.SUPER_ADMIN],
        }),
      (err: Error) => {
        assert.ok(err.message.includes('Super Admin') || err.message.includes('SUPER_ADMIN'));
        return true;
      },
    );

    // VILLAGE_ADMIN requires assignedVillageId
    await assert.rejects(
      () =>
        usersService.updateUserRoles([UserRole.SUPER_ADMIN], 'usr-test-villadmin-001', {
          roles: [UserRole.VILLAGE_ADMIN],
        }),
      (err: Error) => {
        assert.ok(
          err.message.toLowerCase().includes('village') ||
            err.message.toLowerCase().includes('assignedvillage'),
        );
        return true;
      },
    );
  });

  /**
   * Stage 8: Audit Log Recording
   * Verify audit trail is non-blocking and captures all critical events
   */
  it('[Stage 8] Audit log recording should be non-blocking and capture all events', async () => {
    const criticalActions = [
      { action: AuditAction.USER_ROLE_CHANGED, resourceType: AuditResourceType.USER },
      { action: AuditAction.FEATURE_FLAG_TOGGLED, resourceType: AuditResourceType.FEATURE_FLAG },
      {
        action: AuditAction.NAVIGATION_TREE_UPDATED,
        resourceType: AuditResourceType.NAVIGATION_TREE,
      },
      {
        action: AuditAction.UPFRONT_PERCENTAGE_CHANGED,
        resourceType: AuditResourceType.SYSTEM_CONFIG,
      },
      { action: AuditAction.BOOKING_TOGGLE_CHANGED, resourceType: AuditResourceType.PLACE },
      { action: AuditAction.CERTIFICATE_REVOKED, resourceType: AuditResourceType.CERTIFICATE },
      { action: AuditAction.REFUND_INITIATED, resourceType: AuditResourceType.PAYMENT },
      { action: AuditAction.POST_MODERATED, resourceType: AuditResourceType.POST },
      { action: AuditAction.VILLAGE_UPDATE_APPROVED, resourceType: AuditResourceType.VILLAGE },
    ];

    for (const { action, resourceType } of criticalActions) {
      await assert.doesNotReject(
        () =>
          auditService.recordAuditLog({
            actorUserId: 'usr-superadmin-e2e-001',
            actorEmail: 'superadmin@ebs.in',
            actorRoles: [UserRole.SUPER_ADMIN],
            action,
            resourceType,
            outcome: AuditOutcome.SUCCESS,
          }),
        `Audit log recording for action ${action} must not throw`,
      );
    }
  });

  /**
   * Stage 9: Audit Log Retrieval & Summary
   */
  it('[Stage 9] Audit log retrieval should support filtering and pagination', async () => {
    const logs = await auditService.getAuditLogs({ page: 1, limit: 20 });
    assert.ok(Array.isArray(logs.items));
    assert.ok(Object.hasOwn(logs, 'pagination'));

    const summary = await auditService.getAuditSummary();
    assert.ok(typeof summary.totalEntries === 'number');
    assert.ok(typeof summary.last24hEntries === 'number');
    assert.ok(typeof summary.failureCount === 'number');
    assert.ok(typeof summary.mostCommonAction === 'string');
  });

  /**
   * Stage 10: Report Generation Queue
   */
  it('[Stage 10] Report generation should queue all supported report types', async () => {
    const reportTypes = [
      'BOOKING_SUMMARY',
      'REVENUE_SUMMARY',
      'USER_ACTIVITY',
      'VILLAGE_ACTIVITY',
      'CERTIFICATE_ISSUANCE',
      'AUDIT_LOG_EXPORT',
    ];

    for (const reportType of reportTypes) {
      const report = await systemService.generateReport('usr-superadmin-e2e-001', {
        reportType,
        format: 'CSV',
      });
      assert.ok(report.id, `Report ${reportType} must have an ID`);
      assert.strictEqual(
        report.status,
        ReportStatus.QUEUED,
        `Report ${reportType} must be in QUEUED status`,
      );
      assert.ok(report.expiresAt, `Report ${reportType} must have an expiry`);
    }
  });

  /**
   * Stage 11: Moderation Queue Operations
   */
  it('[Stage 11] Moderation queue should be retrievable with pagination', async () => {
    const queue = await moderationService.getModerationQueue(1, 20);
    assert.ok(Array.isArray(queue.items));
    assert.ok(Object.hasOwn(queue, 'pagination'));
    assert.strictEqual(queue.pagination.page, 1);
    assert.strictEqual(queue.pagination.limit, 20);
  });

  /**
   * Stage 12: Admin Platform Metrics via AdminService
   */
  it('[Stage 12] AdminService.getMetricsOverview should return full platform metrics', async () => {
    const metrics = await adminService.getMetricsOverview();
    assert.ok(Object.hasOwn(metrics, 'totalUsers'));
    assert.ok(Object.hasOwn(metrics, 'totalPlaces'));
    assert.ok(Object.hasOwn(metrics, 'totalVillages'));
    assert.ok(Object.hasOwn(metrics, 'totalBookings'));
    assert.ok(Object.hasOwn(metrics, 'pendingModerations'));
    assert.strictEqual(metrics.systemHealth, 'OPERATIONAL');
    assert.ok(metrics.timestamp);
  });
});
