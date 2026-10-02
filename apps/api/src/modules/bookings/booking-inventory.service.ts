// Explore Bharat Safar — Section 3: Live Slot & Inventory Concurrency Service
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-26-RULES

import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { WaitlistStatus, type WaitlistEntryEntity } from '@ebs/types';

export interface ActiveSlotLock {
  bookingId: string;
  batchId: string;
  slots: number;
  expiresAt: Date;
}

@Injectable()
export class BookingInventoryService {
  private readonly logger = new Logger(BookingInventoryService.name);

  // In-memory slot lock cache (in production backed by Redis Redlock cluster)
  private readonly activeLocks = new Map<string, ActiveSlotLock>();

  // In-memory batch dynamic overrides (available slots)
  private readonly batchSlotOverrides = new Map<string, number>();

  // In-memory waitlist registry
  private readonly waitlistRegistry = new Map<string, WaitlistEntryEntity[]>();

  private static readonly LOCK_TTL_SECONDS = 900; // 15 Minutes per EBS-BLU-43-BKG

  /**
   * Initializes or gets the currently available slots for a batch.
   */
  getAvailableSlots(batchId: string, defaultCapacity: number): number {
    this.sweepExpiredLocks();
    const current = this.batchSlotOverrides.get(batchId);
    if (current === undefined) {
      this.batchSlotOverrides.set(batchId, defaultCapacity);
      return defaultCapacity;
    }
    return current;
  }

  /**
   * Sets the capacity or available slots explicitly (admin/system override)
   */
  setAvailableSlots(batchId: string, count: number): void {
    this.batchSlotOverrides.set(batchId, Math.max(0, count));
  }

  /**
   * Atomically acquires a 15-minute slot lock for a booking order.
   * Throws ConflictException if requested slots exceed available inventory.
   */
  acquireSlotLock(
    batchId: string,
    bookingId: string,
    requestedSlots: number,
    totalCapacity: number,
  ): { lockToken: string; expiresAt: string; remainingSlots: number } {
    this.sweepExpiredLocks();

    const currentSlots = this.getAvailableSlots(batchId, totalCapacity);

    if (currentSlots < requestedSlots) {
      this.logger.warn(
        `Slot lock rejected for Batch ${batchId}. Requested: ${requestedSlots}, Available: ${currentSlots}`,
      );
      throw new ConflictException({
        errorCode: 'EBS_BOOKING_SLOTS_UNAVAILABLE',
        message: `Selected departure batch is out of available capacity (${currentSlots} slots left). Please select another batch or join the waitlist.`,
        availableSlots: currentSlots,
      });
    }

    // Decrement slots atomically
    const remainingSlots = currentSlots - requestedSlots;
    this.batchSlotOverrides.set(batchId, remainingSlots);

    const expiresAt = new Date(Date.now() + BookingInventoryService.LOCK_TTL_SECONDS * 1000);
    const lockKey = `lock:batch:${batchId}:${bookingId}`;

    this.activeLocks.set(lockKey, {
      bookingId,
      batchId,
      slots: requestedSlots,
      expiresAt,
    });

    this.logger.log(
      `Slot lock acquired: ${lockKey} for ${requestedSlots} seats. Remaining: ${remainingSlots}. Expires: ${expiresAt.toISOString()}`,
    );

    return {
      lockToken: lockKey,
      expiresAt: expiresAt.toISOString(),
      remainingSlots,
    };
  }

  /**
   * Checks if an order's slot lock is still active and within the 15-minute TTL.
   */
  isLockValid(batchId: string, bookingId: string): boolean {
    this.sweepExpiredLocks();
    const lockKey = `lock:batch:${batchId}:${bookingId}`;
    const lock = this.activeLocks.get(lockKey);
    if (!lock) return false;
    return lock.expiresAt.getTime() > Date.now();
  }

  /**
   * Returns remaining seconds on an active lock.
   */
  getRemainingLockSeconds(batchId: string, bookingId: string): number {
    const lockKey = `lock:batch:${batchId}:${bookingId}`;
    const lock = this.activeLocks.get(lockKey);
    if (!lock) return 0;
    const diff = Math.floor((lock.expiresAt.getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  }

  /**
   * Releases an active slot lock and restores inventory to the batch.
   */
  releaseLock(batchId: string, bookingId: string): void {
    const lockKey = `lock:batch:${batchId}:${bookingId}`;
    const lock = this.activeLocks.get(lockKey);
    if (lock) {
      const current = this.batchSlotOverrides.get(batchId) ?? 0;
      this.batchSlotOverrides.set(batchId, current + lock.slots);
      this.activeLocks.delete(lockKey);
      this.logger.log(
        `Slot lock released: ${lockKey}. Restored ${lock.slots} seats to Batch ${batchId}.`,
      );
    }
  }

  /**
   * Confirms a booking, finalizing the slot reservation into permanent inventory consumption.
   */
  commitReservation(batchId: string, bookingId: string): void {
    const lockKey = `lock:batch:${batchId}:${bookingId}`;
    // Lock is consumed; inventory remains decremented
    this.activeLocks.delete(lockKey);
    this.logger.log(`Slot lock finalized to confirmed reservation: ${lockKey}`);
  }

  /**
   * Adds an explorer to the batch waitlist.
   */
  addToWaitlist(
    batchId: string,
    userId: string,
    partySize: number,
    contactPhone: string,
    userName?: string,
    userEmail?: string,
  ): WaitlistEntryEntity {
    const entries = this.waitlistRegistry.get(batchId) ?? [];
    const newEntry: WaitlistEntryEntity = {
      id: `wl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      batchId,
      userId,
      userName,
      userEmail,
      partySize,
      contactPhone,
      status: WaitlistStatus.WAITING,
      createdAt: new Date().toISOString(),
    };
    entries.push(newEntry);
    this.waitlistRegistry.set(batchId, entries);

    this.logger.log(
      `Explorer added to waitlist for Batch ${batchId}: User ${userId}, Party size ${partySize}`,
    );
    return newEntry;
  }

  /**
   * Retrieves all waitlist entries for a batch.
   */
  getWaitlist(batchId: string): WaitlistEntryEntity[] {
    return this.waitlistRegistry.get(batchId) ?? [];
  }

  /**
   * Automated sweeper: checks for expired 15-minute slot holds and restores seats to batch capacity.
   */
  sweepExpiredLocks(): number {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, lock] of this.activeLocks.entries()) {
      if (lock.expiresAt.getTime() <= now) {
        const current = this.batchSlotOverrides.get(lock.batchId) ?? 0;
        this.batchSlotOverrides.set(lock.batchId, current + lock.slots);
        this.activeLocks.delete(key);
        expiredCount++;
        this.logger.warn(
          `Lock timeout (>15 mins). Restored ${lock.slots} seats for Batch ${lock.batchId}`,
        );
      }
    }

    return expiredCount;
  }
}
