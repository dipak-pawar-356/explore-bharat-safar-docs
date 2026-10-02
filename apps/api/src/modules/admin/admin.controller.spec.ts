// Explore Bharat Safar — Admin Controller Unit Tests
// Reference: EBS-DOC-13-ADMIN, EBS-DOC-09-API Section 5.7
// NOTE: @ebs/database is mocked below — pure unit tests, no DB required (RISK-003).

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { UserRole, AccountStatus } from '@ebs/types';

// ---------------------------------------------------------------------------
// Prisma mock — prevents live DB connection (RISK-003 remediation)
// ---------------------------------------------------------------------------
mock.module('@ebs/database', {
  namedExports: {
    prisma: {
      user: {
        count: async () => 100,
        findMany: async () => [],
        findUnique: async () => null,
        update: async () => ({}),
      },
      booking: { count: async () => 50 },
      place: { count: async () => 200 },
      village: { count: async () => 150 },
      certificate: { count: async () => 75 },
      villageUpdateStaging: { count: async () => 5 },
      adminAuditLog: {
        create: async () => ({}),
        count: async () => 1000,
        findMany: async () => [],
      },
      contentModerationQueue: {
        findMany: async () => [],
        findUnique: async () => null,
        count: async () => 0,
        update: async () => ({}),
        create: async () => ({}),
      },
      systemConfig: {
        findMany: async () => [],
        findUnique: async () => null,
        upsert: async () => ({
          id: 'cfg-1',
          key: 'test',
          displayName: 'Test',
          description: '',
          value: 'true',
          category: 'FEATURE_FLAG',
          isReadOnly: false,
          updatedAt: new Date(),
          createdAt: new Date(),
        }),
      },
      $queryRaw: async () => [{ '?column?': 1 }],
    },
  },
});

