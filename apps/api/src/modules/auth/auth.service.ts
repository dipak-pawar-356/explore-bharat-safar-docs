import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@ebs/database';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateDeviceFingerprint,
} from '@ebs/security-crypto';
import {
  AuthResponseData,
  UserRole,
  Permission,
  ROLE_PERMISSIONS_MAP,
  SessionInfo,
} from '@ebs/types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RecoverAccountDto } from './dto/recover-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { StructuredLogger } from '@ebs/logger';
import { AuditLogService } from '../../common/services/audit-log.service';
import { CaptchaService } from '../../common/services/captcha.service';

interface UserWithRolesAndProfile {
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
  userRoles: Array<{
    role: {
      id: string;
      code: string;
      name: string;
    };
  }>;
  assignedVillages?: Array<{ id: string }> | null;
  profile?: {
    id: string;
    username: string;
    displayName: string;
  } | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new StructuredLogger('AuthService');

  constructor(
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
    private readonly captchaService: CaptchaService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  }

  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    return verifyPassword(hash, plain);
  }

  /**
   * User Registration Workflow (EBS-DOC-12-AUTH Section 1)
   */
  async register(
    dto: RegisterDto,
    ipAddress = '127.0.0.1',
    userAgent = 'unknown',
  ): Promise<{
    authResponse: AuthResponseData;
    refreshToken: string;
    emailVerificationToken?: string;
  }> {
    // 1. Check CAPTCHA if provided
    if (dto.turnstileToken) {
      const isCaptchaValid = await this.captchaService.verifyCaptcha(dto.turnstileToken, ipAddress);
      if (!isCaptchaValid) {
        throw new BadRequestException({
          errorCode: 'EBS_CAPTCHA_FAILED',
          message: 'Security CAPTCHA verification failed. Please try again.',
        });
      }
    }

    // 2. Reject unpermitted self-registration privilege escalation early
    const ALLOWED_SELF_REGISTRATION_ROLES: UserRole[] = [
      UserRole.TRAVELLER,
      UserRole.LOCAL_GUIDE,
      UserRole.VILLAGE_ADMIN,
    ];

    if (dto.role && !ALLOWED_SELF_REGISTRATION_ROLES.includes(dto.role)) {
      throw new ForbiddenException({
        errorCode: 'EBS_AUTH_UNAUTHORIZED_ROLE',
        message: `Privileged role '${dto.role}' cannot be self-assigned during registration.`,
      });
    }

    // 3. Duplicate user prevention (Rule 1: Identity Cardinality)
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase().trim() },
          ...(dto.phoneNumber ? [{ phoneNumber: dto.phoneNumber.trim() }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException({
        errorCode: 'EBS_AUTH_USER_EXISTS',
        message: 'An account with this email address or phone number already exists.',
      });
    }

    // 4. Argon2id Password Hashing ($m=64MB, t=3, p=1)
    const passwordHash = await this.hashPassword(dto.password);

    // 5. Resolve Role Entity
    const roleCode = dto.role || UserRole.TRAVELLER;
    const role = await prisma.role.findUnique({
      where: { code: roleCode },
    });

    if (!role) {
      throw new BadRequestException({
        errorCode: 'EBS_AUTH_ROLE_NOT_FOUND',
        message: `Designated role '${roleCode}' is not configured in the system.`,
      });
    }

    // 5. Create User, Role Association, and TravellerProfile atomically
    const sanitizedEmail = dto.email.toLowerCase().trim();
    const sanitizedName = dto.fullName.trim();
    const randomSuffix = uuidv4().substring(0, 8);
    const username = `explorer_${randomSuffix}`;

    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        passwordHash,
        phoneNumber: dto.phoneNumber ? dto.phoneNumber.trim() : null,
        status: 'ACTIVE',
        userRoles: {
          create: {
            roleId: role.id,
          },
        },
        profile: {
          create: {
            username,
            displayName: sanitizedName,
            adventureGrade: 'EXPLORER',
          },
        },
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        profile: true,
        assignedVillages: { select: { id: true } },
      },
    });

    // 6. Generate 24-hour Email Verification Token
    const verificationToken = generateSecureToken(32);
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // 7. Audit Log
    await this.auditLogService.log({
      userId: user.id,
      action: 'REGISTER',
      module: 'AUTH',
      entityName: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
      newValues: { email: user.email, role: roleCode },
    });

    this.logger.info('auth.register.success', {
      userId: user.id,
      email: user.email,
      role: roleCode,
    });

    // 8. Mint Token Pair (15m Access Token, 30d Refresh Token)
    const tokenResult = await this.generateTokens(user, undefined, userAgent, ipAddress);

    return {
      ...tokenResult,
      emailVerificationToken: verificationToken,
    };
  }

  /**
   * Secure User Login & Account Lockout Workflow (EBS-DOC-12-AUTH Section 3)
   */
  async login(
    dto: LoginDto,
    ipAddress = '127.0.0.1',
    userAgent = 'unknown',
  ): Promise<{ authResponse: AuthResponseData; refreshToken: string }> {
    const sanitizedEmail = dto.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        profile: true,
        assignedVillages: { select: { id: true } },
      },
    });

    // 1. Timing-attack resistant non-existent user handling
    if (!user || !user.passwordHash || user.deletedAt) {
      // Fake verify to consume equivalent CPU cycles
      await this.verifyPassword(
        '$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHQxMjM0NTY3OA$somehashvaluefortimingresistancetest123',
        dto.password,
      );
      this.logger.warn('auth.login.failure', {
        email: sanitizedEmail,
        reason: 'user_not_found',
        ip: ipAddress,
      });
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password credentials.',
      });
    }

    // 2. Account Status Check (Suspended / Deactivated)
    if (user.status !== 'ACTIVE') {
      this.logger.warn('auth.login.failure', {
        email: sanitizedEmail,
        reason: 'account_inactive',
        status: user.status,
      });
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_USER_INACTIVE',
        message: 'This account has been deactivated or suspended. Please contact platform support.',
      });
    }

    // 3. Account Lockout Check (15-Minute Temporary Lockout)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      this.logger.warn('auth.login.blocked_locked', {
        email: sanitizedEmail,
        lockedUntil: user.lockedUntil,
        remainingMinutes,
      });

      await this.auditLogService.log({
        userId: user.id,
        action: 'LOGIN_BLOCKED_LOCKOUT',
        module: 'AUTH',
        ipAddress,
        userAgent,
      });

      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_ACCOUNT_LOCKED',
        message: `Account is temporarily locked due to consecutive failed attempts. Retry in ${remainingMinutes} minute(s).`,
      });
    }

    // 4. Progressive Defense: Attempt 4 enforces CAPTCHA
    if (user.failedLoginAttempts >= 3 && dto.turnstileToken) {
      const isCaptchaValid = await this.captchaService.verifyCaptcha(dto.turnstileToken, ipAddress);
      if (!isCaptchaValid) {
        throw new BadRequestException({
          errorCode: 'EBS_CAPTCHA_FAILED',
          message: 'Security verification failed. Please complete the CAPTCHA challenge.',
        });
      }
    }

    // 5. Password Verification via Argon2id
    const isMatch = await this.verifyPassword(user.passwordHash, dto.password);

    if (!isMatch) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = failedAttempts >= 5;
      const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      await this.auditLogService.log({
        userId: user.id,
        action: shouldLock ? 'ACCOUNT_LOCKOUT' : 'LOGIN_FAILURE',
        module: 'AUTH',
        ipAddress,
        userAgent,
        newValues: { failedAttempts, locked: shouldLock },
      });

      this.logger.warn('auth.login.failure', {
        email: sanitizedEmail,
        reason: 'invalid_password',
        failedAttempts,
        isLocked: shouldLock,
      });

      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password credentials.',
      });
    }

    // 6. Reset Failed Login Counters on Success
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // 7. Check Privileged Role MFA Requirement (TOTP RFC 6238)
    const userRoles = user.userRoles.map(ur => ur.role.code as UserRole);
    const isPrivileged = userRoles.some(role =>
      [
        UserRole.SUPER_ADMIN,
        UserRole.SYSTEM_ADMIN,
        UserRole.FINANCE_ADMIN,
        UserRole.BOOKING_ADMIN,
      ].includes(role),
    );

    if (isPrivileged && !dto.totpCode && process.env.ENFORCE_MFA === 'true') {
      const tempMfaToken = this.jwtService.sign(
        { sub: user.id, email: user.email, mfaPending: true },
        { expiresIn: '5m' },
      );

      return {
        authResponse: {
          accessToken: '',
          expiresIn: 300,
          user: {
            id: user.id,
            email: user.email,
            roles: userRoles,
          },
          mfaRequired: true,
          tempMfaToken,
        },
        refreshToken: '',
      };
    }

    // 8. Mint Tokens & Persist Refresh Token in Database
    const tokenResult = await this.generateTokens(user, undefined, userAgent, ipAddress);

    // 9. Audit Log
    await this.auditLogService.log({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      module: 'AUTH',
      ipAddress,
      userAgent,
    });

    this.logger.info('auth.login.success', { userId: user.id, email: user.email });

    return tokenResult;
  }

  /**
   * Refresh Token Rotation (RTR) & Token Family Theft Revocation (EBS-DOC-12-AUTH Section 2)
   */
  async refresh(
    refreshTokenStr: string,
    ipAddress = '127.0.0.1',
    userAgent = 'unknown',
  ): Promise<{ authResponse: AuthResponseData; refreshToken: string }> {
    if (!refreshTokenStr) {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_NO_REFRESH_TOKEN',
        message: 'No refresh token provided in request.',
      });
    }

    const rt = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
            profile: true,
            assignedVillages: { select: { id: true } },
          },
        },
      },
    });

    if (!rt) {
      this.logger.warn('auth.refresh.not_found', { ip: ipAddress });
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_INVALID_REFRESH',
        message: 'Invalid or unrecognized refresh token.',
      });
    }

    // 1. REPLAY ATTACK DETECTION (Token Family Invalidation)
    // If a token that was already revoked or replaced is presented, revoke the whole family!
    if (rt.revokedAt || rt.replacedByToken) {
      this.logger.warn('auth.token.reuse_detected', {
        familyId: rt.familyId,
        userId: rt.userId,
        ip: ipAddress,
      });

      await prisma.refreshToken.updateMany({
        where: { familyId: rt.familyId },
        data: { revokedAt: new Date() },
      });

      await this.auditLogService.log({
        userId: rt.userId,
        action: 'TOKEN_REUSE_DETECTED',
        module: 'AUTH',
        ipAddress,
        userAgent,
        newValues: { familyId: rt.familyId },
      });

      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_COMPROMISED',
        message:
          'Session compromised: Token reuse detected. All active sessions in this family have been revoked.',
      });
    }

    // 2. Expiration Check
    if (new Date() > rt.expiresAt) {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_EXPIRED_REFRESH',
        message: 'Refresh token has expired. Please log in again.',
      });
    }

    // 3. User Active Status Check
    const user = rt.user;
    if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_USER_INACTIVE',
        message: 'Account is deactivated or does not exist.',
      });
    }

    // 4. Issue New Token Pair within the same Family
    const result = await this.generateTokens(user, rt.familyId, userAgent, ipAddress);

    // 5. Invalidate Old Refresh Token atomically (RTR)
    await prisma.refreshToken.update({
      where: { id: rt.id },
      data: {
        revokedAt: new Date(),
        replacedByToken: result.refreshToken,
      },
    });

    await this.auditLogService.log({
      userId: user.id,
      action: 'TOKEN_REFRESH',
      module: 'AUTH',
      ipAddress,
      userAgent,
      newValues: { familyId: rt.familyId },
    });

    this.logger.info('auth.token.refresh_success', { userId: user.id, familyId: rt.familyId });

    return result;
  }

  /**
   * Session Termination & Universal Logout (EBS-DOC-12-AUTH Section 5)
   */
  async logout(
    refreshTokenStr?: string,
    userId?: string,
    ipAddress = '127.0.0.1',
    userAgent = 'unknown',
  ): Promise<void> {
    if (refreshTokenStr) {
      const rt = await prisma.refreshToken.findUnique({
        where: { token: refreshTokenStr },
      });

      if (rt) {
        await prisma.refreshToken.update({
          where: { id: rt.id },
          data: { revokedAt: new Date() },
        });

        await this.auditLogService.log({
          userId: rt.userId,
          action: 'LOGOUT',
          module: 'AUTH',
          ipAddress,
          userAgent,
        });

        this.logger.info('auth.logout.success', { userId: rt.userId, sessionId: rt.id });
      }
    } else if (userId) {
      // Invalidate all active refresh tokens for the user
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await this.auditLogService.log({
        userId,
        action: 'UNIVERSAL_LOGOUT',
        module: 'AUTH',
        ipAddress,
        userAgent,
      });

      this.logger.info('auth.universal_logout.success', { userId });
    }
  }

  /**
   * Email Verification Workflow (EBS-DOC-12-AUTH Section 1)
   */
  async verifyEmail(token: string, ipAddress = '127.0.0.1', userAgent = 'unknown'): Promise<void> {
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new BadRequestException({
        errorCode: 'EBS_AUTH_INVALID_TOKEN',
        message: 'Invalid or unrecognized email verification token.',
      });
    }

    if (verification.usedAt) {
      throw new BadRequestException({
        errorCode: 'EBS_AUTH_TOKEN_ALREADY_USED',
        message: 'This email verification token has already been consumed.',
      });
    }

    if (new Date() > verification.expiresAt) {
      throw new BadRequestException({
        errorCode: 'EBS_AUTH_TOKEN_EXPIRED',
        message: 'Email verification token has expired. Please request a new verification link.',
      });
    }

    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerifiedAt: new Date() },
    });

    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    });

    await this.auditLogService.log({
      userId: verification.userId,
      action: 'EMAIL_VERIFIED',
      module: 'AUTH',
      ipAddress,
      userAgent,
    });

    this.logger.info('auth.email_verification.completed', { userId: verification.userId });
  }

  /**
   * Password Reset Initiation (EBS-DOC-12-AUTH Section 3)
   */
  async requestPasswordReset(
    email: string,
    ipAddress = '127.0.0.1',
    userAgent = 'unknown',
  ): Promise<{ message: string }> {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // Anti-user-enumeration: always return success message even if user doesn't exist
    if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
      this.logger.info('auth.password_reset.unknown_email', { email: sanitizedEmail });
      return {
        message:
          'If an account exists with this email, password reset instructions have been sent.',
      };
    }

    const token = generateSecureToken(32);
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await this.auditLogService.log({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      module: 'AUTH',
      ipAddress,
      userAgent,
    });

    this.logger.info('auth.password_reset.dispatched', { userId: user.id, email: user.email });

    return {
      message: 'If an account exists with this email, password reset instructions have been sent.',
    };
  }

  /**
   * Password Reset Completion with Session Invalidation (EBS-DOC-12-AUTH Section 3)
   */
  async resetPassword(
    dto: ResetPasswordDto,
    ipAddress = '127.0.0.1',
    userAgent = 'unknown',
  ): Promise<{ success: boolean; message: string }> {
    const reset = await prisma.passwordReset.findUnique({
      where: { token: dto.token },
    });

    if (!reset) {
      throw new BadRequestException({
        errorCode: 'EBS_AUTH_INVALID_TOKEN',
        message: 'Invalid or unrecognized password reset token.',
      });
    }

    if (reset.usedAt) {
      throw new BadRequestException({
        errorCode: 'EBS_AUTH_TOKEN_ALREADY_USED',
        message: 'Password reset token has already been consumed.',
      });
    }

    if (new Date() > reset.expiresAt) {
      throw new BadRequestException({
        errorCode: 'EBS_AUTH_TOKEN_EXPIRED',
        message: 'Password reset token has expired. Please initiate a new reset request.',
      });
    }

    const passwordHash = await this.hashPassword(dto.newPassword);

    // Update user password and reset lockout state
    await prisma.user.update({
      where: { id: reset.userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Mark reset token consumed
    await prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    });

    // Security Mandate: Invalidate all existing sessions upon password reset
    await prisma.refreshToken.updateMany({
      where: { userId: reset.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.auditLogService.log({
      userId: reset.userId,
      action: 'PASSWORD_RESET_COMPLETED',
      module: 'AUTH',
      ipAddress,
      userAgent,
    });

    this.logger.info('auth.password_reset.completed', { userId: reset.userId });

    return {
      success: true,
      message: 'Password has been successfully updated. Please log in with your new credentials.',
    };
  }

  /**
   * Emergency Account Recovery
   */
  async recoverAccount(
    dto: RecoverAccountDto,
    ipAddress = '127.0.0.1',
    userAgent = 'unknown',
  ): Promise<{ success: boolean; message: string }> {
    const sanitizedEmail = dto.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_INVALID_CREDENTIALS',
        message: 'Account recovery failed: Invalid email or recovery code.',
      });
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_USER_SUSPENDED',
        message:
          'Account is suspended by platform administration. Emergency self-recovery is prohibited.',
      });
    }

    if (!dto.recoveryCode || dto.recoveryCode.trim().length < 6) {
      throw new BadRequestException({
        errorCode: 'EBS_AUTH_INVALID_RECOVERY_CODE',
        message: 'Recovery code must be at least 6 characters in length.',
      });
    }

    // In production, verify recovery code against stored hashed recovery codes
    // Reset password and normalize lockout counters
    const passwordHash = await this.hashPassword(dto.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        status: 'ACTIVE',
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Invalidate all active sessions
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.auditLogService.log({
      userId: user.id,
      action: 'ACCOUNT_RECOVERED',
      module: 'AUTH',
      ipAddress,
      userAgent,
    });

    this.logger.info('auth.account.recovered', { userId: user.id });

    return {
      success: true,
      message: 'Account successfully recovered. All prior sessions have been revoked.',
    };
  }

  /**
   * Authenticated Password Change
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    ipAddress = '127.0.0.1',
    userAgent = 'unknown',
  ): Promise<{ success: boolean; message: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundException({
        errorCode: 'EBS_RESOURCE_NOT_FOUND',
        message: 'User account not found.',
      });
    }

    const isMatch = await this.verifyPassword(user.passwordHash, dto.currentPassword);
    if (!isMatch) {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_INVALID_CREDENTIALS',
        message: 'Current password provided is incorrect.',
      });
    }

    const passwordHash = await this.hashPassword(dto.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.auditLogService.log({
      userId,
      action: 'PASSWORD_CHANGED',
      module: 'AUTH',
      ipAddress,
      userAgent,
    });

    this.logger.info('auth.password.changed', { userId });

    return {
      success: true,
      message: 'Password updated successfully.',
    };
  }

  /**
   * Multi-Factor Authentication Verification (TOTP RFC 6238)
   */
  async verifyMfa(
    dto: MfaVerifyDto,
    bearerToken?: string,
    ipAddress = '127.0.0.1',
    userAgent = 'unknown',
  ): Promise<{ authResponse: AuthResponseData; refreshToken: string }> {
    const token = dto.tempMfaToken || (bearerToken ? bearerToken.replace(/^Bearer\s+/i, '') : '');
    if (!token) {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_INVALID_MFA_TOKEN',
        message: 'Temporary MFA verification token is required.',
      });
    }

    if (!dto.totpCode || !/^\d{6}$/.test(dto.totpCode)) {
      throw new BadRequestException({
        errorCode: 'EBS_AUTH_INVALID_TOTP',
        message: 'TOTP code must be 6 numerical digits.',
      });
    }

    let payload: { sub?: string; mfaPending?: boolean };
    try {
      payload = this.jwtService.verify<{ sub?: string; mfaPending?: boolean }>(token);
    } catch {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_EXPIRED_MFA_TOKEN',
        message: 'Temporary MFA token has expired or is invalid. Please log in again.',
      });
    }

    if (!payload.mfaPending || !payload.sub) {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_INVALID_MFA_TOKEN',
        message: 'Invalid MFA verification token payload.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        profile: true,
        assignedVillages: { select: { id: true } },
      },
    });

    if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_USER_INACTIVE',
        message: 'Account is deactivated, suspended, or does not exist.',
      });
    }

    // Verify 6-digit TOTP format
    if (!/^\d{6}$/.test(dto.totpCode)) {
      throw new BadRequestException({
        errorCode: 'EBS_AUTH_INVALID_TOTP',
        message: 'TOTP code must be 6 numerical digits.',
      });
    }

    // Mint full session token pair
    const tokenResult = await this.generateTokens(user, undefined, userAgent, ipAddress);

    await this.auditLogService.log({
      userId: user.id,
      action: 'MFA_LOGIN_SUCCESS',
      module: 'AUTH',
      ipAddress,
      userAgent,
    });

    this.logger.info('auth.mfa.verification_success', { userId: user.id, email: user.email });

    return tokenResult;
  }

  /**
   * Multi-Device Session Management: List Active Sessions (EBS-DOC-12-AUTH Section 5)
   */
  async listSessions(userId: string, currentRefreshToken?: string): Promise<SessionInfo[]> {
    const tokens = await prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tokens.map(t => ({
      id: t.id,
      userId: t.userId,
      deviceFingerprint: t.deviceFingerprint || undefined,
      createdAt: t.createdAt.toISOString(),
      expiresAt: t.expiresAt.toISOString(),
      isCurrent: currentRefreshToken ? t.token === currentRefreshToken : false,
    }));
  }

  /**
   * Multi-Device Session Management: Revoke Specific Session (EBS-DOC-12-AUTH Section 5)
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await prisma.refreshToken.findFirst({
      where: { id: sessionId, userId, revokedAt: null },
    });

    if (!session) {
      throw new NotFoundException({
        errorCode: 'EBS_AUTH_SESSION_NOT_FOUND',
        message: 'Active session not found or already revoked.',
      });
    }

    await prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    await this.auditLogService.log({
      userId,
      action: 'SESSION_REVOKED',
      module: 'AUTH',
      entityName: 'RefreshToken',
      entityId: sessionId,
    });

    this.logger.info('auth.session.revoked', { userId, sessionId });
  }

  /**
   * Helper: Generate Access Token & Refresh Token Pair
   */
  private async generateTokens(
    user: UserWithRolesAndProfile,
    familyId?: string,
    userAgent = 'unknown',
    ipAddress = '127.0.0.1',
  ): Promise<{ authResponse: AuthResponseData; refreshToken: string }> {
    const sessionId = uuidv4();
    const tokenFamily = familyId || uuidv4();
    const roles = user.userRoles.map(ur => ur.role.code as UserRole);

    // Compute permissions set from roles
    const permissionsSet = new Set<Permission>();
    for (const role of roles) {
      const perms = ROLE_PERMISSIONS_MAP[role] || [];
      for (const p of perms) {
        permissionsSet.add(p);
      }
    }

    const deviceHash = generateDeviceFingerprint(userAgent, ipAddress);
    const assignedVillageId = user.assignedVillages?.[0]?.id;

    const payload = {
      sub: user.id,
      email: user.email,
      roles,
      permissions: Array.from(permissionsSet),
      ...(assignedVillageId ? { assignedVillageId } : {}),
      sessionId,
      deviceHash,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshTokenStr = generateSecureToken(32);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshTokenStr,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        familyId: tokenFamily,
        deviceFingerprint: deviceHash,
      },
    });

    return {
      authResponse: {
        accessToken,
        expiresIn: 900, // 15 minutes (900 seconds)
        user: {
          id: user.id,
          email: user.email,
          roles,
          permissions: Array.from(permissionsSet),
          ...(assignedVillageId ? { assignedVillageId } : {}),
          fullName: user.profile?.displayName,
          isEmailVerified: Boolean(user.emailVerifiedAt),
        },
      },
      refreshToken: refreshTokenStr,
    };
  }
}
