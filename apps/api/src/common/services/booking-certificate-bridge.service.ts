// Explore Bharat Safar — Section 4: Booking-Certificate Domain Bridge Service
// Reference: EBS-BLU-49-REPO Section 7.2 & 10.1 (Architecture Boundaries & Decoupled Domain Integration)

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  BookingStatus,
  BatchStatus,
  ExperienceType,
  DifficultyLevel,
  FoodPreference,
  TrekExperienceLevel,
  type BookingOrder,
  type BatchEntity,
  type ExperienceEntity,
  type BookingParticipantEntity,
} from '@ebs/types';

export interface EnrichedParticipantInfo {
  participant: BookingParticipantEntity;
  booking: BookingOrder;
  batch: BatchEntity;
  experience: ExperienceEntity;
}

@Injectable()
export class BookingCertificateBridgeService {
  private readonly logger = new Logger(BookingCertificateBridgeService.name);

  private readonly bookings = new Map<string, BookingOrder>();
  private readonly batches = new Map<string, BatchEntity>();
  private readonly experiences = new Map<string, ExperienceEntity>();
  private readonly finalizedBatches = new Set<string>();

  constructor() {
    this.seedInitialState();
  }

  /**
   * Registers a booking order in the bridge registry.
   */
  registerBooking(booking: BookingOrder): void {
    this.bookings.set(booking.id, booking);
    if (booking.orderNumber) {
      this.bookings.set(booking.orderNumber, booking);
    }
  }

  /**
   * Retrieves a booking by primary UUID or order number.
   */
  getBooking(bookingIdOrNumber: string): BookingOrder | undefined {
    let booking = this.bookings.get(bookingIdOrNumber);
    if (!booking) {
      booking = Array.from(this.bookings.values()).find(b => b.orderNumber === bookingIdOrNumber);
    }
    return booking;
  }

  /**
   * Retrieves batch entity by UUID.
   */
  getBatch(batchId: string): BatchEntity | undefined {
    return this.batches.get(batchId);
  }

  /**
   * Retrieves experience entity by UUID.
   */
  getExperience(experienceId: string): ExperienceEntity | undefined {
    return this.experiences.get(experienceId);
  }

  /**
   * Checks if an expedition batch has been formally finalized by Admin.
   */
  isBatchFinalized(batchId: string): boolean {
    return this.finalizedBatches.has(batchId);
  }

