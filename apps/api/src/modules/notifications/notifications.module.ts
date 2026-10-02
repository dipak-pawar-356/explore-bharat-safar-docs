// Explore Bharat Safar — Notifications Module
// Reference: EBS-DOC-19-NOTIF, EBS-DOC-09-API
// Sprint 10: Enterprise Notification & Communication Platform

import { Module } from '@nestjs/common';
import { AuditLogService } from '../../common/services/audit-log.service';

// Controllers
import { NotificationsController } from './notifications.controller';
import { AdminNotificationsController } from './admin-notifications.controller';

// Services
import { NotificationService } from './services/notification.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { NotificationQueueService } from './services/notification-queue.service';
import { NotificationDlqService } from './services/notification-dlq.service';
import { NotificationAnalyticsService } from './services/notification-analytics.service';
import { NotificationsGateway } from './notifications.gateway';

// Engines
import { NotificationDeduplicationEngine } from './engine/deduplication.engine';
import { NotificationRateLimiterEngine } from './engine/rate-limiter.engine';
import { NotificationCircuitBreakerEngine } from './engine/circuit-breaker.engine';

// Adapters
import { AwsSesEmailAdapter } from './adapters/aws-ses.adapter';
import { GupshupSmsAdapter } from './adapters/gupshup-sms.adapter';
import { TwilioSmsAdapter } from './adapters/twilio-sms.adapter';
import { WhatsAppBusinessAdapter } from './adapters/whatsapp-business.adapter';
import { WebPushAdapter } from './adapters/web-push.adapter';
import { MockNotificationProvidersAdapter } from './adapters/mock-providers.adapter';

@Module({
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [
    AuditLogService,
    NotificationService,
    NotificationTemplateService,
    NotificationPreferenceService,
    NotificationQueueService,
    NotificationDlqService,
    NotificationAnalyticsService,
    NotificationsGateway,
    NotificationDeduplicationEngine,
    NotificationRateLimiterEngine,
    NotificationCircuitBreakerEngine,
    AwsSesEmailAdapter,
    GupshupSmsAdapter,
    TwilioSmsAdapter,
    WhatsAppBusinessAdapter,
    WebPushAdapter,
    MockNotificationProvidersAdapter,
  ],
  exports: [
    NotificationService,
    NotificationTemplateService,
    NotificationPreferenceService,
    NotificationsGateway,
    NotificationAnalyticsService,
  ],
})
export class NotificationsModule {}
