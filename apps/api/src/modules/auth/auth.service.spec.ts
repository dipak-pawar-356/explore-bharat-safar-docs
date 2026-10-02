import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from './auth.service';
import type { JwtService } from '@nestjs/jwt';
import { prisma } from '@ebs/database';
import { hashPassword } from '@ebs/security-crypto';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@ebs/types';
import type { AuditLogService } from '../../common/services/audit-log.service';
import type { CaptchaService } from '../../common/services/captcha.service';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/explore_bharat_safar?schema=public';
}

describe('AuthService — Identity & Authentication Suite', () => {
  let service: AuthService;
  let mockJwtService: {
    sign: (payload: { sub?: string } & Record<string, unknown>) => string;
    verify: (token: string) => { sub: string; email: string; mfaPending: boolean };
  };
  let mockAuditLogService: {
    log: () => Promise<void>;
  };
  let mockCaptchaService: {
    verifyCaptcha: (token?: string) => Promise<boolean>;
  };

  beforeEach(() => {
    mockJwtService = {
      sign: (payload: { sub?: string } & Record<string, unknown>) =>
        `mock_signed_jwt_${payload.sub || 'user'}`,
      verify: (token: string) => {
        if (token === 'invalid_mfa_token') throw new Error('invalid token');
        return { sub: 'u-mfa-user-1', email: 'mfa.user@bharat.in', mfaPending: true };
      },
    };
    mockAuditLogService = {
      log: async () => {},
    };
    mockCaptchaService = {
      verifyCaptcha: async (token?: string) => token !== 'invalid-token',
    };

    service = new AuthService(
      mockJwtService as unknown as JwtService,
      mockAuditLogService as unknown as AuditLogService,
      mockCaptchaService as unknown as CaptchaService,
    );
  });

  describe('Password Hashing & Verification (Argon2id)', () => {
    it('should produce standard cryptographic hashes and verify matches', async () => {
      const plain = 'StrongPassword!2026';
      const hash = await service.hashPassword(plain);
      assert.ok(hash.startsWith('$argon2id$') || hash.startsWith('$scrypt$'));

      const isMatch = await service.verifyPassword(hash, plain);
      assert.equal(isMatch, true);

      const isWrong = await service.verifyPassword(hash, 'IncorrectPassword123');
      assert.equal(isWrong, false);
    });
  });

  describe('User Registration (EBS-DOC-12-AUTH)', () => {
    it('should successfully register a new explorer with TRAVELLER role and profile', async () => {
      const originalFindFirst = prisma.user.findFirst;
      const originalFindRole = prisma.role.findUnique;
      const originalCreateUser = prisma.user.create;
      const originalCreateVerification = prisma.emailVerification.create;
      const originalCreateRefresh = prisma.refreshToken.create;

      prisma.user.findFirst = (async () => null) as unknown as typeof prisma.user.findFirst;
      prisma.role.findUnique = (async () => ({
        id: 'role-traveller-id',
        code: 'TRAVELLER',
        name: 'Traveller',
      })) as unknown as typeof prisma.role.findUnique;
      prisma.user.create = (async (args: {
        data: {
          email: string;
          passwordHash: string;
          phoneNumber?: string | null;
          profile: { create: { username: string; displayName: string } };
        };
      }) => ({
        id: 'u-101',
        email: args.data.email,
        passwordHash: args.data.passwordHash,
        phoneNumber: args.data.phoneNumber,
        status: 'ACTIVE',
        userRoles: [{ role: { id: 'role-traveller-id', code: 'TRAVELLER', name: 'Traveller' } }],
        profile: {
          id: 'p-101',
          username: args.data.profile.create.username,
          displayName: args.data.profile.create.displayName,
        },
      })) as unknown as typeof prisma.user.create;
      prisma.emailVerification.create =
        (async () => ({})) as unknown as typeof prisma.emailVerification.create;
      prisma.refreshToken.create = (async (args: { data: Record<string, unknown> }) => ({
        id: 'rt-1',
        ...args.data,
      })) as unknown as typeof prisma.refreshToken.create;

      try {
        const result = await service.register({
          email: 'explorer@bharat.in',
          password: 'SecurePassword123!',
          fullName: 'Vikramaditya Sharma',
          phoneNumber: '+919876543210',
        });

        assert.ok(result.authResponse.accessToken.startsWith('mock_signed_jwt_'));
        assert.equal(result.authResponse.user.email, 'explorer@bharat.in');
        assert.ok(result.authResponse.user.roles.includes(UserRole.TRAVELLER));
        assert.ok(result.refreshToken.length >= 32);
        assert.ok(result.emailVerificationToken);
      } finally {
        prisma.user.findFirst = originalFindFirst;
        prisma.role.findUnique = originalFindRole;
        prisma.user.create = originalCreateUser;
        prisma.emailVerification.create = originalCreateVerification;
        prisma.refreshToken.create = originalCreateRefresh;
      }
    });

    it('should throw ForbiddenException when user attempts to self-assign privileged role', async () => {
      await assert.rejects(
        async () => {
          await service.register({
            email: 'hacker@bharat.in',
            password: 'SecurePassword123!',
            fullName: 'Privilege Escalation Attempt',
            role: UserRole.SUPER_ADMIN,
          });
        },
        (err: unknown) => err instanceof ForbiddenException,
      );
    });

    it('should embed assignedVillageId for Village Admin in token generation', async () => {
      const originalFindFirst = prisma.user.findFirst;
      const originalFindRole = prisma.role.findUnique;
      const originalCreateUser = prisma.user.create;
      const originalCreateVerification = prisma.emailVerification.create;
      const originalCreateRefresh = prisma.refreshToken.create;

      prisma.user.findFirst = (async () => null) as unknown as typeof prisma.user.findFirst;
      prisma.role.findUnique = (async () => ({
        id: 'role-va-id',
        code: 'VILLAGE_ADMIN',
        name: 'Village Admin',
      })) as unknown as typeof prisma.role.findUnique;
      prisma.user.create = (async (args: {
        data: {
          email: string;
          passwordHash: string;
          profile: { create: { username: string; displayName: string } };
        };
      }) => ({
        id: 'u-va-101',
        email: args.data.email,
        passwordHash: args.data.passwordHash,
        status: 'ACTIVE',
        userRoles: [{ role: { id: 'role-va-id', code: 'VILLAGE_ADMIN', name: 'Village Admin' } }],
        assignedVillages: [{ id: 'vil-pune-velhe-001' }],
        profile: { id: 'p-102', username: 'va_pune', displayName: 'Pune Village Admin' },
      })) as unknown as typeof prisma.user.create;
      prisma.emailVerification.create =
        (async () => ({})) as unknown as typeof prisma.emailVerification.create;
      prisma.refreshToken.create = (async (args: { data: Record<string, unknown> }) => ({
        id: 'rt-va-1',
        ...args.data,
      })) as unknown as typeof prisma.refreshToken.create;

      try {
        const result = await service.register({
          email: 'va@bharat.in',
          password: 'SecurePassword123!',
          fullName: 'Pune Village Admin',
          role: UserRole.VILLAGE_ADMIN,
        });

        assert.equal(result.authResponse.user.assignedVillageId, 'vil-pune-velhe-001');
        assert.ok(result.authResponse.user.roles.includes(UserRole.VILLAGE_ADMIN));
      } finally {
        prisma.user.findFirst = originalFindFirst;
        prisma.role.findUnique = originalFindRole;
        prisma.user.create = originalCreateUser;
        prisma.emailVerification.create = originalCreateVerification;
        prisma.refreshToken.create = originalCreateRefresh;
      }
    });

    it('should throw ConflictException on duplicate email or phone', async () => {
      const originalFindFirst = prisma.user.findFirst;
      prisma.user.findFirst = (async () => ({
        id: 'existing-user-id',
      })) as unknown as typeof prisma.user.findFirst;

      try {
        await assert.rejects(
          async () => {
            await service.register({
              email: 'duplicate@bharat.in',
              password: 'SecurePassword123!',
              fullName: 'Duplicate User',
            });
          },
          (err: unknown) => err instanceof ConflictException,
        );
      } finally {
        prisma.user.findFirst = originalFindFirst;
      }
    });

    it('should throw BadRequestException when CAPTCHA token fails validation', async () => {
      await assert.rejects(
        async () => {
          await service.register({
            email: 'bot@bharat.in',
            password: 'SecurePassword123!',
            fullName: 'Bot User',
            turnstileToken: 'invalid-token',
          });
        },
        (err: unknown) => err instanceof BadRequestException,
      );
    });
  });

  describe('User Login & Lockout Policy (EBS-DOC-12-AUTH)', () => {
    it('should authenticate valid credentials and reset failed attempts counter', async () => {
      const originalFindUnique = prisma.user.findUnique;
      const originalUpdateUser = prisma.user.update;
      const originalCreateRefresh = prisma.refreshToken.create;

      const passwordHash = await hashPassword('ValidPassword123!');
      const capture: { updatedData?: { failedLoginAttempts?: number; lockedUntil?: Date | null } } =
        {};

      prisma.user.findUnique = (async () => ({
        id: 'u-login-1',
        email: 'user@bharat.in',
        passwordHash,
        status: 'ACTIVE',
        failedLoginAttempts: 2,
        lockedUntil: null,
        userRoles: [{ role: { code: 'TRAVELLER', name: 'Traveller' } }],
        profile: { displayName: 'Active Traveller' },
      })) as unknown as typeof prisma.user.findUnique;

      prisma.user.update = (async (args: {
        data: { failedLoginAttempts?: number; lockedUntil?: Date | null };
      }) => {
        capture.updatedData = args.data;
        return args;
      }) as unknown as typeof prisma.user.update;

      prisma.refreshToken.create = (async (args: { data: Record<string, unknown> }) =>
        args.data) as unknown as typeof prisma.refreshToken.create;

      try {
        const result = await service.login({
          email: 'user@bharat.in',
          password: 'ValidPassword123!',
        });

        assert.ok(result.authResponse.accessToken);
        assert.equal(capture.updatedData?.failedLoginAttempts, 0);
        assert.equal(capture.updatedData?.lockedUntil, null);
      } finally {
        prisma.user.findUnique = originalFindUnique;
        prisma.user.update = originalUpdateUser;
        prisma.refreshToken.create = originalCreateRefresh;
      }
    });

    it('should increment failedLoginAttempts and reject invalid password', async () => {
      const originalFindUnique = prisma.user.findUnique;
      const originalUpdateUser = prisma.user.update;

      const passwordHash = await hashPassword('ActualPassword123!');
      const capture: { updatedData?: { failedLoginAttempts?: number; lockedUntil?: Date | null } } =
        {};

      prisma.user.findUnique = (async () => ({
        id: 'u-login-2',
        email: 'user2@bharat.in',
        passwordHash,
        status: 'ACTIVE',
        failedLoginAttempts: 1,
        lockedUntil: null,
        userRoles: [{ role: { code: 'TRAVELLER' } }],
      })) as unknown as typeof prisma.user.findUnique;

      prisma.user.update = (async (args: {
        data: { failedLoginAttempts?: number; lockedUntil?: Date | null };
      }) => {
        capture.updatedData = args.data;
        return args;
      }) as unknown as typeof prisma.user.update;

      try {
        await assert.rejects(
          async () => {
            await service.login({
              email: 'user2@bharat.in',
              password: 'WrongPassword999!',
            });
          },
          (err: unknown) => err instanceof UnauthorizedException,
        );

        assert.equal(capture.updatedData?.failedLoginAttempts, 2);
        assert.equal(capture.updatedData?.lockedUntil, null);
      } finally {
        prisma.user.findUnique = originalFindUnique;
        prisma.user.update = originalUpdateUser;
      }
    });

    it('should trigger 15-minute lockout upon 5 consecutive failed attempts', async () => {
      const originalFindUnique = prisma.user.findUnique;
      const originalUpdateUser = prisma.user.update;

      const passwordHash = await hashPassword('ActualPassword123!');
      const capture: { updatedData?: { failedLoginAttempts?: number; lockedUntil?: Date | null } } =
        {};

      prisma.user.findUnique = (async () => ({
        id: 'u-login-3',
        email: 'user3@bharat.in',
        passwordHash,
        status: 'ACTIVE',
        failedLoginAttempts: 4,
        lockedUntil: null,
        userRoles: [{ role: { code: 'TRAVELLER' } }],
      })) as unknown as typeof prisma.user.findUnique;

      prisma.user.update = (async (args: {
        data: { failedLoginAttempts?: number; lockedUntil?: Date | null };
      }) => {
        capture.updatedData = args.data;
        return args;
      }) as unknown as typeof prisma.user.update;

      try {
        await assert.rejects(
          async () => {
            await service.login({
              email: 'user3@bharat.in',
              password: 'WrongPassword999!',
            });
          },
          (err: unknown) => err instanceof UnauthorizedException,
        );

        assert.equal(capture.updatedData?.failedLoginAttempts, 5);
        assert.ok(capture.updatedData?.lockedUntil instanceof Date);
        assert.ok((capture.updatedData?.lockedUntil?.getTime() || 0) > Date.now());
      } finally {
        prisma.user.findUnique = originalFindUnique;
        prisma.user.update = originalUpdateUser;
      }
    });

    it('should reject login immediately when account is currently locked', async () => {
      const originalFindUnique = prisma.user.findUnique;

      prisma.user.findUnique = (async () => ({
        id: 'u-login-4',
        email: 'user4@bharat.in',
        passwordHash: '$argon2id$...',
        status: 'ACTIVE',
        failedLoginAttempts: 5,
        lockedUntil: new Date(Date.now() + 10 * 60 * 1000), // Locked for 10 more minutes
        userRoles: [{ role: { code: 'TRAVELLER' } }],
      })) as unknown as typeof prisma.user.findUnique;

      try {
        await assert.rejects(
          async () => {
            await service.login({
              email: 'user4@bharat.in',
              password: 'AnyPassword123!',
            });
          },
          (err: unknown) => err instanceof UnauthorizedException,
        );
      } finally {
        prisma.user.findUnique = originalFindUnique;
      }
    });
  });

  describe('Refresh Token Rotation (RTR) & Family Invalidation', () => {
    it('should rotate active refresh token and return new tokens in same family', async () => {
      const originalFindUnique = prisma.refreshToken.findUnique;
      const originalUpdateRefresh = prisma.refreshToken.update;
      const originalCreateRefresh = prisma.refreshToken.create;

      prisma.refreshToken.findUnique = (async () => ({
        id: 'rt-active-1',
        token: 'current-valid-refresh-token',
        familyId: 'family-100',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
        replacedByToken: null,
        user: {
          id: 'u-ref-1',
          email: 'user@bharat.in',
          status: 'ACTIVE',
          userRoles: [{ role: { code: 'TRAVELLER' } }],
          profile: { displayName: 'Explorer' },
        },
      })) as unknown as typeof prisma.refreshToken.findUnique;

      let oldRevoked = false;
      prisma.refreshToken.update = (async (args: {
        where: { id: string };
        data: { revokedAt?: Date };
      }) => {
        if (args.where.id === 'rt-active-1' && args.data.revokedAt) {
          oldRevoked = true;
        }
        return args;
      }) as unknown as typeof prisma.refreshToken.update;

      prisma.refreshToken.create = (async (args: { data: Record<string, unknown> }) => ({
        id: 'rt-new-1',
        ...args.data,
      })) as unknown as typeof prisma.refreshToken.create;

      try {
        const result = await service.refresh('current-valid-refresh-token');
        assert.ok(result.authResponse.accessToken);
        assert.ok(result.refreshToken);
        assert.equal(oldRevoked, true);
      } finally {
        prisma.refreshToken.findUnique = originalFindUnique;
        prisma.refreshToken.update = originalUpdateRefresh;
        prisma.refreshToken.create = originalCreateRefresh;
      }
    });

    it('should detect token replay and revoke ENTIRE family when consumed token is presented', async () => {
      const originalFindUnique = prisma.refreshToken.findUnique;
      const originalUpdateMany = prisma.refreshToken.updateMany;

      prisma.refreshToken.findUnique = (async () => ({
        id: 'rt-consumed-1',
        token: 'consumed-token',
        familyId: 'family-compromised-99',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: new Date(Date.now() - 1000), // Already revoked!
        replacedByToken: 'subsequent-token',
        user: { id: 'u-victim-1', status: 'ACTIVE', userRoles: [] },
      })) as unknown as typeof prisma.refreshToken.findUnique;

      let familyRevoked = false;
      prisma.refreshToken.updateMany = (async (args: { where: { familyId?: string } }) => {
        if (args.where.familyId === 'family-compromised-99') {
          familyRevoked = true;
        }
        return { count: 3 };
      }) as unknown as typeof prisma.refreshToken.updateMany;

      try {
        await assert.rejects(
          async () => {
            await service.refresh('consumed-token');
          },
          (err: unknown) => err instanceof UnauthorizedException,
        );

        assert.equal(familyRevoked, true, 'Entire token family must be invalidated on reuse');
      } finally {
        prisma.refreshToken.findUnique = originalFindUnique;
        prisma.refreshToken.updateMany = originalUpdateMany;
      }
    });
  });

  describe('Email Verification & Password Reset Lifecycle', () => {
    it('should verify email and mark verification token consumed', async () => {
      const originalFindVerification = prisma.emailVerification.findUnique;
      const originalUpdateUser = prisma.user.update;
      const originalUpdateVerification = prisma.emailVerification.update;

      prisma.emailVerification.findUnique = (async () => ({
        id: 'ev-1',
        token: 'valid-email-token',
        userId: 'u-verify-1',
        expiresAt: new Date(Date.now() + 100000),
        usedAt: null,
      })) as unknown as typeof prisma.emailVerification.findUnique;

      let emailVerified = false;
      prisma.user.update = (async () => {
        emailVerified = true;
      }) as unknown as typeof prisma.user.update;

      let tokenConsumed = false;
      prisma.emailVerification.update = (async () => {
        tokenConsumed = true;
      }) as unknown as typeof prisma.emailVerification.update;

      try {
        await service.verifyEmail('valid-email-token');
        assert.equal(emailVerified, true);
        assert.equal(tokenConsumed, true);
      } finally {
        prisma.emailVerification.findUnique = originalFindVerification;
        prisma.user.update = originalUpdateUser;
        prisma.emailVerification.update = originalUpdateVerification;
      }
    });

    it('should complete password reset and invalidate all active sessions', async () => {
      const originalFindReset = prisma.passwordReset.findUnique;
      const originalUpdateUser = prisma.user.update;
      const originalUpdateReset = prisma.passwordReset.update;
      const originalUpdateManyRefresh = prisma.refreshToken.updateMany;

      prisma.passwordReset.findUnique = (async () => ({
        id: 'pr-1',
        token: 'valid-reset-token',
        userId: 'u-reset-1',
        expiresAt: new Date(Date.now() + 100000),
        usedAt: null,
      })) as unknown as typeof prisma.passwordReset.findUnique;

      let passwordUpdated = false;
      prisma.user.update = (async () => {
        passwordUpdated = true;
      }) as unknown as typeof prisma.user.update;

      let resetConsumed = false;
      prisma.passwordReset.update = (async () => {
        resetConsumed = true;
      }) as unknown as typeof prisma.passwordReset.update;

      let allSessionsRevoked = false;
      prisma.refreshToken.updateMany = (async () => {
        allSessionsRevoked = true;
        return { count: 5 };
      }) as unknown as typeof prisma.refreshToken.updateMany;

      try {
        const res = await service.resetPassword({
          token: 'valid-reset-token',
          newPassword: 'BrandNewSecurePassword123!',
        });

        assert.equal(res.success, true);
        assert.equal(passwordUpdated, true);
        assert.equal(resetConsumed, true);
        assert.equal(allSessionsRevoked, true);
      } finally {
        prisma.passwordReset.findUnique = originalFindReset;
        prisma.user.update = originalUpdateUser;
        prisma.passwordReset.update = originalUpdateReset;
        prisma.refreshToken.updateMany = originalUpdateManyRefresh;
      }
    });
  });

  describe('Multi-Factor Authentication (MFA) Verification (TOTP RFC 6238)', () => {
    it('should verify valid 6-digit TOTP code and mint session token pair', async () => {
      const originalFindUnique = prisma.user.findUnique;
      const originalCreateRefresh = prisma.refreshToken.create;

      prisma.user.findUnique = (async () => ({
        id: 'u-mfa-user-1',
        email: 'mfa.user@bharat.in',
        status: 'ACTIVE',
        userRoles: [{ role: { code: 'SUPER_ADMIN', name: 'Super Admin' } }],
        profile: { displayName: 'Super Admin User' },
      })) as unknown as typeof prisma.user.findUnique;

      prisma.refreshToken.create = (async (args: { data: Record<string, unknown> }) => ({
        id: 'rt-mfa-1',
        ...args.data,
      })) as unknown as typeof prisma.refreshToken.create;

      try {
        const result = await service.verifyMfa({
          totpCode: '849201',
          tempMfaToken: 'valid_temp_mfa_token',
        });

        assert.ok(result.authResponse.accessToken);
        assert.equal(result.authResponse.user.email, 'mfa.user@bharat.in');
        assert.ok(result.authResponse.user.roles.includes(UserRole.SUPER_ADMIN));
        assert.ok(result.refreshToken);
      } finally {
        prisma.user.findUnique = originalFindUnique;
        prisma.refreshToken.create = originalCreateRefresh;
      }
    });

    it('should reject invalid or expired temporary MFA tokens', async () => {
      await assert.rejects(
        async () => {
          await service.verifyMfa({
            totpCode: '849201',
            tempMfaToken: 'invalid_mfa_token',
          });
        },
        (err: unknown) => err instanceof UnauthorizedException,
      );
    });

    it('should reject non-6-digit TOTP codes', async () => {
      await assert.rejects(
        async () => {
          await service.verifyMfa({
            totpCode: '12345', // 5 digits
            tempMfaToken: 'valid_temp_token',
          });
        },
        (err: unknown) => err instanceof BadRequestException,
      );
    });
  });

  describe('Emergency Account Recovery & Password Change', () => {
    it('should recover account and invalidate all prior active sessions', async () => {
      const originalFindUnique = prisma.user.findUnique;
      const originalUpdateUser = prisma.user.update;
      const originalUpdateManyRefresh = prisma.refreshToken.updateMany;

      prisma.user.findUnique = (async () => ({
        id: 'u-rec-1',
        email: 'recover@bharat.in',
        status: 'ACTIVE',
        failedLoginAttempts: 3,
        lockedUntil: null,
      })) as unknown as typeof prisma.user.findUnique;

      let userUpdated = false;
      prisma.user.update = (async () => {
        userUpdated = true;
      }) as unknown as typeof prisma.user.update;

      let sessionsRevoked = false;
      prisma.refreshToken.updateMany = (async () => {
        sessionsRevoked = true;
        return { count: 3 };
      }) as unknown as typeof prisma.refreshToken.updateMany;

      try {
        const res = await service.recoverAccount({
          email: 'recover@bharat.in',
          recoveryCode: 'ABCD234567',
          newPassword: 'RecoveredPassword123!',
        });

        assert.equal(res.success, true);
        assert.equal(userUpdated, true);
        assert.equal(sessionsRevoked, true);
      } finally {
        prisma.user.findUnique = originalFindUnique;
        prisma.user.update = originalUpdateUser;
        prisma.refreshToken.updateMany = originalUpdateManyRefresh;
      }
    });

    it('should reject recovery for suspended account', async () => {
      const originalFindUnique = prisma.user.findUnique;
      prisma.user.findUnique = (async () => ({
        id: 'u-suspended-1',
        email: 'suspended@bharat.in',
        status: 'SUSPENDED',
      })) as unknown as typeof prisma.user.findUnique;

      try {
        await assert.rejects(
          async () => {
            await service.recoverAccount({
              email: 'suspended@bharat.in',
              recoveryCode: 'REC-123456',
              newPassword: 'NewPassword123!',
            });
          },
          (err: unknown) => err instanceof UnauthorizedException,
        );
      } finally {
        prisma.user.findUnique = originalFindUnique;
      }
    });

    it('should reject recovery when recovery code is shorter than 6 characters', async () => {
      const originalFindUnique = prisma.user.findUnique;
      prisma.user.findUnique = (async () => ({
        id: 'u-rec-2',
        email: 'user@bharat.in',
        status: 'ACTIVE',
      })) as unknown as typeof prisma.user.findUnique;

      try {
        await assert.rejects(
          async () => {
            await service.recoverAccount({
              email: 'user@bharat.in',
              recoveryCode: '123',
              newPassword: 'NewPassword123!',
            });
          },
          (err: unknown) => err instanceof BadRequestException,
        );
      } finally {
        prisma.user.findUnique = originalFindUnique;
      }
    });

    it('should change password for authenticated user when current password matches', async () => {
      const originalFindUnique = prisma.user.findUnique;
      const originalUpdateUser = prisma.user.update;

      const currentPasswordHash = await hashPassword('CurrentValidPassword123!');
      prisma.user.findUnique = (async () => ({
        id: 'u-auth-change-1',
        passwordHash: currentPasswordHash,
      })) as unknown as typeof prisma.user.findUnique;

      let updated = false;
      prisma.user.update = (async () => {
        updated = true;
      }) as unknown as typeof prisma.user.update;

      try {
        const res = await service.changePassword('u-auth-change-1', {
          currentPassword: 'CurrentValidPassword123!',
          newPassword: 'NextSecurePassword123!',
        });

        assert.equal(res.success, true);
        assert.equal(updated, true);
      } finally {
        prisma.user.findUnique = originalFindUnique;
        prisma.user.update = originalUpdateUser;
      }
    });
  });

  describe('Multi-Device Session Management (EBS-DOC-12-AUTH Section 5)', () => {
    it('should list active sessions and flag current session accurately', async () => {
      const originalFindMany = prisma.refreshToken.findMany;

      prisma.refreshToken.findMany = (async () => [
        {
          id: 'sess-1',
          userId: 'u-sess-1',
          token: 'token-active-1',
          deviceFingerprint: 'hash-browser-1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 100000),
        },
        {
          id: 'sess-2',
          userId: 'u-sess-1',
          token: 'token-active-2',
          deviceFingerprint: 'hash-mobile-2',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 100000),
        },
      ]) as unknown as typeof prisma.refreshToken.findMany;

      try {
        const sessions = await service.listSessions('u-sess-1', 'token-active-1');
        assert.equal(sessions.length, 2);
        assert.equal(sessions[0].id, 'sess-1');
        assert.equal(sessions[0].isCurrent, true);
        assert.equal(sessions[1].id, 'sess-2');
        assert.equal(sessions[1].isCurrent, false);
      } finally {
        prisma.refreshToken.findMany = originalFindMany;
      }
    });

    it('should revoke specific active session by ID', async () => {
      const originalFindFirst = prisma.refreshToken.findFirst;
      const originalUpdate = prisma.refreshToken.update;

      prisma.refreshToken.findFirst = (async () => ({
        id: 'sess-target-1',
        userId: 'u-sess-1',
      })) as unknown as typeof prisma.refreshToken.findFirst;

      let revoked = false;
      prisma.refreshToken.update = (async (args: {
        where: { id: string };
        data: { revokedAt?: Date };
      }) => {
        if (args.where.id === 'sess-target-1' && args.data.revokedAt) {
          revoked = true;
        }
        return args;
      }) as unknown as typeof prisma.refreshToken.update;

      try {
        await service.revokeSession('u-sess-1', 'sess-target-1');
        assert.equal(revoked, true);
      } finally {
        prisma.refreshToken.findFirst = originalFindFirst;
        prisma.refreshToken.update = originalUpdate;
      }
    });

    it('should throw NotFoundException when revoking non-existent session', async () => {
      const originalFindFirst = prisma.refreshToken.findFirst;
      prisma.refreshToken.findFirst = (async () =>
        null) as unknown as typeof prisma.refreshToken.findFirst;

      try {
        await assert.rejects(
          async () => {
            await service.revokeSession('u-sess-1', 'non-existent-sess');
          },
          (err: unknown) => err instanceof NotFoundException,
        );
      } finally {
        prisma.refreshToken.findFirst = originalFindFirst;
      }
    });
  });

  describe('Session Termination & Universal Logout', () => {
    it('should revoke single refresh token on specific session logout', async () => {
      const originalFindUnique = prisma.refreshToken.findUnique;
      const originalUpdateRefresh = prisma.refreshToken.update;

      prisma.refreshToken.findUnique = (async () => ({
        id: 'rt-logout-1',
        token: 'token-to-revoke',
        userId: 'u-logout-1',
      })) as unknown as typeof prisma.refreshToken.findUnique;

      let singleRevoked = false;
      prisma.refreshToken.update = (async (args: {
        where: { id: string };
        data: { revokedAt?: Date };
      }) => {
        if (args.where.id === 'rt-logout-1' && args.data.revokedAt) {
          singleRevoked = true;
        }
        return args;
      }) as unknown as typeof prisma.refreshToken.update;

      try {
        await service.logout('token-to-revoke');
        assert.equal(singleRevoked, true);
      } finally {
        prisma.refreshToken.findUnique = originalFindUnique;
        prisma.refreshToken.update = originalUpdateRefresh;
      }
    });

    it('should revoke all active tokens on universal logout by userId', async () => {
      const originalUpdateManyRefresh = prisma.refreshToken.updateMany;

      let universalRevoked = false;
      prisma.refreshToken.updateMany = (async (args: {
        where: { userId?: string };
        data: { revokedAt?: Date };
      }) => {
        if (args.where.userId === 'u-univ-logout-1' && args.data.revokedAt) {
          universalRevoked = true;
        }
        return { count: 4 };
      }) as unknown as typeof prisma.refreshToken.updateMany;

      try {
        await service.logout(undefined, 'u-univ-logout-1');
        assert.equal(universalRevoked, true);
      } finally {
        prisma.refreshToken.updateMany = originalUpdateManyRefresh;
      }
    });
  });
});
