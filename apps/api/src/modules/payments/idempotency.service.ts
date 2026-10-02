// Explore Bharat Safar — Section 4: Payment Idempotency & Replay Defense Service
// Reference: EBS-DOC-21-PAYMENT, EBS-BLU-40-SECURITY

import { Injectable, ConflictException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface CachedIdempotencyResponse {
  idempotencyKey: string;
  endpoint: string;
  requestHash: string;
  responsePayload: unknown;
  statusCode: number;
  expiresAt: number; // epoch ms
  createdAt: string;
}

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly cache = new Map<string, CachedIdempotencyResponse>();
  private readonly defaultTtlMs = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Hashes payload deterministically using SHA-256.
   */
  hashPayload(payload: unknown): string {
    const serialized = JSON.stringify(payload ?? {});
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Inspects cache for previously processed request.
   * If key exists and request hash matches, returns cached response.
   * If key exists but hash differs, raises 409 Conflict (key reuse with different payload).
   */
  checkIdempotency(
    idempotencyKey: string,
    endpoint: string,
    payload: unknown,
  ): CachedIdempotencyResponse | null {
    this.cleanExpired();

    const existing = this.cache.get(idempotencyKey);
    if (!existing) {
      return null;
    }

    const currentHash = this.hashPayload(payload);
    if (existing.requestHash !== currentHash) {
      this.logger.warn(
        `Idempotency key ${idempotencyKey} reused with mismatched payload hash on ${endpoint}.`,
      );
      throw new ConflictException({
        errorCode: 'EBS_IDEMPOTENCY_CONFLICT',
        message: 'Idempotency-Key was already used with different request parameters.',
      });
    }

    this.logger.log(`Idempotent replay detected for key: ${idempotencyKey} on ${endpoint}`);
    return existing;
  }

  /**
   * Caches completed response for 24 hours.
   */
  storeIdempotency(
    idempotencyKey: string,
    endpoint: string,
    payload: unknown,
    responsePayload: unknown,
    statusCode = 200,
  ): void {
    const requestHash = this.hashPayload(payload);
    const expiresAt = Date.now() + this.defaultTtlMs;

    this.cache.set(idempotencyKey, {
      idempotencyKey,
      endpoint,
      requestHash,
      responsePayload,
      statusCode,
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    this.logger.debug(`Stored idempotency record for key ${idempotencyKey} (TTL: 24h)`);
  }

  /**
   * Purges expired idempotency entries to maintain bounded memory footprint.
   */
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, record] of this.cache.entries()) {
      if (record.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  clearAll(): void {
    this.cache.clear();
  }
}
