// Explore Bharat Safar — Enterprise Notification & Communication Contracts
// Reference: EBS-DOC-19-NOTIF, EBS-DOC-09-API, EBS-BLU-49-REPO Section 14
// Sprint 10: Enterprise Notification & Communication Platform

export enum NotificationCategory {
  TRANSACTIONAL = 'TRANSACTIONAL',
  SECURITY = 'SECURITY',
  BOOKING = 'BOOKING',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  CERTIFICATE = 'CERTIFICATE',
  VILLAGE = 'VILLAGE',
  DISCOVERY = 'DISCOVERY',
  SOCIAL = 'SOCIAL',
  COMMUNITY = 'COMMUNITY',
  MODERATION = 'MODERATION',
  SYSTEM = 'SYSTEM',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  EMERGENCY = 'EMERGENCY',
}

export enum NotificationPriority {
  CRITICAL = 'CRITICAL', // P0: Instant dispatch, bypasses batching (SMS/Email/InApp)
  HIGH = 'HIGH', // P1: Priority lane in BullMQ (Booking confirms, refunds)
  NORMAL = 'NORMAL', // P2: Default lane (Social, certificates, reviews)
  LOW = 'LOW', // P3: Batch lane (Weekly digests, community news)
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  WEB_PUSH = 'WEB_PUSH',
  MOBILE_PUSH = 'MOBILE_PUSH',
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

export enum NotificationType {
  // Booking
  BOOKING_RESERVED = 'BOOKING_RESERVED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  WAITLIST_PROMOTED = 'WAITLIST_PROMOTED',
  TRIP_COUNTDOWN_48H = 'TRIP_COUNTDOWN_48H',
  TRIP_COUNTDOWN_24H = 'TRIP_COUNTDOWN_24H',

  // Payment & Refunds
  PAYMENT_DEPOSIT_CONFIRMED = 'PAYMENT_DEPOSIT_CONFIRMED',
  PAYMENT_BALANCE_DUE = 'PAYMENT_BALANCE_DUE',
  PAYMENT_BALANCE_CONFIRMED = 'PAYMENT_BALANCE_CONFIRMED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_INITIATED = 'REFUND_INITIATED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  REFUND_REJECTED = 'REFUND_REJECTED',

  // Certificates
  CERTIFICATE_ISSUED = 'CERTIFICATE_ISSUED',
  CERTIFICATE_VERIFIED = 'CERTIFICATE_VERIFIED',

  // Authentication & Security
  AUTH_LOGIN_NEW_DEVICE = 'AUTH_LOGIN_NEW_DEVICE',
  AUTH_LOGIN_NEW_LOCATION = 'AUTH_LOGIN_NEW_LOCATION',
  AUTH_MFA_ENABLED = 'AUTH_MFA_ENABLED',
  AUTH_PASSWORD_RESET = 'AUTH_PASSWORD_RESET',
  AUTH_EMAIL_VERIFIED = 'AUTH_EMAIL_VERIFIED',
  AUTH_SESSION_EXPIRING = 'AUTH_SESSION_EXPIRING',

  // Village Knowledge & Governance
  VILLAGE_UPDATE_SUBMITTED = 'VILLAGE_UPDATE_SUBMITTED',
  VILLAGE_UPDATE_APPROVED = 'VILLAGE_UPDATE_APPROVED',
  VILLAGE_UPDATE_REJECTED = 'VILLAGE_UPDATE_REJECTED',
  VILLAGE_JATRA_ANNOUNCEMENT = 'VILLAGE_JATRA_ANNOUNCEMENT',

  // Discovery & Trails
  DISCOVERY_NEW_TRAIL = 'DISCOVERY_NEW_TRAIL',
  DISCOVERY_SEASON_ALERT = 'DISCOVERY_SEASON_ALERT',

  // Social & Community
  SOCIAL_NEW_FOLLOWER = 'SOCIAL_NEW_FOLLOWER',
  SOCIAL_POST_LIKED = 'SOCIAL_POST_LIKED',
  SOCIAL_POST_COMMENTED = 'SOCIAL_POST_COMMENTED',
  SOCIAL_MENTION = 'SOCIAL_MENTION',
  COMMUNITY_NEW_THREAD = 'COMMUNITY_NEW_THREAD',
  COMMUNITY_UPDATE = 'COMMUNITY_UPDATE',

