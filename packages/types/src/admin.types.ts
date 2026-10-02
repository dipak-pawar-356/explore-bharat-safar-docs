// Explore Bharat Safar — Enterprise Administration Platform Types
// Conforms to EBS-DOC-13-ADMIN, EBS-DOC-09-API, EBS-DOC-26-RULES, EBS-DOC-40-SEC-BLUEPRINT

import type { UserRole, Permission, AccountStatus } from './auth.types';

// ---------------------------------------------------------------------------
// Admin Dashboard & Analytics
// ---------------------------------------------------------------------------

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPlaces: number;
  totalVillages: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  pendingRevenue: number;
  certificatesIssued: number;
  pendingModerations: number;
  activeSocialPosts: number;
  activeCommunities: number;
  systemHealth: SystemHealthStatus;
  timestamp: string;
}

export enum SystemHealthStatus {
  OPERATIONAL = 'OPERATIONAL',
  DEGRADED = 'DEGRADED',
  PARTIAL_OUTAGE = 'PARTIAL_OUTAGE',
  CRITICAL = 'CRITICAL',
  MAINTENANCE = 'MAINTENANCE',
}

export interface KpiWidget {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  trend?: KpiTrend;
  trendPercent?: number;
  category: KpiCategory;
  icon?: string;
  colorVariant: KpiColorVariant;
  description?: string;
  lastUpdated: string;
}

export enum KpiTrend {
  UP = 'UP',
  DOWN = 'DOWN',
  STABLE = 'STABLE',
}

export enum KpiCategory {
  USERS = 'USERS',
  BOOKINGS = 'BOOKINGS',
  REVENUE = 'REVENUE',
  VILLAGES = 'VILLAGES',
  DISCOVERY = 'DISCOVERY',
  SOCIAL = 'SOCIAL',
  CERTIFICATES = 'CERTIFICATES',
  PAYMENTS = 'PAYMENTS',
  SYSTEM = 'SYSTEM',
  MODERATION = 'MODERATION',
}

export enum KpiColorVariant {
  SAFFRON = 'saffron',
  EVERGREEN = 'evergreen',
  TERRACOTTA = 'terracotta',
  SLATE = 'slate',
  INDIGO = 'indigo',
  AMBER = 'amber',
}

// ---------------------------------------------------------------------------
// Audit Logging
// ---------------------------------------------------------------------------

export interface AuditLogEntry {
  id: string;
  actorUserId: string;
  actorEmail: string;
  actorRoles: UserRole[];
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  resourceLabel?: string;
  changes?: AuditChangeDiff;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  outcome: AuditOutcome;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export enum AuditAction {
  // Auth Actions
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_PASSWORD_RESET = 'USER_PASSWORD_RESET',
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_STATUS_CHANGED = 'USER_STATUS_CHANGED',
  USER_DELETED = 'USER_DELETED',
  // Village Actions
  VILLAGE_UPDATE_SUBMITTED = 'VILLAGE_UPDATE_SUBMITTED',
  VILLAGE_UPDATE_APPROVED = 'VILLAGE_UPDATE_APPROVED',
  VILLAGE_UPDATE_REJECTED = 'VILLAGE_UPDATE_REJECTED',
  // Booking Actions
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  ATTENDANCE_MARKED = 'ATTENDANCE_MARKED',
  // Payment Actions
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_CAPTURED = 'PAYMENT_CAPTURED',
  REFUND_INITIATED = 'REFUND_INITIATED',
  UPFRONT_PERCENTAGE_CHANGED = 'UPFRONT_PERCENTAGE_CHANGED',
  // Certificate Actions
  CERTIFICATE_ISSUED = 'CERTIFICATE_ISSUED',
  CERTIFICATE_REVOKED = 'CERTIFICATE_REVOKED',
  CERTIFICATE_REISSUED = 'CERTIFICATE_REISSUED',
  // Admin Actions
  NAVIGATION_TREE_UPDATED = 'NAVIGATION_TREE_UPDATED',
  BOOKING_TOGGLE_CHANGED = 'BOOKING_TOGGLE_CHANGED',
  FEATURE_FLAG_TOGGLED = 'FEATURE_FLAG_TOGGLED',
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  // Social Moderation
  POST_MODERATED = 'POST_MODERATED',
  COMMUNITY_MODERATED = 'COMMUNITY_MODERATED',
  STORY_MODERATED = 'STORY_MODERATED',
  REPORT_RESOLVED = 'REPORT_RESOLVED',
}

export enum AuditResourceType {
  USER = 'USER',
  VILLAGE = 'VILLAGE',
  PLACE = 'PLACE',
  BOOKING = 'BOOKING',
  PAYMENT = 'PAYMENT',
  CERTIFICATE = 'CERTIFICATE',
  POST = 'POST',
  COMMUNITY = 'COMMUNITY',
  EXPERIENCE = 'EXPERIENCE',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  FEATURE_FLAG = 'FEATURE_FLAG',
  NAVIGATION_TREE = 'NAVIGATION_TREE',
}

export enum AuditOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PARTIAL = 'PARTIAL',
}

export interface AuditChangeDiff {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  fieldsChanged?: string[];
}

