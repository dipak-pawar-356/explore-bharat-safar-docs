// Explore Bharat Safar — Notification Query Filter DTO
// Sprint 10: Enterprise Notification & Communication Platform

import type { NotificationCategory, NotificationPriority, NotificationChannel } from '@ebs/types';

export class NotificationQueryDto {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  isRead?: boolean;
  isArchived?: boolean;
  search?: string;
}
