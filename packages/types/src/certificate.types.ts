// Explore Bharat Safar — Certificate System Contracts
// Conforms to EBS-DOC-20-CERT, EBS-DOC-09-API Section 5.5, EBS-DOC-10-DATA Section 3.6, EBS-DOC-26-RULES

// -------------------------------------------------------------
// ENUMS
// -------------------------------------------------------------

export enum CertificateStatus {
  ISSUED = 'ISSUED',
  REVOKED = 'REVOKED',
  REISSUED = 'REISSUED',
}

export enum ParticipantCompletionStatus {
  COMPLETED = 'COMPLETED',
  ABSENT = 'ABSENT',
  DROPPED_OUT = 'DROPPED_OUT',
  CANCELLED = 'CANCELLED',
}

export enum BatchCompletionStatus {
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CertificateActionType {
  MINTED = 'MINTED',
  DOWNLOADED = 'DOWNLOADED',
  VERIFIED = 'VERIFIED',
  REVOKED = 'REVOKED',
  REISSUED = 'REISSUED',
}

// -------------------------------------------------------------
// CORE ENTITIES
// -------------------------------------------------------------

export interface CertificateEntity {
  id: string;
  certificateNumber: string; // 'EBS-CERT-YYYY-XXXX-XXXXXX'
  participantId: string;
  bookingId: string;
  batchId: string;
  userId: string;
  participantName: string;
  experienceTitle: string;
  experienceLocation: string;
  highestAltitudeMeters?: number | null;
  completionDate: string; // ISO date YYYY-MM-DD
  verificationHash: string; // HMAC-SHA256 digest
  digitalSignature: string; // RS256 Asymmetric Signature
  qrVerificationUrl: string; // https://explorebharatsafar.in/verify/:certNumber
  pdfVaultUri: string; // s3://ebs-certificates-vault/:certNumber.pdf
  imageVaultUri?: string | null;
  status: CertificateStatus;
  reissueCount: number;
  revokedAt?: string | null;
  revokedReason?: string | null;
  revokedBy?: string | null;
  issuedAt: string;
  updatedAt: string;
}

export interface CertificateEligibilityChecks {
  experienceCompleted: boolean;
  batchFinalized: boolean;
  participantAttended: boolean;
  notCancelled: boolean;
  paymentsSettled: boolean;
  notAlreadyIssued: boolean;
}

export interface CertificateEligibilityResult {
  isEligible: boolean;
  reasons: string[];
  checks: CertificateEligibilityChecks;
}

export interface CertificateVerificationResult {
  isValid: boolean;
  status: CertificateStatus;
  certificateNumber: string;
  participantName?: string;
  experienceTitle?: string;
  experienceLocation?: string;
  highestAltitudeMeters?: number | null;
  completionDate?: string;
  issuedAt?: string;
  revokedAt?: string | null;
  revokedReason?: string | null;
  verificationHash?: string;
  isSignatureValid: boolean;
  reason?: string;
}

export interface CertificateAuditLogEntity {
  id: string;
  certificateId: string;
  certificateNumber: string;
  action: CertificateActionType;
  actorId: string;
  actorRole: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}

export interface CertificateConfigEntity {
  autoIssuanceEnabled: boolean;
  requireAdminBatchFinalize: boolean;
  allowSelfReissue: boolean;
  defaultIssuerTitle: string;
  directorName: string;
  leadGuideTitle: string;
}

// -------------------------------------------------------------
// DTOs & QUERY INTERFACES
// -------------------------------------------------------------

export interface GenerateCertificateDto {
  bookingId: string;
  participantId: string;
  batchId: string;
}

export interface BatchFinalizeDto {
  batchId: string;
  notes?: string;
  markMissingAsAbsent?: boolean;
}

export interface RevokeCertificateDto {
  certificateNumber: string;
  reason: string;
}

export interface ReissueCertificateDto {
  certificateNumber: string;
  reason: string;
  correctedName?: string;
}

export interface CertificateSearchQueryDto {
  q?: string;
  status?: CertificateStatus;
  batchId?: string;
  experienceId?: string;
  page?: number;
  limit?: number;
}

export interface PublicCertificateVerifyDto {
  certificateNumber: string;
  hash?: string;
}

export interface CertificateSuperAdminControlsDto {
  autoIssuanceEnabled?: boolean;
  requireAdminBatchFinalize?: boolean;
  directorName?: string;
  leadGuideTitle?: string;
}
