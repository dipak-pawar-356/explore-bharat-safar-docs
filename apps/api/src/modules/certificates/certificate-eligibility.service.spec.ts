// Explore Bharat Safar — Certificate Eligibility & Quality Gates Unit Tests
// Reference: EBS-DOC-20-CERT Section 2

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { BookingStatus } from '@ebs/types';
import { CertificateEligibilityService } from './certificate-eligibility.service';
import { BookingCertificateBridgeService } from '../../common/services/booking-certificate-bridge.service';

describe('CertificateEligibilityService', () => {
  let bridgeService: BookingCertificateBridgeService;
  let eligibilityService: CertificateEligibilityService;

  beforeEach(() => {
    bridgeService = new BookingCertificateBridgeService();
    eligibilityService = new CertificateEligibilityService(bridgeService);
  });

  it('should approve eligibility when all 6 systemic quality gates are met', () => {
    const result = eligibilityService.evaluateEligibility(
      'bkg_sprint7_001',
      'part_sprint7_001',
      false,
    );

    assert.equal(result.isEligible, true);
    assert.equal(result.reasons.length, 0);
    assert.equal(result.checks.experienceCompleted, true);
    assert.equal(result.checks.batchFinalized, true);
    assert.equal(result.checks.participantAttended, true);
    assert.equal(result.checks.notCancelled, true);
    assert.equal(result.checks.paymentsSettled, true);
    assert.equal(result.checks.notAlreadyIssued, true);
  });

  it('should block eligibility when on-trail attendance is missing', () => {
    // Un-verify attendance
    bridgeService.verifyParticipantAttendance('bkg_sprint7_001', 'part_sprint7_001', false);

    const result = eligibilityService.evaluateEligibility(
      'bkg_sprint7_001',
      'part_sprint7_001',
      false,
    );

    assert.equal(result.isEligible, false);
    assert.equal(result.checks.participantAttended, false);
    assert.ok(result.reasons.some(r => r.includes('attendance has not been verified')));
  });

  it('should block eligibility when outstanding balance is greater than zero', () => {
    const booking = bridgeService.getBooking('bkg_sprint7_001');
    assert.ok(booking);
    booking.balanceAmountDue = 800; // Outstanding basecamp balance
    bridgeService.registerBooking(booking);

    const result = eligibilityService.evaluateEligibility(
      'bkg_sprint7_001',
      'part_sprint7_001',
      false,
    );

    assert.equal(result.isEligible, false);
    assert.equal(result.checks.paymentsSettled, false);
    assert.ok(result.reasons.some(r => r.includes('balance of ₹800 must be settled')));
  });

  it('should block eligibility when booking is cancelled', () => {
    const booking = bridgeService.getBooking('bkg_sprint7_001');
    assert.ok(booking);
    booking.status = BookingStatus.CANCELLED_BY_USER;
    bridgeService.registerBooking(booking);

    const result = eligibilityService.evaluateEligibility(
      'bkg_sprint7_001',
      'part_sprint7_001',
      false,
    );

    assert.equal(result.isEligible, false);
    assert.equal(result.checks.notCancelled, false);
    assert.ok(result.reasons.some(r => r.includes('CANCELLED')));
  });

  it('should block eligibility when certificate has already been issued', () => {
    const result = eligibilityService.evaluateEligibility(
      'bkg_sprint7_001',
      'part_sprint7_001',
      true, // already issued
    );

    assert.equal(result.isEligible, false);
    assert.equal(result.checks.notAlreadyIssued, false);
    assert.ok(result.reasons.some(r => r.includes('already been minted')));
  });
});