import { AdminService } from './admin.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminAuditService } from './services/admin-audit.service';
import { AdminSystemService } from './services/admin-system.service';
import { AdminModerationService } from './services/admin-moderation.service';
import { AdminController } from './admin.controller';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSuperAdminReq = {
  user: {
    sub: 'usr-superadmin-001',
    email: 'superadmin@ebs.in',
    roles: [UserRole.SUPER_ADMIN],
  },
  ip: '127.0.0.1',
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFinanceAdminReq = {
  user: {
    sub: 'usr-financeadmin-001',
    email: 'finance@ebs.in',
    roles: [UserRole.FINANCE_ADMIN],
  },
  ip: '127.0.0.1',
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe('AdminController — Sprint 9 Enterprise Administration Platform', () => {
  let controller: AdminController;
  let adminService: AdminService;
  let adminUsersService: AdminUsersService;
  let adminAuditService: AdminAuditService;
  let adminSystemService: AdminSystemService;
  let adminModerationService: AdminModerationService;

  beforeEach(() => {
    adminService = new AdminService();
    adminUsersService = new AdminUsersService();
    adminAuditService = new AdminAuditService();
    adminSystemService = new AdminSystemService();
    adminModerationService = new AdminModerationService();

    controller = new AdminController(
      adminService,
      adminUsersService,
      adminAuditService,
      adminSystemService,
      adminModerationService,
    );
  });

  // =========================================================================
  // METRICS & DASHBOARD
  // =========================================================================

  describe('Dashboard & Metrics', () => {
    it('GET /admin/metrics/overview should return platform telemetry', async () => {
      const result = await controller.getMetricsOverview();
      assert.ok(result);
      assert.ok(Object.hasOwn(result, 'totalUsers'));
      assert.ok(Object.hasOwn(result, 'totalPlaces'));
      assert.ok(Object.hasOwn(result, 'totalVillages'));
      assert.ok(Object.hasOwn(result, 'totalBookings'));
      assert.ok(Object.hasOwn(result, 'pendingModerations'));
      assert.strictEqual(result.systemHealth, 'OPERATIONAL');
      assert.ok(result.timestamp);
    });

    it('GET /admin/dashboard/stats should return comprehensive KPI data', async () => {
      const result = await controller.getDashboardStats();
      assert.ok(result);
      assert.ok(Object.hasOwn(result, 'totalUsers'));
      assert.ok(Object.hasOwn(result, 'activeUsers'));
      assert.ok(Object.hasOwn(result, 'totalPlaces'));
      assert.ok(Object.hasOwn(result, 'totalVillages'));
      assert.ok(Object.hasOwn(result, 'certificatesIssued'));
      assert.ok(Object.hasOwn(result, 'pendingModerations'));
      assert.ok(Object.hasOwn(result, 'timestamp'));
    });
  });

  // =========================================================================
  // USER MANAGEMENT
  // =========================================================================

  describe('User Management', () => {
    it('GET /admin/users should return paginated user list', async () => {
      const result = await controller.listUsers({});
      assert.ok(result);
      assert.ok(Array.isArray(result.items));
      assert.ok(Object.hasOwn(result, 'pagination'));
      assert.ok(Object.hasOwn(result.pagination, 'page'));
      assert.ok(Object.hasOwn(result.pagination, 'totalRecords'));
    });

    it('GET /admin/users with role filter should apply filter correctly', async () => {
      const result = await controller.listUsers({ role: UserRole.TRAVELLER });
      assert.ok(result);
      assert.ok(Array.isArray(result.items));
    });

    it('GET /admin/users with status filter should apply status filter', async () => {
      const result = await controller.listUsers({ status: AccountStatus.ACTIVE });
      assert.ok(result);
      assert.ok(Array.isArray(result.items));
    });

    it('PATCH /admin/users/:id/roles should require at least one role', async () => {
      await assert.rejects(
        () =>
          controller.updateUserRoles(mockSuperAdminReq, 'usr-test-001', {
            roles: [],
          }),
        (err: Error) => {
          assert.ok(err.message.includes('At least one role') || err.message.includes('role'));
          return true;
        },
      );
    });

    it('PATCH /admin/users/:id/roles should reject VILLAGE_ADMIN without assignedVillageId', async () => {
      await assert.rejects(
        () =>
          controller.updateUserRoles(mockSuperAdminReq, 'usr-test-001', {
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
  });

  // =========================================================================
  // SYSTEM HEALTH & FEATURE FLAGS
  // =========================================================================

  describe('System Health & Feature Flags', () => {
    it('GET /admin/system/health should return system health status', async () => {
      const result = await controller.getSystemHealth();
      assert.ok(result);
      assert.ok(Object.hasOwn(result, 'status'));
      assert.ok(Object.hasOwn(result, 'services'));
      assert.ok(Array.isArray(result.services));
      assert.ok(Object.hasOwn(result, 'timestamp'));
      assert.ok(Object.hasOwn(result, 'uptime'));
      assert.ok(typeof result.uptime === 'number');
    });

    it('GET /admin/system/health should include PostgreSQL service check', async () => {
      const result = await controller.getSystemHealth();
      const dbService = result.services.find((s: { name: string }) =>
        s.name.toLowerCase().includes('postgresql'),
      );
      assert.ok(dbService, 'PostgreSQL service check must be present');
      assert.ok(Object.hasOwn(dbService, 'status'));
      assert.ok(Object.hasOwn(dbService, 'lastChecked'));
    });

    it('GET /admin/system/feature-flags should return feature flags array', async () => {
      const result = await controller.getFeatureFlags();
      assert.ok(Array.isArray(result));
    });

    it('PATCH /admin/system/feature-flags/:key should toggle feature flag', async () => {
      const result = await controller.toggleFeatureFlag('test_feature_flag', {
        isEnabled: true,
      });
      assert.ok(result);
      assert.ok(Object.hasOwn(result, 'key'));
      assert.strictEqual(result.key, 'test_feature_flag');
      assert.ok(Object.hasOwn(result, 'isEnabled'));
      assert.strictEqual(result.isEnabled, true);
    });
  });

  // =========================================================================
  // NAVIGATION TREE
  // =========================================================================

  describe('Navigation Tree Management', () => {
    it('GET /admin/config/navigation-tree should return navigation tree', async () => {
      const result = await controller.getNavigationTree();
      assert.ok(result);
      assert.ok(Object.hasOwn(result, 'sections'));
      assert.ok(Array.isArray(result.sections));
      assert.ok(result.sections.length > 0);
    });

    it('GET /admin/config/navigation-tree should include discovery section', async () => {
      const result = await controller.getNavigationTree();
      const discoverySection = result.sections.find(
        (s: { slug: string }) => s.slug === 'discovery',
      );
      assert.ok(discoverySection, 'Discovery section must be in navigation tree');
      assert.ok(discoverySection.isVisible);
    });
  });

  // =========================================================================
  // PAYMENT CONFIGURATION
  // =========================================================================

  describe('Payment Configuration', () => {
    it('PATCH /admin/config/payment-percentage should update global payment %', async () => {
      const result = await controller.updateGlobalPaymentPercentage({
        percentage: 30,
        reason: 'Quarterly policy review adjustment',
      });
      assert.ok(result);
      assert.strictEqual(result.percentage, 30);
      assert.ok(result.updatedAt);
    });
  });

  // =========================================================================
  // AUDIT LOGS
  // =========================================================================

  describe('Audit Log Management', () => {
    it('GET /admin/audit-logs should return paginated audit log', async () => {
      const result = await controller.getAuditLogs({});
      assert.ok(result);
      assert.ok(Array.isArray(result.items));
      assert.ok(Object.hasOwn(result, 'pagination'));
    });

    it('GET /admin/audit-logs/summary should return activity statistics', async () => {
      const result = await controller.getAuditSummary();
      assert.ok(result);
      assert.ok(Object.hasOwn(result, 'totalEntries'));
      assert.ok(Object.hasOwn(result, 'last24hEntries'));
      assert.ok(Object.hasOwn(result, 'failureCount'));
      assert.ok(Object.hasOwn(result, 'mostCommonAction'));
      assert.ok(typeof result.totalEntries === 'number');
    });
  });

  // =========================================================================
  // REPORT GENERATION
  // =========================================================================

  describe('Report Generation', () => {
    it('POST /admin/reports/generate should queue a report', async () => {
      const result = await controller.generateReport(mockSuperAdminReq, {
        reportType: 'BOOKING_SUMMARY',
        format: 'CSV',
      });
      assert.ok(result);
      assert.ok(Object.hasOwn(result, 'id'));
      assert.ok(Object.hasOwn(result, 'status'));
      assert.strictEqual(result.status, 'QUEUED');
      assert.ok(Object.hasOwn(result, 'generatedBy'));
      assert.strictEqual(result.generatedBy, mockSuperAdminReq.user.sub);
    });

    it('POST /admin/reports/generate should work for Finance Admin', async () => {
      const result = await controller.generateReport(mockFinanceAdminReq, {
        reportType: 'REVENUE_SUMMARY',
        format: 'PDF',
      });
      assert.ok(result);
      assert.strictEqual(result.status, 'QUEUED');
      assert.strictEqual(result.generatedBy, mockFinanceAdminReq.user.sub);
    });
  });
});
