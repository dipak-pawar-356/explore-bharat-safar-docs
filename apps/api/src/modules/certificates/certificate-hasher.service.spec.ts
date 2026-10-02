// Explore Bharat Safar — Certificate Hasher & Signing Unit Tests
// Reference: EBS-DOC-20-CERT Section 4

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { ConfigService } from '@nestjs/config';
import { CertificateHasherService } from './certificate-hasher.service';
import { CERTIFICATE_NUMBER_REGEX } from '@ebs/validators';

describe('CertificateHasherService', () => {
  let service: CertificateHasherService;

  const mockConfig = {
    get: (key: string) => {
      if (key === 'CERTIFICATE_HMAC_SECRET')
        return 'test_hmac_secret_key_minimum_32_characters_long';
      return null;
    },
  } as unknown as ConfigService;

  beforeEach(() => {
    service = new CertificateHasherService(mockConfig);
  });

  it('should generate valid certificate numbers matching standard pattern', () => {
    const certNum1 = service.generateCertificateNumber('harishchandragad-monsoon-trek', 2026);
    assert.ok(CERTIFICATE_NUMBER_REGEX.test(certNum1));
    assert.ok(certNum1.startsWith('EBS-CERT-2026-HARI-'));

    const certNum2 = service.generateCertificateNumber('kalsubai-peak-sunrise-trek', 2026);
    assert.ok(CERTIFICATE_NUMBER_REGEX.test(certNum2));
    assert.ok(certNum2.startsWith('EBS-CERT-2026-KALS-'));
  });

  it('should compute deterministic HMAC-SHA256 verification digest', () => {
    const params = {
      certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
      participantName: 'Amitabh Sharma',
      experienceIdOrTitle: 'Harishchandragad Monsoon Escarpment Trek',
      completionDate: '2026-08-15',
    };

    const digest1 = service.computeVerificationDigest(params);
    const digest2 = service.computeVerificationDigest(params);

    assert.equal(digest1, digest2);
    assert.equal(digest1.length, 64); // SHA-256 hex string is 64 chars
  });

  it('should verify matching digest and reject tampered content', () => {
    const params = {
      certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
      participantName: 'Amitabh Sharma',
      experienceIdOrTitle: 'Harishchandragad Monsoon Escarpment Trek',
      completionDate: '2026-08-15',
    };

    const validDigest = service.computeVerificationDigest(params);
    assert.equal(service.verifyVerificationDigest(params, validDigest), true);

    // Tampered name
    const tamperedName = { ...params, participantName: 'Amitabh Verma' };
    assert.equal(service.verifyVerificationDigest(tamperedName, validDigest), false);

    // Tampered date
    const tamperedDate = { ...params, completionDate: '2026-08-16' };
    assert.equal(service.verifyVerificationDigest(tamperedDate, validDigest), false);

    // Tampered certificate number
    const tamperedCert = { ...params, certificateNumber: 'EBS-CERT-2026-HARI-999999' };
    assert.equal(service.verifyVerificationDigest(tamperedCert, validDigest), false);
  });

  it('should sign and verify RS256 digital signature', () => {
    const digest = '7f8b91a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0';
    const signature = service.createDigitalSignature(digest);

    assert.ok(signature);
    assert.ok(signature.length > 50);

    const isValid = service.verifyDigitalSignature(digest, signature);
    assert.equal(isValid, true);

    // Tampered digest fails verification
    const tamperedDigest = '0000000000000000000000000000000000000000000000000000000000000000';
    const isTamperedValid = service.verifyDigitalSignature(tamperedDigest, signature);
    assert.equal(isTamperedValid, false);
  });

  it('should synthesize dynamic QR code Data URL pointing to public verification endpoint', async () => {
    const certNum = 'EBS-CERT-2026-HARI-8F3A21';
    const digest = '7f8b91a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0';

    const qrDataUrl = await service.generateVerificationQrCode(certNum, digest);
    assert.ok(qrDataUrl.startsWith('data:image/png;base64,'));
    assert.ok(qrDataUrl.length > 200);
  });
});