  // Moderation & Feedback
  MODERATION_CONTENT_FLAGGED = 'MODERATION_CONTENT_FLAGGED',
  MODERATION_ACTION_TAKEN = 'MODERATION_ACTION_TAKEN',
  REPORT_STATUS_UPDATE = 'REPORT_STATUS_UPDATE',
  REVIEW_SUBMITTED = 'REVIEW_SUBMITTED',

  // System, Ops & Emergency
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  SYSTEM_EMERGENCY_ALERT = 'SYSTEM_EMERGENCY_ALERT',
  SYSTEM_DEGRADATION = 'SYSTEM_DEGRADATION',
}

export interface IRichNotificationContent {
  heroImageUrl?: string;
  avatarUrl?: string;
  iconName?: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  actionButton?: {
    label: string;
    url: string;
    isExternal?: boolean;
  };
  attachments?: Array<{
    fileName: string;
    fileUri: string;
    mimeType: string;
    sizeBytes: number;
  }>;
}

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType | string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  richContent?: IRichNotificationContent;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  channels: NotificationChannel[];
  deliveryStatus: DeliveryStatus;
  isRead: boolean;
  readAt?: string | null;
  isArchived: boolean;
  archivedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationPreferences {
  userId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    webPush: boolean;
  };
  categories: {
    transactional: boolean; // Mandatory TRUE
    security: boolean; // Mandatory TRUE
    booking: boolean;
    payment: boolean;
    village: boolean;
    social: boolean;
    community: boolean;
    marketing: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // e.g., '22:00'
    endTime: string; // e.g., '07:00'
    timezone: string; // e.g., 'Asia/Kolkata'
  };
  updatedAt: string;
}

export interface INotificationTemplate {
  id: string;
  slug: string;
  version: string; // semver e.g., '1.0.0'
  category: NotificationCategory;
  channel: NotificationChannel;
  titleTemplate: string;
  bodyTemplate: string;
  variables: string[];
  locale: string; // 'en' | 'hi'
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationPayload {
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: NotificationType | string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  title: string;
  body: string;
  richContent?: IRichNotificationContent;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  templateSlug?: string;
  templateVariables?: Record<string, string | number>;
  idempotencyKey?: string;
  scheduledFor?: string; // ISO 8601 string for delayed dispatch
}

export interface ISendNotificationDto {
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: NotificationType | string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  title: string;
  body: string;
  richContent?: IRichNotificationContent;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  templateSlug?: string;
  templateVariables?: Record<string, string | number>;
  idempotencyKey?: string;
  scheduledFor?: string;
}

export interface IBroadcastNotificationDto {
  targetRole?: 'ALL' | 'TRAVELLER' | 'VILLAGE_ADMIN' | 'ADMIN' | 'SUPER_ADMIN';
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  title: string;
  body: string;
  richContent?: IRichNotificationContent;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface IDeliveryLog {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  provider: string; // e.g. 'AWS_SES', 'GUPSHUP', 'TWILIO', 'META_WHATSAPP', 'SOCKET_IO'
  providerMessageId?: string;
  status: DeliveryStatus;
  attempts: number;
  responseTimeMs: number;
  errorDetails?: string;
  dispatchedAt: string;
  deliveredAt?: string;
}

export interface IDeadLetterJob {
  id: string;
  jobId: string;
  queueName: string;
  notificationId?: string;
  payload: Record<string, unknown>;
  failureReason: string;
  stackTrace?: string;
  retryCount: number;
  lastAttemptAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
}

export interface IPushSubscription {
  id?: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  createdAt: string;
}

export interface INotificationAnalytics {
  timeframe: string;
  totalDispatched: number;
  totalDelivered: number;
  totalFailed: number;
  totalBounced: number;
  totalRead: number;
  deliverySuccessRate: number; // percentage e.g., 99.4
  readRate: number; // percentage e.g., 68.2
  channelBreakdown: Record<NotificationChannel, number>;
  categoryBreakdown: Record<NotificationCategory, number>;
  averageLatencyMs: number;
}

export interface IQueueMetrics {
  activeCount: number;
  waitingCount: number;
  delayedCount: number;
  failedCount: number;
  completedCount: number;
  deadLetterCount: number;
  isPaused: boolean;
}

export interface INotificationFilterQuery {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  isRead?: boolean;
  isArchived?: boolean;
  search?: string;
}

export interface ProviderSendResult {
  providerMessageId?: string;
  success: boolean;
  rawResponse?: Record<string, unknown>;
  failureCode?: string;
}

