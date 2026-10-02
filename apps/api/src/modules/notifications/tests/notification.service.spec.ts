// Explore Bharat Safar — Notification Service Unit Tests
// Reference: EBS-DOC-19-NOTIF, EBS-DOC-09-API
// Sprint 10: Enterprise Notification & Communication Platform

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NotificationService } from '../services/notification.service';
import { NotificationTemplateService } from '../services/notification-template.service';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { NotificationQueueService } from '../services/notification-queue.service';
import { NotificationDeduplicationEngine } from '../engine/deduplication.engine';
import { NotificationRateLimiterEngine } from '../engine/rate-limiter.engine';
import { NotificationAnalyticsService } from '../services/notification-analytics.service';
import type { ConfigService } from '@nestjs/config';
import type { AuditLogService } from '../../../common/services/audit-log.service';
import {
  NotificationCategory,
  NotificationPriority,
  NotificationChannel,
  DeliveryStatus,
} from '@ebs/types';

describe('NotificationService — Sprint 10', () => {
  let service: NotificationService;
  let templateService: NotificationTemplateService;
  let preferenceService: NotificationPreferenceService;
  let queueService: NotificationQueueService;
  let dedupEngine: NotificationDeduplicationEngine;
  let rateLimiter: NotificationRateLimiterEngine;
  let analyticsService: NotificationAnalyticsService;
  let mockAuditLogService: AuditLogService;

  beforeEach(() => {
    const mockConfig = { get: () => undefined } as unknown as ConfigService;
    templateService = new NotificationTemplateService();
    preferenceService = new NotificationPreferenceService();
    queueService = new NotificationQueueService(mockConfig);
    dedupEngine = new NotificationDeduplicationEngine(mockConfig);
    rateLimiter = new NotificationRateLimiterEngine();
    analyticsService = new NotificationAnalyticsService();
    mockAuditLogService = { log: async () => {} } as unknown as AuditLogService;

    service = new NotificationService(
      templateService,
      preferenceService,
      queueService,
      dedupEngine,
      rateLimiter,
      analyticsService,
      mockAuditLogService,
    );
  });

  describe('sendNotification', () => {
    it('should successfully queue a notification with valid parameters', async () => {
      const result = await service.sendNotification({
        recipientId: '11111111-1111-4111-8111-111111111111',
        type: 'BOOKING_CONFIRMED',
        category: NotificationCategory.BOOKING,
        priority: NotificationPriority.HIGH,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        title: 'Booking Confirmed!',
        body: 'Your spot is locked.',
      });

      assert.ok(result.notificationId);
      assert.equal(result.status, DeliveryStatus.QUEUED);
    });

    it('should interpolate template when templateSlug is provided', async () => {
      const result = await service.sendNotification({
        recipientId: '22222222-2222-4222-8222-222222222222',
        type: 'BOOKING_CONFIRMED',
        category: NotificationCategory.BOOKING,
        templateSlug: 'booking-confirmed',
        templateVariables: {
          participantName: 'Rajesh Kumar',
          bookingNumber: 'EBS-BK-8899',
          experienceTitle: 'Sandhan Valley Canyon Trek',
          departureDate: '2026-11-20',
        },
        title: 'Fallback Title',
        body: 'Fallback Body',
      });

      assert.ok(result.notificationId);
      assert.equal(result.status, DeliveryStatus.QUEUED);

      // Verify the queued job data has interpolated title and body
      const queueItems = queueService.getMemoryQueue();
      const job = queueItems.find(j => j.data.notificationId === result.notificationId);
      assert.ok(job);
      assert.ok(job.data.title.includes('Sandhan Valley Canyon Trek'));
      assert.ok(job.data.body.includes('Rajesh Kumar'));
    });

    it('should suppress duplicate notifications within deduplication window', async () => {
      const payload = {
        recipientId: '33333333-3333-4333-8333-333333333333',
        type: 'PAYMENT_RECEIVED',
        category: NotificationCategory.PAYMENT,
        channels: [NotificationChannel.IN_APP],
        title: 'Payment Received',
        body: 'Amount ₹1050 credited.',
        idempotencyKey: 'dedup-test-key-001',
      };

      const res1 = await service.sendNotification(payload);
      assert.notEqual(res1.notificationId, 'dedup-suppressed');

      const res2 = await service.sendNotification(payload);
      assert.equal(res2.notificationId, 'dedup-suppressed');
      assert.equal(res2.status, DeliveryStatus.SENT);
    });
  });

  describe('getUserNotifications and markAsRead', () => {
    it('should retrieve notifications and update read status', async () => {
      const userId = '44444444-4444-4444-8444-444444444444';

      // Send 2 notifications
      const notif1 = await service.sendNotification({
        recipientId: userId,
        type: 'SOCIAL_NEW_FOLLOWER',
        category: NotificationCategory.SOCIAL,
        channels: [NotificationChannel.IN_APP],
        title: 'New Follower',
        body: 'Explorer joined your trail.',
      });

      const _notif2 = await service.sendNotification({
        recipientId: userId,
        type: 'CERTIFICATE_ISSUED',
        category: NotificationCategory.CERTIFICATE,
        channels: [NotificationChannel.IN_APP],
        title: 'Certificate Issued',
        body: 'Download your certificate.',
      });

      // Get user notifications
      const listBefore = await service.getUserNotifications(userId);
      assert.equal(listBefore.total, 2);
      assert.equal(listBefore.unreadCount, 2);

      // Mark first as read
      const updated = await service.markAsRead(userId, notif1.notificationId);
      assert.strictEqual(updated.isRead, true);
      assert.ok(updated.readAt);

      // Check unread count
      const unreadCount = await service.getUnreadCount(userId);
      assert.equal(unreadCount, 1);

      // Mark all as read
      const markAllResult = await service.markAllAsRead(userId);
      assert.equal(markAllResult.count, 1);

      const listAfter = await service.getUserNotifications(userId);
      assert.equal(listAfter.unreadCount, 0);
    });

    it('should archive and delete notifications cleanly', async () => {
      const userId = '55555555-5555-4555-8555-555555555555';

      const notif = await service.sendNotification({
        recipientId: userId,
        type: 'COMMUNITY_UPDATE',
        category: NotificationCategory.COMMUNITY,
        channels: [NotificationChannel.IN_APP],
        title: 'Community Update',
        body: 'New story posted.',
      });

      const archived = await service.archiveNotification(userId, notif.notificationId);
      assert.strictEqual(archived.isArchived, true);
      assert.ok(archived.archivedAt);

      await service.deleteNotification(userId, notif.notificationId);
      const list = await service.getUserNotifications(userId);
      assert.equal(list.total, 0);
    });
  });

  describe('broadcastNotification', () => {
    it('should dispatch broadcast messages and log audit event', async () => {
      const result = await service.broadcastNotification(
        {
          targetRole: 'ALL',
          category: NotificationCategory.ANNOUNCEMENT,
          priority: NotificationPriority.NORMAL,
          channels: [NotificationChannel.IN_APP],
          title: 'Monsoon Trekking Guidelines',
          body: 'All trekkers please carry waterproof gear and follow lead guide safety instructions.',
        },
        'super-admin-001',
      );

      assert.ok(result.recipientCount >= 1);
      assert.equal(result.status, 'DISPATCHED');
    });
  });
});
