// Explore Bharat Safar — Send Notification DTO
// Sprint 10: Enterprise Notification & Communication Platform

import type {
  NotificationCategory,
  NotificationPriority,
  NotificationChannel,
  IRichNotificationContent,
} from '@ebs/types';

export class SendNotificationDto {
  recipientId!: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type!: string;
  category!: NotificationCategory;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  title!: string;
  body!: string;
  richContent?: IRichNotificationContent;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  templateSlug?: string;
  templateVariables?: Record<string, string | number>;
  idempotencyKey?: string;
  scheduledFor?: string;
}
