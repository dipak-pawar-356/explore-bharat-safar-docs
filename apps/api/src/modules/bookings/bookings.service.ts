// Explore Bharat Safar — Section 3: Travel Booking Engine & Experiences Service
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-09-API, EBS-DOC-10-DATA, EBS-DOC-26-RULES, EBS-DOC-36-STATE

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import {
  DifficultyLevel,
  ExperienceType,
  BookingStatus,
  BatchStatus,
  AddonType,
  DiscountType,
  FoodPreference,
  TrekExperienceLevel,
  type ExperienceEntity,
  type BatchEntity,
  type AddonEntity,
  type CouponEntity,
  type PricingBreakdown,
  type CancellationRefundEstimate,
  type BookingOrder,
  type BookingParticipantEntity,
  type ReserveSlotResponse,
  type ExperienceCatalogResponse,
  type BatchManifestDto,
  type WaitlistEntryEntity,
} from '@ebs/types';
import { encryptAesGcm } from '@ebs/security-crypto';
import { BookingInventoryService } from './booking-inventory.service';
import type {
  ReserveSlotDto,
  ConfirmBookingDto,
  CancelBookingDto,
  WaitlistJoinDto,
  CreateBatchDto,
  UpdateBatchDto,
  ExperienceFilterDto,
} from './dto/booking.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  // In-memory persistent master state (seeded with production-grade Bharat expeditions)
  private readonly experiences = new Map<string, ExperienceEntity>();
  private readonly batches = new Map<string, BatchEntity>();
  private readonly addons = new Map<string, AddonEntity>();
  private readonly coupons = new Map<string, CouponEntity>();
  private readonly bookings = new Map<string, BookingOrder>();

  // Symmetric 64-hex char key for DPDP Act 2023 medical encryption
  private readonly medicalEncryptionKeyHex =
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  constructor(private readonly inventoryService: BookingInventoryService) {
    this.seedCatalogueData();
  }

  // =========================================================================
  // 1. EXPERIENCE & CATALOGUE QUERY SERVICES
  // =========================================================================

  /**
   * Retrieves filtered adventure experiences catalog.
   */
  async getExperiences(filter?: ExperienceFilterDto): Promise<ExperienceCatalogResponse> {
    let items = Array.from(this.experiences.values()).filter(e => e.isPublished);

    if (filter?.q) {
      const qLower = filter.q.toLowerCase();
      items = items.filter(
        e =>
          e.title.toLowerCase().includes(qLower) ||
          e.slug.toLowerCase().includes(qLower) ||
          e.overviewDescription.toLowerCase().includes(qLower),
      );
    }

    if (filter?.experienceType) {
      items = items.filter(e => e.experienceType === filter.experienceType);
    }

    if (filter?.difficulty) {
      items = items.filter(e => e.difficulty === filter.difficulty);
    }

    if (filter?.minPrice !== undefined) {
      items = items.filter(e => e.basePriceInr >= (filter.minPrice ?? 0));
    }

    if (filter?.maxPrice !== undefined) {
      items = items.filter(e => e.basePriceInr <= (filter.maxPrice ?? Infinity));
    }

    if (filter?.maxAltitude !== undefined) {
      items = items.filter(e => (e.maxAltitudeMeters ?? 0) <= (filter.maxAltitude ?? Infinity));
    }

    if (filter?.durationDays !== undefined) {
      items = items.filter(e => e.durationDays === filter.durationDays);
    }

    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    const categories = Array.from(
      new Set(Array.from(this.experiences.values()).map(e => e.categorySlug)),
    );

    return {
      items: paginatedItems,
      totalMatches: items.length,
      page,
      limit,
      availableCategories: categories,
    };
  }

  /**
   * Retrieves complete experience dossier by slug or ID with upcoming batches.
   */
  async getExperienceBySlug(slugOrId: string): Promise<{
    experience: ExperienceEntity;
    batches: BatchEntity[];
    addons: AddonEntity[];
  }> {
    const experience =
      this.experiences.get(slugOrId) ||
      Array.from(this.experiences.values()).find(e => e.slug === slugOrId);

    if (!experience) {
      throw new NotFoundException({
        errorCode: 'EBS_EXP_NOT_FOUND',
        message: `Adventure experience with identifier '${slugOrId}' not found.`,
      });
    }

    // Find and synchronize batches
    const experienceBatches = Array.from(this.batches.values())
      .filter(b => b.experienceId === experience.id)
      .map(b => {
        const liveSlots = this.inventoryService.getAvailableSlots(b.id, b.totalCapacity);
        let status = b.status;
        if (liveSlots === 0) {
          status = BatchStatus.SOLD_OUT;
        } else if (liveSlots <= 5) {
          status = BatchStatus.FILLING_FAST;
        }
        return {
          ...b,
          availableSlots: liveSlots,
          status,
        };
      });

    // Find associated add-ons
    const availableAddons = Array.from(this.addons.values()).filter(
      a => a.isActive && (!a.experienceId || a.experienceId === experience.id),
    );

    return {
      experience,
      batches: experienceBatches,
      addons: availableAddons,
    };
  }

  /**
   * Retrieves live slot availability for a specific departure batch.
   */
  async getBatchAvailability(batchId: string): Promise<{
    batch: BatchEntity;
    availableSlots: number;
    isBookingOpen: boolean;
    waitlistCount: number;
  }> {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new NotFoundException({
        errorCode: 'EBS_BATCH_NOT_FOUND',
        message: `Departure batch ${batchId} was not found in the booking system.`,
      });
    }

    const availableSlots = this.inventoryService.getAvailableSlots(batch.id, batch.totalCapacity);
    const waitlist = this.inventoryService.getWaitlist(batch.id);

    return {
      batch: {
        ...batch,
        availableSlots,
      },
      availableSlots,
      isBookingOpen: availableSlots > 0 && batch.status !== BatchStatus.CANCELLED,
      waitlistCount: waitlist.length,
    };
  }

  // =========================================================================
  // 2. PRICING & PROMOTION CALCULATION ENGINE
  // =========================================================================

  /**
   * Calculates dynamic pricing breakdown per EBS-DOC-14-BOOKING and EBS-BLU-43-BKG.
   */
  calculatePricing(
    basePricePerParticipant: number,
    participantCount: number,
    selectedAddons: { addon: AddonEntity; quantity: number }[] = [],
    couponCode?: string,
    upfrontPercentage: number = 25,
  ): PricingBreakdown {
    const basePriceTotal = Math.round(basePricePerParticipant * participantCount * 100) / 100;

    let addOnsTotal = 0;
    for (const item of selectedAddons) {
      addOnsTotal += item.addon.priceInr * item.quantity;
    }
    addOnsTotal = Math.round(addOnsTotal * 100) / 100;

    const grossSubtotal = basePriceTotal + addOnsTotal;

    // Evaluate coupon discount
    let discountTotal = 0;
    if (couponCode) {
      const coupon = this.coupons.get(couponCode.toUpperCase());
      if (coupon && coupon.isActive && grossSubtotal >= coupon.minOrderAmountInr) {
        if (coupon.discountType === DiscountType.PERCENTAGE) {
          discountTotal = (grossSubtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountInr && discountTotal > coupon.maxDiscountInr) {
            discountTotal = coupon.maxDiscountInr;
          }
        } else {
          discountTotal = coupon.discountValue;
        }
      }
    }
    discountTotal = Math.min(grossSubtotal, Math.round(discountTotal * 100) / 100);

    const subtotal = Math.max(0, grossSubtotal - discountTotal);

    // Statutory GST on adventure expeditions: 5%
    const taxesGst = Math.round(subtotal * 0.05 * 100) / 100;
    const convenienceFee = 0; // Configurable convenience charge
    const totalBookingAmount = Math.round((subtotal + taxesGst + convenienceFee) * 100) / 100;

    // Enforce Super Admin upfront bounds: [10%, 100%]
    const effectiveUpfront = Math.min(100, Math.max(10, upfrontPercentage));
    const mandatoryAdvanceDeposit =
      Math.round(totalBookingAmount * (effectiveUpfront / 100) * 100) / 100;
    const outstandingBalanceDue =
      Math.round((totalBookingAmount - mandatoryAdvanceDeposit) * 100) / 100;

    return {
      basePriceTotal,
      addOnsTotal,
      discountTotal,
      subtotal,
      taxesGst,
      convenienceFee,
      totalBookingAmount,
      adminUpfrontPercentage: effectiveUpfront,
      mandatoryAdvanceDeposit,
      outstandingBalanceDue,
    };
  }

  // =========================================================================
  // 3. ATOMIC RESERVATION & CHECKOUT WORKFLOW
  // =========================================================================

  /**
   * Reserves batch slots with 15-minute Redlock concurrency hold.
   */
  async reserveSlots(userId: string, dto: ReserveSlotDto): Promise<ReserveSlotResponse> {
    const batch = this.batches.get(dto.batchId);
    if (!batch) {
      throw new NotFoundException({
        errorCode: 'EBS_BATCH_NOT_FOUND',
        message: `Batch ${dto.batchId} does not exist.`,
      });
    }

    const experience = this.experiences.get(batch.experienceId);
    if (!experience) {
      throw new NotFoundException({
        errorCode: 'EBS_EXP_NOT_FOUND',
        message: `Parent experience for batch not found.`,
      });
    }

    if (!dto.termsAccepted) {
      throw new BadRequestException({
        errorCode: 'EBS_TERMS_NOT_ACCEPTED',
        message:
          'Explicit acceptance of adventure terms, safety waiver, and cancellation policy is mandatory.',
      });
    }

    const participantCount = dto.participants?.length || 1;
    if (participantCount > 10) {
      throw new BadRequestException({
        errorCode: 'EBS_MAX_SLOTS_EXCEEDED',
        message: 'Maximum 10 slots can be reserved in a single booking order.',
      });
    }

    // Generate unique order number: EBS-ORD-YYYY-XXXXX
    const year = new Date().getFullYear();
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString();
    const orderNumber = `EBS-ORD-${year}-${randomHex}`;
    const bookingId = `bkg-${Date.now()}-${randomHex}`;

    // 1. Acquire 15-minute distributed slot lock atomically
    const lockResult = this.inventoryService.acquireSlotLock(
      batch.id,
      bookingId,
      participantCount,
      batch.totalCapacity,
    );

    // 2. Resolve selected add-ons
    const selectedAddonEntities: { addon: AddonEntity; quantity: number }[] = [];
    if (dto.addonIds && dto.addonIds.length > 0) {
      for (const addonId of dto.addonIds) {
        const addon = this.addons.get(addonId);
        if (addon && addon.isActive) {
          selectedAddonEntities.push({ addon, quantity: 1 });
        }
      }
    }

    // 3. Compute dynamic pricing
    const pricing = this.calculatePricing(
      batch.batchPriceInr,
      participantCount,
      selectedAddonEntities,
      dto.couponCode,
      experience.mandatoryUpfrontPercentage,
    );

    // 4. Encrypt medical declarations per DPDP Act 2023
    const participantsList: BookingParticipantEntity[] = (dto.participants || []).map((p, idx) => {
      let encryptedMedical: string | undefined = undefined;
      if (p.medicalDeclarations) {
        const enc = encryptAesGcm(p.medicalDeclarations, this.medicalEncryptionKeyHex);
        encryptedMedical = `${enc.iv}:${enc.tag}:${enc.ciphertext}`;
      }

      return {
        id: `part-${bookingId}-${idx + 1}`,
        bookingId,
        fullName: p.fullName,
        age: p.age,
        gender: p.gender,
        dateOfBirth: p.dateOfBirth,
        emergencyContactName: p.emergencyContactName,
        emergencyContactPhone: p.emergencyContactPhone,
        foodPreference: p.foodPreference || FoodPreference.VEG,
        experienceLevel: p.experienceLevel || TrekExperienceLevel.BEGINNER,
        encryptedMedicalDeclarations: encryptedMedical,
        isAttendanceVerified: false,
        createdAt: new Date().toISOString(),
      };
    });

    // 5. Store booking order in PENDING_PAYMENT status
    const newBooking: BookingOrder = {
      id: bookingId,
      orderNumber,
      userId,
      batchId: batch.id,
      experienceId: experience.id,
      experienceTitle: experience.title,
      participantCount,
      status: BookingStatus.PENDING_PAYMENT,
      pricing,
      participants: participantsList,
      selectedAddons: selectedAddonEntities.map(a => ({
        addonId: a.addon.id,
        name: a.addon.name,
        priceInr: a.addon.priceInr,
        quantity: a.quantity,
      })),
      appliedCoupon: dto.couponCode?.toUpperCase(),
      termsVersion: dto.termsVersion || '2026.1',
      termsAcceptedAt: new Date().toISOString(),
      lockExpiresAt: lockResult.expiresAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bookings.set(bookingId, newBooking);

    this.logger.log(
      `Booking reserved: ${bookingId} (${orderNumber}) by user ${userId}. Total: ₹${pricing.totalBookingAmount}, Upfront: ₹${pricing.mandatoryAdvanceDeposit}.`,
    );

    return {
      bookingId,
      orderNumber,
      status: BookingStatus.PENDING_PAYMENT,
      pricing,
      lockExpiresAt: lockResult.expiresAt,
      lockDurationSeconds: 900,
    };
  }

  /**
   * Confirms a booking order (simulation / direct confirmation in absence of payment gateway).
   */
  async confirmBooking(
    bookingId: string,
    userId: string,
    _dto?: ConfirmBookingDto,
  ): Promise<BookingOrder> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new NotFoundException({
        errorCode: 'EBS_BOOKING_NOT_FOUND',
        message: `Booking ${bookingId} was not found.`,
      });
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException({
        errorCode: 'EBS_ACCESS_DENIED',
        message: 'You are not authorized to access this booking order.',
      });
    }

    if (
      booking.status !== BookingStatus.PENDING_PAYMENT &&
      booking.status !== BookingStatus.DRAFT
    ) {
      throw new BadRequestException({
        errorCode: 'EBS_INVALID_TRANSITION',
        message: `Cannot confirm booking in '${booking.status}' state.`,
      });
    }

    // Verify slot lock is still valid
    if (!this.inventoryService.isLockValid(booking.batchId, booking.id)) {
      booking.status = BookingStatus.EXPIRED;
      booking.updatedAt = new Date().toISOString();
      throw new ConflictException({
        errorCode: 'EBS_LOCK_EXPIRED',
        message: '15-minute slot reservation lock has expired. Please re-initiate booking.',
      });
    }

    // Commit reservation to permanent inventory decrement
    this.inventoryService.commitReservation(booking.batchId, booking.id);

    // Transition status to CONFIRMED
    booking.status = BookingStatus.CONFIRMED;
    booking.updatedAt = new Date().toISOString();
    this.bookings.set(booking.id, booking);

    this.logger.log(`Booking confirmed: ${booking.orderNumber} for user ${userId}.`);
    return booking;
  }

  // =========================================================================
  // 4. CANCELLATION & REFUND POLICY ENGINE
  // =========================================================================

  /**
   * Estimates cancellation deduction and refund eligibility per 30/15/7-day rules.
   */
  calculateCancellationRefund(bookingId: string): CancellationRefundEstimate {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found.`);
    }

    const batch = this.batches.get(booking.batchId);
    if (!batch) {
      throw new NotFoundException(`Batch for booking ${bookingId} not found.`);
    }

    const departureDate = new Date(batch.batchStartDate);
    const now = new Date();
    const daysBeforeDeparture = Math.floor(
      (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    let refundPercentage = 0;
    let policyTierNote = '';

    if (daysBeforeDeparture >= 30) {
      refundPercentage = 90;
      policyTierNote = '30+ days prior: 90% refund (10% processing fee retained)';
    } else if (daysBeforeDeparture >= 15) {
      refundPercentage = 50;
      policyTierNote = '15-29 days prior: 50% refund (50% cancellation fee)';
    } else if (daysBeforeDeparture >= 7) {
      refundPercentage = 25;
      policyTierNote = '7-14 days prior: 25% refund (75% cancellation fee)';
    } else {
      refundPercentage = 0;
      policyTierNote = '<7 days prior: 0% refund (permits and logistics pre-booked)';
    }

    const totalAmount = booking.pricing.totalBookingAmount;
    const eligibleRefundAmount = Math.round(totalAmount * (refundPercentage / 100) * 100) / 100;
    const cancellationFee = Math.round((totalAmount - eligibleRefundAmount) * 100) / 100;

    return {
      bookingId,
      daysBeforeDeparture,
      totalAmountPaid: totalAmount,
      refundPercentage,
      cancellationFee,
      eligibleRefundAmount,
      policyTierNote,
    };
  }

  /**
   * Executes cancellation and restores slots back to batch inventory.
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    dto: CancelBookingDto,
  ): Promise<{
    booking: BookingOrder;
    refundEstimate: CancellationRefundEstimate;
  }> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new NotFoundException({
        errorCode: 'EBS_BOOKING_NOT_FOUND',
        message: `Booking ${bookingId} not found.`,
      });
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException({
        errorCode: 'EBS_ACCESS_DENIED',
        message: 'You are not authorized to cancel this booking.',
      });
    }

    if (
      booking.status === BookingStatus.CANCELLED_BY_USER ||
      booking.status === BookingStatus.CANCELLED_BY_ADMIN ||
      booking.status === BookingStatus.TRIP_COMPLETED
    ) {
      throw new BadRequestException({
        errorCode: 'EBS_ALREADY_CANCELLED',
        message: `Booking is already in '${booking.status}' state.`,
      });
    }

    const refundEstimate = this.calculateCancellationRefund(bookingId);

    // Restore slots to batch inventory
    const currentSlots = this.inventoryService.getAvailableSlots(booking.batchId, 20);
    this.inventoryService.setAvailableSlots(
      booking.batchId,
      currentSlots + booking.participantCount,
    );

    booking.status = BookingStatus.CANCELLED_BY_USER;
    booking.updatedAt = new Date().toISOString();
    this.bookings.set(bookingId, booking);

    this.logger.log(
      `Booking ${booking.orderNumber} cancelled by user ${userId}. Reason: ${dto.reason}. Refund %: ${refundEstimate.refundPercentage}%`,
    );

    return {
      booking,
      refundEstimate,
    };
  }

  // =========================================================================
  // 5. WAITLIST & USER DASHBOARD
  // =========================================================================

  /**
   * Allows user to join waitlist for a sold-out batch.
   */
  async joinWaitlist(
    userId: string,
    dto: WaitlistJoinDto,
    userName?: string,
    userEmail?: string,
  ): Promise<WaitlistEntryEntity> {
    const batch = this.batches.get(dto.batchId);
    if (!batch) {
      throw new NotFoundException(`Batch ${dto.batchId} not found.`);
    }

    return this.inventoryService.addToWaitlist(
      dto.batchId,
      userId,
      dto.partySize,
      dto.contactPhone,
      userName,
      userEmail,
    );
  }

  /**
   * Retrieves active and past bookings for a specific traveler.
   */
  async getTravellerBookings(userId: string): Promise<BookingOrder[]> {
    return Array.from(this.bookings.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Retrieves single booking order details.
   */
  async getBookingById(bookingId: string, userId: string): Promise<BookingOrder> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking order ${bookingId} not found.`);
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Access denied to booking order.');
    }

    return booking;
  }

  /**
   * Internal lookup by ID or order number (used by payment orchestration & webhooks).
   */
  getBookingInternal(bookingIdOrOrderNumber: string): BookingOrder | undefined {
    let booking = this.bookings.get(bookingIdOrOrderNumber);
    if (!booking) {
      booking = Array.from(this.bookings.values()).find(
        b => b.orderNumber === bookingIdOrOrderNumber,
      );
    }
    return booking;
  }

  /**
   * Internal batch lookup.
   */
  getBatchInternal(batchId: string): BatchEntity | undefined {
    return this.batches.get(batchId);
  }

  /**
   * Internal experience lookup.
   */
  getExperienceInternal(experienceId: string): ExperienceEntity | undefined {
    return this.experiences.get(experienceId);
  }

  /**
   * Updates booking order state upon payment processing or refund.
   */
  updateBookingPaymentState(
    bookingId: string,
    status: BookingStatus,
    amountPaid: number,
    transactionId?: string,
  ): BookingOrder {
    const booking = this.getBookingInternal(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found.`);
    }

    booking.status = status;
    booking.advanceAmountPaid = (booking.advanceAmountPaid ?? 0) + amountPaid;
    booking.balanceAmountDue = Math.max(
      0,
      Math.round((booking.pricing.totalBookingAmount - booking.advanceAmountPaid) * 100) / 100,
    );
    if (transactionId) {
      booking.paymentTransactionId = transactionId;
    }
    booking.updatedAt = new Date().toISOString();

    // Commit inventory lock if confirmed
    if (status === BookingStatus.CONFIRMED) {
      try {
        this.inventoryService.commitReservation(booking.batchId, booking.id);
      } catch (err) {
        this.logger.debug(
          `Inventory commit for ${booking.id} already committed or not in locked map: ${err}`,
        );
      }
    }

    this.bookings.set(booking.id, booking);
    return booking;
  }

  // =========================================================================
  // 6. ADMIN & OPERATIONAL MANAGEMENT
  // =========================================================================

  /**
   * Retrieves all bookings with administrative search and filters.
   */
  async getAllAdminBookings(filter?: {
    status?: string;
    q?: string;
    batchId?: string;
  }): Promise<{ items: BookingOrder[]; total: number }> {
    let items = Array.from(this.bookings.values());

    if (filter?.status) {
      items = items.filter(b => b.status === filter.status);
    }

    if (filter?.batchId) {
      items = items.filter(b => b.batchId === filter.batchId);
    }

    if (filter?.q) {
      const qLower = filter.q.toLowerCase();
      items = items.filter(
        b =>
          b.orderNumber.toLowerCase().includes(qLower) ||
          b.experienceTitle.toLowerCase().includes(qLower) ||
          b.id.toLowerCase().includes(qLower),
      );
    }

    return {
      items,
      total: items.length,
    };
  }

  /**
   * Creates a new departure batch (Admin).
   */
  async createBatch(dto: CreateBatchDto): Promise<BatchEntity> {
    const experience = this.experiences.get(dto.experienceId);
    if (!experience) {
      throw new NotFoundException(`Experience ${dto.experienceId} does not exist.`);
    }

    const batchId = `bat-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBatch: BatchEntity = {
      id: batchId,
      experienceId: dto.experienceId,
      batchStartDate: dto.batchStartDate,
      batchEndDate: dto.batchEndDate,
      reportingTime: dto.reportingTime,
      totalCapacity: dto.totalCapacity,
      availableSlots: dto.totalCapacity,
      batchPriceInr: dto.batchPriceInr,
      leadGuideUserId: dto.leadGuideUserId,
      status: BatchStatus.OPEN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.batches.set(batchId, newBatch);
    this.inventoryService.setAvailableSlots(batchId, dto.totalCapacity);

    this.logger.log(
      `Admin created Batch ${batchId} for '${experience.title}' with capacity ${dto.totalCapacity}.`,
    );
    return newBatch;
  }

  /**
   * Updates an existing departure batch (Admin).
   */
  async updateBatch(batchId: string, dto: UpdateBatchDto): Promise<BatchEntity> {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found.`);
    }

    if (dto.totalCapacity !== undefined) {
      const diff = dto.totalCapacity - batch.totalCapacity;
      batch.totalCapacity = dto.totalCapacity;
      const currentAvailable = this.inventoryService.getAvailableSlots(
        batchId,
        batch.totalCapacity,
      );
      this.inventoryService.setAvailableSlots(batchId, Math.max(0, currentAvailable + diff));
    }

    if (dto.batchPriceInr !== undefined) {
      batch.batchPriceInr = dto.batchPriceInr;
    }

    if (dto.status !== undefined) {
      batch.status = dto.status as BatchStatus;
    }

    if (dto.leadGuideUserId !== undefined) {
      batch.leadGuideUserId = dto.leadGuideUserId;
    }

    batch.updatedAt = new Date().toISOString();
    this.batches.set(batchId, batch);
    return batch;
  }

  /**
   * Generates participant manifest for trek leaders.
   */
  async getBatchManifest(batchId: string): Promise<BatchManifestDto> {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found.`);
    }

    const experience = this.experiences.get(batch.experienceId);
    const batchBookings = Array.from(this.bookings.values()).filter(
      b => b.batchId === batchId && b.status !== BookingStatus.CANCELLED_BY_USER,
    );

    const manifestParticipants: BatchManifestDto['participants'] = [];
    let confirmedCount = 0;
    let lockedCount = 0;

    for (const bkg of batchBookings) {
      if (
        bkg.status === BookingStatus.CONFIRMED ||
        bkg.status === BookingStatus.PARTIALLY_PAID ||
        bkg.status === BookingStatus.FULLY_PAID
      ) {
        confirmedCount += bkg.participantCount;
      } else if (bkg.status === BookingStatus.PENDING_PAYMENT) {
        lockedCount += bkg.participantCount;
      }

      for (const p of bkg.participants) {
        manifestParticipants.push({
          participantId: p.id,
          bookingNumber: bkg.orderNumber,
          fullName: p.fullName,
          age: p.age,
          gender: p.gender,
          emergencyContactName: p.emergencyContactName,
          emergencyContactPhone: p.emergencyContactPhone,
          foodPreference: p.foodPreference,
          experienceLevel: p.experienceLevel,
          hasMedicalDisclosures: !!p.encryptedMedicalDeclarations,
          isAttendanceVerified: p.isAttendanceVerified,
        });
      }
    }

    const availableSlots = this.inventoryService.getAvailableSlots(batchId, batch.totalCapacity);

    return {
      batchId,
      experienceTitle: experience?.title || 'Expedition',
      startDate: batch.batchStartDate,
      endDate: batch.batchEndDate,
      reportingTime: batch.reportingTime,
      totalCapacity: batch.totalCapacity,
      confirmedCount,
      lockedCount,
      availableSlots,
      participants: manifestParticipants,
    };
  }

  // =========================================================================
  // 7. SEED DATA GENERATOR
  // =========================================================================

  private seedCatalogueData(): void {
    // 1. Torna (Prachandagad) Monsoon Fortress Ascent
    const expTorna: ExperienceEntity = {
      id: 'exp-torna-fort-ascent',
      title: 'Torna Fort (Prachandagad) Monsoon Ridge Trek',
      slug: 'torna-fort-monsoon-ridge-trek',
      categorySlug: 'treks',
      experienceType: ExperienceType.TREK,
      difficulty: DifficultyLevel.MODERATE,
      durationDays: 2,
      durationNights: 1,
      maxAltitudeMeters: 1403,
      totalTrekDistanceKm: 14.5,
      basePriceInr: 2850,
      mandatoryUpfrontPercentage: 25,
      overviewDescription:
        'Conquer Prachandagad ("The Massive Fort"), the historic citadel captured by Chhatrapati Shivaji Maharaj in 1646 at age 16. Features the dramatic Zunjar Machi ridge walk and misty Sahyadri valleys.',
      inclusions: [
        'Certified Wilderness First Aid Trek Leader',
        'Tented Accommodation on Torna Plateau',
        'Traditional Maharashtrian Meals (Pithla Bhakri, Thecha)',
        'Forest Entry Permits & Safety Equipment',
      ],
      exclusions: [
        'Personal Backpacks and Walking Sticks',
        'Travel Insurance',
        'Transit to Velhe Base Camp',
      ],
      itineraryDaywise: [
        {
          dayNumber: 1,
          title: 'Ascent from Velhe to Torna Ridge',
          description:
            'Assembly at Velhe Gram Panchayat. 4-hour ridge climb via Mengai Goddess temple.',
          altitudeMeters: 1403,
          elevationGainMeters: 750,
          trailDistanceKm: 7.2,
          mealsProvided: ['Breakfast', 'Packed Lunch', 'Campfire Dinner'],
          accommodationType: 'Alpine Tents',
        },
        {
          dayNumber: 2,
          title: 'Budhla Machi Exploration & Descent',
          description:
            'Sunrise exploration of Zunjar and Budhla Machi ridges followed by descent to Velhe.',
          altitudeMeters: 1200,
          elevationGainMeters: -750,
          trailDistanceKm: 7.3,
          mealsProvided: ['Breakfast', 'Traditional Village Lunch'],
          accommodationType: 'Return Transit',
        },
      ],
      packingList: [
        'High-traction trekking shoes with deep treads',
        'Rain poncho or waterproof jacket (Sahyadri monsoon)',
        'Headlamp with extra batteries',
        '2 Litres reusable hydration pack',
        'Personal medical kit & blister care',
      ],
      medicalGuidelines:
        'Participants must possess good cardiovascular health. Not suitable for individuals with unmanaged vertigo or severe chronic respiratory ailments.',
      cancellationPolicy: [
        { minDaysBeforeDeparture: 30, refundPercentage: 90, description: '30+ days: 90% refund' },
        {
          minDaysBeforeDeparture: 15,
          maxDaysBeforeDeparture: 29,
          refundPercentage: 50,
          description: '15-29 days: 50% refund',
        },
        {
          minDaysBeforeDeparture: 7,
          maxDaysBeforeDeparture: 14,
          refundPercentage: 25,
          description: '7-14 days: 25% refund',
        },
        {
          minDaysBeforeDeparture: 0,
          maxDaysBeforeDeparture: 6,
          refundPercentage: 0,
          description: '<7 days: Non-refundable',
        },
      ],
      meetingPointName: 'Gram Panchayat Bhavan, Velhe, Pune District',
      meetingPointCoords: { latitude: 18.2975, longitude: 73.6339 },
      heroImageUrl: '/images/experiences/torna-fort.jpg',
      galleryImages: ['/images/experiences/torna-1.jpg', '/images/experiences/torna-2.jpg'],
      isPublished: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    // 2. Hampta Pass Himalayan Crossover Expedition
    const expHampta: ExperienceEntity = {
      id: 'exp-hampta-pass-crossover',
      title: 'Hampta Pass & Chandratal Alpine Crossover',
      slug: 'hampta-pass-chandratal-crossover',
      categorySlug: 'expeditions',
      experienceType: ExperienceType.EXPEDITION,
      difficulty: DifficultyLevel.CHALLENGING,
      durationDays: 5,
      durationNights: 4,
      maxAltitudeMeters: 4287,
      totalTrekDistanceKm: 35.0,
      basePriceInr: 12500,
      mandatoryUpfrontPercentage: 30,
      overviewDescription:
        'A dramatic transition from lush green Kullu valleys to the stark, rain-shadow deserts of Spiti Valley, concluding at the turquoise crescent of Chandratal Lake.',
      inclusions: [
        'UIAA Certified Mountain Guides & Safety Marshals',
        'All High-Altitude Camping Gear & Four-Season Tents',
        'High-Calorie Mountain Cuisine (All Meals)',
        'Oxygen Cylinders & Pulse Oximeters',
      ],
      exclusions: ['Transit to Manali Base', 'Personal Porter Hire', 'Cold-Weather Sleeping Bags'],
      itineraryDaywise: [
        {
          dayNumber: 1,
          title: 'Manali to Jobra & Trek to Chika',
          description:
            'Scenic pine forest drive followed by gentle acclimatization walk along Rani Nallah.',
          altitudeMeters: 3100,
          elevationGainMeters: 550,
          trailDistanceKm: 5.0,
          mealsProvided: ['Packed Lunch', 'Dinner'],
          accommodationType: 'Alpine Tents',
        },
      ],
      packingList: [
        'Down feather jacket (-10C rated)',
        'Waterproof trekking boots with ankle support',
      ],
      medicalGuidelines: 'Mandatory medical clearance and physical fitness verification required.',
      cancellationPolicy: [
        { minDaysBeforeDeparture: 30, refundPercentage: 90, description: '30+ days: 90% refund' },
        {
          minDaysBeforeDeparture: 15,
          maxDaysBeforeDeparture: 29,
          refundPercentage: 50,
          description: '15-29 days: 50% refund',
        },
        {
          minDaysBeforeDeparture: 7,
          maxDaysBeforeDeparture: 14,
          refundPercentage: 25,
          description: '7-14 days: 25% refund',
        },
        {
          minDaysBeforeDeparture: 0,
          maxDaysBeforeDeparture: 6,
          refundPercentage: 0,
          description: '<7 days: Non-refundable',
        },
      ],
      meetingPointName: 'Old Manali Base Office, Himachal Pradesh',
      meetingPointCoords: { latitude: 32.2396, longitude: 77.1887 },
      isPublished: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    // 3. Velhe & Bhor Heritage Crafts Immersion
    const expCrafts: ExperienceEntity = {
      id: 'exp-velhe-heritage-immersion',
      title: 'Velhe Folk Arts & Warli Masterclass Immersion',
      slug: 'velhe-folk-arts-warli-immersion',
      categorySlug: 'rural-homestays',
      experienceType: ExperienceType.RURAL_HOMESTAY,
      difficulty: DifficultyLevel.EASY,
      durationDays: 2,
      durationNights: 1,
      maxAltitudeMeters: 640,
      totalTrekDistanceKm: 4.0,
      basePriceInr: 3200,
      mandatoryUpfrontPercentage: 25,
      overviewDescription:
        'Stay with local village hosts in Velhe, study traditional Warli painting with master artisans, sample farm-to-table organic meals, and support rural empowerment.',
      inclusions: [
        'Heritage Village Homestay Accommodations',
        'Warli Art Workshop with Traditional Canvas & Brushes',
        'Authentic Farm-to-Table Organic Meals',
      ],
      exclusions: ['Personal Shopping', 'Private Vehicle Transit'],
      itineraryDaywise: [
        {
          dayNumber: 1,
          title: 'Village Welcoming & Artisan Studio Tour',
          description:
            'Traditional welcome, settle into homestay, evening Warli fresco painting workshop.',
          altitudeMeters: 620,
          mealsProvided: ['Welcome Drinks', 'Village Lunch', 'Evening Feast'],
          accommodationType: 'Village Homestay',
        },
      ],
      packingList: ['Casual comfortable cotton attire', 'Personal toiletries'],
      medicalGuidelines: 'Accessible to all ages and fitness levels.',
      cancellationPolicy: [
        { minDaysBeforeDeparture: 30, refundPercentage: 90, description: '30+ days: 90% refund' },
        {
          minDaysBeforeDeparture: 15,
          maxDaysBeforeDeparture: 29,
          refundPercentage: 50,
          description: '15-29 days: 50% refund',
        },
        {
          minDaysBeforeDeparture: 7,
          maxDaysBeforeDeparture: 14,
          refundPercentage: 25,
          description: '7-14 days: 25% refund',
        },
        {
          minDaysBeforeDeparture: 0,
          maxDaysBeforeDeparture: 6,
          refundPercentage: 0,
          description: '<7 days: Non-refundable',
        },
      ],
      meetingPointName: 'Gram Panchayat Bhavan, Velhe',
      meetingPointCoords: { latitude: 18.2975, longitude: 73.6339 },
      isPublished: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    this.experiences.set(expTorna.id, expTorna);
    this.experiences.set(expHampta.id, expHampta);
    this.experiences.set(expCrafts.id, expCrafts);

    // Seed Batches
    const batch1: BatchEntity = {
      id: 'bat-torna-oct-01',
      experienceId: expTorna.id,
      batchStartDate: '2026-10-17',
      batchEndDate: '2026-10-18',
      reportingTime: '06:30 AM at Velhe',
      totalCapacity: 20,
      availableSlots: 18,
      batchPriceInr: 2850,
      status: BatchStatus.OPEN,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const batch2: BatchEntity = {
      id: 'bat-torna-oct-02',
      experienceId: expTorna.id,
      batchStartDate: '2026-10-24',
      batchEndDate: '2026-10-25',
      reportingTime: '06:30 AM at Velhe',
      totalCapacity: 15,
      availableSlots: 3,
      batchPriceInr: 2850,
      status: BatchStatus.FILLING_FAST,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const batchSoldOut: BatchEntity = {
      id: 'bat-hampta-diwali',
      experienceId: expHampta.id,
      batchStartDate: '2026-11-01',
      batchEndDate: '2026-11-05',
      reportingTime: '08:00 AM at Manali',
      totalCapacity: 12,
      availableSlots: 0,
      batchPriceInr: 12500,
      status: BatchStatus.SOLD_OUT,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    this.batches.set(batch1.id, batch1);
    this.batches.set(batch2.id, batch2);
    this.batches.set(batchSoldOut.id, batchSoldOut);

    this.inventoryService.setAvailableSlots(batch1.id, 18);
    this.inventoryService.setAvailableSlots(batch2.id, 3);
    this.inventoryService.setAvailableSlots(batchSoldOut.id, 0);

    // Seed Add-ons
    this.addons.set('addon-sleeping-bag', {
      id: 'addon-sleeping-bag',
      name: 'Sub-Zero Sleeping Bag Rental',
      description: 'Sterilized -5C rated sleeping bag with fresh fleece inner liner',
      priceInr: 350,
      addonType: AddonType.EQUIPMENT,
      isActive: true,
    });
    this.addons.set('addon-trekking-poles', {
      id: 'addon-trekking-poles',
      name: 'Anti-Shock Trekking Poles (Pair)',
      description: 'Lightweight aluminum carbon-fiber telescoping poles',
      priceInr: 200,
      addonType: AddonType.EQUIPMENT,
      isActive: true,
    });
    this.addons.set('addon-personal-porter', {
      id: 'addon-personal-porter',
      name: 'Dedicated Personal Trail Porter',
      description: 'Carries your 10kg rucksack throughout the expedition',
      priceInr: 1800,
      addonType: AddonType.UPGRADE,
      isActive: true,
    });

    // Seed Coupons
    this.coupons.set('BHARAT10', {
      id: 'cpn-bharat-10',
      code: 'BHARAT10',
      description: '10% Launch Discount on all experiences',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minOrderAmountInr: 2000,
      maxDiscountInr: 1500,
      validUntil: '2026-12-31',
      isActive: true,
    });
    this.coupons.set('DIWALI2026', {
      id: 'cpn-diwali',
      code: 'DIWALI2026',
      description: 'Special Festive Discount ₹500 off',
      discountType: DiscountType.FLAT,
      discountValue: 500,
      minOrderAmountInr: 3000,
      validUntil: '2026-11-30',
      isActive: true,
    });
  }
}
