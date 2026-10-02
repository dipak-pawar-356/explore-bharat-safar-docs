// Explore Bharat Safar — Section 3: Travel Booking Engine End-to-End Suite
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-09-API, EBS-DOC-26-RULES, EBS-DOC-36-STATE

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { BookingsService } from './bookings.service';
import { BookingInventoryService } from './booking-inventory.service';
import { BookingsController } from './bookings.controller';
import {
  BookingStatus,
  DifficultyLevel,
  BatchStatus,
  FoodPreference,
  TrekExperienceLevel,
} from '@ebs/types';

describe('Bookings & Experiences System — End-to-End Enterprise Lifecycle', () => {
  let inventoryService: BookingInventoryService;
  let bookingsService: BookingsService;
  let bookingsController: BookingsController;

  const testTravellerId = 'usr-e2e-traveller-001';
  const secondTravellerId = 'usr-e2e-traveller-002';

  before(() => {
    inventoryService = new BookingInventoryService();
    bookingsService = new BookingsService(inventoryService);
    bookingsController = new BookingsController(bookingsService);
  });

  it('should execute full 9-stage Travel Booking & Adventure lifecycle with inventory integrity and DPDP compliance', async () => {
    // -------------------------------------------------------------
    // STAGE 1: Discover Experience Catalog & Filter by Category
    // -------------------------------------------------------------
    const catalogRes = await bookingsController.getExperiences({
      difficulty: 'MODERATE',
    });
    assert.equal(catalogRes.status, 'success');
    assert.ok(catalogRes.data.items.length >= 1);
    const tornaExperience = catalogRes.data.items.find(
      e => e.slug === 'torna-fort-monsoon-ridge-trek',
    );
    assert.ok(tornaExperience, 'Torna Fort experience must be present in catalog');
    assert.equal(tornaExperience.difficulty, DifficultyLevel.MODERATE);
    assert.equal(tornaExperience.maxAltitudeMeters, 1403);
    assert.equal(tornaExperience.mandatoryUpfrontPercentage, 25);

    // -------------------------------------------------------------
    // STAGE 2: Retrieve Full Experience Dossier & Departure Batches
    // -------------------------------------------------------------
    const dossierRes = await bookingsController.getExperienceBySlug(tornaExperience.slug);
    assert.equal(dossierRes.status, 'success');
    assert.equal(dossierRes.data.experience.id, tornaExperience.id);
    assert.ok(dossierRes.data.batches.length >= 2, 'Should have at least 2 scheduled batches');
    assert.ok(dossierRes.data.addons.length >= 1, 'Should have optional rental gear addons');

    const openBatch = dossierRes.data.batches.find(b => b.status === BatchStatus.OPEN);
    assert.ok(openBatch, 'Should find an OPEN departure batch');
    const initialBatchSlots = openBatch.availableSlots;
    assert.ok(initialBatchSlots >= 5, 'Batch should have ample starting capacity');

    // -------------------------------------------------------------
    // STAGE 3: Check Live Batch Availability
    // -------------------------------------------------------------
    const availabilityRes = await bookingsController.getBatchAvailability(openBatch.id);
    assert.equal(availabilityRes.status, 'success');
    assert.equal(availabilityRes.data.availableSlots, initialBatchSlots);
    assert.equal(availabilityRes.data.isBookingOpen, true);

    // -------------------------------------------------------------
    // STAGE 4: Atomic Slot Reservation with 15m Mutex Hold & DPDP Encryption
    // -------------------------------------------------------------
    const reservationRes = await bookingsController.reserveSlots(testTravellerId, {
      batchId: openBatch.id,
      participants: [
        {
          fullName: 'Arjun Sen',
          age: 29,
          gender: 'MALE',
          emergencyContactName: 'Geeta Sen',
          emergencyContactPhone: '+919822123456',
          foodPreference: FoodPreference.VEG,
          experienceLevel: TrekExperienceLevel.INTERMEDIATE,
          medicalDeclarations: 'Mild peanut allergy; carrying EpiPen',
        },
        {
          fullName: 'Meera Sen',
          age: 27,
          gender: 'FEMALE',
          emergencyContactName: 'Geeta Sen',
          emergencyContactPhone: '+919822123456',
          foodPreference: FoodPreference.VEG,
          experienceLevel: TrekExperienceLevel.BEGINNER,
          medicalDeclarations: 'None',
        },
      ],
      addonIds: ['addon-sleeping-bag'],
      couponCode: 'BHARAT10',
      termsAccepted: true,
      termsVersion: '2026.1',
    });

    assert.equal(reservationRes.status, 'success');
    const orderData = reservationRes.data;
    assert.ok(orderData.bookingId.startsWith('bkg-'));
    assert.ok(orderData.orderNumber.startsWith('EBS-ORD-'));
    assert.equal(orderData.status, BookingStatus.PENDING_PAYMENT);
    assert.equal(orderData.lockDurationSeconds, 900);

    // Check pricing math: 2 participants * 2850 = 5700 + 350 addon = 6050
    // 10% coupon = 605 discount -> subtotal 5445
    // 5% GST = 272.25 -> total 5717.25
    // 25% upfront advance deposit = 1429.31
    assert.equal(orderData.pricing.basePriceTotal, 5700);
    assert.equal(orderData.pricing.addOnsTotal, 350);
    assert.equal(orderData.pricing.discountTotal, 605);
    assert.equal(orderData.pricing.subtotal, 5445);
    assert.equal(orderData.pricing.taxesGst, 272.25);
    assert.equal(orderData.pricing.totalBookingAmount, 5717.25);
    assert.equal(orderData.pricing.adminUpfrontPercentage, 25);
    assert.equal(orderData.pricing.mandatoryAdvanceDeposit, 1429.31);
    assert.equal(orderData.pricing.outstandingBalanceDue, 4287.94);

    // Verify inventory slot count immediately decremented by 2
    const postReserveAvail = await bookingsController.getBatchAvailability(openBatch.id);
    assert.equal(postReserveAvail.data.availableSlots, initialBatchSlots - 2);

    // -------------------------------------------------------------
    // STAGE 5: Concurrency Protection (Prevent Overbooking)
    // -------------------------------------------------------------
    // Attempt to book more slots than remaining on batch with 3 seats left
    await assert.rejects(
      () =>
        bookingsController.reserveSlots(secondTravellerId, {
          batchId: 'bat-torna-oct-02',
          participants: Array.from({ length: 5 }).map((_, i) => ({
            fullName: `Excess Traveler ${i}`,
            age: 25,
            gender: 'MALE',
            emergencyContactName: 'Contact',
            emergencyContactPhone: '+919822000000',
          })),
          termsAccepted: true,
          termsVersion: '2026.1',
        }),
      /Selected departure batch is out of available capacity/,
    );

    // -------------------------------------------------------------
    // STAGE 6: Booking Confirmation & State Transition
    // -------------------------------------------------------------
    const confirmRes = await bookingsController.confirmBooking(
      orderData.bookingId,
      testTravellerId,
      { confirmDirect: true },
    );

    assert.equal(confirmRes.status, 'success');
    assert.equal(confirmRes.data.status, BookingStatus.CONFIRMED);
    assert.equal(confirmRes.data.id, orderData.bookingId);

    // Verify booking appears in Traveller's history
    const userBookings = await bookingsController.getTravellerBookings(testTravellerId);
    assert.equal(userBookings.status, 'success');
    assert.ok(userBookings.data.some(b => b.id === orderData.bookingId));

    // Verify booking detail view with DPDP encrypted medical declarations
    const bkgDetail = await bookingsController.getBookingById(orderData.bookingId, testTravellerId);
    assert.equal(bkgDetail.status, 'success');
    assert.equal(bkgDetail.data.participants.length, 2);
    // Medical notes must be encrypted format: iv:tag:ciphertext (never raw plaintext in DB)
    const arjunParticipant = bkgDetail.data.participants.find(p => p.fullName === 'Arjun Sen');
    assert.ok(arjunParticipant?.encryptedMedicalDeclarations);
    assert.ok(arjunParticipant.encryptedMedicalDeclarations.includes(':'));
    assert.equal(arjunParticipant.encryptedMedicalDeclarations.includes('EpiPen'), false);

    // -------------------------------------------------------------
    // STAGE 7: Expedition Leader Roster & Manifest Generation
    // -------------------------------------------------------------
    const manifestRes = await bookingsController.getBatchManifest(openBatch.id);
    assert.equal(manifestRes.status, 'success');
    assert.equal(manifestRes.data.batchId, openBatch.id);
    assert.ok(manifestRes.data.confirmedCount >= 2);
    const manifestArjun = manifestRes.data.participants.find(p => p.fullName === 'Arjun Sen');
    assert.ok(manifestArjun);
    assert.equal(manifestArjun.emergencyContactName, 'Geeta Sen');
    assert.equal(manifestArjun.emergencyContactPhone, '+919822123456');
    assert.equal(manifestArjun.hasMedicalDisclosures, true);

    // -------------------------------------------------------------
    // STAGE 8: Cancellation & Statutory Refund Policy Engine
    // -------------------------------------------------------------
    const cancelRes = await bookingsController.cancelBooking(orderData.bookingId, testTravellerId, {
      reason: 'Unforeseen work conflict prevents travel',
      confirmCancellation: true,
    });

    assert.equal(cancelRes.status, 'success');
    assert.equal(cancelRes.data.booking.status, BookingStatus.CANCELLED_BY_USER);
    assert.ok(cancelRes.data.refundEstimate.eligibleRefundAmount > 0);
    assert.ok(cancelRes.data.refundEstimate.cancellationFee >= 0);

    // Verify the 2 slots are restored back to batch availability
    const postCancelAvail = await bookingsController.getBatchAvailability(openBatch.id);
    assert.equal(postCancelAvail.data.availableSlots, initialBatchSlots);

    // -------------------------------------------------------------
    // STAGE 9: Waitlist Registration on Sold-Out Batch
    // -------------------------------------------------------------
    const soldOutBatchId = 'bat-hampta-diwali';
    const waitlistRes = await bookingsController.joinWaitlist(
      soldOutBatchId,
      secondTravellerId,
      'Vikram Malhotra',
      'vikram@bharat.in',
      {
        batchId: soldOutBatchId,
        partySize: 2,
        contactPhone: '+919822887766',
      },
    );

    assert.equal(waitlistRes.status, 'success');
    assert.ok(waitlistRes.data.id.startsWith('wl-'));
    assert.equal(waitlistRes.data.batchId, soldOutBatchId);
    assert.equal(waitlistRes.data.partySize, 2);

    const soldOutBatchAvail = await bookingsController.getBatchAvailability(soldOutBatchId);
    assert.ok(soldOutBatchAvail.data.waitlistCount >= 1);
  });
});
