import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { type ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { VillageScopeGuard } from './village-scope.guard';
import { UserRole, Permission } from '@ebs/types';

function createMockContext(
  user: unknown,
  params: Record<string, unknown> = {},
  body: Record<string, unknown> = {},
  query: Record<string, unknown> = {},
): ExecutionContext {
  const req = {
    user,
    params,
    body,
    query,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => ({}),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RBAC Authorization & Guards Suite', () => {
  describe('RolesGuard (EBS-DOC-40-SEC Section 4)', () => {
    it('should allow access when no roles are required on route', () => {
      const mockReflector = {
        getAllAndOverride: () => undefined,
      } as unknown as Reflector;

      const guard = new RolesGuard(mockReflector);
      const ctx = createMockContext(null);

      assert.equal(guard.canActivate(ctx), true);
    });

    it('should allow SUPER_ADMIN access to any role-protected route', () => {
      const mockReflector = {
        getAllAndOverride: () => [UserRole.FINANCE_ADMIN],
      } as unknown as Reflector;

      const guard = new RolesGuard(mockReflector);
      const ctx = createMockContext({
        id: 'sa-1',
        roles: [UserRole.SUPER_ADMIN],
      });

      assert.equal(guard.canActivate(ctx), true);
    });

    it('should allow user with matching role', () => {
      const mockReflector = {
        getAllAndOverride: () => [UserRole.TRAVELLER, UserRole.VILLAGE_ADMIN],
      } as unknown as Reflector;

      const guard = new RolesGuard(mockReflector);
      const ctx = createMockContext({
        id: 'u-1',
        roles: [UserRole.TRAVELLER],
      });

      assert.equal(guard.canActivate(ctx), true);
    });

    it('should reject user with mismatched role with 403 Forbidden', () => {
      const mockReflector = {
        getAllAndOverride: () => [UserRole.BOOKING_ADMIN],
      } as unknown as Reflector;

      const guard = new RolesGuard(mockReflector);
      const ctx = createMockContext({
        id: 'u-1',
        roles: [UserRole.TRAVELLER],
      });

      assert.throws(() => guard.canActivate(ctx), ForbiddenException);
    });

    it('should reject unauthenticated request with 403 Forbidden', () => {
      const mockReflector = {
        getAllAndOverride: () => [UserRole.TRAVELLER],
      } as unknown as Reflector;

      const guard = new RolesGuard(mockReflector);
      const ctx = createMockContext(null);

      assert.throws(() => guard.canActivate(ctx), ForbiddenException);
    });
  });

  describe('PermissionsGuard (EBS-DOC-40-SEC Section 4)', () => {
    it('should allow SUPER_ADMIN access to any permission-protected route', () => {
      const mockReflector = {
        getAllAndOverride: () => [Permission.PAYMENT_REFUND],
      } as unknown as Reflector;

      const guard = new PermissionsGuard(mockReflector);
      const ctx = createMockContext({
        id: 'sa-1',
        roles: [UserRole.SUPER_ADMIN],
      });

      assert.equal(guard.canActivate(ctx), true);
    });

    it('should grant access when user role automatically inherits required permission', () => {
      const mockReflector = {
        getAllAndOverride: () => [Permission.BOOKING_CREATE],
      } as unknown as Reflector;

      const guard = new PermissionsGuard(mockReflector);
      const ctx = createMockContext({
        id: 'u-1',
        roles: [UserRole.TRAVELLER],
      });

      assert.equal(guard.canActivate(ctx), true);
    });

    it('should reject user whose role lacks required permission', () => {
      const mockReflector = {
        getAllAndOverride: () => [Permission.PAYMENT_REFUND],
      } as unknown as Reflector;

      const guard = new PermissionsGuard(mockReflector);
      const ctx = createMockContext({
        id: 'u-1',
        roles: [UserRole.TRAVELLER], // Travellers cannot process refunds
      });

      assert.throws(() => guard.canActivate(ctx), ForbiddenException);
    });
  });

  describe('JwtAuthGuard Public Route Bypass', () => {
    it('should allow public access when route is marked with @Public()', () => {
      const mockReflector = {
        getAllAndOverride: () => true, // isPublic is true
      } as unknown as Reflector;

      const guard = new JwtAuthGuard(mockReflector);
      const ctx = createMockContext(null);

      assert.equal(guard.canActivate(ctx), true);
    });

    it('should throw standard unauthorized exception when user is null', () => {
      const guard = new JwtAuthGuard();
      assert.throws(() => guard.handleRequest(null, null, undefined), UnauthorizedException);
    });
  });

  describe('VillageScopeGuard Tenancy Isolation (EBS-DOC-40-SEC Section 36)', () => {
    it('should allow Village Admin to mutate records for their assigned village', () => {
      const mockReflector = {
        getAllAndOverride: () => 'villageId',
      } as unknown as Reflector;

      const guard = new VillageScopeGuard(mockReflector);
      const ctx = createMockContext(
        {
          id: 'va-1',
          roles: [UserRole.VILLAGE_ADMIN],
          assignedVillageId: 'vil-pune-velhe-001',
        },
        { villageId: 'vil-pune-velhe-001' },
      );

      assert.equal(guard.canActivate(ctx), true);
    });

    it('should block Village Admin from mutating records for another village', () => {
      const mockReflector = {
        getAllAndOverride: () => 'villageId',
      } as unknown as Reflector;

      const guard = new VillageScopeGuard(mockReflector);
      const ctx = createMockContext(
        {
          id: 'va-1',
          roles: [UserRole.VILLAGE_ADMIN],
          assignedVillageId: 'vil-pune-velhe-001',
        },
        { villageId: 'vil-kolhapur-panhala-999' }, // Different village!
      );

      assert.throws(() => guard.canActivate(ctx), ForbiddenException);
    });

    it('should block Village Admin when assignedVillageId is null or undefined', () => {
      const mockReflector = {
        getAllAndOverride: () => 'villageId',
      } as unknown as Reflector;

      const guard = new VillageScopeGuard(mockReflector);
      const ctx = createMockContext(
        {
          id: 'va-unassigned',
          roles: [UserRole.VILLAGE_ADMIN],
          assignedVillageId: null,
        },
        { villageId: 'vil-pune-velhe-001' },
      );

      assert.throws(() => guard.canActivate(ctx), ForbiddenException);
    });

    it('should allow SUPER_ADMIN or MODERATOR to access any village', () => {
      const mockReflector = {
        getAllAndOverride: () => 'villageId',
      } as unknown as Reflector;

      const guard = new VillageScopeGuard(mockReflector);
      const ctx = createMockContext(
        {
          id: 'mod-1',
          roles: [UserRole.MODERATOR],
        },
        { villageId: 'vil-kolhapur-panhala-999' },
      );

      assert.equal(guard.canActivate(ctx), true);
    });

    it('should reject non-admin users without VILLAGE_ADMIN role with 403 Forbidden', () => {
      const mockReflector = {
        getAllAndOverride: () => 'villageId',
      } as unknown as Reflector;

      const guard = new VillageScopeGuard(mockReflector);
      const ctx = createMockContext(
        {
          id: 'u-traveller-1',
          roles: [UserRole.TRAVELLER],
          assignedVillageId: 'vil-pune-velhe-001',
        },
        { villageId: 'vil-pune-velhe-001' },
      );

      assert.throws(() => guard.canActivate(ctx), ForbiddenException);
    });

    it('should reject when body payload contains conflicting villageId', () => {
      const mockReflector = {
        getAllAndOverride: () => 'villageId',
      } as unknown as Reflector;

      const guard = new VillageScopeGuard(mockReflector);
      const ctx = createMockContext(
        {
          id: 'va-1',
          roles: [UserRole.VILLAGE_ADMIN],
          assignedVillageId: 'vil-pune-velhe-001',
        },
        { villageId: 'vil-pune-velhe-001' },
        { villageId: 'vil-different-002' }, // Body payload tampering!
      );

      assert.throws(() => guard.canActivate(ctx), ForbiddenException);
    });
  });
});
