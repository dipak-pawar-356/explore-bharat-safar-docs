// Explore Bharat Safar — Admin Services Unit Tests
// Reference: EBS-DOC-13-ADMIN, EBS-DOC-26-RULES
// NOTE: @ebs/database is mocked below — pure unit tests, no DB required (RISK-003).

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  UserRole,
  AuditAction,
  AuditResourceType,
  AuditOutcome,
  SystemHealthStatus,
  ServiceStatus,
  KpiCategory,
  KpiColorVariant,
  KpiTrend,
  FeatureFlagScope,
  ModerationItemType,
  ModerationDecision,
  ReportStatus,
  ExportFormat,
  AdminTheme,
  DateRangePreset,
} from '@ebs/types';

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

import { AdminSystemService } from './services/admin-system.service';
import { AdminAuditService } from './services/admin-audit.service';
import { AdminUsersService } from './services/admin-users.service';

// ---------------------------------------------------------------------------
// AdminSystemService Tests
// ---------------------------------------------------------------------------

describe('AdminSystemService — System Configuration & Platform Management', () => {
  const service = new AdminSystemService();

  describe('getDashboardStats()', () => {
    it('should return all required dashboard KPI fields', async () => {
      const stats = await service.getDashboardStats();
      assert.ok(typeof stats.totalUsers === 'number');
      assert.ok(typeof stats.activeUsers === 'number');
      assert.ok(typeof stats.totalPlaces === 'number');
      assert.ok(typeof stats.totalVillages === 'number');
      assert.ok(typeof stats.totalBookings === 'number');
      assert.ok(typeof stats.confirmedBookings === 'number');
      assert.ok(typeof stats.totalRevenue === 'number');
      assert.ok(typeof stats.pendingModerations === 'number');
      assert.ok(typeof stats.certificatesIssued === 'number');
      assert.ok(Object.values(SystemHealthStatus).includes(stats.systemHealth));
      assert.ok(stats.timestamp);
    });
  });

  describe('getSystemHealth()', () => {
    it('should return system health with required structure', async () => {
      const health = await service.getSystemHealth();
      assert.ok(Object.values(SystemHealthStatus).includes(health.status));
      assert.ok(Array.isArray(health.services));
      assert.ok(health.services.length > 0);
      assert.ok(typeof health.uptime === 'number');
      assert.ok(health.uptime >= 0);
      assert.ok(health.timestamp);
      assert.ok(health.version);
    });

    it('should include all critical service health checks', async () => {
      const health = await service.getSystemHealth();
      const serviceNames = health.services.map((s: { name: string }) => s.name.toLowerCase());
      assert.ok(
        serviceNames.some(n => n.includes('postgresql')),
        'Must include PostgreSQL health check',
      );
      assert.ok(
        serviceNames.some(n => n.includes('redis')),
        'Must include Redis health check',
      );
    });

    it('each service health check should have required fields', async () => {
      const health = await service.getSystemHealth();
      for (const svc of health.services) {
        assert.ok(svc.name, 'Service must have a name');
        assert.ok(
          Object.values(ServiceStatus).includes(svc.status as ServiceStatus),
          `Service ${svc.name} has invalid status: ${svc.status}`,
        );
        assert.ok(svc.lastChecked, 'Service must have lastChecked timestamp');
      }
    });
  });

  describe('getFeatureFlags()', () => {
    it('should return an array (empty or populated)', async () => {
      const flags = await service.getFeatureFlags();
      assert.ok(Array.isArray(flags));
    });
  });

  describe('toggleFeatureFlag()', () => {
    it('should toggle feature flag to enabled', async () => {
      const result = await service.toggleFeatureFlag('sprint9_admin_platform', {
        isEnabled: true,
        reason: 'Sprint 9 admin platform activation',
      });
      assert.strictEqual(result.key, 'sprint9_admin_platform');
      assert.strictEqual(result.isEnabled, true);
      assert.ok(Object.values(FeatureFlagScope).includes(result.scope));
    });

    it('should toggle feature flag to disabled', async () => {
      const result = await service.toggleFeatureFlag('sprint9_test_toggle', {
        isEnabled: false,
        reason: 'Disabling test feature',
      });
      assert.strictEqual(result.isEnabled, false);
    });
  });

  describe('getNavigationTree()', () => {
    it('should return default navigation tree when none stored', async () => {
      const tree = await service.getNavigationTree();
      assert.ok(tree.sections);
      assert.ok(Array.isArray(tree.sections));
      assert.ok(tree.sections.length >= 4, 'Must have at least 4 navigation sections');
    });

    it('should include all 4 core sections', async () => {
      const tree = await service.getNavigationTree();
      const slugs = tree.sections.map((s: { slug: string }) => s.slug);
      assert.ok(slugs.includes('discovery'), 'Must include discovery section');
      assert.ok(slugs.includes('villages'), 'Must include villages section');
      assert.ok(slugs.includes('bookings'), 'Must include bookings section');
      assert.ok(slugs.includes('social'), 'Must include social section');
    });

    it('each navigation section should have position and isVisible', async () => {
      const tree = await service.getNavigationTree();
      for (const section of tree.sections) {
        assert.ok(
          typeof section.position === 'number',
          `Section ${section.slug} must have a numeric position`,
        );
        assert.ok(
          typeof section.isVisible === 'boolean',
          `Section ${section.slug} must have isVisible flag`,
        );
      }
    });
  });

  describe('generateReport()', () => {
    it('should queue a booking summary report', async () => {
      const report = await service.generateReport('usr-superadmin-001', {
        reportType: 'BOOKING_SUMMARY',
        format: 'CSV',
      });
      assert.ok(report.id);
      assert.strictEqual(report.reportType, 'BOOKING_SUMMARY');
      assert.strictEqual(report.status, ReportStatus.QUEUED);
      assert.strictEqual(report.generatedBy, 'usr-superadmin-001');
      assert.ok(report.expiresAt);
    });

    it('should queue a revenue report in PDF format', async () => {
      const report = await service.generateReport('usr-financeadmin-001', {
        reportType: 'REVENUE_SUMMARY',
        format: 'PDF',
      });
      assert.strictEqual(report.status, ReportStatus.QUEUED);
      assert.strictEqual(report.parameters.format, 'PDF');
    });
  });

  describe('updateGlobalPaymentPercentage()', () => {
    it('should update global payment percentage', async () => {
      const result = await service.updateGlobalPaymentPercentage(25, 'Standard quarterly policy');
      assert.strictEqual(result.percentage, 25);
      assert.ok(result.updatedAt);
    });

    it('should accept the full valid range 10-100', async () => {
      const result10 = await service.updateGlobalPaymentPercentage(10, 'Minimum threshold');
      assert.strictEqual(result10.percentage, 10);

      const result100 = await service.updateGlobalPaymentPercentage(100, 'Full payment upfront');
      assert.strictEqual(result100.percentage, 100);
    });
  });
});

