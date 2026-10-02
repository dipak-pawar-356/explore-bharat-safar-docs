// Explore Bharat Safar — Mock Notification Provider Harness
// Provides deterministic test harnesses and simulation mode
// Sprint 10: Enterprise Notification & Communication Platform

import { Injectable } from '@nestjs/common';
import {
  IEmailProviderPort,
  SendEmailOptions,
  EmailDispatchResult,
} from '../ports/email-provider.port';
import { ISmsProviderPort, SendSmsOptions, SmsDispatchResult } from '../ports/sms-provider.port';
import {
  IWhatsAppProviderPort,
  SendWhatsAppOptions,
  WhatsAppDispatchResult,
} from '../ports/whatsapp-provider.port';
import {
  IPushProviderPort,
  PushNotificationPayload,
  PushDispatchResult,
  PushSubscriptionKeys,
} from '../ports/push-provider.port';

@Injectable()
export class MockNotificationProvidersAdapter
  implements IEmailProviderPort, ISmsProviderPort, IWhatsAppProviderPort, IPushProviderPort
{
  public sentEmails: SendEmailOptions[] = [];
  public sentSms: SendSmsOptions[] = [];
  public sentWhatsApp: SendWhatsAppOptions[] = [];
  public sentPushes: Array<{
    subscription: { endpoint: string; keys: PushSubscriptionKeys };
    payload: PushNotificationPayload;
  }> = [];

  public shouldFailEmail = false;
  public shouldFailSms = false;
  public shouldFailWhatsApp = false;
  public shouldFailPush = false;

  async sendEmail(options: SendEmailOptions): Promise<EmailDispatchResult> {
    if (this.shouldFailEmail) {
      return {
        success: false,
        provider: 'MOCK_SES',
        error: 'Simulated AWS SES network timeout (503 Service Unavailable)',
        timestamp: new Date().toISOString(),
      };
    }
    this.sentEmails.push(options);
    return {
      success: true,
      messageId: `mock-ses-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      provider: 'MOCK_SES',
      timestamp: new Date().toISOString(),
    };
  }

  async sendSms(options: SendSmsOptions): Promise<SmsDispatchResult> {
    if (this.shouldFailSms) {
      return {
        success: false,
        provider: 'MOCK_GUPSHUP',
        error: 'Simulated Gupshup DLT template rejected',
        timestamp: new Date().toISOString(),
      };
    }
    this.sentSms.push(options);
    return {
      success: true,
      messageId: `mock-sms-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      provider: 'MOCK_GUPSHUP',
      timestamp: new Date().toISOString(),
    };
  }

  async sendWhatsApp(options: SendWhatsAppOptions): Promise<WhatsAppDispatchResult> {
    if (this.shouldFailWhatsApp) {
      return {
        success: false,
        provider: 'MOCK_WHATSAPP',
        error: 'Simulated Meta WhatsApp Business API rate limit (429)',
        timestamp: new Date().toISOString(),
      };
    }
    this.sentWhatsApp.push(options);
    return {
      success: true,
      messageId: `mock-wa-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      provider: 'MOCK_WHATSAPP',
      timestamp: new Date().toISOString(),
    };
  }

  async sendPush(
    subscription: { endpoint: string; keys: PushSubscriptionKeys },
    payload: PushNotificationPayload,
  ): Promise<PushDispatchResult> {
    if (this.shouldFailPush) {
      return {
        success: false,
        provider: 'MOCK_VAPID',
        statusCode: 410,
        error: 'Simulated Web Push subscription expired (410 Gone)',
        timestamp: new Date().toISOString(),
      };
    }
    this.sentPushes.push({ subscription, payload });
    return {
      success: true,
      statusCode: 201,
      provider: 'MOCK_VAPID',
      timestamp: new Date().toISOString(),
    };
  }

  public reset(): void {
    this.sentEmails = [];
    this.sentSms = [];
    this.sentWhatsApp = [];
    this.sentPushes = [];
    this.shouldFailEmail = false;
    this.shouldFailSms = false;
    this.shouldFailWhatsApp = false;
    this.shouldFailPush = false;
  }
}
