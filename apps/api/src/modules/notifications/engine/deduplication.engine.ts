// Explore Bharat Safar — Notification Deduplication & Idempotency Engine
// Reference: EBS-DOC-19-NOTIF Section 3.1
// Formula: Dedup Key = MD5(UserId || EventType || EntityId || Channel)
// Sprint 10: Enterprise Notification & Communication Platform

import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationDeduplicationEngine {
  private readonly logger = new Logger(NotificationDeduplicationEngine.name);
  private redisClient?: Redis;
  private readonly memoryStore = new Map<string, number>(); // Local fallback
  private readonly defaultTtlSeconds = 300; // 5 minutes

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    if (redisHost) {
      try {
        this.redisClient = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
        });
        this.redisClient.connect().catch(() => {
          this.logger.warn(
            'Redis unavailable for DeduplicationEngine, falling back to in-memory store.',
          );
          this.redisClient = undefined;
        });
      } catch {
        this.redisClient = undefined;
      }
    }
  }

  public generateKey(params: {
    userId: string;
    eventType: string;
    entityId?: string;
    channel: string;
  }): string {
    const raw = `${params.userId}:${params.eventType}:${params.entityId || 'none'}:${params.channel}`;
    return crypto.createHash('md5').update(raw).digest('hex');
  }

  async isDuplicate(key: string, ttlSeconds = this.defaultTtlSeconds): Promise<boolean> {
    const redisKey = `ebs:notif:dedup:${key}`;

    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        const result = await this.redisClient.set(redisKey, '1', 'EX', ttlSeconds, 'NX');
        return result === null; // If NX returns null, key already existed => Duplicate!
      } catch (err) {
        this.logger.warn(`Redis dedup query failed, checking memory fallback: ${String(err)}`);
      }
    }

    // In-memory fallback
    const now = Date.now();
    const expiry = this.memoryStore.get(key);
    if (expiry && expiry > now) {
      return true; // Duplicate!
    }

    this.memoryStore.set(key, now + ttlSeconds * 1000);
    this.cleanExpiredMemoryKeys();
    return false;
  }

  private cleanExpiredMemoryKeys(): void {
    if (this.memoryStore.size > 1000) {
      const now = Date.now();
      for (const [k, exp] of this.memoryStore.entries()) {
        if (exp <= now) this.memoryStore.delete(k);
      }
    }
  }
}