// ---------------------------------------------------------------------------
// AdminAuditService Tests
// ---------------------------------------------------------------------------

describe('AdminAuditService — Audit Log Management', () => {
  const service = new AdminAuditService();

  describe('recordAuditLog()', () => {
    it('should record an audit log entry without throwing', async () => {
      await assert.doesNotReject(() =>
        service.recordAuditLog({
          actorUserId: 'usr-superadmin-001',
          actorEmail: 'superadmin@ebs.in',
          actorRoles: [UserRole.SUPER_ADMIN],
          action: AuditAction.FEATURE_FLAG_TOGGLED,
          resourceType: AuditResourceType.FEATURE_FLAG,
          resourceId: 'sprint9_admin_platform',
          resourceLabel: 'Sprint 9 Admin Platform Flag',
          changesBefore: { isEnabled: false },
          changesAfter: { isEnabled: true },
          outcome: AuditOutcome.SUCCESS,
          ipAddress: '127.0.0.1',
        }),
      );
    });

    it('should gracefully handle audit log write failures (non-blocking)', async () => {
      // Audit log failures must NOT break the primary operation
      await assert.doesNotReject(() =>
        service.recordAuditLog({
          actorUserId: 'usr-superadmin-001',
          actorEmail: 'superadmin@ebs.in',
          actorRoles: [UserRole.SUPER_ADMIN],
          action: AuditAction.SYSTEM_CONFIG_CHANGED,
          resourceType: AuditResourceType.SYSTEM_CONFIG,
          outcome: AuditOutcome.FAILURE,
          failureReason: 'Database constraint violation during config update',
        }),
      );
    });
  });

  describe('getAuditLogs()', () => {
    it('should return paginated audit log list', async () => {
      const result = await service.getAuditLogs({ page: 1, limit: 10 });
      assert.ok(Array.isArray(result.items));
      assert.ok(Object.hasOwn(result, 'pagination'));
      assert.ok(Object.hasOwn(result.pagination, 'page'));
      assert.ok(Object.hasOwn(result.pagination, 'totalRecords'));
      assert.ok(Object.hasOwn(result.pagination, 'totalPages'));
    });
  });

  describe('getAuditSummary()', () => {
    it('should return summary statistics', async () => {
      const summary = await service.getAuditSummary();
      assert.ok(Object.hasOwn(summary, 'totalEntries'));
      assert.ok(Object.hasOwn(summary, 'last24hEntries'));
      assert.ok(Object.hasOwn(summary, 'failureCount'));
      assert.ok(Object.hasOwn(summary, 'mostCommonAction'));
      assert.ok(typeof summary.totalEntries === 'number');
      assert.ok(typeof summary.failureCount === 'number');
      assert.ok(typeof summary.last24hEntries === 'number');
    });
  });
});

