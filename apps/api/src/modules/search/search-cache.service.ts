// Explore Bharat Safar — Multi-Tier Search Cache & SWR Refresh Service
// Reference: EBS-DOC-18-SEARCH Section 3 & EBS-TDR-51-TECHSTACK
// Sprint 11: Enterprise Search Optimization

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import Redis from 'ioredis';
import { logger } from '@ebs/logger';
import { SearchContext } from '@ebs/types';

interface CachedSearchEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
  swrThresholdMs: number;
}

@Injectable()
export class SearchCacheService {
  private redis: Redis | null = null;
  private l1Cache = new Map<string, CachedSearchEntry<unknown>>();
  private readonly MAX_L1_ENTRIES = 1000;
  private readonly DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
  private readonly DEFAULT_SWR_MS = 30 * 60 * 1000; // 30 minutes

  constructor() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        lazyConnect: true,
        maxRetriesPerRequest: 0,
        enableOfflineQueue: false,
        retryStrategy: () => null, // Disable reconnect retries when offline
      });

      this.redis.on('error', () => {
        // Silently fall back to L1 in-memory LRU cache
      });

      this.redis.connect().catch(() => {
        this.redis = null;
      });
    } catch {
      this.redis = null;
    }
  }

  /**
   * Generates deterministic SHA-256 cache key for query payload
   */
  generateCacheKey(context: SearchContext | string, queryParams: Record<string, unknown>): string {
    const serialized = JSON.stringify(queryParams, Object.keys(queryParams).sort());
    const hash = crypto.createHash('sha256').update(serialized).digest('hex').substring(0, 16);
    return `ebs:search:${context}:${hash}`;
  }

  /**
   * Retrieves item from L1 memory or L2 Redis cache with SWR detection
   */
  async get<T>(
    key: string,
    onStaleRefresh?: () => Promise<T>,
  ): Promise<{ data: T; isCached: boolean } | null> {
    const now = Date.now();

    // 1. Check L1 Memory Cache
    const l1Entry = this.l1Cache.get(key) as CachedSearchEntry<T> | undefined;
    if (l1Entry) {
      if (now - l1Entry.cachedAt < l1Entry.ttlMs) {
        // Check if Stale-While-Revalidate background refresh needed
        if (onStaleRefresh && now - l1Entry.cachedAt > l1Entry.swrThresholdMs) {
          this.triggerBackgroundRefresh(key, onStaleRefresh);
        }
        return { data: l1Entry.data, isCached: true };
      }
      this.l1Cache.delete(key);
    }

    // 2. Check L2 Redis Cache
    if (this.redis) {
      try {
        const raw = await this.redis.get(key);
        if (raw) {
          const entry = JSON.parse(raw) as CachedSearchEntry<T>;
          // Populate L1 cache
          this.setL1(key, entry.data, entry.ttlMs);

          if (onStaleRefresh && now - entry.cachedAt > entry.swrThresholdMs) {
            this.triggerBackgroundRefresh(key, onStaleRefresh);
          }
          return { data: entry.data, isCached: true };
        }
      } catch {
        // Graceful fallback on Redis error
      }
    }

    return null;
  }

  /**
   * Persists item in both L1 and L2 caches
   */
  async set<T>(key: string, data: T, ttlMs = this.DEFAULT_TTL_MS): Promise<void> {
    const entry: CachedSearchEntry<T> = {
      data,
      cachedAt: Date.now(),
      ttlMs,
      swrThresholdMs: ttlMs / 2,
    };

    // Set L1
    this.setL1(key, data, ttlMs);

    // Set L2
    if (this.redis) {
      try {
        const ttlSec = Math.ceil(ttlMs / 1000);
        await this.redis.set(key, JSON.stringify(entry), 'EX', ttlSec);
      } catch {
        // Fallback to L1
      }
    }
  }

  /**
   * Invalidates all cache keys for a given search domain context
   */
  async invalidateContext(context: SearchContext | string): Promise<void> {
    const prefix = `ebs:search:${context}:`;

    // Clear matching L1 keys
    for (const key of this.l1Cache.keys()) {
      if (key.startsWith(prefix)) {
        this.l1Cache.delete(key);
      }
    }

    // Clear matching L2 Redis keys
    if (this.redis) {
      try {
        const keys = await this.redis.keys(`${prefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch {
        // Ignored
      }
    }
  }

  private setL1<T>(key: string, data: T, ttlMs: number): void {
    if (this.l1Cache.size >= this.MAX_L1_ENTRIES) {
      const firstKey = this.l1Cache.keys().next().value;
      if (firstKey) this.l1Cache.delete(firstKey);
    }
    this.l1Cache.set(key, {
      data,
      cachedAt: Date.now(),
      ttlMs,
      swrThresholdMs: ttlMs / 2,
    });
  }

  private triggerBackgroundRefresh<T>(key: string, fetchFn: () => Promise<T>): void {
    setImmediate(async () => {
      try {
        const fresh = await fetchFn();
        await this.set(key, fresh);
        logger.debug(`SearchCacheService: Background SWR refreshed key: ${key}`);
      } catch {
        // Fallback
      }
    });
  }
}
