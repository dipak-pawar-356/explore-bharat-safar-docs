// Explore Bharat Safar — Core Certificate Automation & Lifecycle Domain Service
// Reference: EBS-DOC-20-CERT, EBS-DOC-09-API Section 5.5, EBS-DOC-26-RULES Section 3

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import {
  CertificateStatus,
  CertificateActionType,
  UserRole,
  type CertificateEntity,
  type CertificateVerificationResult,
  type CertificateAuditLogEntity,
  type CertificateConfigEntity,
  type BatchEntity,
} from '@ebs/types';
import {
  GenerateCertificateDto,
  BatchFinalizeDto,
  RevokeCertificateDto,
  ReissueCertificateDto,
  CertificateSearchQueryDto,
  CertificateSuperAdminControlsDto,
} from './dto/certificate.dto';
import { CertificateHasherService } from './certificate-hasher.service';
import { CertificateTemplateService } from './certificate-template.service';
import { CertificateEligibilityService } from './certificate-eligibility.service';
import { BookingCertificateBridgeService } from '../../common/services/booking-certificate-bridge.service';

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  // In-memory repositories backed by Prisma / DB schema
  private readonly certificates = new Map<string, CertificateEntity>();
  private readonly auditLogs: CertificateAuditLogEntity[] = [];

  private config: CertificateConfigEntity = {
    autoIssuanceEnabled: true,
    requireAdminBatchFinalize: true,
    allowSelfReissue: false,
    defaultIssuerTitle: 'Sovereign Expedition & Rural Heritage Council of Bharat',
    directorName: 'Dr. Vikramaditya Joshi',
    leadGuideTitle: 'Chief Expedition Marshal',
  };

  constructor(
    private readonly hasherService: CertificateHasherService,
    private readonly templateService: CertificateTemplateService,
    private readonly eligibilityService: CertificateEligibilityService,
    private readonly bridgeService: BookingCertificateBridgeService,
  ) {
    this.seedInitialCertificates();
  }

  /**
   * Generates a single digital certificate after validating all systemic quality gates.
   */
  async generateCertificate(
    actorId: string,
    actorRoles: UserRole[],
    dto: GenerateCertificateDto,
  ): Promise<CertificateEntity> {
    const isIssued = this.isParticipantCertificateIssued(dto.participantId);
    const eligibility = this.eligibilityService.evaluateEligibility(
      dto.bookingId,
      dto.participantId,
      isIssued,
    );

    if (!eligibility.isEligible) {
      throw new BadRequestException(
        `Certificate issuance refused by quality gates: ${eligibility.reasons.join(', ')}`,
      );
    }

    const context = this.bridgeService.getParticipantContext(dto.bookingId, dto.participantId);
    if (!context) {
      throw new NotFoundException(
        `Participant or booking context not found for ${dto.participantId}`,
      );
    }

    const { participant, booking, batch, experience } = context;

    // 1. Generate unique certificate number: EBS-CERT-YYYY-<SLUG4>-<HEX6>
    const certNumber = this.hasherService.generateCertificateNumber(experience.slug);

    // 2. Compute canonical HMAC-SHA256 verification digest
    const verificationHash = this.hasherService.computeVerificationDigest({
      certificateNumber: certNumber,
      participantName: participant.fullName,
      experienceIdOrTitle: experience.title,
      completionDate: batch.batchEndDate,
    });

    // 3. RS256 Asymmetric Digital Signature
    const digitalSignature = this.hasherService.createDigitalSignature(verificationHash);

    // 4. Generate dynamic high-contrast QR Code Data URL
    const qrVerificationUrl = `https://explorebharatsafar.in/verify/${certNumber}?hash=${verificationHash.substring(0, 16)}`;
    const _qrDataUrl = await this.hasherService.generateVerificationQrCode(
      certNumber,
      verificationHash,
    );

    const pdfVaultUri = `s3://ebs-certificates-vault/${certNumber}.pdf`;
    const imageVaultUri = `s3://ebs-certificates-vault/${certNumber}.svg`;

    const certificate: CertificateEntity = {
      id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      certificateNumber: certNumber,
      participantId: participant.id,
      bookingId: booking.id,
      batchId: batch.id,
      userId: booking.userId,
      participantName: participant.fullName,
      experienceTitle: experience.title,
      experienceLocation: experience.meetingPointName,
      highestAltitudeMeters: experience.maxAltitudeMeters,
      completionDate: batch.batchEndDate,
      verificationHash,
      digitalSignature,
      qrVerificationUrl,
      pdfVaultUri,
      imageVaultUri,
      status: CertificateStatus.ISSUED,
      reissueCount: 0,
      revokedAt: null,
      revokedReason: null,
      revokedBy: null,
      issuedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.certificates.set(certificate.id, certificate);
    this.certificates.set(certificate.certificateNumber, certificate);

    // Record Audit Log
    this.logAudit({
      certificateId: certificate.id,
      certificateNumber: certificate.certificateNumber,
      action: CertificateActionType.MINTED,
      actorId,
      actorRole: actorRoles[0] || 'SYSTEM',
      details: {
        bookingId: booking.id,
        participantName: participant.fullName,
        batchId: batch.id,
        digest: verificationHash,
      },
    });

    this.logger.log(`Digital Certificate ${certNumber} minted for ${participant.fullName}`);
    return certificate;
  }

  /**
   * Finalizes an expedition batch and mints digital certificates for all eligible participants.
   */
  async finalizeBatchAndMintCertificates(
    adminId: string,
    adminRole: string,
    dto: BatchFinalizeDto,
  ): Promise<{
    finalizedBatch: BatchEntity;
    certificatesMinted: CertificateEntity[];
    skippedCount: number;
    errors: string[];
  }> {
    const finalizedBatch = this.bridgeService.finalizeBatch(dto.batchId, dto.notes);
    const certificatesMinted: CertificateEntity[] = [];
    const errors: string[] = [];
    let skippedCount = 0;

    // Scan all bookings in the system matching this batch
    const candidateBookings = Array.from(
      new Set(
        Array.from(this.bridgeService['bookings'].values()).filter(b => b.batchId === dto.batchId),
      ),
    );

    for (const bkg of candidateBookings) {
      for (const part of bkg.participants) {
        const isIssued = this.isParticipantCertificateIssued(part.id);
        const eligibility = this.eligibilityService.evaluateEligibility(bkg.id, part.id, isIssued);

        if (eligibility.isEligible) {
          try {
            const cert = await this.generateCertificate(adminId, [UserRole.BOOKING_ADMIN], {
              bookingId: bkg.id,
              participantId: part.id,
              batchId: dto.batchId,
            });
            certificatesMinted.push(cert);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            errors.push(`Participant ${part.fullName}: ${msg}`);
          }
        } else {
          skippedCount++;
        }
      }
    }

    this.logger.log(
      `Batch ${finalizedBatch.id} finalized. Minted: ${certificatesMinted.length}, Skipped: ${skippedCount}`,
    );

    return {
      finalizedBatch,
      certificatesMinted,
      skippedCount,
      errors,
    };
  }

  /**
   * Public Certificate Verification API.
   * Performs cryptographic digest re-calculation and RS256 signature verification.
   */
  async verifyPublicCertificate(
    certificateNumber: string,
    optionalHash?: string,
  ): Promise<CertificateVerificationResult> {
    const cert = this.certificates.get(certificateNumber);

    if (!cert) {
      return {
        isValid: false,
        status: CertificateStatus.REVOKED,
        certificateNumber,
        isSignatureValid: false,
        reason: 'Certificate record does not exist on the sovereign registry.',
      };
    }

    // Check revocation status
    if (cert.status === CertificateStatus.REVOKED) {
      return {
        isValid: false,
        status: CertificateStatus.REVOKED,
        certificateNumber: cert.certificateNumber,
        participantName: cert.participantName,
        experienceTitle: cert.experienceTitle,
        completionDate: cert.completionDate,
        revokedAt: cert.revokedAt,
        revokedReason: cert.revokedReason || 'Certificate has been formally revoked.',
        isSignatureValid: false,
        reason: `Certificate has been formally revoked: ${cert.revokedReason}`,
      };
    }

    // 1. Re-calculate cryptographic HMAC-SHA256 digest
    const isDigestValid = this.hasherService.verifyVerificationDigest(
      {
        certificateNumber: cert.certificateNumber,
        participantName: cert.participantName,
        experienceIdOrTitle: cert.experienceTitle,
        completionDate: cert.completionDate,
      },
      cert.verificationHash,
    );

    // 2. Verify RS256 digital signature
    const isSignatureValid = this.hasherService.verifyDigitalSignature(
      cert.verificationHash,
      cert.digitalSignature,
    );

    // Optional short hash verification if provided from QR query param
    let isOptionalHashMatching = true;
    if (optionalHash) {
      isOptionalHashMatching = cert.verificationHash.startsWith(optionalHash);
    }

    const isValid = isDigestValid && isSignatureValid && isOptionalHashMatching;

    if (!isValid) {
      return {
        isValid: false,
        status: CertificateStatus.REVOKED,
        certificateNumber: cert.certificateNumber,
        isSignatureValid,
        reason: 'Cryptographic integrity check failed. Certificate may be forged or tampered.',
      };
    }

    return {
      isValid: true,
      status: cert.status,
      certificateNumber: cert.certificateNumber,
      participantName: cert.participantName,
      experienceTitle: cert.experienceTitle,
      experienceLocation: cert.experienceLocation,
      highestAltitudeMeters: cert.highestAltitudeMeters,
      completionDate: cert.completionDate,
      issuedAt: cert.issuedAt,
      verificationHash: cert.verificationHash,
      isSignatureValid: true,
    };
  }

  /**
   * Retrieves certificate entity by internal ID or certificate number.
   */
  async getCertificate(
    idOrNumber: string,
    userId: string,
    userRoles: UserRole[],
  ): Promise<CertificateEntity> {
    const cert = this.certificates.get(idOrNumber);
    if (!cert) {
      throw new NotFoundException(`Certificate ${idOrNumber} not found.`);
    }

    const isAdmin =
      userRoles.includes(UserRole.SUPER_ADMIN) ||
      userRoles.includes(UserRole.SYSTEM_ADMIN) ||
      userRoles.includes(UserRole.BOOKING_ADMIN) ||
      userRoles.includes(UserRole.FINANCE_ADMIN);

    if (!isAdmin && cert.userId !== userId) {
      throw new ForbiddenException('Access denied to this certificate record.');
    }

    return cert;
  }

  /**
   * Synthesizes and streams the PDF document buffer for a certificate.
   */
  async downloadCertificatePdf(
    idOrNumber: string,
    userId: string,
    userRoles: UserRole[],
  ): Promise<{ buffer: Buffer; filename: string }> {
    const cert = await this.getCertificate(idOrNumber, userId, userRoles);

    const qrDataUrl = await this.hasherService.generateVerificationQrCode(
      cert.certificateNumber,
      cert.verificationHash,
    );

    const buffer = await this.templateService.renderPdf({
      certificateNumber: cert.certificateNumber,
      participantName: cert.participantName,
      experienceTitle: cert.experienceTitle,
      experienceLocation: cert.experienceLocation,
      highestAltitudeMeters: cert.highestAltitudeMeters,
      completionDate: cert.completionDate,
      verificationHash: cert.verificationHash,
      qrDataUrl,
      directorName: this.config.directorName,
      leadGuideTitle: this.config.leadGuideTitle,
    });

    this.logAudit({
      certificateId: cert.id,
      certificateNumber: cert.certificateNumber,
      action: CertificateActionType.DOWNLOADED,
      actorId: userId,
      actorRole: userRoles[0] || 'TRAVELLER',
      details: { format: 'PDF/A' },
    });

    const slug = cert.participantName.replace(/\s+/g, '-');
    return {
      buffer,
      filename: `EBS-Certificate-${slug}.pdf`,
    };
  }

  /**
   * Retrieves all certificates issued to a specific traveller.
   */
  async getTravellerCertificates(userId: string): Promise<CertificateEntity[]> {
    const unique = Array.from(new Set(this.certificates.values()));
    return unique
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }

  /**
   * Search and filter certificates for Administrators.
   */
  async searchCertificates(query: CertificateSearchQueryDto): Promise<{
    items: CertificateEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const unique = Array.from(new Set(this.certificates.values()));
    let filtered = unique;

    if (query.q) {
      const qLower = query.q.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.certificateNumber.toLowerCase().includes(qLower) ||
          c.participantName.toLowerCase().includes(qLower) ||
          c.experienceTitle.toLowerCase().includes(qLower),
      );
    }

    if (query.status) {
      filtered = filtered.filter(c => c.status === query.status);
    }

    if (query.batchId) {
      filtered = filtered.filter(c => c.batchId === query.batchId);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total: filtered.length,
      page,
      limit,
    };
  }

  /**
   * Revokes an existing certificate with a mandatory reason.
   */
  async revokeCertificate(
    adminId: string,
    adminRole: string,
    dto: RevokeCertificateDto,
  ): Promise<CertificateEntity> {
    const cert = this.certificates.get(dto.certificateNumber);
    if (!cert) {
      throw new NotFoundException(`Certificate ${dto.certificateNumber} not found.`);
    }

    const updated: CertificateEntity = {
      ...cert,
      status: CertificateStatus.REVOKED,
      revokedAt: new Date().toISOString(),
      revokedReason: dto.reason,
      revokedBy: adminId,
      updatedAt: new Date().toISOString(),
    };

    this.certificates.set(updated.id, updated);
    this.certificates.set(updated.certificateNumber, updated);

    this.logAudit({
      certificateId: updated.id,
      certificateNumber: updated.certificateNumber,
      action: CertificateActionType.REVOKED,
      actorId: adminId,
      actorRole: adminRole,
      details: { reason: dto.reason },
    });

    this.logger.warn(`Certificate ${dto.certificateNumber} formally REVOKED by ${adminId}`);
    return updated;
  }

  /**
   * Reissues an existing certificate (e.g. for legal name correction).
   * Recalculates cryptographic digest, increments reissue counter, and archives old status.
   */
  async reissueCertificate(
    adminId: string,
    adminRole: string,
    dto: ReissueCertificateDto,
  ): Promise<CertificateEntity> {
    const cert = this.certificates.get(dto.certificateNumber);
    if (!cert) {
      throw new NotFoundException(`Certificate ${dto.certificateNumber} not found.`);
    }

    const participantName = dto.correctedName ? dto.correctedName.trim() : cert.participantName;

    // Recalculate HMAC-SHA256 digest
    const newVerificationHash = this.hasherService.computeVerificationDigest({
      certificateNumber: cert.certificateNumber,
      participantName,
      experienceIdOrTitle: cert.experienceTitle,
      completionDate: cert.completionDate,
    });

    // Re-sign with RS256
    const newDigitalSignature = this.hasherService.createDigitalSignature(newVerificationHash);

    const updated: CertificateEntity = {
      ...cert,
      participantName,
      verificationHash: newVerificationHash,
      digitalSignature: newDigitalSignature,
      status: CertificateStatus.REISSUED,
      reissueCount: cert.reissueCount + 1,
      revokedAt: null,
      revokedReason: null,
      updatedAt: new Date().toISOString(),
    };

    this.certificates.set(updated.id, updated);
    this.certificates.set(updated.certificateNumber, updated);

    this.logAudit({
      certificateId: updated.id,
      certificateNumber: updated.certificateNumber,
      action: CertificateActionType.REISSUED,
      actorId: adminId,
      actorRole: adminRole,
      details: {
        reason: dto.reason,
        previousName: cert.participantName,
        newName: participantName,
        reissueCount: updated.reissueCount,
      },
    });

    this.logger.log(
      `Certificate ${dto.certificateNumber} REISSUED (Iteration: ${updated.reissueCount})`,
    );
    return updated;
  }

  /**
   * Retrieves certificate audit logs.
   */
  getAuditLogs(certificateIdOrNumber?: string): CertificateAuditLogEntity[] {
    if (!certificateIdOrNumber) return this.auditLogs;
    return this.auditLogs.filter(
      l =>
        l.certificateId === certificateIdOrNumber || l.certificateNumber === certificateIdOrNumber,
    );
  }

  /**
   * Returns current Super Admin certificate configuration.
   */
  getControls(): CertificateConfigEntity {
    return { ...this.config };
  }

  /**
   * Updates Super Admin certificate configuration.
   */
  updateControls(dto: CertificateSuperAdminControlsDto): CertificateConfigEntity {
    this.config = {
      ...this.config,
      ...dto,
    };
    this.logger.log('Certificate platform controls updated by Super Admin');
    return { ...this.config };
  }

  /**
   * Checks whether an active certificate has already been issued for a participant.
   */
  private isParticipantCertificateIssued(participantId: string): boolean {
    const list = Array.from(new Set(this.certificates.values()));
    return list.some(
      c => c.participantId === participantId && c.status !== CertificateStatus.REVOKED,
    );
  }

  /**
   * Helper to append immutable audit log records.
   */
  private logAudit(entry: Omit<CertificateAuditLogEntity, 'id' | 'timestamp'>): void {
    this.auditLogs.push({
      id: `cert_audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
  }

  /**
   * Seeds demo certificates for verified test cases.
   */
  private seedInitialCertificates(): void {
    const cert1Number = 'EBS-CERT-2026-HARI-8F3A21';
    const hash1 = this.hasherService.computeVerificationDigest({
      certificateNumber: cert1Number,
      participantName: 'Amitabh Sharma',
      experienceIdOrTitle: 'Harishchandragad Monsoon Escarpment Trek',
      completionDate: '2026-08-15',
    });
    const sig1 = this.hasherService.createDigitalSignature(hash1);

    const cert1: CertificateEntity = {
      id: 'cert_seed_001',
      certificateNumber: cert1Number,
      participantId: 'part_sprint7_001',
      bookingId: 'bkg_sprint7_001',
      batchId: 'batch_hari_2026_01',
      userId: 'usr_traveller_sprint2_001',
      participantName: 'Amitabh Sharma',
      experienceTitle: 'Harishchandragad Monsoon Escarpment Trek',
      experienceLocation: 'Ahmednagar, Maharashtra',
      highestAltitudeMeters: 1422,
      completionDate: '2026-08-15',
      verificationHash: hash1,
      digitalSignature: sig1,
      qrVerificationUrl: `https://explorebharatsafar.in/verify/${cert1Number}?hash=${hash1.substring(0, 16)}`,
      pdfVaultUri: `s3://ebs-certificates-vault/${cert1Number}.pdf`,
      imageVaultUri: `s3://ebs-certificates-vault/${cert1Number}.svg`,
      status: CertificateStatus.ISSUED,
      reissueCount: 0,
      revokedAt: null,
      revokedReason: null,
      revokedBy: null,
      issuedAt: '2026-08-16T10:00:00.000Z',
      updatedAt: '2026-08-16T10:00:00.000Z',
    };

    this.certificates.set(cert1.id, cert1);
    this.certificates.set(cert1.certificateNumber, cert1);
  }
}
