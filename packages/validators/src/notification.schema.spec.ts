// Explore Bharat Safar — Notification Validator Tests
// Reference: EBS-DOC-19-NOTIF, EBS-DOC-09-API
// Sprint 10: Enterprise Notification & Communication Platform

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SendNotificationSchema,
  BroadcastNotificationSchema,
  UpdateNotificationPreferencesSchema,
  NotificationQueryFilterSchema,
  RegisterPushSubscriptionSchema,
  RetryDlqJobSchema,
  TemplateCrudSchema,
} from './notification.schema';

describe('Notification Validation Schemas — Sprint 10', () => {
  describe('SendNotificationSchema', () => {
    it('should validate valid send notification payload', () => {
      const payload = {
        recipientId: '11111111-1111-4111-8111-111111111111',
        recipientEmail: 'traveller@bharat.in',
        recipientPhone: '+919876543210',
        type: 'BOOKING_CONFIRMED',
        category: 'BOOKING',
        priority: 'HIGH',
        channels: ['IN_APP', 'EMAIL', 'WHATSAPP'],
        title: 'Booking Confirmed: Harishchandragad Trek',
        body: 'Your expedition spot is confirmed for departure on Oct 15.',
        actionUrl: '/bookings/ebs-ord-2026-88129',
        metadata: { bookingId: 'ebs-ord-2026-88129' },
      };

      const result = SendNotificationSchema.safeParse(payload);
      assert.ok(result.success);
      if (result.success) {
        assert.equal(result.data.title, payload.title);
        assert.equal(result.data.priority, 'HIGH');
      }
    });

    it('should reject invalid UUID recipientId', () => {
      const payload = {
        recipientId: 'invalid-id-format',
        type: 'SYSTEM_ANNOUNCEMENT',
        category: 'SYSTEM',
        title: 'System Notice',
        body: 'Scheduled maintenance tonight.',
      };

      const result = SendNotificationSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some(i => i.path.includes('recipientId')));
      }
    });

    it('should reject invalid Indian phone number', () => {
      const payload = {
        recipientId: '11111111-1111-4111-8111-111111111111',
        recipientPhone: '12345', // Invalid
        type: 'PAYMENT_FAILED',
        category: 'PAYMENT',
        title: 'Payment Failed',
        body: 'Your transaction could not be processed.',
      };

      const result = SendNotificationSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    it('should accept rich notification content with action button and attachments', () => {
      const payload = {
        recipientId: '11111111-1111-4111-8111-111111111111',
        type: 'CERTIFICATE_ISSUED',
        category: 'CERTIFICATE',
        title: 'Your Expedition Certificate is Ready!',
        body: 'Congratulations on completing the Harishchandragad Monsoon Escarpment Trek.',
        richContent: {
          badgeText: 'Verified',
          badgeVariant: 'success',
          actionButton: {
            label: 'Download PDF Certificate',
            url: '/certificates/cert-123/download',
          },
          attachments: [
            {
              fileName: 'EBS-Certificate-Harishchandragad.pdf',
              fileUri: 'https://vault.explorebharatsafar.in/certs/cert-123.pdf',
              mimeType: 'application/pdf',
              sizeBytes: 245000,
            },
          ],
        },
      };

      const result = SendNotificationSchema.safeParse(payload);
      assert.ok(result.success);
    });
  });

  describe('BroadcastNotificationSchema', () => {
    it('should validate valid broadcast to ALL roles', () => {
      const payload = {
        targetRole: 'ALL',
        category: 'ANNOUNCEMENT',
        priority: 'NORMAL',
        channels: ['IN_APP', 'EMAIL'],
        title: 'Monsoon Trail Guidelines Updated',
        body: 'Please review the updated safety advisories for Sahyadri Western Ghat treks.',
      };

      const result = BroadcastNotificationSchema.safeParse(payload);
      assert.ok(result.success);
    });

    it('should reject broadcast with empty channels array', () => {
      const payload = {
        targetRole: 'TRAVELLER',
        category: 'EMERGENCY',
        channels: [], // Empty
        title: 'Severe Weather Warning',
        body: 'Heavy rainfall alert in Kalsubai region.',
      };

      const result = BroadcastNotificationSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe('UpdateNotificationPreferencesSchema', () => {
    it('should accept valid preference updates', () => {
      const payload = {
        channels: {
          inApp: true,
          email: true,
          sms: false,
          whatsapp: true,
          webPush: false,
        },
        categories: {
          social: false,
          community: true,
          marketing: false,
        },
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '07:00',
          timezone: 'Asia/Kolkata',
        },
      };

      const result = UpdateNotificationPreferencesSchema.safeParse(payload);
      assert.ok(result.success);
    });

    it('should reject malformed quiet hours time format', () => {
      const payload = {
        quietHours: {
          enabled: true,
          startTime: '25:99', // Invalid time
          endTime: '07:00',
          timezone: 'Asia/Kolkata',
        },
      };

      const result = UpdateNotificationPreferencesSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe('NotificationQueryFilterSchema', () => {
    it('should apply default page and limit', () => {
      const result = NotificationQueryFilterSchema.safeParse({});
      assert.ok(result.success);
      if (result.success) {
        assert.equal(result.data.page, 1);
        assert.equal(result.data.limit, 20);
      }
    });

    it('should coerce string numbers and boolean strings', () => {
      const result = NotificationQueryFilterSchema.safeParse({
        page: '2',
        limit: '50',
        category: 'BOOKING',
        isRead: 'false',
        isArchived: 'true',
        search: 'monsoon',
      });

      assert.ok(result.success);
      if (result.success) {
        assert.equal(result.data.page, 2);
        assert.equal(result.data.limit, 50);
        assert.equal(result.data.isRead, false);
        assert.equal(result.data.isArchived, true);
        assert.equal(result.data.search, 'monsoon');
      }
    });
  });

  describe('RegisterPushSubscriptionSchema', () => {
    it('should validate valid web push VAPID subscription', () => {
      const payload = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/sample-token',
        p256dh:
          'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9ic04YpqxHIOHnMzaeTkGkkYce2SZ0FLitaDhgTV9omE2E',
        auth: 'tBHItJI5svbpez7KI4CCXg',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      };

      const result = RegisterPushSubscriptionSchema.safeParse(payload);
      assert.ok(result.success);
    });

    it('should reject invalid URL endpoint', () => {
      const payload = {
        endpoint: 'not-a-valid-url',
        p256dh: 'key1234567890',
        auth: 'auth12345',
      };

      const result = RegisterPushSubscriptionSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe('RetryDlqJobSchema', () => {
    it('should validate valid deadLetterId', () => {
      const result = RetryDlqJobSchema.safeParse({
        deadLetterId: '22222222-2222-4222-8222-222222222222',
        forceRetry: true,
      });

      assert.ok(result.success);
    });
  });

  describe('TemplateCrudSchema', () => {
    it('should validate valid notification template', () => {
      const payload = {
        slug: 'booking-confirmed-v1',
        version: '1.0.0',
        category: 'BOOKING',
        channel: 'EMAIL',
        titleTemplate: 'Booking Confirmed: {{experienceTitle}} ({{bookingNumber}})',
        bodyTemplate: 'Dear {{participantName}},\n\nYour spot on {{experienceTitle}} is confirmed.',
        variables: ['experienceTitle', 'bookingNumber', 'participantName'],
        locale: 'en',
        isActive: true,
      };

      const result = TemplateCrudSchema.safeParse(payload);
      assert.ok(result.success);
    });

    it('should reject non-semver version string', () => {
      const payload = {
        slug: 'invalid-version-template',
        version: 'v1-beta', // Not semver
        category: 'SYSTEM',
        channel: 'IN_APP',
        titleTemplate: 'Title',
        bodyTemplate: 'Body text',
      };

      const result = TemplateCrudSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });
});
