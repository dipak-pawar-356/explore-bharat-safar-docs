// Explore Bharat Safar — Authentication & IAM Contracts
// Conforms to EBS-DOC-12-AUTH, EBS-DOC-40-SEC-BLUEPRINT & EBS-BLU-48-BIZ

export enum UserRole {
  GUEST = 'GUEST',
  TRAVELLER = 'TRAVELLER',
  LOCAL_GUIDE = 'LOCAL_GUIDE',
  VILLAGE_ADMIN = 'VILLAGE_ADMIN',
  BOOKING_ADMIN = 'BOOKING_ADMIN',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  MODERATOR = 'MODERATOR',
  CONTENT_EDITOR = 'CONTENT_EDITOR',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  LOCKED = 'LOCKED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum Permission {
  AUTH_LOGIN = 'auth:login',
  AUTH_REGISTER = 'auth:register',
  AUTH_REFRESH = 'auth:refresh',
  AUTH_LOGOUT = 'auth:logout',
  USER_READ_SELF = 'user:read_self',
  USER_UPDATE_SELF = 'user:update_self',
  USER_READ_ALL = 'user:read_all',
  USER_MANAGE_ROLES = 'user:manage_roles',
  VILLAGE_READ = 'village:read',
  VILLAGE_WRITE_SCOPED = 'village:write_scoped',
  VILLAGE_APPROVE = 'village:approve',
  BOOKING_CREATE = 'booking:create',
  BOOKING_READ_SELF = 'booking:read_self',
  BOOKING_READ_ALL = 'booking:read_all',
  BOOKING_VERIFY_ATTENDANCE = 'booking:verify_attendance',
  PAYMENT_READ = 'payment:read',
  PAYMENT_REFUND = 'payment:refund',
  REVIEW_SUBMIT = 'review:submit',
  SOCIAL_POST_CREATE = 'social:post_create',
  ADMIN_ALL = 'admin:all',
}

export const ROLE_PERMISSIONS_MAP: Record<UserRole, Permission[]> = {
  [UserRole.GUEST]: [Permission.VILLAGE_READ],
  [UserRole.TRAVELLER]: [
    Permission.AUTH_LOGIN,
    Permission.AUTH_REGISTER,
    Permission.AUTH_REFRESH,
    Permission.AUTH_LOGOUT,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.VILLAGE_READ,
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ_SELF,
    Permission.REVIEW_SUBMIT,
    Permission.SOCIAL_POST_CREATE,
  ],
  [UserRole.LOCAL_GUIDE]: [
    Permission.AUTH_LOGIN,
    Permission.AUTH_REFRESH,
    Permission.AUTH_LOGOUT,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.VILLAGE_READ,
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ_SELF,
    Permission.REVIEW_SUBMIT,
    Permission.SOCIAL_POST_CREATE,
  ],
  [UserRole.VILLAGE_ADMIN]: [
    Permission.AUTH_LOGIN,
    Permission.AUTH_REFRESH,
    Permission.AUTH_LOGOUT,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.VILLAGE_READ,
    Permission.VILLAGE_WRITE_SCOPED,
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ_SELF,
    Permission.REVIEW_SUBMIT,
    Permission.SOCIAL_POST_CREATE,
  ],
  [UserRole.MODERATOR]: [
    Permission.AUTH_LOGIN,
    Permission.AUTH_REFRESH,
    Permission.AUTH_LOGOUT,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.VILLAGE_READ,
    Permission.VILLAGE_APPROVE,
    Permission.BOOKING_READ_ALL,
    Permission.REVIEW_SUBMIT,
    Permission.SOCIAL_POST_CREATE,
  ],
  [UserRole.CONTENT_EDITOR]: [
    Permission.AUTH_LOGIN,
    Permission.AUTH_REFRESH,
    Permission.AUTH_LOGOUT,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.VILLAGE_READ,
    Permission.REVIEW_SUBMIT,
    Permission.SOCIAL_POST_CREATE,
  ],
  [UserRole.BOOKING_ADMIN]: [
    Permission.AUTH_LOGIN,
    Permission.AUTH_REFRESH,
    Permission.AUTH_LOGOUT,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.VILLAGE_READ,
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ_SELF,
    Permission.BOOKING_READ_ALL,
    Permission.BOOKING_VERIFY_ATTENDANCE,
  ],
  [UserRole.FINANCE_ADMIN]: [
    Permission.AUTH_LOGIN,
    Permission.AUTH_REFRESH,
    Permission.AUTH_LOGOUT,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.BOOKING_READ_ALL,
    Permission.PAYMENT_READ,
    Permission.PAYMENT_REFUND,
  ],
  [UserRole.SYSTEM_ADMIN]: [
    Permission.AUTH_LOGIN,
    Permission.AUTH_REFRESH,
    Permission.AUTH_LOGOUT,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.USER_READ_ALL,
    Permission.USER_MANAGE_ROLES,
    Permission.VILLAGE_READ,
    Permission.VILLAGE_WRITE_SCOPED,
    Permission.VILLAGE_APPROVE,
    Permission.BOOKING_READ_ALL,
    Permission.BOOKING_VERIFY_ATTENDANCE,
    Permission.PAYMENT_READ,
    Permission.PAYMENT_REFUND,
  ],
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
};

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: AccountStatus;
  roles: UserRole[];
  permissions?: Permission[];
  assignedVillageId?: string; // For Village Admins (tenancy scoping)
  fullName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JwtPayload {
  sub: string; // user UUID
  email: string;
  roles: UserRole[];
  permissions?: Permission[] | string[];
  assignedVillageId?: string;
  sessionId: string;
  deviceHash?: string;
  iat: number;
  exp: number;
  iss?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  totpCode?: string;
  turnstileToken?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  role?: UserRole;
  turnstileToken?: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface RecoverAccountDto {
  email: string;
  recoveryCode: string;
  newPassword: string;
}

export interface MfaSetupResponse {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

export interface MfaVerifyDto {
  totpCode: string;
  tempMfaToken?: string;
}

export interface AuthResponseData {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    roles: UserRole[];
    permissions?: Permission[] | string[];
    assignedVillageId?: string;
    fullName?: string;
    isEmailVerified?: boolean;
  };
  mfaRequired?: boolean;
  tempMfaToken?: string;
}

export interface SessionInfo {
  id: string;
  userId: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}
