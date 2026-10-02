// Explore Bharat Safar — Section 3: Bookings Controller Unit Test Suite
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-09-API

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { BookingsController } from './bookings.controller';
import type { BookingsService } from './bookings.service';
import {
  BookingStatus,
  DifficultyLevel,
  ExperienceType,
  BatchStatus,
  type PricingBreakdown,
} from '@ebs/types';

const dummyPricing: PricingBreakdown = {
  basePriceTotal: 2850,
  addOnsTotal: 0,
  discountTotal: 0,
  subtotal: 2850,
  taxesGst: 142.5,
  convenienceFee: 0,
  totalBookingAmount: 2992.5,
  adminUpfrontPercentage: 25,
  mandatoryAdvanceDeposit: 748.13,
  outstandingBalanceDue: 2244.37,
};

describe('BookingsController — API Gateway Layer', () => {
  let controller: BookingsController;
  let mockBookingsService: Partial<BookingsService>;

  beforeEach(() => {
    mockBookingsService = {
      getExperiences: async _filter => ({
        items: [
          {
            id: 'exp-1',
            title: 'Torna Fort Monsoon Trek',
            slug: 'torna-fort-monsoon-trek',
            categorySlug: 'treks',
            experienceType: ExperienceType.TREK,
            difficulty: DifficultyLevel.MODERATE,
            durationDays: 2,
            durationNights: 1,
            basePriceInr: 2850,
            mandatoryUpfrontPercentage: 25,
            overviewDescription: 'Historic Maratha fortress ascent',
            inclusions: ['Tents', 'Meals'],
            exclusions: ['Transport'],
            itineraryDaywise: [],
            packingList: [],
            medicalGuidelines: 'Standard fitness',
            cancellationPolicy: [],
            meetingPointName: 'Velhe',
            meetingPointCoords: { latitude: 18.2975, longitude: 73.6339 },
            isPublished: true,
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
          },
        ],
        totalMatches: 1,
        page: 1,
        limit: 20,
        availableCategories: ['treks'],
      }),
      getExperienceBySlug: async slug => ({
        experience: {
          id: 'exp-1',
          title: 'Torna Fort Monsoon Trek',
          slug,
          categorySlug: 'treks',
          experienceType: ExperienceType.TREK,
          difficulty: DifficultyLevel.MODERATE,
          durationDays: 2,
          durationNights: 1,
          basePriceInr: 2850,
          mandatoryUpfrontPercentage: 25,
          overviewDescription: 'Overview',
          inclusions: [],
          exclusions: [],
          itineraryDaywise: [],
          packingList: [],
          medicalGuidelines: '',
          cancellationPolicy: [],
          meetingPointName: 'Velhe',
          meetingPointCoords: { latitude: 18.2975, longitude: 73.6339 },
          isPublished: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        batches: [],
        addons: [],
      }),
      getBatchAvailability: async batchId => ({
        batch: {
          id: batchId,
          experienceId: 'exp-1',
          batchStartDate: '2026-10-17',
          batchEndDate: '2026-10-18',
          reportingTime: '06:00 AM',
          totalCapacity: 20,
          availableSlots: 15,
          batchPriceInr: 2850,
          status: BatchStatus.OPEN,
        },
        availableSlots: 15,
        isBookingOpen: true,
        waitlistCount: 0,
      }),
      reserveSlots: async (_userId, _dto) => ({
        bookingId: 'bkg-123',
        orderNumber: 'EBS-ORD-2026-99999',
        status: BookingStatus.PENDING_PAYMENT,
        pricing: dummyPricing,
        lockExpiresAt: '2026-09-30T12:15:00Z',
        lockDurationSeconds: 900,
      }),
      confirmBooking: async (bookingId, userId) => ({
        id: bookingId,
        orderNumber: 'EBS-ORD-2026-99999',
        userId,
        batchId: 'bat-1',
        experienceId: 'exp-1',
        experienceTitle: 'Torna Fort',
        participantCount: 1,
        status: BookingStatus.CONFIRMED,
        pricing: dummyPricing,
        participants: [],
        selectedAddons: [],
        termsVersion: '2026.1',
        termsAcceptedAt: '2026-09-30T12:00:00Z',
        createdAt: '2026-09-30T12:00:00Z',
        updatedAt: '2026-09-30T12:01:00Z',
      }),
      cancelBooking: async (bookingId, userId, _dto) => ({
        booking: {
          id: bookingId,
          orderNumber: 'EBS-ORD-2026-99999',
          userId,
          batchId: 'bat-1',
          experienceId: 'exp-1',
          experienceTitle: 'Torna Fort',
          participantCount: 1,
          status: BookingStatus.CANCELLED_BY_USER,
          pricing: dummyPricing,
          participants: [],
          selectedAddons: [],
          termsVersion: '2026.1',
          termsAcceptedAt: '2026-09-30T12:00:00Z',
          createdAt: '2026-09-30T12:00:00Z',
          updatedAt: '2026-09-30T12:05:00Z',
        },
        refundEstimate: {
          bookingId,
          daysBeforeDeparture: 35,
          totalAmountPaid: 2992.5,
          refundPercentage: 90,
          cancellationFee: 299.25,
          eligibleRefundAmount: 2693.25,
          policyTierNote: '30+ days prior: 90% refund',
        },
      }),
      getTravellerBookings: async userId => [
        {
          id: 'bkg-123',
          orderNumber: 'EBS-ORD-2026-99999',
          userId,
          batchId: 'bat-1',
          experienceId: 'exp-1',
          experienceTitle: 'Torna Fort',
          participantCount: 1,
          status: BookingStatus.CONFIRMED,
          pricing: dummyPricing,
          participants: [],
          selectedAddons: [],
          termsVersion: '2026.1',
          termsAcceptedAt: '2026-09-30T12:00:00Z',
          createdAt: '2026-09-30T12:00:00Z',
          updatedAt: '2026-09-30T12:01:00Z',
        },
      ],
      getBatchManifest: async batchId => ({
        batchId,
        experienceTitle: 'Torna Fort Trek',
        startDate: '2026-10-17',
        endDate: '2026-10-18',
        reportingTime: '06:00 AM',
        totalCapacity: 20,
        confirmedCount: 1,
        lockedCount: 0,
        availableSlots: 19,
        participants: [],
      }),
    };

    controller = new BookingsController(mockBookingsService as BookingsService);
  });

  it('should delegate getExperiences with envelope response', async () => {
    const res = await controller.getExperiences({});
    assert.equal(res.status, 'success');
    assert.equal(res.data.totalMatches, 1);
    assert.equal(res.data.items[0]?.title, 'Torna Fort Monsoon Trek');
  });

  it('should delegate getExperienceBySlug correctly', async () => {
    const res = await controller.getExperienceBySlug('torna-fort-monsoon-trek');
    assert.equal(res.status, 'success');
    assert.equal(res.data.experience.slug, 'torna-fort-monsoon-trek');
  });

  it('should delegate getBatchAvailability', async () => {
    const res = await controller.getBatchAvailability('bat-1');
    assert.equal(res.status, 'success');
    assert.equal(res.data.availableSlots, 15);
    assert.equal(res.data.isBookingOpen, true);
  });

  it('should delegate reserveSlots with user context and payload', async () => {
    const res = await controller.reserveSlots('usr-explorer', {
      batchId: 'bat-1',
      participants: [
        {
          fullName: 'Test Participant',
          age: 28,
          gender: 'MALE',
          emergencyContactName: 'Emergency',
          emergencyContactPhone: '+919822123456',
        },
      ],
      termsAccepted: true,
      termsVersion: '2026.1',
    });

    assert.equal(res.status, 'success');
    assert.equal(res.data.bookingId, 'bkg-123');
    assert.equal(res.data.status, BookingStatus.PENDING_PAYMENT);
  });

  it('should delegate confirmBooking', async () => {
    const res = await controller.confirmBooking('bkg-123', 'usr-explorer');
    assert.equal(res.status, 'success');
    assert.equal(res.data.status, BookingStatus.CONFIRMED);
  });

  it('should delegate cancelBooking and return refund estimate', async () => {
    const res = await controller.cancelBooking('bkg-123', 'usr-explorer', {
      reason: 'Trip postponed',
      confirmCancellation: true,
    });
    assert.equal(res.status, 'success');
    assert.equal(res.data.booking.status, BookingStatus.CANCELLED_BY_USER);
    assert.equal(res.data.refundEstimate.refundPercentage, 90);
  });

  it('should delegate getTravellerBookings', async () => {
    const res = await controller.getTravellerBookings('usr-explorer');
    assert.equal(res.status, 'success');
    assert.equal(res.data.length, 1);
  });

  it('should delegate getBatchManifest for admin', async () => {
    const res = await controller.getBatchManifest('bat-1');
    assert.equal(res.status, 'success');
    assert.equal(res.data.batchId, 'bat-1');
  });
});
