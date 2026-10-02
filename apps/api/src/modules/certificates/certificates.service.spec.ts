// Explore Bharat Safar — Certificates Service Unit Tests
// Reference: EBS-DOC-20-CERT, EBS-DOC-09-API Section 5.5

import { describe, it, beforeEach } from 'node:test';
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

describe('CertificatesService', () => {
  let service: CertificatesService;
  let bridgeService: BookingCertificateBridgeService;
  let hasherService: CertificateHasherService;
  let templateService: CertificateTemplateService;
  let eligibilityService: CertificateEligibilityService;

  const mockConfig = {
    get: (key: string) => {
      if (key === 'CERTIFICATE_HMAC_SECRET')
        return 'test_hmac_secret_key_minimum_32_characters_long';
      return null;
    },
  } as unknown as ConfigService;

  beforeEach(() => {
    bridgeService = new BookingCertificateBridgeService();
    hasherService = new CertificateHasherService(mockConfig);
    templateService = new CertificateTemplateService();
    eligibilityService = new CertificateEligibilityService(bridgeService);

    service = new CertificatesService(
      hasherService,
      templateService,
      eligibilityService,
      bridgeService,
    );
  });

  describe('Single Certificate Generation', () => {
    it('should generate digital certificate when quality gates pass', async () => {
      // Clear out seeded certificate to test clean generation
      const newPartId = 'part_new_001';
      const booking = bridgeService.getBooking('bkg_sprint7_001');
      assert.ok(booking);
      booking.participants.push({
        id: newPartId,
        bookingId: booking.id,
        fullName: 'Pooja Deshmukh',
        age: 26,
        gender: 'FEMALE',
        emergencyContactName: 'Sanjay Deshmukh',
        emergencyContactPhone: '9876543211',
        foodPreference: FoodPreference.VEG,
        experienceLevel: TrekExperienceLevel.INTERMEDIATE,
        isAttendanceVerified: true,
        createdAt: new Date().toISOString(),
      });
      bridgeService.registerBooking(booking);

      const cert = await service.generateCertificate('usr_admin_001', [UserRole.BOOKING_ADMIN], {
        bookingId: booking.id,
        participantId: newPartId,
        batchId: booking.batchId,
      });

      assert.ok(cert.id);
      assert.ok(cert.certificateNumber.startsWith('EBS-CERT-2026-HARI-'));
      assert.equal(cert.participantName, 'Pooja Deshmukh');
      assert.equal(cert.status, CertificateStatus.ISSUED);
      assert.equal(cert.reissueCount, 0);

      // Verify audit log
      const logs = service.getAuditLogs(cert.certificateNumber);
      assert.equal(logs.length, 1);
      assert.equal(logs[0].action, CertificateActionType.MINTED);
    });

    it('should refuse generation if quality gates fail', async () => {
      // Modify booking to have unpaid balance
      const booking = bridgeService.getBooking('bkg_sprint7_001');
      assert.ok(booking);
      booking.balanceAmountDue = 1500;
      bridgeService.registerBooking(booking);

      await assert.rejects(async () => {
        await service.generateCertificate('usr_admin_001', [UserRole.BOOKING_ADMIN], {
          bookingId: booking.id,
          participantId: 'part_sprint7_001',
          batchId: booking.batchId,
        });
      }, /Certificate issuance refused by quality gates/);
    });
  });

  describe('Public Verification API', () => {
    it('should verify seeded authentic certificate successfully', async () => {
      const result = await service.verifyPublicCertificate('EBS-CERT-2026-HARI-8F3A21');

      assert.equal(result.isValid, true);
      assert.equal(result.status, CertificateStatus.ISSUED);
      assert.equal(result.participantName, 'Amitabh Sharma');
      assert.equal(result.experienceTitle, 'Harishchandragad Monsoon Escarpment Trek');
      assert.equal(result.isSignatureValid, true);
    });

    it('should return invalid for non-existent certificate number', async () => {
      const result = await service.verifyPublicCertificate('EBS-CERT-2026-FAKE-000000');

      assert.equal(result.isValid, false);
      assert.ok(result.reason?.includes('does not exist'));
    });

    it('should return revoked status and reason for revoked certificate', async () => {
      await service.revokeCertificate('usr_admin_001', UserRole.BOOKING_ADMIN, {
        certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
        reason: 'Issued in error due to participant cancellation on summit day.',
      });

      const result = await service.verifyPublicCertificate('EBS-CERT-2026-HARI-8F3A21');

      assert.equal(result.isValid, false);
      assert.equal(result.status, CertificateStatus.REVOKED);
      assert.ok(result.reason?.includes('participant cancellation'));
    });
  });

  describe('Download & Search Operations', () => {
    it('should synthesize and stream PDF buffer for authentic certificate', async () => {
      const { buffer, filename } = await service.downloadCertificatePdf(
        'EBS-CERT-2026-HARI-8F3A21',
        'usr_traveller_sprint2_001',
        [UserRole.TRAVELLER],
      );

      assert.ok(buffer instanceof Buffer);
      assert.ok(buffer.length > 2000);
      assert.ok(filename.includes('Amitabh-Sharma'));
    });

    it('should filter certificates by query string and status', async () => {
      const searchRes = await service.searchCertificates({
        q: 'Amitabh',
        status: CertificateStatus.ISSUED,
        page: 1,
        limit: 10,
      });

      assert.equal(searchRes.items.length, 1);
      assert.equal(searchRes.total, 1);
      assert.equal(searchRes.items[0].participantName, 'Amitabh Sharma');
    });
  });

  describe('Reissue & Revocation Workflows', () => {
    it('should reissue certificate with corrected name and increment reissueCount', async () => {
      const reissued = await service.reissueCertificate('usr_admin_001', UserRole.SUPER_ADMIN, {
        certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
        reason: 'Correcting spelling of surname per government ID',
        correctedName: 'Amitabh Sharma-Patil',
      });

      assert.equal(reissued.participantName, 'Amitabh Sharma-Patil');
      assert.equal(reissued.status, CertificateStatus.REISSUED);
      assert.equal(reissued.reissueCount, 1);

      // Verify updated public verification
      const verifyRes = await service.verifyPublicCertificate('EBS-CERT-2026-HARI-8F3A21');
      assert.equal(verifyRes.isValid, true);
      assert.equal(verifyRes.participantName, 'Amitabh Sharma-Patil');
    });
  });

  describe('Super Admin Platform Controls', () => {
    it('should retrieve and update Super Admin certificate controls', () => {
      const initial = service.getControls();
      assert.equal(initial.autoIssuanceEnabled, true);

      const updated = service.updateControls({
        directorName: 'Col. Rajeshwar Singh',
        leadGuideTitle: 'Senior Expedition Director',
      });

      assert.equal(updated.directorName, 'Col. Rajeshwar Singh');
      assert.equal(updated.leadGuideTitle, 'Senior Expedition Director');
    });
  });
});