// ---------------------------------------------------------------------------
// User Management
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  status: AccountStatus;
  roles: UserRole[];
  permissions?: Permission[];
  assignedVillageId?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: string;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserManagementFilter {
  search?: string;
  role?: UserRole;
  status?: AccountStatus;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'fullName';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateUserRolesDto {
  roles: UserRole[];
  assignedVillageId?: string;
}

export interface UpdateUserStatusDto {
  status: AccountStatus;
  reason?: string;
}

// ---------------------------------------------------------------------------
// System Configuration & Feature Flags
// ---------------------------------------------------------------------------

export interface FeatureFlag {
  id: string;
  key: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  scope: FeatureFlagScope;
  rolloutPercentage?: number;
  affectedRoles?: UserRole[];
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  createdAt: string;
}

export enum FeatureFlagScope {
  GLOBAL = 'GLOBAL',
  ROLE_BASED = 'ROLE_BASED',
  CANARY = 'CANARY',
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string | number | boolean;
  description?: string;
  category: SystemConfigCategory;
  isReadOnly: boolean;
  lastModifiedBy?: string;
  updatedAt: string;
}

export enum SystemConfigCategory {
  PAYMENT = 'PAYMENT',
  BOOKING = 'BOOKING',
  AUTHENTICATION = 'AUTHENTICATION',
  SOCIAL = 'SOCIAL',
  MODERATION = 'MODERATION',
  NOTIFICATION = 'NOTIFICATION',
  GIS = 'GIS',
  GENERAL = 'GENERAL',
}

// ---------------------------------------------------------------------------
// Navigation Tree
// ---------------------------------------------------------------------------

export interface NavigationTree {
  id: string;
  version: number;
  sections: NavigationSection[];
  updatedAt: string;
  updatedBy?: string;
}

export interface NavigationSection {
  id: string;
  slug: string;
  label: string;
  icon?: string;
  position: number;
  isVisible: boolean;
  href?: string;
  children?: NavigationSection[];
  requiredRoles?: UserRole[];
}

// ---------------------------------------------------------------------------
// System Health & Monitoring
// ---------------------------------------------------------------------------

export interface SystemHealth {
  status: SystemHealthStatus;
  timestamp: string;
  services: ServiceHealthCheck[];
  uptime: number;
  version: string;
}

export interface ServiceHealthCheck {
  name: string;
  status: ServiceStatus;
  latencyMs?: number;
  lastChecked: string;
  details?: string;
}

export enum ServiceStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED',
  UNKNOWN = 'UNKNOWN',
}

// ---------------------------------------------------------------------------
// Moderation
// ---------------------------------------------------------------------------

export interface AdminModerationItem {
  id: string;
  type: ModerationItemType;
  contentId: string;
  contentPreview?: string;
  reportedBy?: string;
  reportReason?: string;
  reportCount: number;
  status: AdminModerationStatus;
  assignedModerator?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ModerationItemType {
  POST = 'POST',
  STORY = 'STORY',
  COMMUNITY = 'COMMUNITY',
  REVIEW = 'REVIEW',
  COMMENT = 'COMMENT',
  PROFILE = 'PROFILE',
  VILLAGE_UPDATE = 'VILLAGE_UPDATE',
}

export enum AdminModerationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
}

export interface ModerationAction {
  action: ModerationDecision;
  reason?: string;
  notes?: string;
}

export enum ModerationDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REMOVE = 'REMOVE',
  WARN_USER = 'WARN_USER',
  SUSPEND_USER = 'SUSPEND_USER',
  ESCALATE = 'ESCALATE',
}

// ---------------------------------------------------------------------------
// Dashboard Filters & Saved Views
// ---------------------------------------------------------------------------

export interface DashboardFilter {
  id: string;
  label: string;
  dateRange?: DateRange;
  roles?: UserRole[];
  categories?: KpiCategory[];
  isDefault: boolean;
}

export interface DateRange {
  from: string;
  to: string;
  preset?: DateRangePreset;
}

export enum DateRangePreset {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  THIS_YEAR = 'THIS_YEAR',
  CUSTOM = 'CUSTOM',
}

// ---------------------------------------------------------------------------
// Report Generation
// ---------------------------------------------------------------------------

export interface AdminReport {
  id: string;
  reportType: ReportType;
  title: string;
  generatedBy: string;
  generatedAt: string;
  parameters: Record<string, unknown>;
  status: ReportStatus;
  downloadUrl?: string;
  expiresAt?: string;
}

export enum ReportType {
  BOOKING_SUMMARY = 'BOOKING_SUMMARY',
  REVENUE_SUMMARY = 'REVENUE_SUMMARY',
  USER_ACTIVITY = 'USER_ACTIVITY',
  VILLAGE_ACTIVITY = 'VILLAGE_ACTIVITY',
  CERTIFICATE_ISSUANCE = 'CERTIFICATE_ISSUANCE',
  PAYMENT_RECONCILIATION = 'PAYMENT_RECONCILIATION',
  MODERATION_ACTIVITY = 'MODERATION_ACTIVITY',
  AUDIT_LOG_EXPORT = 'AUDIT_LOG_EXPORT',
  SYSTEM_HEALTH = 'SYSTEM_HEALTH',
  SOCIAL_ANALYTICS = 'SOCIAL_ANALYTICS',
  GIS_ANALYTICS = 'GIS_ANALYTICS',
}

export enum ReportStatus {
  QUEUED = 'QUEUED',
  GENERATING = 'GENERATING',
  READY = 'READY',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export enum ExportFormat {
  CSV = 'CSV',
  PDF = 'PDF',
  JSON = 'JSON',
  XLSX = 'XLSX',
}

// ---------------------------------------------------------------------------
// Admin Profile & Settings
// ---------------------------------------------------------------------------

export interface AdminProfile {
  userId: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  avatarUrl?: string;
  themePreference: AdminTheme;
  notificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  activeSessionCount: number;
}

export enum AdminTheme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM',
}

// ---------------------------------------------------------------------------
// Paginated Admin Response
// ---------------------------------------------------------------------------

export interface AdminPaginatedResult<T> {
  items: T[];
  pagination: AdminPagination;
}

export interface AdminPagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}
