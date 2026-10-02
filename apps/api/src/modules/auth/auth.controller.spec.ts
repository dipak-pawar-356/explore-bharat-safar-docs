import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';
import {
  UserRole,
  AccountStatus,
  type User,
  type SessionInfo,
  type AuthResponseData,
} from '@ebs/types';
import type { FastifyReply, FastifyRequest } from 'fastify';

interface MockAuthService {
  register: () => Promise<{ authResponse: AuthResponseData; refreshToken: string }>;
  login: () => Promise<{ authResponse: AuthResponseData; refreshToken: string }>;
  refresh: () => Promise<{ authResponse: AuthResponseData; refreshToken: string }>;
  logout: () => Promise<void>;
  verifyEmail: () => Promise<void>;
  requestPasswordReset: () => Promise<{ message: string }>;
  resetPassword: () => Promise<{ success: boolean; message: string }>;
  recoverAccount: () => Promise<{ success: boolean; message: string }>;
  changePassword: () => Promise<{ success: boolean; message: string }>;
  verifyMfa: () => Promise<{ authResponse: AuthResponseData; refreshToken: string }>;
  listSessions?: () => Promise<SessionInfo[]>;
  revokeSession?: () => Promise<void>;
}

describe('AuthController — REST Endpoints Unit Suite', () => {
  let controller: AuthController;
  let mockAuthService: MockAuthService;
  let mockRes: {
    setCookie: (name: string, value: string, options: Record<string, unknown>) => void;
    clearCookie: (name: string, options: Record<string, unknown>) => void;
  };
  let mockReq: {
    ip: string;
    headers: Record<string, string>;
    cookies: Record<string, string>;
  };
  let setCookieCalls: Array<[string, string, Record<string, unknown>]>;
  let clearCookieCalls: Array<[string, Record<string, unknown>]>;

  beforeEach(() => {
    setCookieCalls = [];
    clearCookieCalls = [];

    mockAuthService = {
      register: async () => ({
        authResponse: {
          accessToken: 'mock_jwt_access_token',
          expiresIn: 900,
          user: {
            id: 'u-1',
            email: 'explorer@bharat.in',
            roles: [UserRole.TRAVELLER],
            fullName: 'Explorer Name',
          },
        },
        refreshToken: 'mock_refresh_token_123',
      }),
      login: async () => ({
        authResponse: {
          accessToken: 'mock_jwt_access_token',
          expiresIn: 900,
          user: {
            id: 'u-1',
            email: 'explorer@bharat.in',
            roles: [UserRole.TRAVELLER],
          },
        },
        refreshToken: 'mock_refresh_token_456',
      }),
      refresh: async () => ({
        authResponse: {
          accessToken: 'mock_new_access_token',
          expiresIn: 900,
          user: {
            id: 'u-1',
            email: 'explorer@bharat.in',
            roles: [UserRole.TRAVELLER],
          },
        },
        refreshToken: 'mock_new_refresh_token',
      }),
      logout: async () => {},
      verifyEmail: async () => {},
      requestPasswordReset: async () => ({ message: 'Instructions dispatched.' }),
      resetPassword: async () => ({ success: true, message: 'Password reset.' }),
      recoverAccount: async () => ({ success: true, message: 'Account recovered.' }),
      changePassword: async () => ({ success: true, message: 'Password changed.' }),
      verifyMfa: async () => ({
        authResponse: {
          accessToken: 'mock_mfa_access_token',
          expiresIn: 900,
          user: {
            id: 'u-mfa-1',
            email: 'mfa@bharat.in',
            roles: [UserRole.SUPER_ADMIN],
          },
        },
        refreshToken: 'mock_mfa_refresh_token',
      }),
    };

    mockRes = {
      setCookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookieCalls.push([name, value, options]);
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearCookieCalls.push([name, options]);
      },
    };

    mockReq = {
      ip: '192.168.1.50',
      headers: { 'user-agent': 'JestTestClient/1.0' },
      cookies: {},
    };

    controller = new AuthController(mockAuthService as unknown as AuthService);
  });

  it('POST /auth/register should set HttpOnly refresh cookie and return access payload', async () => {
    const res = await controller.register(
      {
        email: 'explorer@bharat.in',
        password: 'SecurePassword123!',
        fullName: 'Explorer Name',
      },
      mockReq as unknown as FastifyRequest,
      mockRes as unknown as FastifyReply,
    );

    assert.equal(res.accessToken, 'mock_jwt_access_token');
    assert.equal(setCookieCalls.length, 1);
    assert.equal(setCookieCalls[0][0], 'refreshToken');
    assert.equal(setCookieCalls[0][1], 'mock_refresh_token_123');
    assert.equal(setCookieCalls[0][2].httpOnly, true);
    assert.equal(setCookieCalls[0][2].sameSite, 'strict');
  });

  it('POST /auth/login should set HttpOnly cookie and return access credentials', async () => {
    const res = await controller.login(
      {
        email: 'explorer@bharat.in',
        password: 'SecurePassword123!',
      },
      mockReq as unknown as FastifyRequest,
      mockRes as unknown as FastifyReply,
    );

    assert.equal(res.accessToken, 'mock_jwt_access_token');
    assert.equal(setCookieCalls.length, 1);
    assert.equal(setCookieCalls[0][0], 'refreshToken');
    assert.equal(setCookieCalls[0][1], 'mock_refresh_token_456');
  });

  it('POST /auth/refresh should read cookie and set new rotated cookie', async () => {
    mockReq.cookies = { refreshToken: 'cookie_refresh_token' };

    const res = await controller.refresh(
      mockReq as unknown as FastifyRequest,
      mockRes as unknown as FastifyReply,
    );
    assert.equal(res.accessToken, 'mock_new_access_token');
    assert.equal(setCookieCalls.length, 1);
    assert.equal(setCookieCalls[0][1], 'mock_new_refresh_token');
  });

  it('POST /auth/logout should clear refresh cookie', async () => {
    mockReq.cookies = { refreshToken: 'token_to_logout' };

    const res = await controller.logout(
      mockReq as unknown as FastifyRequest,
      mockRes as unknown as FastifyReply,
    );
    assert.equal(res.success, true);
    assert.equal(clearCookieCalls.length, 1);
    assert.equal(clearCookieCalls[0][0], 'refreshToken');
  });

  it('POST /auth/verify-email should execute email verification', async () => {
    const res = await controller.verifyEmail(
      { token: 'verification_token' },
      mockReq as unknown as FastifyRequest,
    );
    assert.equal(res.success, true);
  });

  it('POST /auth/forgot-password should dispatch reset instructions', async () => {
    const res = await controller.forgotPassword(
      { email: 'explorer@bharat.in' },
      mockReq as unknown as FastifyRequest,
    );
    assert.equal(res.message, 'Instructions dispatched.');
  });

  it('POST /auth/reset-password should reset password and clear refresh cookie', async () => {
    const res = await controller.resetPassword(
      { token: 'reset_tok', newPassword: 'BrandNewPassword123!' },
      mockReq as unknown as FastifyRequest,
      mockRes as unknown as FastifyReply,
    );
    assert.equal(res.success, true);
    assert.equal(clearCookieCalls.length, 1);
  });

  it('POST /auth/recover-account should recover account and clear cookie', async () => {
    const res = await controller.recoverAccount(
      {
        email: 'explorer@bharat.in',
        recoveryCode: 'REC-999999',
        newPassword: 'BrandNewPassword123!',
      },
      mockReq as unknown as FastifyRequest,
      mockRes as unknown as FastifyReply,
    );
    assert.equal(res.success, true);
    assert.equal(clearCookieCalls.length, 1);
  });

  it('POST /auth/change-password should change password for authenticated user', async () => {
    const res = await controller.changePassword(
      'u-1',
      {
        currentPassword: 'CurrentPassword123!',
        newPassword: 'BrandNewPassword123!',
      },
      mockReq as unknown as FastifyRequest,
    );
    assert.equal(res.success, true);
  });

  it('POST /auth/mfa/verify should verify TOTP and set refresh cookie', async () => {
    const res = await controller.verifyMfa(
      {
        totpCode: '849201',
        tempMfaToken: 'mock_temp_mfa_token',
      },
      mockReq as unknown as FastifyRequest,
      mockRes as unknown as FastifyReply,
    );
    assert.equal(res.accessToken, 'mock_mfa_access_token');
    assert.equal(setCookieCalls.length, 1);
    assert.equal(setCookieCalls[0][1], 'mock_mfa_refresh_token');
  });

  it('POST /auth/logout-all should execute universal logout and clear refresh cookie', async () => {
    const res = await controller.logoutAll(
      'u-1',
      mockReq as unknown as FastifyRequest,
      mockRes as unknown as FastifyReply,
    );
    assert.equal(res.success, true);
    assert.equal(clearCookieCalls.length, 1);
  });

  it('GET /auth/sessions should return list of active sessions', async () => {
    mockAuthService.listSessions = async () => [
      {
        id: 'sess-1',
        userId: 'u-1',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 100000).toISOString(),
        isCurrent: true,
      },
    ];

    const sessions = await controller.listSessions('u-1', mockReq as unknown as FastifyRequest);
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].id, 'sess-1');
    assert.equal(sessions[0].isCurrent, true);
  });

  it('DELETE /auth/sessions/:sessionId should revoke target session', async () => {
    mockAuthService.revokeSession = async () => {};

    const res = await controller.revokeSession('u-1', 'sess-1');
    assert.equal(res.success, true);
    assert.ok(res.message.includes('revoked'));
  });

  it('GET /auth/me should return current authenticated user', async () => {
    const mockUser: User = {
      id: 'u-1',
      email: 'explorer@bharat.in',
      roles: [UserRole.TRAVELLER],
      status: AccountStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEmailVerified: true,
      isPhoneVerified: false,
    };

    const res = await controller.getProfile(mockUser);
    assert.equal(res.id, 'u-1');
    assert.equal(res.email, 'explorer@bharat.in');
  });
});
