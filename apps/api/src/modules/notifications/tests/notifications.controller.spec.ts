// Explore Bharat Safar — Notifications Controller Unit Tests
// Reference: EBS-DOC-19-NOTIF, EBS-DOC-09-API
// Sprint 10: Enterprise Notification & Communication Platform

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NotificationsController } from '../notifications.controller';
import { NotificationService } from '../services/notification.service';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { NotificationTemplateService } from '../services/notification-template.service';
import { NotificationQueueService } from '../services/notification-queue.service';
import { NotificationDeduplicationEngine } from '../engine/deduplication.engine';
import { NotificationRateLimiterEngine } from '../engine/rate-limiter.engine';
import { NotificationAnalyticsService } from '../services/notification-analytics.service';
import type { ConfigService } from '@nestjs/config';
import type { AuditLogService } from '../../../common/services/audit-log.service';
import { NotificationCategory, NotificationChannel } from '@ebs/types';

describe('NotificationsController — Sprint 10', () => {
  let controller: NotificationsController;
  let service: NotificationService;
  let preferenceService: NotificationPreferenceService;

  beforeEach(() => {
    const mockConfig = { get: () => undefined } as unknown as ConfigService;
    const templateService = new NotificationTemplateService();
    preferenceService = new NotificationPreferenceService();
    const queueService = new NotificationQueueService(mockConfig);
    const dedupEngine = new NotificationDeduplicationEngine(mockConfig);
    const rateLimiter = new NotificationRateLimiterEngine();
    const analyticsService = new NotificationAnalyticsService();
    const mockAuditLogService = { log: async () => {} };

    service = new NotificationService(
      templateService,
      preferenceService,
      queueService,
      dedupEngine,
      rateLimiter,
      analyticsService,
      mockAuditLogService as unknown as AuditLogService,
    );

    controller = new NotificationsController(service, preferenceService);
  });

  it('should return paginated notifications and unread count', async () => {
    const user = { id: 'test-user-001' };

    await service.sendNotification({
      recipientId: user.id,
      type: 'BOOKING_CONFIRMED',
      category: NotificationCategory.BOOKING,
      channels: [NotificationChannel.IN_APP],
      title: 'Trek Confirmed',
      body: 'See you at basecamp.',
    });

    const result = await controller.getNotifications(user, { page: 1, limit: 10 });
    assert.equal(result.total, 1);
    assert.equal(result.unreadCount, 1);

    const countRes = await controller.getUnreadCount(user);
    assert.equal(countRes.unreadCount, 1);
  });

  it('should mark notification as read via controller endpoint', async () => {
    const user = { id: 'test-user-002' };

    const notif = await service.sendNotification({
      recipientId: user.id,
      type: 'PAYMENT_RECEIVED',
      category: NotificationCategory.PAYMENT,
      channels: [NotificationChannel.IN_APP],
      title: 'Deposit Received',
      body: '₹1050 credited.',
    });

    const updated = await controller.markAsRead(user, notif.notificationId);
    assert.strictEqual(updated.isRead, true);

    const countRes = await controller.getUnreadCount(user);
    assert.equal(countRes.unreadCount, 0);
  });

  it('should mark all notifications as read', async () => {
    const user = { id: 'test-user-003' };

    await service.sendNotification({
      recipientId: user.id,
      type: 'SOCIAL_NEW_FOLLOWER',
      category: NotificationCategory.SOCIAL,
      title: 'New Follower',
      body: 'User followed you.',
    });

    const markAllResult = await controller.markAllAsRead(user);
    assert.strictEqual(markAllResult.success, true);
    assert.equal(markAllResult.count, 1);
  });

  it('should archive and delete notifications', async () => {
    const user = { id: 'test-user-004' };

    const notif = await service.sendNotification({
      recipientId: user.id,
      type: 'SYSTEM_ANNOUNCEMENT',
      category: NotificationCategory.SYSTEM,
      title: 'Advisory',
      body: 'System update tonight.',
    });

    const archived = await controller.archiveNotification(user, notif.notificationId);
    assert.strictEqual(archived.isArchived, true);

    await controller.deleteNotification(user, notif.notificationId);
    const list = await controller.getNotifications(user, {});
    assert.equal(list.total, 0);
  });

  it('should retrieve and update notification preferences with mandatory constraints', async () => {
    const user = { id: 'test-user-005' };

    const initialPrefs = await controller.getPreferences(user);
    assert.strictEqual(initialPrefs.categories.transactional, true);
    assert.strictEqual(initialPrefs.categories.security, true);

    const updatedPrefs = await controller.updatePreferences(user, {
      channels: { sms: false, email: true },
      quietHours: { enabled: true, startTime: '23:00', endTime: '06:00' },
    });

    assert.strictEqual(updatedPrefs.channels.sms, false);
    assert.strictEqual(updatedPrefs.quietHours.enabled, true);
    assert.strictEqual(updatedPrefs.categories.transactional, true); // Still true!
  });

  it('should register push subscription successfully', async () => {
    const user = { id: 'test-user-006' };
    const res = await controller.registerPush(user, {
      endpoint: 'https://push.example.com/send/token-xyz',
      p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA',
      auth: 'tBHItJI5svbpez7KI4CCXg',
      userAgent: 'Chrome/120',
    });

    assert.strictEqual(res.success, true);
  });
});
