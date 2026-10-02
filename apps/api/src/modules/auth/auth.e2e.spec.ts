import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@ebs/database';
import { UserRole } from '@ebs/types';
import { UnauthorizedException } from '@nestjs/common';
import type { AuditLogService } from '../../common/services/audit-log.service';
import type { CaptchaService } from '../../common/services/captcha.service';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/explore_bharat_safar?schema=public';
}

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string | null;
  status: string;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  emailVerifiedAt?: Date | null;
  phoneVerifiedAt?: Date | null;
  deletedAt?: Date | null;
  userRoles: Array<{ role: { id: string; code: string; name: string } }>;
  profile?: { id: string; username: string; displayName: string };
  assignedVillages?: Array<{ id: string }>;
}

interface StoredRefreshToken {
  id: string;
  userId: string;
  token: string;
  familyId: string;
  deviceFingerprint?: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
  replacedByToken: string | null;
}

interface StoredVerification {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
}

describe('Auth End-to-End Lifecycle & Security Gates Suite', () => {
  const jwtService = new JwtService({
    secret: 'ebs_super_secure_jwt_dev_secret_key_minimum_32_characters_long',
    signOptions: { expiresIn: '15m' },
  });

  const mockAuditService = {
    log: async () => {},
  };

  const mockCaptchaService = {
    verifyCaptcha: async () => true,
  };

  const authService = new AuthService(
    jwtService,
    mockAuditService as unknown as AuditLogService,
    mockCaptchaService as unknown as CaptchaService,
  );

  it('should execute full 10-stage authentication and identity lifecycle', async () => {
    // In-memory test store simulating Prisma database
    const state: { storedUser: StoredUser | null } = { storedUser: null };
    const storedRole = { id: 'role-traveller-uuid', code: 'TRAVELLER', name: 'Traveller' };
    const storedRefreshTokens = new Map<string, StoredRefreshToken>();
    const storedEmailVerifications = new Map<string, StoredVerification>();
    const storedPasswordResets = new Map<string, StoredVerification>();

    // Mock Prisma hooks for isolated E2E execution
    const origUserFindFirst = prisma.user.findFirst;
    const origUserFindUnique = prisma.user.findUnique;
    const origUserCreate = prisma.user.create;
    const origUserUpdate = prisma.user.update;
    const origRoleFindUnique = prisma.role.findUnique;
    const origRefreshCreate = prisma.refreshToken.create;
    const origRefreshFindUnique = prisma.refreshToken.findUnique;
    const origRefreshFindFirst = prisma.refreshToken.findFirst;
    const origRefreshFindMany = prisma.refreshToken.findMany;
    const origRefreshUpdate = prisma.refreshToken.update;
    const origRefreshUpdateMany = prisma.refreshToken.updateMany;
    const origEmailVerifyCreate = prisma.emailVerification.create;
    const origEmailVerifyFindUnique = prisma.emailVerification.findUnique;
    const origEmailVerifyUpdate = prisma.emailVerification.update;
    const origPasswordResetCreate = prisma.passwordReset.create;
    const origPasswordResetFindUnique = prisma.passwordReset.findUnique;
    const origPasswordResetUpdate = prisma.passwordReset.update;

    prisma.role.findUnique = (async () => storedRole) as unknown as typeof prisma.role.findUnique;

    prisma.user.findFirst = (async (args: {
      where: { OR?: Array<{ email?: string; phoneNumber?: string }> };
    }) => {
      if (state.storedUser && args.where.OR) {
        const matches = args.where.OR.some(
          clause =>
            (clause.email && clause.email === state.storedUser?.email) ||
            (clause.phoneNumber && clause.phoneNumber === state.storedUser?.phoneNumber),
        );
        return matches ? state.storedUser : null;
      }
      return null;
    }) as unknown as typeof prisma.user.findFirst;

    prisma.user.findUnique = (async (args: { where: { id?: string; email?: string } }) => {
      if (state.storedUser) {
        if (args.where.id && state.storedUser.id === args.where.id) return state.storedUser;
        if (args.where.email && state.storedUser.email === args.where.email)
          return state.storedUser;
      }
      return null;
    }) as unknown as typeof prisma.user.findUnique;

    prisma.user.create = (async (args: {
      data: {
        email: string;
        passwordHash: string;
        phoneNumber?: string | null;
        profile: { create: { username: string; displayName: string } };
      };
    }) => {
      state.storedUser = {
        id: 'u-e2e-user-1',
        email: args.data.email,
        passwordHash: args.data.passwordHash,
        phoneNumber: args.data.phoneNumber,
        status: 'ACTIVE',
        failedLoginAttempts: 0,
        lockedUntil: null,
        emailVerifiedAt: null,
        phoneVerifiedAt: null,
        deletedAt: null,
        userRoles: [{ role: storedRole }],
        profile: {
          id: 'prof-1',
          username: args.data.profile.create.username,
          displayName: args.data.profile.create.displayName,
        },
      };
      return state.storedUser;
    }) as unknown as typeof prisma.user.create;

    prisma.user.update = (async (args: { where: { id: string }; data: Partial<StoredUser> }) => {
      if (state.storedUser && state.storedUser.id === args.where.id) {
        Object.assign(state.storedUser, args.data);
        return state.storedUser;
      }
      return null;
    }) as unknown as typeof prisma.user.update;

    prisma.refreshToken.create = (async (args: { data: StoredRefreshToken }) => {
      const record: StoredRefreshToken = {
        ...args.data,
        id: `rt-${storedRefreshTokens.size + 1}`,
        createdAt: new Date(),
        revokedAt: null,
        replacedByToken: null,
      };
      storedRefreshTokens.set(args.data.token, record);
      return record;
    }) as unknown as typeof prisma.refreshToken.create;

    prisma.refreshToken.findUnique = (async (args: { where: { token: string } }) => {
      const record = storedRefreshTokens.get(args.where.token);
      if (record) {
        return {
          ...record,
          user: state.storedUser,
        };
      }
      return null;
    }) as unknown as typeof prisma.refreshToken.findUnique;

    prisma.refreshToken.findFirst = (async (args: {
      where: { id?: string; userId?: string; revokedAt?: Date | null };
    }) => {
      for (const val of storedRefreshTokens.values()) {
        if (args.where.id && val.id === args.where.id) {
          if (args.where.userId && val.userId !== args.where.userId) continue;
          if (args.where.revokedAt === null && val.revokedAt !== null) continue;
          return val;
        }
      }
      return null;
    }) as unknown as typeof prisma.refreshToken.findFirst;

    prisma.refreshToken.findMany = (async (args: {
      where: { userId?: string; revokedAt?: Date | null };
    }) => {
      const result: StoredRefreshToken[] = [];
      for (const val of storedRefreshTokens.values()) {
        if (args.where.userId && val.userId === args.where.userId) {
          if (args.where.revokedAt === null && val.revokedAt !== null) continue;
          result.push(val);
        }
      }
      return result;
    }) as unknown as typeof prisma.refreshToken.findMany;

    prisma.refreshToken.update = (async (args: {
      where: { id: string };
      data: Partial<StoredRefreshToken>;
    }) => {
      for (const val of storedRefreshTokens.values()) {
        if (val.id === args.where.id) {
          Object.assign(val, args.data);
          return val;
        }
      }
      return null;
    }) as unknown as typeof prisma.refreshToken.update;

    prisma.refreshToken.updateMany = (async (args: {
      where: { familyId?: string; userId?: string };
      data: Partial<StoredRefreshToken>;
    }) => {
      let count = 0;
      for (const val of storedRefreshTokens.values()) {
        if (
          (args.where.familyId && val.familyId === args.where.familyId) ||
          (args.where.userId && val.userId === args.where.userId)
        ) {
          Object.assign(val, args.data);
          count++;
        }
      }
      return { count };
    }) as unknown as typeof prisma.refreshToken.updateMany;

    prisma.emailVerification.create = (async (args: {
      data: { userId: string; token: string; expiresAt: Date };
    }) => {
      const record: StoredVerification = {
        id: `ev-${storedEmailVerifications.size + 1}`,
        ...args.data,
        usedAt: null,
      };
      storedEmailVerifications.set(args.data.token, record);
      return record;
    }) as unknown as typeof prisma.emailVerification.create;

    prisma.emailVerification.findUnique = (async (args: { where: { token: string } }) => {
      const record = storedEmailVerifications.get(args.where.token);
      return record ? { ...record, user: state.storedUser } : null;
    }) as unknown as typeof prisma.emailVerification.findUnique;

    prisma.emailVerification.update = (async (args: {
      where: { id: string };
      data: Partial<StoredVerification>;
    }) => {
      for (const val of storedEmailVerifications.values()) {
        if (val.id === args.where.id) {
          Object.assign(val, args.data);
          return val;
        }
      }
      return null;
    }) as unknown as typeof prisma.emailVerification.update;

    prisma.passwordReset.create = (async (args: {
      data: { userId: string; token: string; expiresAt: Date };
    }) => {
      const record: StoredVerification = {
        id: `pr-${storedPasswordResets.size + 1}`,
        ...args.data,
        usedAt: null,
      };
      storedPasswordResets.set(args.data.token, record);
      return record;
    }) as unknown as typeof prisma.passwordReset.create;

    prisma.passwordReset.findUnique = (async (args: { where: { token: string } }) => {
      const record = storedPasswordResets.get(args.where.token);
      return record ? { ...record, user: state.storedUser } : null;
    }) as unknown as typeof prisma.passwordReset.findUnique;

    prisma.passwordReset.update = (async (args: {
      where: { id: string };
      data: Partial<StoredVerification>;
    }) => {
      for (const val of storedPasswordResets.values()) {
        if (val.id === args.where.id) {
          Object.assign(val, args.data);
          return val;
        }
      }
      return null;
    }) as unknown as typeof prisma.passwordReset.update;

    try {
      // Stage 1: Register New User
      const registration = await authService.register({
        email: 'aaditya.joshi@bharat.in',
        password: 'InitialPassword123!',
        fullName: 'Aaditya Joshi',
        phoneNumber: '+919876543210',
      });

      assert.ok(registration.authResponse.accessToken);
      assert.equal(registration.authResponse.user.email, 'aaditya.joshi@bharat.in');
      assert.ok(registration.authResponse.user.roles.includes(UserRole.TRAVELLER));
      // Stage 2: Email Verification
      assert.ok(registration.emailVerificationToken);
      await authService.verifyEmail(registration.emailVerificationToken);
      assert.ok(state.storedUser?.emailVerifiedAt instanceof Date);

      // Stage 3: Login
      const loginRes = await authService.login({
        email: 'aaditya.joshi@bharat.in',
        password: 'InitialPassword123!',
      });
      assert.ok(loginRes.authResponse.accessToken);
      assert.ok(loginRes.refreshToken);

      // Stage 4: Token Refresh (RTR)
      const refreshRes = await authService.refresh(loginRes.refreshToken);
      assert.ok(refreshRes.authResponse.accessToken);
      assert.notEqual(refreshRes.refreshToken, loginRes.refreshToken);

      // Stage 5: Password Reset Request
      await authService.requestPasswordReset('aaditya.joshi@bharat.in');
      const resetToken = Array.from(storedPasswordResets.keys())[0];
      assert.ok(resetToken);

      // Stage 6: Complete Password Reset
      await authService.resetPassword({
        token: resetToken,
        newPassword: 'BrandNewSecurePassword456!',
      });

      // Stage 7: Attempt Login with Old Password -> Must Fail
      await assert.rejects(
        async () => {
          await authService.login({
            email: 'aaditya.joshi@bharat.in',
            password: 'InitialPassword123!',
          });
        },
        (err: unknown) => err instanceof UnauthorizedException,
      );

      // Stage 8: Login with New Password -> Succeeds
      const newLogin = await authService.login({
        email: 'aaditya.joshi@bharat.in',
        password: 'BrandNewSecurePassword456!',
      });
      assert.ok(newLogin.authResponse.accessToken);

      // Stage 9: Authenticated Password Change
      await authService.changePassword(state.storedUser?.id || '', {
        currentPassword: 'BrandNewSecurePassword456!',
        newPassword: 'ThirdPasswordUpdated789!',
      });

      // Stage 10: MFA Verification Flow with temporary token
      const tempMfaToken = jwtService.sign({
        sub: state.storedUser?.id,
        email: state.storedUser?.email,
        mfaPending: true,
      });
      const mfaResult = await authService.verifyMfa({
        totpCode: '849201',
        tempMfaToken,
      });
      assert.ok(mfaResult.authResponse.accessToken);

      // Stage 11: Multi-Device Session Inspection
      const activeSessions = await authService.listSessions(
        state.storedUser?.id || '',
        newLogin.refreshToken,
      );
      assert.ok(activeSessions.length >= 1);

      // Stage 12: Emergency Account Recovery
      const recoverResult = await authService.recoverAccount({
        email: 'aaditya.joshi@bharat.in',
        recoveryCode: 'ABCD234567',
        newPassword: 'RecoveredFinalPassword!999',
      });
      assert.equal(recoverResult.success, true);

      // Stage 13: Universal Logout
      await authService.logout(undefined, state.storedUser?.id || '');
      for (const rt of storedRefreshTokens.values()) {
        assert.ok(rt.revokedAt instanceof Date);
      }
    } finally {
      prisma.user.findFirst = origUserFindFirst;
      prisma.user.findUnique = origUserFindUnique;
      prisma.user.create = origUserCreate;
      prisma.user.update = origUserUpdate;
      prisma.role.findUnique = origRoleFindUnique;
      prisma.refreshToken.create = origRefreshCreate;
      prisma.refreshToken.findUnique = origRefreshFindUnique;
      prisma.refreshToken.findFirst = origRefreshFindFirst;
      prisma.refreshToken.findMany = origRefreshFindMany;
      prisma.refreshToken.update = origRefreshUpdate;
      prisma.refreshToken.updateMany = origRefreshUpdateMany;
      prisma.emailVerification.create = origEmailVerifyCreate;
      prisma.emailVerification.findUnique = origEmailVerifyFindUnique;
      prisma.emailVerification.update = origEmailVerifyUpdate;
      prisma.passwordReset.create = origPasswordResetCreate;
      prisma.passwordReset.findUnique = origPasswordResetFindUnique;
      prisma.passwordReset.update = origPasswordResetUpdate;
    }
  });
});
