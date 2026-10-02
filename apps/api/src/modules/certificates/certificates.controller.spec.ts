// Explore Bharat Safar — Certificates Controller Unit Tests
// Reference: EBS-DOC-20-CERT, EBS-DOC-09-API Section 5.5

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { FastifyReply } from 'fastify';
import { AccountStatus, CertificateStatus, UserRole, type User } from '@ebs/types';
import { CertificatesController } from './certificates.controller';
import type { CertificatesService } from './certificates.service';

describe('CertificatesController', () => {
  let controller: CertificatesController;

  const mockUser: User = {
    id: 'usr_traveller_sprint2_001',
    email: 'arjun.mehta@example.com',
    fullName: 'Arjun Mehta',
    roles: [UserRole.TRAVELLER],
    isEmailVerified: true,
    isPhoneVerified: true,
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockAdminUser: User = {
    id: 'usr_admin_001',
    email: 'admin@explorebharatsafar.in',
    fullName: 'Admin Official',
    roles: [UserRole.SUPER_ADMIN],
    isEmailVerified: true,
    isPhoneVerified: true,
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockCertificatesService = {
    verifyPublicCertificate: async (certNum: string) => ({
      isValid: true,
      status: CertificateStatus.ISSUED,
      certificateNumber: certNum,
      participantName: 'Amitabh Sharma',
      experienceTitle: 'Harishchandragad Trek',
      isSignatureValid: true,
    }),
    downloadCertificatePdf: async () => ({
      buffer: Buffer.from('%PDF-1.4 mock pdf data'),
      filename: 'EBS-Certificate-Amitabh-Sharma.pdf',
    }),
    getTravellerCertificates: async () => [
      {
        id: 'cert_1',
        certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
        participantName: 'Amitabh Sharma',
        status: CertificateStatus.ISSUED,
      },
    ],
    getCertificate: async () => ({
      id: 'cert_1',
      certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
      participantName: 'Amitabh Sharma',
    }),
    finalizeBatchAndMintCertificates: async () => ({
      finalizedBatch: { id: 'batch_1', status: 'COMPLETED' },
      certificatesMinted: [{ id: 'cert_1', certificateNumber: 'EBS-CERT-2026-HARI-8F3A21' }],
      skippedCount: 0,
      errors: [],
    }),
    generateCertificate: async () => ({
      id: 'cert_2',
      certificateNumber: 'EBS-CERT-2026-KALS-123456',
      status: CertificateStatus.ISSUED,
    }),
    searchCertificates: async () => ({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    }),
    revokeCertificate: async () => ({
      id: 'cert_1',
      certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
      status: CertificateStatus.REVOKED,
    }),
    reissueCertificate: async () => ({
      id: 'cert_1',
      certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
      status: CertificateStatus.REISSUED,
      reissueCount: 1,
    }),
    getAuditLogs: () => [],
    getControls: () => ({ autoIssuanceEnabled: true }),
    updateControls: () => ({ autoIssuanceEnabled: false }),
  } as unknown as CertificatesService;

  beforeEach(() => {
    controller = new CertificatesController(mockCertificatesService);
  });

  it('should verify public certificate via GET /verify/:certificateNumber without auth', async () => {
    const res = await controller.verifyCertificate('EBS-CERT-2026-HARI-8F3A21');

    assert.equal(res.status, 'success');
    assert.equal(res.data.isValid, true);
    assert.equal(res.data.participantName, 'Amitabh Sharma');
  });

  it('should download certificate PDF with proper Fastify headers', async () => {
    const headers: Record<string, string> = {};
    let sentBuffer: Buffer | null = null;

    const mockReply = {
      header: (key: string, value: string) => {
        headers[key] = value;
        return mockReply;
      },
      send: (buf: Buffer) => {
        sentBuffer = buf;
        return mockReply;
      },
    } as unknown as FastifyReply;

    await controller.downloadCertificate(mockUser, 'cert_1', mockReply);

    assert.equal(headers['Content-Type'], 'application/pdf');
    assert.ok(headers['Content-Disposition'].includes('EBS-Certificate-Amitabh-Sharma.pdf'));
    assert.ok(sentBuffer);
  });

  it('should list traveller certificates via GET /my-certificates', async () => {
    const res = await controller.getMyCertificates(mockUser);

    assert.equal(res.status, 'success');
    assert.equal(res.data.length, 1);
    assert.equal(res.data[0].certificateNumber, 'EBS-CERT-2026-HARI-8F3A21');
  });

  it('should allow admin to finalize batch and mint certificates', async () => {
    const res = await controller.finalizeBatch(mockAdminUser, {
      batchId: '123e4567-e89b-12d3-a456-426614174000',
    });

    assert.equal(res.status, 'success');
    assert.equal(res.data.certificatesMinted.length, 1);
  });

  it('should allow admin to revoke and reissue certificates', async () => {
    const revokeRes = await controller.revokeCertificate(mockAdminUser, {
      certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
      reason: 'Participant did not complete summit ascent.',
    });
    assert.equal(revokeRes.status, 'success');
    assert.equal(revokeRes.data.status, CertificateStatus.REVOKED);

    const reissueRes = await controller.reissueCertificate(mockAdminUser, {
      certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
      reason: 'Name correction per official passport.',
      correctedName: 'Amitabh Sharma-Patil',
    });
    assert.equal(reissueRes.status, 'success');
    assert.equal(reissueRes.data.status, CertificateStatus.REISSUED);
  });

  it('should retrieve and update Super Admin certificate controls', async () => {
    const getRes = await controller.getControls();
    assert.equal(getRes.status, 'success');
    assert.equal(getRes.data.autoIssuanceEnabled, true);

    const updateRes = await controller.updateControls({
      autoIssuanceEnabled: false,
    });
    assert.equal(updateRes.status, 'success');
    assert.equal(updateRes.data.autoIssuanceEnabled, false);
  });
});
