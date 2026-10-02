// Explore Bharat Safar — 11-Stage Certificate Lifecycle End-to-End Integration Tests
// Reference: EBS-DOC-20-CERT, EBS-DOC-26-RULES, EBS-DOC-09-API, EBS-BLU-40-SECURITY

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import type { ConfigService } from '@nestjs/config';
import {
  CertificateStatus,
  CertificateActionType,
  UserRole,
  FoodPreference,
  TrekExperienceLevel,
} from '@ebs/types';
import { CertificatesService } from './certificates.service';
import { CertificateHasherService } from './certificate-hasher.service';
import { CertificateTemplateService } from './certificate-template.service';
import { CertificateEligibilityService } from './certificate-eligibility.service';
import { BookingCertificateBridgeService } from '../../common/services/booking-certificate-bridge.service';

describe('Certificate Automation & Experience Completion E2E Lifecycle', () => {
  let bridgeService: BookingCertificateBridgeService;
  let hasherService: CertificateHasherService;
  let templateService: CertificateTemplateService;
  let eligibilityService: CertificateEligibilityService;
  let certificatesService: CertificatesService;

  const testUserId = 'usr_traveller_sprint2_001';
  const testBookingId = 'bkg_sprint7_001';
  const testPartId = 'part_e2e_001';
  const testBatchId = 'batch_hari_2026_01';
  let mintedCertificateNumber = '';

  before(() => {
    const mockConfig = {
      get: (key: string) => {
        if (key === 'CERTIFICATE_HMAC_SECRET')
          return 'test_hmac_secret_key_minimum_32_characters_long';
        return null;
      },
    } as unknown as ConfigService;

    bridgeService = new BookingCertificateBridgeService();
    hasherService = new CertificateHasherService(mockConfig);
    templateService = new CertificateTemplateService();
    eligibilityService = new CertificateEligibilityService(bridgeService);

    certificatesService = new CertificatesService(
      hasherService,
      templateService,
      eligibilityService,
      bridgeService,
    );

    // Register a new test participant on the booking
    const booking = bridgeService.getBooking(testBookingId);
    assert.ok(booking);
    booking.participants.push({
      id: testPartId,
      bookingId: testBookingId,
      fullName: 'Vikramaditya Rathore',
      age: 32,
      gender: 'MALE',
      emergencyContactName: 'Kailash Rathore',
      emergencyContactPhone: '9822001122',
      foodPreference: FoodPreference.VEG,
      experienceLevel: TrekExperienceLevel.ADVANCED,
      isAttendanceVerified: false, // Initially unverified
      createdAt: new Date().toISOString(),
    });
    booking.balanceAmountDue = 1200; // Initially unpaid balance
    bridgeService.registerBooking(booking);
  });

  // Stage 1: Quality Gate Check — Unverified Attendance
  it('Stage 1: should block certificate generation when attendance is not verified', () => {
    const eligibility = eligibilityService.evaluateEligibility(testBookingId, testPartId, false);
    assert.equal(eligibility.isEligible, false);
    assert.equal(eligibility.checks.participantAttended, false);
  });

  // Stage 2: Quality Gate Check — Outstanding Fiscal Balance
  it('Stage 2: should block certificate generation when fiscal balance is outstanding', () => {
    // Verify attendance, but leave balance unpaid
    bridgeService.verifyParticipantAttendance(testBookingId, testPartId, true);

    const eligibility = eligibilityService.evaluateEligibility(testBookingId, testPartId, false);
    assert.equal(eligibility.isEligible, false);
    assert.equal(eligibility.checks.participantAttended, true);
    assert.equal(eligibility.checks.paymentsSettled, false);
  });

  // Stage 3: Full Payment Settlement & Final Quality Gate Approval
  it('Stage 3: should approve eligibility once balance is cleared and attendance is logged', () => {
    bridgeService.settleBookingBalance(testBookingId);

    const eligibility = eligibilityService.evaluateEligibility(testBookingId, testPartId, false);
    assert.equal(eligibility.isEligible, true);
    assert.equal(eligibility.checks.experienceCompleted, true);
    assert.equal(eligibility.checks.batchFinalized, true);
    assert.equal(eligibility.checks.participantAttended, true);
    assert.equal(eligibility.checks.paymentsSettled, true);
    assert.equal(eligibility.checks.notCancelled, true);
    assert.equal(eligibility.checks.notAlreadyIssued, true);
  });

  // Stage 4: Unique Certificate Number Generation
  it('Stage 4: should mint digital certificate with standardized number EBS-CERT-YYYY-XXXX-XXXXXX', async () => {
    const cert = await certificatesService.generateCertificate(
      'usr_admin_001',
      [UserRole.BOOKING_ADMIN],
      {
        bookingId: testBookingId,
        participantId: testPartId,
        batchId: testBatchId,
      },
    );

    assert.ok(cert.id);
    assert.ok(cert.certificateNumber.startsWith('EBS-CERT-2026-HARI-'));
    assert.equal(cert.participantName, 'Vikramaditya Rathore');
    assert.equal(cert.status, CertificateStatus.ISSUED);
    assert.equal(cert.reissueCount, 0);

    mintedCertificateNumber = cert.certificateNumber;
  });

  // Stage 5: Cryptographic Sealing & Dynamic QR Code
  it('Stage 5: should verify HMAC-SHA256 digest, RS256 signature, and dynamic QR Code url', async () => {
    const cert = await certificatesService.getCertificate(mintedCertificateNumber, testUserId, [
      UserRole.TRAVELLER,
    ]);

    assert.equal(cert.verificationHash.length, 64);
    assert.ok(cert.digitalSignature.length > 50);
    assert.ok(cert.qrVerificationUrl.includes(mintedCertificateNumber));

    // Verify RS256 signature mathematically with public key
    const isSigValid = hasherService.verifyDigitalSignature(
      cert.verificationHash,
      cert.digitalSignature,
    );
    assert.equal(isSigValid, true);
  });

  // Stage 6: PDF/A Vector Synthesis & Storage
  it('Stage 6: should synthesize publication-grade PDF/A document buffer with %PDF- header', async () => {
    const { buffer, filename } = await certificatesService.downloadCertificatePdf(
      mintedCertificateNumber,
      testUserId,
      [UserRole.TRAVELLER],
    );

    assert.ok(buffer instanceof Buffer);
    assert.ok(buffer.length > 2000);
    assert.equal(buffer.subarray(0, 5).toString('ascii'), '%PDF-');
    assert.ok(filename.includes('Vikramaditya-Rathore'));
  });

  // Stage 7: Public QR Verification by External Third Party
  it('Stage 7: should allow third-party verification via public API without credentials', async () => {
    const verifyRes = await certificatesService.verifyPublicCertificate(mintedCertificateNumber);

    assert.equal(verifyRes.isValid, true);
    assert.equal(verifyRes.status, CertificateStatus.ISSUED);
    assert.equal(verifyRes.participantName, 'Vikramaditya Rathore');
    assert.equal(verifyRes.experienceTitle, 'Harishchandragad Monsoon Escarpment Trek');
    assert.equal(verifyRes.isSignatureValid, true);
  });

  // Stage 8: Tamper Detection & Fraud Rejection
  it('Stage 8: should reject verification if hash or certificate parameters are tampered with', async () => {
    // If an attacker attempts to substitute a forged hash or modify the internal record
    const cert = await certificatesService.getCertificate(mintedCertificateNumber, testUserId, [
      UserRole.TRAVELLER,
    ]);

    const isForgedDigestValid = hasherService.verifyVerificationDigest(
      {
        certificateNumber: cert.certificateNumber,
        participantName: 'Attacker Forged Name', // Tampered participant
        experienceIdOrTitle: cert.experienceTitle,
        completionDate: cert.completionDate,
      },
      cert.verificationHash,
    );

    assert.equal(isForgedDigestValid, false);
  });

  // Stage 9: Administrative Reissue Workflow
  it('Stage 9: should reissue certificate with updated legal name and increment reissue count', async () => {
    const reissued = await certificatesService.reissueCertificate(
      'usr_admin_001',
      UserRole.SUPER_ADMIN,
      {
        certificateNumber: mintedCertificateNumber,
        reason: 'Adding ancestral clan surname per Aadhaar Card update',
        correctedName: 'Vikramaditya Singh Rathore',
      },
    );

    assert.equal(reissued.participantName, 'Vikramaditya Singh Rathore');
    assert.equal(reissued.status, CertificateStatus.REISSUED);
    assert.equal(reissued.reissueCount, 1);

    // Verify public verification reflects updated name and valid signature
    const verifyRes = await certificatesService.verifyPublicCertificate(mintedCertificateNumber);
    assert.equal(verifyRes.isValid, true);
    assert.equal(verifyRes.participantName, 'Vikramaditya Singh Rathore');
  });

  // Stage 10: Administrative Revocation Workflow
  it('Stage 10: should revoke certificate and notify public verifier of revocation', async () => {
    const revoked = await certificatesService.revokeCertificate(
      'usr_admin_001',
      UserRole.BOOKING_ADMIN,
      {
        certificateNumber: mintedCertificateNumber,
        reason: 'Trail marshals reported shortcut was taken, skipping peak ridge summit.',
      },
    );

    assert.equal(revoked.status, CertificateStatus.REVOKED);
    assert.ok(revoked.revokedAt);
    assert.ok(revoked.revokedReason);

    // Public verification now returns isValid: false and status: REVOKED
    const verifyRes = await certificatesService.verifyPublicCertificate(mintedCertificateNumber);
    assert.equal(verifyRes.isValid, false);
    assert.equal(verifyRes.status, CertificateStatus.REVOKED);
    assert.ok(verifyRes.reason?.includes('shortcut was taken'));
  });

  // Stage 11: Audit Trail Verification
  it('Stage 11: should maintain complete chronological audit log of all certificate actions', () => {
    const logs = certificatesService.getAuditLogs(mintedCertificateNumber);

    assert.ok(logs.length >= 3);
    const actions = logs.map(l => l.action);
    assert.ok(actions.includes(CertificateActionType.MINTED));
    assert.ok(actions.includes(CertificateActionType.DOWNLOADED));
    assert.ok(actions.includes(CertificateActionType.REISSUED));
    assert.ok(actions.includes(CertificateActionType.REVOKED));
  });
});
