// Explore Bharat Safar — Notification Rate Limiting Engine
// Reference: EBS-DOC-19-NOTIF, EBS-DOC-40-SEC
// Anti-SMS-bombing & DoS protection sliding window token bucket
// Sprint 10: Enterprise Notification & Communication Platform

import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@ebs/types';

export interface RateLimitRule {
  maxRequests: number;
  windowSeconds: number;
}

export const DEFAULT_CHANNEL_RATE_LIMITS: Record<NotificationChannel, RateLimitRule> = {
  [NotificationChannel.SMS]: { maxRequests: 5, windowSeconds: 3600 }, // Max 5 SMS / hour per user
  [NotificationChannel.EMAIL]: { maxRequests: 25, windowSeconds: 3600 }, // Max 25 emails / hour per user
  [NotificationChannel.WHATSAPP]: { maxRequests: 15, windowSeconds: 3600 }, // Max 15 WhatsApp / hour per user
  [NotificationChannel.WEB_PUSH]: { maxRequests: 40, windowSeconds: 3600 }, // Max 40 push / hour per user
  [NotificationChannel.MOBILE_PUSH]: { maxRequests: 40, windowSeconds: 3600 },
  [NotificationChannel.IN_APP]: { maxRequests: 100, windowSeconds: 3600 }, // High ceiling for in-app feeds
};

@Injectable()
export class NotificationRateLimiterEngine {
  private readonly logger = new Logger(NotificationRateLimiterEngine.name);
  private readonly windowStore = new Map<string, number[]>();

  public checkRateLimit(
    userId: string,
    channel: NotificationChannel,
    customRule?: RateLimitRule,
  ): { isAllowed: boolean; remaining: number; retryAfterSeconds?: number } {
    const rule = customRule || DEFAULT_CHANNEL_RATE_LIMITS[channel];
    const key = `ratelimit:${userId}:${channel}`;
    const now = Date.now();
    const windowStart = now - rule.windowSeconds * 1000;

    const timestamps = (this.windowStore.get(key) || []).filter(ts => ts > windowStart);

    if (timestamps.length >= rule.maxRequests) {
      const oldest = timestamps[0];
      const retryAfterSeconds = Math.ceil((oldest + rule.windowSeconds * 1000 - now) / 1000);
      this.logger.warn(
        `Rate limit exceeded for user ${userId} on channel ${channel}. Retry after ${retryAfterSeconds}s.`,
      );
      return {
        isAllowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }

    timestamps.push(now);
    this.windowStore.set(key, timestamps);

    return {
      isAllowed: true,
      remaining: rule.maxRequests - timestamps.length,
    };
  }

  public resetUser(userId: string): void {
    for (const key of this.windowStore.keys()) {
      if (key.startsWith(`ratelimit:${userId}:`)) {
        this.windowStore.delete(key);
      }
    }
  }
}