  /**
   * Finalizes an expedition batch.
   */
  finalizeBatch(batchId: string, notes?: string): BatchEntity {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found.`);
    }

    const updated: BatchEntity = {
      ...batch,
      status: BatchStatus.COMPLETED,
    };
    this.batches.set(batchId, updated);
    this.finalizedBatches.add(batchId);

    this.logger.log(`Expedition Batch ${batchId} marked FINALIZED. Notes: ${notes || 'None'}`);
    return updated;
  }

  /**
   * Updates attendance verification state for a participant.
   */
  verifyParticipantAttendance(
    bookingId: string,
    participantId: string,
    isAttendanceVerified: boolean,
  ): BookingParticipantEntity {
    const booking = this.getBooking(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found.`);
    }

    const participant = booking.participants.find(p => p.id === participantId);
    if (!participant) {
      throw new NotFoundException(
        `Participant ${participantId} not found on booking ${bookingId}.`,
      );
    }

    participant.isAttendanceVerified = isAttendanceVerified;
    this.registerBooking(booking);
    return participant;
  }

  /**
   * Settles any outstanding balance due on a booking.
   */
  settleBookingBalance(bookingId: string): BookingOrder {
    const booking = this.getBooking(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found.`);
    }

    const updated: BookingOrder = {
      ...booking,
      balanceAmountDue: 0,
      pricing: {
        ...booking.pricing,
        outstandingBalanceDue: 0,
      },
    };
    this.registerBooking(updated);
    return updated;
  }

  /**
   * Retrieves complete participant, booking, batch, and experience context for certificate generation.
   */
  getParticipantContext(
    bookingId: string,
    participantId: string,
  ): EnrichedParticipantInfo | undefined {
    const booking = this.getBooking(bookingId);
    if (!booking) return undefined;

    const participant = booking.participants.find(p => p.id === participantId);
    if (!participant) return undefined;

    const batch = this.getBatch(booking.batchId);
    if (!batch) return undefined;

    const experience = this.getExperience(batch.experienceId);
    if (!experience) return undefined;

    return {
      participant,
      booking,
      batch,
      experience,
    };
  }

  /**
   * Seeds deterministic demo and test data.
   */
  private seedInitialState(): void {
    const exp1: ExperienceEntity = {
      id: 'exp_harishchandragad_001',
      title: 'Harishchandragad Monsoon Escarpment Trek',
      slug: 'harishchandragad-monsoon-trek',
      categorySlug: 'trek',
      experienceType: ExperienceType.TREK,
      difficulty: DifficultyLevel.MODERATE,
      durationDays: 2,
      durationNights: 1,
      maxAltitudeMeters: 1422,
      totalTrekDistanceKm: 18,
      basePriceInr: 4000,
      mandatoryUpfrontPercentage: 20,
      overviewDescription: 'Historical hill fort in the Western Ghats known for Kokankada cliff.',
      inclusions: ['Guide', 'Tents', 'Local Meals'],
      exclusions: ['Travel to base village'],
      itineraryDaywise: [],
      packingList: [],
      medicalGuidelines: 'Good physical endurance required.',
      cancellationPolicy: [],
      meetingPointName: 'Ahmednagar, Maharashtra',
      meetingPointCoords: { latitude: 19.3855, longitude: 73.7766 },
      isPublished: true,
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    };
    this.experiences.set(exp1.id, exp1);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    const batch1: BatchEntity = {
      id: 'batch_hari_2026_01',
      experienceId: exp1.id,
      batchStartDate: pastDateStr,
      batchEndDate: pastDateStr,
      reportingTime: '06:00 AM',
      totalCapacity: 25,
      availableSlots: 5,
      batchPriceInr: 4000,
      status: BatchStatus.COMPLETED,
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    };
    this.batches.set(batch1.id, batch1);
    this.finalizedBatches.add(batch1.id);

    const bkg1: BookingOrder = {
      id: 'bkg_sprint7_001',
      orderNumber: 'EBS-BKG-2026-000701',
      userId: 'usr_traveller_sprint2_001',
      batchId: batch1.id,
      experienceId: exp1.id,
      experienceTitle: exp1.title,
      participantCount: 1,
      status: BookingStatus.TRIP_COMPLETED,
      pricing: {
        basePriceTotal: 4000,
        addOnsTotal: 0,
        discountTotal: 0,
        subtotal: 3809.52,
        taxesGst: 190.48,
        convenienceFee: 0,
        totalBookingAmount: 4000,
        adminUpfrontPercentage: 100,
        mandatoryAdvanceDeposit: 4000,
        outstandingBalanceDue: 0,
      },
      advanceAmountPaid: 4000,
      balanceAmountDue: 0,
      paymentTransactionId: 'tx_sprint7_001',
      selectedAddons: [],
      termsVersion: '1.0.0',
      termsAcceptedAt: new Date().toISOString(),
      participants: [
        {
          id: 'part_sprint7_001',
          bookingId: 'bkg_sprint7_001',
          fullName: 'Amitabh Sharma',
          age: 28,
          gender: 'MALE',
          emergencyContactName: 'Rajesh Sharma',
          emergencyContactPhone: '9876543210',
          foodPreference: FoodPreference.VEG,
          experienceLevel: TrekExperienceLevel.BEGINNER,
          isAttendanceVerified: true,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.registerBooking(bkg1);
  }
}
