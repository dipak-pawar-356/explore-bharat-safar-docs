// Explore Bharat Safar — Broadcast Notification DTO
// Sprint 10: Enterprise Notification & Communication Platform

import type {
  NotificationCategory,
  NotificationPriority,
  NotificationChannel,
  IRichNotificationContent,
} from '@ebs/types';

export class BroadcastNotificationDto {
  targetRole?: 'ALL' | 'TRAVELLER' | 'VILLAGE_ADMIN' | 'ADMIN' | 'SUPER_ADMIN';
  category!: NotificationCategory;
  priority!: NotificationPriority;
  channels!: NotificationChannel[];
  title!: string;
  body!: string;
  richContent?: IRichNotificationContent;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}
