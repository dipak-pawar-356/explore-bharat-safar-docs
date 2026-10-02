// Explore Bharat Safar — Section 3: Bookings Service Unit Test Suite
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-26-RULES, EBS-DOC-36-STATE

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { BookingsService } from './bookings.service';
import { BookingInventoryService } from './booking-inventory.service';
import { DifficultyLevel, ExperienceType, BookingStatus, AddonType } from '@ebs/types';

describe('BookingsService — Domain Business Logic Suite', () => {
  let service: BookingsService;
  let inventoryService: BookingInventoryService;

  beforeEach(() => {
    inventoryService = new BookingInventoryService();
    service = new BookingsService(inventoryService);
  });

  describe('1. Catalogue & Experience Discovery', () => {
    it('should retrieve all published experiences with default pagination', async () => {
      const res = await service.getExperiences();
      assert.ok(res.items.length >= 3);
      assert.equal(res.page, 1);
      assert.ok(res.totalMatches >= 3);
      assert.ok(res.availableCategories.includes('treks'));
    });

    it('should filter experiences by difficulty level', async () => {
      const res = await service.getExperiences({ difficulty: DifficultyLevel.MODERATE });
      assert.ok(res.items.length >= 1);
      assert.ok(res.items.every(e => e.difficulty === DifficultyLevel.MODERATE));
    });

    it('should filter experiences by experience type', async () => {
      const res = await service.getExperiences({ experienceType: ExperienceType.EXPEDITION });
      assert.ok(res.items.length >= 1);
      assert.ok(res.items.every(e => e.experienceType === ExperienceType.EXPEDITION));
    });

    it('should search experiences by query string', async () => {
      const res = await service.getExperiences({ q: 'Torna' });
      assert.equal(res.items.length, 1);
      assert.ok(res.items[0]?.title.includes('Torna'));
    });

    it('should retrieve full experience dossier by slug with batches and addons', async () => {
      const dossier = await service.getExperienceBySlug('torna-fort-monsoon-ridge-trek');
      assert.ok(dossier.experience);
      assert.equal(dossier.experience.slug, 'torna-fort-monsoon-ridge-trek');
      assert.ok(dossier.batches.length >= 2);
      assert.ok(dossier.addons.length >= 1);
      assert.equal(dossier.experience.maxAltitudeMeters, 1403);
    });

    it('should throw NotFoundException for unknown experience slug', async () => {
      await assert.rejects(
        () => service.getExperienceBySlug('non-existent-trek-slug'),
        /not found/,
      );
    });
  });

  describe('2. Pricing Engine & Discount Calculation', () => {
    it('should calculate accurate pricing with 5% GST and 25% upfront advance deposit', () => {
      const pricing = service.calculatePricing(
        2000, // Base price per participant
        2, // 2 participants
        [], // No addons
        undefined, // No coupon
        25, // 25% upfront
      );

      assert.equal(pricing.basePriceTotal, 4000);
      assert.equal(pricing.addOnsTotal, 0);
      assert.equal(pricing.subtotal, 4000);
      assert.equal(pricing.taxesGst, 200); // 5% of 4000
      assert.equal(pricing.totalBookingAmount, 4200); // 4000 + 200
      assert.equal(pricing.adminUpfrontPercentage, 25);
      assert.equal(pricing.mandatoryAdvanceDeposit, 1050); // 25% of 4200
      assert.equal(pricing.outstandingBalanceDue, 3150); // 4200 - 1050
    });

    it('should include add-on costs in gross subtotal and tax calculation', () => {
      const mockAddon = {
        id: 'addon-1',
        name: 'Tent Upgrade',
        priceInr: 500,
        addonType: AddonType.UPGRADE,
        isActive: true,
      };

      const pricing = service.calculatePricing(
        1000,
        1,
        [{ addon: mockAddon, quantity: 2 }],
        undefined,
        50,
      );

      assert.equal(pricing.basePriceTotal, 1000);
      assert.equal(pricing.addOnsTotal, 1000); // 500 * 2
      assert.equal(pricing.subtotal, 2000);
      assert.equal(pricing.taxesGst, 100); // 5% of 2000
      assert.equal(pricing.totalBookingAmount, 2100);
      assert.equal(pricing.mandatoryAdvanceDeposit, 1050); // 50% of 2100
      assert.equal(pricing.outstandingBalanceDue, 1050);
    });

    it('should apply valid percentage coupon code correctly', () => {
      const pricing = service.calculatePricing(
        3000,
        1,
        [],
        'BHARAT10', // 10% discount on min 2000
        100, // 100% full payment
      );

      assert.equal(pricing.basePriceTotal, 3000);
      assert.equal(pricing.discountTotal, 300); // 10% of 3000
      assert.equal(pricing.subtotal, 2700);
      assert.equal(pricing.taxesGst, 135); // 5% of 2700
      assert.equal(pricing.totalBookingAmount, 2835);
      assert.equal(pricing.mandatoryAdvanceDeposit, 2835);
      assert.equal(pricing.outstandingBalanceDue, 0);
    });
  });

  describe('3. Concurrency Slot Locking & Reservation Lifecycle', () => {
    it('should reserve slots, decrement available count, and set 15-minute lock', async () => {
      const initialAvailability = await service.getBatchAvailability('bat-torna-oct-01');
      const startingSlots = initialAvailability.availableSlots;

      const reservation = await service.reserveSlots('user-explorer-1', {
        batchId: 'bat-torna-oct-01',
        participants: [
          {
            fullName: 'Neha Kulkarni',
            age: 27,
            gender: 'FEMALE',
            emergencyContactName: 'Ramesh Kulkarni',
            emergencyContactPhone: '+919822112233',
            medicalDeclarations: 'Asthma (carries personal inhaler)',
          },
        ],
        termsAccepted: true,
        termsVersion: '2026.1',
      });

      assert.ok(reservation.bookingId);
      assert.ok(reservation.orderNumber.startsWith('EBS-ORD-'));
      assert.equal(reservation.status, BookingStatus.PENDING_PAYMENT);
      assert.equal(reservation.lockDurationSeconds, 900);

      // Verify batch available slots decreased by 1
      const updatedAvailability = await service.getBatchAvailability('bat-torna-oct-01');
      assert.equal(updatedAvailability.availableSlots, startingSlots - 1);
    });

    it('should reject reservation if terms & conditions are not accepted', async () => {
      await assert.rejects(
        () =>
          service.reserveSlots('user-explorer-2', {
            batchId: 'bat-torna-oct-01',
            participants: [
              {
                fullName: 'Test User',
                age: 25,
                gender: 'MALE',
                emergencyContactName: 'Contact',
                emergencyContactPhone: '+919822000000',
              },
            ],
            termsAccepted: false,
            termsVersion: '2026.1',
          }),
        /terms, safety waiver, and cancellation policy is mandatory/,
      );
    });

    it('should reject reservation with 409 Conflict if batch has insufficient capacity', async () => {
      // bat-hampta-diwali was seeded with 0 available slots
      await assert.rejects(
        () =>
          service.reserveSlots('user-explorer-3', {
            batchId: 'bat-hampta-diwali',
            participants: [
              {
                fullName: 'Late Booker',
                age: 30,
                gender: 'MALE',
                emergencyContactName: 'Contact',
                emergencyContactPhone: '+919822000000',
              },
            ],
            termsAccepted: true,
            termsVersion: '2026.1',
          }),
        /Selected departure batch is out of available capacity/,
      );
    });

    it('should confirm booking order and finalize reservation status', async () => {
      const reservation = await service.reserveSlots('user-confirm-test', {
        batchId: 'bat-torna-oct-01',
        participants: [
          {
            fullName: 'Rahul Joshi',
            age: 29,
            gender: 'MALE',
            emergencyContactName: 'Sunita Joshi',
            emergencyContactPhone: '+919822998877',
          },
        ],
        termsAccepted: true,
        termsVersion: '2026.1',
      });

      const confirmed = await service.confirmBooking(reservation.bookingId, 'user-confirm-test');

      assert.equal(confirmed.status, BookingStatus.CONFIRMED);
      assert.equal(confirmed.id, reservation.bookingId);
    });
  });

  describe('4. Cancellation & Refund Policy Rules', () => {
    it('should compute cancellation deduction tiers accurately based on departure window', async () => {
      const reservation = await service.reserveSlots('user-cancel-test', {
        batchId: 'bat-torna-oct-01',
        participants: [
          {
            fullName: 'Aniket Shinde',
            age: 26,
            gender: 'MALE',
            emergencyContactName: 'Tanvi Shinde',
            emergencyContactPhone: '+919822445566',
          },
        ],
        termsAccepted: true,
        termsVersion: '2026.1',
      });

      const estimate = service.calculateCancellationRefund(reservation.bookingId);
      assert.equal(estimate.bookingId, reservation.bookingId);
      assert.ok(estimate.refundPercentage >= 0 && estimate.refundPercentage <= 90);
      assert.equal(
        estimate.eligibleRefundAmount + estimate.cancellationFee,
        estimate.totalAmountPaid,
      );
    });

    it('should execute cancellation and restore slots to batch inventory', async () => {
      const initialAvailability = await service.getBatchAvailability('bat-torna-oct-01');
      const startSlots = initialAvailability.availableSlots;

      const reservation = await service.reserveSlots('user-cancel-exec', {
        batchId: 'bat-torna-oct-01',
        participants: [
          {
            fullName: 'Priya Verma',
            age: 24,
            gender: 'FEMALE',
            emergencyContactName: 'Verma Contact',
            emergencyContactPhone: '+919822334455',
          },
        ],
        termsAccepted: true,
        termsVersion: '2026.1',
      });

      // Confirm first
      await service.confirmBooking(reservation.bookingId, 'user-cancel-exec');

      // Now cancel
      const cancelResult = await service.cancelBooking(reservation.bookingId, 'user-cancel-exec', {
        reason: 'Severe fever and illness',
        confirmCancellation: true,
      });

      assert.equal(cancelResult.booking.status, BookingStatus.CANCELLED_BY_USER);

      // Verify slot restored
      const afterCancelAvailability = await service.getBatchAvailability('bat-torna-oct-01');
      assert.equal(afterCancelAvailability.availableSlots, startSlots);
    });
  });

  describe('5. Waitlist System', () => {
    it('should allow user to join waitlist for a batch', async () => {
      const waitlistEntry = await service.joinWaitlist(
        'user-waitlist-1',
        {
          batchId: 'bat-hampta-diwali',
          partySize: 2,
          contactPhone: '+919822778899',
        },
        'Kunal Sen',
        'kunal@bharat.in',
      );

      assert.ok(waitlistEntry.id.startsWith('wl-'));
      assert.equal(waitlistEntry.batchId, 'bat-hampta-diwali');
      assert.equal(waitlistEntry.partySize, 2);
      assert.equal(waitlistEntry.status, 'WAITING');

      const batchInfo = await service.getBatchAvailability('bat-hampta-diwali');
      assert.ok(batchInfo.waitlistCount >= 1);
    });
  });

  describe('6. Admin Operations & Participant Manifests', () => {
    it('should allow admin to create a new departure batch', async () => {
      const newBatch = await service.createBatch({
        experienceId: 'exp-torna-fort-ascent',
        batchStartDate: '2026-11-20',
        batchEndDate: '2026-11-21',
        reportingTime: '06:00 AM at Basecamp',
        totalCapacity: 25,
        batchPriceInr: 3000,
      });

      assert.ok(newBatch.id.startsWith('bat-'));
      assert.equal(newBatch.totalCapacity, 25);
      assert.equal(newBatch.availableSlots, 25);

      const availability = await service.getBatchAvailability(newBatch.id);
      assert.equal(availability.availableSlots, 25);
    });

    it('should generate an expedition manifest for trek leaders', async () => {
      const manifest = await service.getBatchManifest('bat-torna-oct-01');
      assert.equal(manifest.batchId, 'bat-torna-oct-01');
      assert.ok(manifest.experienceTitle.includes('Torna'));
      assert.ok(manifest.totalCapacity >= 15);
      assert.ok(Array.isArray(manifest.participants));
    });
  });
});
