// Explore Bharat Safar — Section 4: Booking-Payment Domain Bridge Service
// Reference: EBS-BLU-49-REPO Section 7.2 & 10.1 (Architecture Boundaries & Decoupled Domain Integration)

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  BookingStatus,
  BatchStatus,
  FoodPreference,
  TrekExperienceLevel,
  type BookingOrder,
  type BatchEntity,
  type ExperienceEntity,
} from '@ebs/types';

@Injectable()
export class BookingPaymentBridgeService {
  private readonly logger = new Logger(BookingPaymentBridgeService.name);

  private readonly bookings = new Map<string, BookingOrder>();
  private readonly batches = new Map<string, BatchEntity>();
  private readonly experiences = new Map<string, ExperienceEntity>();

  constructor() {
    this.seedInitialState();
  }

  /**
   * Registers or updates a booking order in the bridge registry.
   */
  registerBooking(booking: BookingOrder): void {
    this.bookings.set(booking.id, booking);
    if (booking.orderNumber) {
      this.bookings.set(booking.orderNumber, booking);
    }
  }

  /**
   * Retrieves a booking by its primary ID or public order number.
   */
  getBooking(orderIdOrNumber: string): BookingOrder | undefined {
    let booking = this.bookings.get(orderIdOrNumber);
    if (!booking) {
      booking = Array.from(this.bookings.values()).find(b => b.orderNumber === orderIdOrNumber);
    }
    return booking;
  }

  /**
   * Retrieves all bookings for a given traveller user ID.
   */
  getTravellerBookings(userId: string): BookingOrder[] {
    const list = Array.from(new Set(this.bookings.values()));
    return list
      .filter(b => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Retrieves batch details.
   */
  getBatch(batchId: string): BatchEntity | undefined {
    return this.batches.get(batchId);
  }

  /**
   * Retrieves departure date for a batch or fallback.
   */
  getDepartureDate(batchId: string): Date {
    const batch = this.batches.get(batchId);
    if (batch?.batchStartDate) {
      return new Date(batch.batchStartDate);
    }
    return new Date(Date.now() + 30 * 86400000);
  }

  /**
   * Atomically updates payment state and status on a booking order.
   */
  updateBookingPaymentState(
    bookingId: string,
    status: BookingStatus,
    amountPaid: number,
    transactionId?: string,
  ): BookingOrder {
    const booking = this.getBooking(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking order ${bookingId} not found in bridge.`);
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

    this.bookings.set(booking.id, booking);
    if (booking.orderNumber) {
      this.bookings.set(booking.orderNumber, booking);
    }

    this.logger.log(
      `Bridge: Booking ${booking.orderNumber} state transitioned to ${status}. Advance paid: ${booking.advanceAmountPaid}, Balance due: ${booking.balanceAmountDue}`,
    );

    return booking;
  }

  private seedInitialState(): void {
    const batchId = 'batch-kedarkantha-2026-001';
    const expId = 'exp-kedarkantha-winter-summit';

    this.batches.set(batchId, {
      id: batchId,
      experienceId: expId,
      batchStartDate: new Date(Date.now() + 35 * 86400000).toISOString(),
      batchEndDate: new Date(Date.now() + 41 * 86400000).toISOString(),
      reportingTime: '06:00 AM Dehradun Railway Station',
      totalCapacity: 20,
      availableSlots: 16,
      batchPriceInr: 9500,
      status: BatchStatus.OPEN,
    });

    const defaultBookingId = 'bkg-demo-kedarkantha-001';
    const demoBooking: BookingOrder = {
      id: defaultBookingId,
      orderNumber: 'EBS-BKG-2026-000101',
      userId: 'usr_traveller_sprint2_001',
      userEmail: 'arjun.traveller@example.com',
      userName: 'Arjun Mehta',
      batchId,
      experienceId: expId,
      experienceTitle: 'Kedarkantha Winter Summit Expedition',
      participantCount: 2,
      status: BookingStatus.PENDING_PAYMENT,
      pricing: {
        basePriceTotal: 19000,
        addOnsTotal: 1200,
        discountTotal: 0,
        subtotal: 20200,
        taxesGst: 1010,
        convenienceFee: 150,
        totalBookingAmount: 21360,
        adminUpfrontPercentage: 20,
        mandatoryAdvanceDeposit: 4272,
        outstandingBalanceDue: 17088,
      },
      participants: [
        {
          id: 'part-01',
          bookingId: defaultBookingId,
          fullName: 'Arjun Mehta',
          age: 29,
          gender: 'Male',
          emergencyContactName: 'Sunita Mehta',
          emergencyContactPhone: '+919876543210',
          foodPreference: FoodPreference.VEG,
          experienceLevel: TrekExperienceLevel.BEGINNER,
          isAttendanceVerified: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'part-02',
          bookingId: defaultBookingId,
          fullName: 'Rohan Mehta',
          age: 27,
          gender: 'Male',
          emergencyContactName: 'Sunita Mehta',
          emergencyContactPhone: '+919876543210',
          foodPreference: FoodPreference.VEG,
          experienceLevel: TrekExperienceLevel.INTERMEDIATE,
          isAttendanceVerified: false,
          createdAt: new Date().toISOString(),
        },
      ],
      selectedAddons: [
        {
          addonId: 'addon-gaiters-rental',
          name: 'Waterproof Gaiters & Microspikes Rental',
          priceInr: 600,
          quantity: 2,
        },
      ],
      termsVersion: 'v2026.1',
      termsAcceptedAt: new Date().toISOString(),
      advanceAmountPaid: 0,
      balanceAmountDue: 21360,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.registerBooking(demoBooking);
  }

  clearAll(): void {
    this.bookings.clear();
    this.batches.clear();
    this.seedInitialState();
  }
}
