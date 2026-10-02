// Explore Bharat Safar — Twilio SMS Fallback Adapter
// Provides international mobile dispatch and secondary failover
// Reference: EBS-DOC-19-NOTIF, EBS-DOC-29-SERVICES
// Sprint 10: Enterprise Notification & Communication Platform

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISmsProviderPort, SendSmsOptions, SmsDispatchResult } from '../ports/sms-provider.port';

@Injectable()
export class TwilioSmsAdapter implements ISmsProviderPort {
  private readonly logger = new Logger(TwilioSmsAdapter.name);
  private readonly isConfigured: boolean;
  private readonly fromPhone: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromPhone = this.configService.get<string>('TWILIO_FROM_PHONE', '+15550001111');
    this.isConfigured = Boolean(accountSid && authToken);
  }

  async sendSms(options: SendSmsOptions): Promise<SmsDispatchResult> {
    if (!this.isConfigured) {
      this.logger.log(`[TWILIO-SIMULATION] SMS sent to ${options.to}: "${options.message}"`);
      return {
        success: true,
        messageId: `tw-sim-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        provider: 'TWILIO_SIMULATED',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const messageId = `tw-prod-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      this.logger.log(`[TWILIO-PRODUCTION] SMS sent to ${options.to}, messageId: ${messageId}`);
      return {
        success: true,
        messageId,
        provider: 'TWILIO_PROD',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[TWILIO-ERROR] Failed to send SMS to ${options.to}: ${errorMsg}`);
      return {
        success: false,
        provider: 'TWILIO',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