// ---------------------------------------------------------------------------
// AdminUsersService Tests
// ---------------------------------------------------------------------------

describe('AdminUsersService — User Management', () => {
  const service = new AdminUsersService();

  describe('listUsers()', () => {
    it('should return paginated user list with default pagination', async () => {
      const result = await service.listUsers({});
      assert.ok(Array.isArray(result.items));
      assert.ok(Object.hasOwn(result, 'pagination'));
      assert.strictEqual(result.pagination.page, 1);
      assert.ok(typeof result.pagination.totalRecords === 'number');
    });

    it('should apply search filter', async () => {
      const result = await service.listUsers({ search: 'admin@ebs.in' });
      assert.ok(Array.isArray(result.items));
    });

    it('should respect custom pagination parameters', async () => {
      const result = await service.listUsers({ page: 2, limit: 5 });
      assert.strictEqual(result.pagination.page, 2);
      assert.strictEqual(result.pagination.limit, 5);
    });
  });

  describe('updateUserRoles()', () => {
    it('should throw ForbiddenException if non-super-admin tries to grant SUPER_ADMIN', async () => {
      await assert.rejects(
        () =>
          service.updateUserRoles([UserRole.SYSTEM_ADMIN], 'usr-test-001', {
            roles: [UserRole.SUPER_ADMIN],
          }),
        (err: Error) => {
          assert.ok(err.message.includes('Super Admin') || err.message.includes('SUPER_ADMIN'));
          return true;
        },
      );
    });

    it('should throw BadRequestException if VILLAGE_ADMIN is set without assignedVillageId', async () => {
      await assert.rejects(
        () =>
          service.updateUserRoles([UserRole.SUPER_ADMIN], 'usr-test-001', {
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
});

// ---------------------------------------------------------------------------
// Admin Types Contract Tests
// ---------------------------------------------------------------------------

describe('Admin Types — Contract Validation', () => {
  it('SystemHealthStatus enum should have all required values', () => {
    assert.ok(SystemHealthStatus.OPERATIONAL);
    assert.ok(SystemHealthStatus.DEGRADED);
    assert.ok(SystemHealthStatus.PARTIAL_OUTAGE);
    assert.ok(SystemHealthStatus.CRITICAL);
    assert.ok(SystemHealthStatus.MAINTENANCE);
  });

  it('KpiCategory enum should cover all platform domains', () => {
    assert.ok(KpiCategory.USERS);
    assert.ok(KpiCategory.BOOKINGS);
    assert.ok(KpiCategory.REVENUE);
    assert.ok(KpiCategory.VILLAGES);
    assert.ok(KpiCategory.DISCOVERY);
    assert.ok(KpiCategory.SOCIAL);
    assert.ok(KpiCategory.CERTIFICATES);
    assert.ok(KpiCategory.PAYMENTS);
    assert.ok(KpiCategory.SYSTEM);
    assert.ok(KpiCategory.MODERATION);
  });

  it('AuditAction enum should include all governance actions', () => {
    assert.ok(AuditAction.USER_LOGIN);
    assert.ok(AuditAction.USER_ROLE_CHANGED);
    assert.ok(AuditAction.FEATURE_FLAG_TOGGLED);
    assert.ok(AuditAction.NAVIGATION_TREE_UPDATED);
    assert.ok(AuditAction.BOOKING_TOGGLE_CHANGED);
    assert.ok(AuditAction.CERTIFICATE_REVOKED);
    assert.ok(AuditAction.REFUND_INITIATED);
    assert.ok(AuditAction.POST_MODERATED);
    assert.ok(AuditAction.VILLAGE_UPDATE_APPROVED);
  });

  it('ModerationDecision enum should cover all valid moderation actions', () => {
    assert.ok(ModerationDecision.APPROVE);
    assert.ok(ModerationDecision.REJECT);
    assert.ok(ModerationDecision.REMOVE);
    assert.ok(ModerationDecision.WARN_USER);
    assert.ok(ModerationDecision.SUSPEND_USER);
    assert.ok(ModerationDecision.ESCALATE);
  });

  it('ExportFormat enum should have all supported export formats', () => {
    assert.ok(ExportFormat.CSV);
    assert.ok(ExportFormat.PDF);
    assert.ok(ExportFormat.JSON);
    assert.ok(ExportFormat.XLSX);
  });

  it('KpiColorVariant values should match design system tokens', () => {
    assert.strictEqual(KpiColorVariant.SAFFRON, 'saffron');
    assert.strictEqual(KpiColorVariant.EVERGREEN, 'evergreen');
    assert.strictEqual(KpiColorVariant.TERRACOTTA, 'terracotta');
    assert.strictEqual(KpiColorVariant.SLATE, 'slate');
    assert.strictEqual(KpiColorVariant.INDIGO, 'indigo');
    assert.strictEqual(KpiColorVariant.AMBER, 'amber');
  });

  it('DateRangePreset should include standard presets', () => {
    assert.ok(DateRangePreset.TODAY);
    assert.ok(DateRangePreset.LAST_7_DAYS);
    assert.ok(DateRangePreset.LAST_30_DAYS);
    assert.ok(DateRangePreset.THIS_MONTH);
    assert.ok(DateRangePreset.CUSTOM);
  });

  it('AdminTheme should support light, dark, and system preference', () => {
    assert.ok(AdminTheme.LIGHT);
    assert.ok(AdminTheme.DARK);
    assert.ok(AdminTheme.SYSTEM);
  });

  it('ModerationItemType should include all content types', () => {
    assert.ok(ModerationItemType.POST);
    assert.ok(ModerationItemType.STORY);
    assert.ok(ModerationItemType.COMMUNITY);
    assert.ok(ModerationItemType.REVIEW);
    assert.ok(ModerationItemType.COMMENT);
    assert.ok(ModerationItemType.PROFILE);
    assert.ok(ModerationItemType.VILLAGE_UPDATE);
  });

  it('KpiTrend should include all directional indicators', () => {
    assert.ok(KpiTrend.UP);
    assert.ok(KpiTrend.DOWN);
    assert.ok(KpiTrend.STABLE);
  });

  it('AuditResourceType should cover all platform domains', () => {
    assert.ok(AuditResourceType.USER);
    assert.ok(AuditResourceType.VILLAGE);
    assert.ok(AuditResourceType.BOOKING);
    assert.ok(AuditResourceType.CERTIFICATE);
    assert.ok(AuditResourceType.PAYMENT);
    assert.ok(AuditResourceType.POST);
    assert.ok(AuditResourceType.FEATURE_FLAG);
    assert.ok(AuditResourceType.NAVIGATION_TREE);
    assert.ok(AuditResourceType.SYSTEM_CONFIG);
  });
});
