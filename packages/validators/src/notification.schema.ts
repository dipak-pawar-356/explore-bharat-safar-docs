// Explore Bharat Safar — Notification Validation Schemas
// Reference: EBS-DOC-19-NOTIF, EBS-DOC-09-API Section 5, EBS-DOC-40-SEC
// Sprint 10: Enterprise Notification & Communication Platform

import { z } from 'zod';

export const NotificationCategoryEnum = z.enum([
  'TRANSACTIONAL',
  'SECURITY',
  'BOOKING',
  'PAYMENT',
  'REFUND',
  'CERTIFICATE',
  'VILLAGE',
  'DISCOVERY',
  'SOCIAL',
  'COMMUNITY',
  'MODERATION',
  'SYSTEM',
  'ANNOUNCEMENT',
  'EMERGENCY',
]);

export const NotificationPriorityEnum = z.enum(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']);

export const NotificationChannelEnum = z.enum([
  'IN_APP',
  'EMAIL',
  'SMS',
  'WHATSAPP',
  'WEB_PUSH',
  'MOBILE_PUSH',
]);

export const DeliveryStatusEnum = z.enum([
  'PENDING',
  'QUEUED',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
  'BOUNCED',
]);

export const RichNotificationContentSchema = z.object({
  heroImageUrl: z.string().url('heroImageUrl must be a valid URL').optional(),
  avatarUrl: z.string().url('avatarUrl must be a valid URL').optional(),
  iconName: z.string().max(50).optional(),
  badgeText: z.string().max(30).optional(),
  badgeVariant: z.enum(['default', 'success', 'warning', 'danger', 'info']).optional(),
  actionButton: z
    .object({
      label: z.string().min(1).max(50),
      url: z.string().min(1).max(500),
      isExternal: z.boolean().optional(),
    })
    .optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string().min(1).max(255),
        fileUri: z.string().min(1).max(1000),
        mimeType: z.string().max(100),
        sizeBytes: z.number().int().nonnegative(),
      }),
    )
    .max(5, 'Maximum of 5 attachments allowed')
    .optional(),
});

export const SendNotificationSchema = z.object({
  recipientId: z.string().uuid('recipientId must be a valid UUID'),
  recipientEmail: z.string().email('recipientEmail must be a valid email').optional(),
  recipientPhone: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, 'recipientPhone must be a valid Indian mobile number')
    .optional(),
  type: z.string().min(2, 'Notification type must be at least 2 characters').max(100),
  category: NotificationCategoryEnum,
  priority: NotificationPriorityEnum.default('NORMAL'),
  channels: z
    .array(NotificationChannelEnum)
    .min(1, 'At least one channel must be specified')
    .optional(),
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  body: z.string().min(2, 'Body must be at least 2 characters').max(2000),
  richContent: RichNotificationContentSchema.optional(),
  actionUrl: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
  templateSlug: z.string().max(100).optional(),
  templateVariables: z.record(z.union([z.string(), z.number()])).optional(),
  idempotencyKey: z.string().max(128).optional(),
  scheduledFor: z
    .string()
    .datetime({ message: 'scheduledFor must be a valid ISO 8601 datetime' })
    .optional(),
});

export const BroadcastNotificationSchema = z.object({
  targetRole: z.enum(['ALL', 'TRAVELLER', 'VILLAGE_ADMIN', 'ADMIN', 'SUPER_ADMIN']).default('ALL'),
  category: NotificationCategoryEnum,
  priority: NotificationPriorityEnum.default('NORMAL'),
  channels: z.array(NotificationChannelEnum).min(1, 'At least one channel must be specified'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  body: z.string().min(5, 'Body must be at least 5 characters').max(4000),
  richContent: RichNotificationContentSchema.optional(),
  actionUrl: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const TimeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const UpdateNotificationPreferencesSchema = z.object({
  channels: z
    .object({
      inApp: z.boolean().optional(),
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      whatsapp: z.boolean().optional(),
      webPush: z.boolean().optional(),
    })
    .optional(),
  categories: z
    .object({
      transactional: z.literal(true).optional(), // Mandatory TRUE per DPDP & business invariant
      security: z.literal(true).optional(), // Mandatory TRUE
      booking: z.boolean().optional(),
      payment: z.boolean().optional(),
      village: z.boolean().optional(),
      social: z.boolean().optional(),
      community: z.boolean().optional(),
      marketing: z.boolean().optional(),
    })
    .optional(),
  quietHours: z
    .object({
      enabled: z.boolean(),
      startTime: z.string().regex(TimeRegex, 'startTime must be in HH:mm 24-hour format'),
      endTime: z.string().regex(TimeRegex, 'endTime must be in HH:mm 24-hour format'),
      timezone: z.string().min(2).max(100).default('Asia/Kolkata'),
    })
    .optional(),
});

export const NotificationQueryFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: NotificationCategoryEnum.optional(),
  priority: NotificationPriorityEnum.optional(),
  channel: NotificationChannelEnum.optional(),
  isRead: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform(v => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
  isArchived: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform(v => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
  search: z.string().max(100).optional(),
});

export const RegisterPushSubscriptionSchema = z.object({
  endpoint: z.string().url('Push subscription endpoint must be a valid URL'),
  p256dh: z.string().min(10, 'p256dh key is required'),
  auth: z.string().min(5, 'auth secret is required'),
  userAgent: z.string().max(500).optional(),
});

export const RetryDlqJobSchema = z.object({
  deadLetterId: z.string().uuid('deadLetterId must be a valid UUID'),
  forceRetry: z.boolean().default(false),
});

export const TemplateCrudSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100)
    .regex(/^[a-z0-9_-]+$/, 'Slug must be lowercase alphanumeric with dashes or underscores'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must follow semver format (e.g., 1.0.0)')
    .default('1.0.0'),
  category: NotificationCategoryEnum,
  channel: NotificationChannelEnum,
  titleTemplate: z.string().min(3).max(300),
  bodyTemplate: z.string().min(5).max(5000),
  variables: z.array(z.string().min(1)).default([]),
  locale: z.enum(['en', 'hi']).default('en'),
  isActive: z.boolean().default(true),
});
