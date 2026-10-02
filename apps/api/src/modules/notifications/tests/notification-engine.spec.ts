// Explore Bharat Safar — Notification Engine Unit Tests
// Reference: EBS-DOC-19-NOTIF, EBS-DOC-29-SERVICES
// Sprint 10: Enterprise Notification & Communication Platform

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { ConfigService } from '@nestjs/config';
import { NotificationDeduplicationEngine } from '../engine/deduplication.engine';
import { NotificationRateLimiterEngine } from '../engine/rate-limiter.engine';
import { NotificationCircuitBreakerEngine, CircuitState } from '../engine/circuit-breaker.engine';
import { NotificationTemplateService } from '../services/notification-template.service';
import { NotificationChannel } from '@ebs/types';

describe('Notification Engine & Core Infrastructure — Sprint 10', () => {
  describe('NotificationDeduplicationEngine', () => {
    let dedupEngine: NotificationDeduplicationEngine;

    beforeEach(() => {
      // Mock ConfigService with no redis (in-memory mode)
      const mockConfig = { get: () => undefined } as unknown as ConfigService;
      dedupEngine = new NotificationDeduplicationEngine(mockConfig);
    });

    it('should generate consistent deterministic MD5 keys', () => {
      const key1 = dedupEngine.generateKey({
        userId: 'user-123',
        eventType: 'BOOKING_CONFIRMED',
        entityId: 'booking-456',
        channel: 'EMAIL',
      });
      const key2 = dedupEngine.generateKey({
        userId: 'user-123',
        eventType: 'BOOKING_CONFIRMED',
        entityId: 'booking-456',
        channel: 'EMAIL',
      });
      const key3 = dedupEngine.generateKey({
        userId: 'user-123',
        eventType: 'BOOKING_CONFIRMED',
        entityId: 'booking-456',
        channel: 'SMS',
      });

      assert.equal(key1, key2);
      assert.notEqual(key1, key3); // Different channel produces different key
    });

    it('should detect duplicate notification within TTL window', async () => {
      const key = dedupEngine.generateKey({
        userId: 'user-123',
        eventType: 'PAYMENT_RECEIVED',
        channel: 'IN_APP',
      });

      const firstCheck = await dedupEngine.isDuplicate(key, 60);
      assert.strictEqual(firstCheck, false); // First submission is not a duplicate

      const secondCheck = await dedupEngine.isDuplicate(key, 60);
      assert.strictEqual(secondCheck, true); // Immediate resubmission is flagged as duplicate!
    });
  });

  describe('NotificationRateLimiterEngine', () => {
    let rateLimiter: NotificationRateLimiterEngine;

    beforeEach(() => {
      rateLimiter = new NotificationRateLimiterEngine();
    });

    it('should allow requests within channel limits and reject excess', () => {
      const userId = 'user-spam-test';
      const rule = { maxRequests: 3, windowSeconds: 60 };

      const r1 = rateLimiter.checkRateLimit(userId, NotificationChannel.SMS, rule);
      assert.strictEqual(r1.isAllowed, true);
      assert.strictEqual(r1.remaining, 2);

      const r2 = rateLimiter.checkRateLimit(userId, NotificationChannel.SMS, rule);
      assert.strictEqual(r2.isAllowed, true);
      assert.strictEqual(r2.remaining, 1);

      const r3 = rateLimiter.checkRateLimit(userId, NotificationChannel.SMS, rule);
      assert.strictEqual(r3.isAllowed, true);
      assert.strictEqual(r3.remaining, 0);

      const r4 = rateLimiter.checkRateLimit(userId, NotificationChannel.SMS, rule);
      assert.strictEqual(r4.isAllowed, false); // Limit exceeded!
      assert.ok((r4.retryAfterSeconds || 0) > 0);
    });

    it('should reset limits when user window is cleared', () => {
      const userId = 'user-reset-test';
      const rule = { maxRequests: 1, windowSeconds: 60 };

      rateLimiter.checkRateLimit(userId, NotificationChannel.EMAIL, rule);
      assert.strictEqual(
        rateLimiter.checkRateLimit(userId, NotificationChannel.EMAIL, rule).isAllowed,
        false,
      );

      rateLimiter.resetUser(userId);
      assert.strictEqual(
        rateLimiter.checkRateLimit(userId, NotificationChannel.EMAIL, rule).isAllowed,
        true,
      );
    });
  });

  describe('NotificationCircuitBreakerEngine', () => {
    let breaker: NotificationCircuitBreakerEngine;

    beforeEach(() => {
      breaker = new NotificationCircuitBreakerEngine();
    });

    it('should start in CLOSED state and stay CLOSED under normal operation', () => {
      const state = breaker.getState('AWS_SES');
      assert.equal(state, CircuitState.CLOSED);

      for (let i = 0; i < 10; i++) {
        breaker.recordSuccess('AWS_SES');
      }
      assert.equal(breaker.getState('AWS_SES'), CircuitState.CLOSED);
    });

    it('should trip to OPEN when failure rate exceeds 20% over minimum calls threshold', () => {
      // 10 calls: 7 success, 3 failures = 30% failure rate (> 20% threshold)
      for (let i = 0; i < 7; i++) {
        breaker.recordSuccess('GUPSHUP_SMS');
      }
      for (let i = 0; i < 3; i++) {
        breaker.recordFailure('GUPSHUP_SMS');
      }

      assert.equal(breaker.getState('GUPSHUP_SMS'), CircuitState.OPEN);
    });
  });

  describe('NotificationTemplateService', () => {
    let templateService: NotificationTemplateService;

    beforeEach(() => {
      templateService = new NotificationTemplateService();
    });

    it('should retrieve pre-approved templates and render English variables', () => {
      const rendered = templateService.render(
        'booking-confirmed',
        {
          participantName: 'Amitabh Sharma',
          bookingNumber: 'EBS-BK-2026-9901',
          experienceTitle: 'Harishchandragad Trek',
          departureDate: '2026-10-15',
        },
        'en',
      );

      assert.ok(rendered);
      assert.ok(rendered.title.includes('Harishchandragad Trek'));
      assert.ok(rendered.title.includes('EBS-BK-2026-9901'));
      assert.ok(rendered.body.includes('Amitabh Sharma'));
      assert.ok(rendered.body.includes('2026-10-15'));
    });

    it('should render Hindi Devanagari localization when requested', () => {
      const rendered = templateService.render(
        'booking-confirmed',
        {
          participantName: 'अमिताभ शर्मा',
          bookingNumber: 'EBS-BK-2026-9901',
          experienceTitle: 'हरिश्चंद्रगड ट्रेक',
          departureDate: '15 अक्टूबर 2026',
        },
        'hi',
      );

      assert.ok(rendered);
      assert.ok(rendered.title.includes('बुकिंग की पुष्टि हुई!'));
      assert.ok(rendered.title.includes('हरिश्चंद्रगड ट्रेक'));
      assert.ok(rendered.body.includes('बधाई हो'));
    });

    it('should safely preserve un-interpolated variables if missing from map', () => {
      const interpolated = templateService.interpolate('Hello {{name}}, welcome to {{location}}!', {
        name: 'Pooja',
      });
      assert.equal(interpolated, 'Hello Pooja, welcome to {{location}}!');
    });
  });
});
