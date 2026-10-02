// Explore Bharat Safar — User Notification Preferences Service
// Reference: EBS-DOC-19-NOTIF Section 4, EBS-DOC-40-SEC
// Enforces mandatory non-opt-outable invariant for Transactional & Security categories
// Evaluates quiet hours with timezone awareness
// Sprint 10: Enterprise Notification & Communication Platform

import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@ebs/database';
import { NotificationCategory, NotificationChannel, INotificationPreferences } from '@ebs/types';
import type { UpdateNotificationPreferencesDto } from '../dto/update-preferences.dto';

@Injectable()
export class NotificationPreferenceService {
  private readonly logger = new Logger(NotificationPreferenceService.name);

  constructor() {}

  async getPreferences(userId: string): Promise<INotificationPreferences> {
    try {
      const record = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!record) {
        return this.createDefaultPreferences(userId);
      }

      return {
        userId: record.userId,
        channels: {
          inApp: record.channelInApp,
          email: record.channelEmail,
          sms: record.channelSms,
          whatsapp: record.channelWhatsApp,
          webPush: record.channelWebPush,
        },
        categories: {
          transactional: true, // Non-opt-outable
          security: true, // Non-opt-outable
          booking: record.catBooking,
          payment: record.catPayment,
          village: record.catVillage,
          social: record.catSocial,
          community: record.catCommunity,
          marketing: record.catMarketing,
        },
        quietHours: {
          enabled: record.quietHoursEnabled,
          startTime: record.quietHoursStart || '22:00',
          endTime: record.quietHoursEnd || '07:00',
          timezone: record.timezone || 'Asia/Kolkata',
        },
        updatedAt: record.updatedAt.toISOString(),
      };
    } catch (err) {
      this.logger.warn(
        `Failed to fetch notification preferences for ${userId}, returning defaults: ${String(err)}`,
      );
      return this.getDefaultObject(userId);
    }
  }

  async updatePreferences(
    userId: string,
    updates: Partial<INotificationPreferences> | UpdateNotificationPreferencesDto,
  ): Promise<INotificationPreferences> {
    const current = await this.getPreferences(userId);

    const mergedChannels = { ...current.channels, ...updates.channels };
    const mergedCategories = {
      ...current.categories,
      ...updates.categories,
      transactional: true, // Invariant: must stay true
      security: true, // Invariant: must stay true
    };
    const mergedQuietHours = { ...current.quietHours, ...updates.quietHours };

    try {
      const record = await prisma.notificationPreference.upsert({
        where: { userId },
        create: {
          userId,
          channelInApp: mergedChannels.inApp,
          channelEmail: mergedChannels.email,
          channelSms: mergedChannels.sms,
          channelWhatsApp: mergedChannels.whatsapp,
          channelWebPush: mergedChannels.webPush,
          catTransactional: true,
          catSecurity: true,
          catBooking: mergedCategories.booking,
          catPayment: mergedCategories.payment,
          catVillage: mergedCategories.village,
          catSocial: mergedCategories.social,
          catCommunity: mergedCategories.community,
          catMarketing: mergedCategories.marketing,
          quietHoursEnabled: mergedQuietHours.enabled,
          quietHoursStart: mergedQuietHours.startTime,
          quietHoursEnd: mergedQuietHours.endTime,
          timezone: mergedQuietHours.timezone,
        },
        update: {
          channelInApp: mergedChannels.inApp,
          channelEmail: mergedChannels.email,
          channelSms: mergedChannels.sms,
          channelWhatsApp: mergedChannels.whatsapp,
          channelWebPush: mergedChannels.webPush,
          catBooking: mergedCategories.booking,
          catPayment: mergedCategories.payment,
          catVillage: mergedCategories.village,
          catSocial: mergedCategories.social,
          catCommunity: mergedCategories.community,
          catMarketing: mergedCategories.marketing,
          quietHoursEnabled: mergedQuietHours.enabled,
          quietHoursStart: mergedQuietHours.startTime,
          quietHoursEnd: mergedQuietHours.endTime,
          timezone: mergedQuietHours.timezone,
        },
      });

      return {
        userId: record.userId,
        channels: mergedChannels,
        categories: mergedCategories,
        quietHours: mergedQuietHours,
        updatedAt: record.updatedAt.toISOString(),
      };
    } catch (err) {
      this.logger.error(`Error saving preferences for ${userId}: ${String(err)}`);
      return {
        userId,
        channels: mergedChannels,
        categories: mergedCategories,
        quietHours: mergedQuietHours,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  public shouldDispatch(
    preferences: INotificationPreferences,
    channel: NotificationChannel,
    category: NotificationCategory,
    isCritical = false,
  ): { allow: boolean; reason?: string } {
    // 1. Critical & Security & Transactional always bypass channel switches
    if (
      isCritical ||
      category === NotificationCategory.SECURITY ||
      category === NotificationCategory.EMERGENCY
    ) {
      return { allow: true };
    }

    // 2. Category Check
    const catMap: Record<string, boolean> = {
      [NotificationCategory.TRANSACTIONAL]: preferences.categories.transactional,
      [NotificationCategory.SECURITY]: preferences.categories.security,
      [NotificationCategory.BOOKING]: preferences.categories.booking,
      [NotificationCategory.PAYMENT]: preferences.categories.payment,
      [NotificationCategory.REFUND]: preferences.categories.payment,
      [NotificationCategory.VILLAGE]: preferences.categories.village,
      [NotificationCategory.SOCIAL]: preferences.categories.social,
      [NotificationCategory.COMMUNITY]: preferences.categories.community,
      [NotificationCategory.CERTIFICATE]: preferences.categories.booking,
      [NotificationCategory.DISCOVERY]: preferences.categories.marketing,
      [NotificationCategory.MODERATION]: true,
      [NotificationCategory.SYSTEM]: true,
      [NotificationCategory.ANNOUNCEMENT]: true,
      [NotificationCategory.EMERGENCY]: true,
    };

    if (catMap[category] === false) {
      return { allow: false, reason: `User has disabled category: ${category}` };
    }

    // 3. Channel Check
    const chanMap: Record<NotificationChannel, boolean> = {
      [NotificationChannel.IN_APP]: preferences.channels.inApp,
      [NotificationChannel.EMAIL]: preferences.channels.email,
      [NotificationChannel.SMS]: preferences.channels.sms,
      [NotificationChannel.WHATSAPP]: preferences.channels.whatsapp,
      [NotificationChannel.WEB_PUSH]: preferences.channels.webPush,
      [NotificationChannel.MOBILE_PUSH]: preferences.channels.webPush,
    };

    if (!chanMap[channel]) {
      return { allow: false, reason: `User has disabled channel: ${channel}` };
    }

    // 4. Quiet Hours Check (only for non-critical alerts on external audio/interrupting channels like SMS, WhatsApp, Push)
    if (
      preferences.quietHours.enabled &&
      (channel === NotificationChannel.SMS ||
        channel === NotificationChannel.WHATSAPP ||
        channel === NotificationChannel.WEB_PUSH)
    ) {
      if (
        this.isInQuietHours(
          preferences.quietHours.startTime,
          preferences.quietHours.endTime,
          preferences.quietHours.timezone,
        )
      ) {
        return { allow: false, reason: 'Deferred due to active Quiet Hours' };
      }
    }

    return { allow: true };
  }

  public isInQuietHours(startTime: string, endTime: string, timezone: string): boolean {
    try {
      const now = new Date();
      // Format current time in user's timezone as HH:mm
      const userTimeString = now.toLocaleTimeString('en-US', {
        timeZone: timezone || 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });

      const [curH, curM] = userTimeString.split(':').map(Number);
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);

      const curMinutes = curH * 60 + curM;
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (startMinutes <= endMinutes) {
        return curMinutes >= startMinutes && curMinutes < endMinutes;
      } else {
        // Overnight quiet hours (e.g. 22:00 to 07:00)
        return curMinutes >= startMinutes || curMinutes < endMinutes;
      }
    } catch {
      return false;
    }
  }

  private async createDefaultPreferences(userId: string): Promise<INotificationPreferences> {
    const defaults = this.getDefaultObject(userId);
    try {
      await prisma.notificationPreference.create({
        data: {
          userId,
          channelInApp: defaults.channels.inApp,
          channelEmail: defaults.channels.email,
          channelSms: defaults.channels.sms,
          channelWhatsApp: defaults.channels.whatsapp,
          channelWebPush: defaults.channels.webPush,
          catTransactional: true,
          catSecurity: true,
          catBooking: defaults.categories.booking,
          catPayment: defaults.categories.payment,
          catVillage: defaults.categories.village,
          catSocial: defaults.categories.social,
          catCommunity: defaults.categories.community,
          catMarketing: defaults.categories.marketing,
          quietHoursEnabled: defaults.quietHours.enabled,
          quietHoursStart: defaults.quietHours.startTime,
          quietHoursEnd: defaults.quietHours.endTime,
          timezone: defaults.quietHours.timezone,
        },
      });
    } catch {
      // Ignored if race condition or db offline
    }
    return defaults;
  }

  private getDefaultObject(userId: string): INotificationPreferences {
    return {
      userId,
      channels: {
        inApp: true,
        email: true,
        sms: true,
        whatsapp: true,
        webPush: false,
      },
      categories: {
        transactional: true,
        security: true,
        booking: true,
        payment: true,
        village: true,
        social: true,
        community: true,
        marketing: false,
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '07:00',
        timezone: 'Asia/Kolkata',
      },
      updatedAt: new Date().toISOString(),
    };
  }
}
