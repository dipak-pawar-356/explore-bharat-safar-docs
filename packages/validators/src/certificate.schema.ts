// Explore Bharat Safar — Certificate Validation Schemas
// Conforms to EBS-DOC-20-CERT, EBS-DOC-09-API Section 5.5, EBS-DOC-26-RULES

import { z } from 'zod';

export const CertificateStatusEnum = z.enum(['ISSUED', 'REVOKED', 'REISSUED']);

/**
 * Standard Certificate Number format: EBS-CERT-YYYY-XXXX-XXXXXX
 * Example: EBS-CERT-2026-HARI-8F3A21
 */
export const CERTIFICATE_NUMBER_REGEX = /^EBS-CERT-\d{4}-[A-Z0-9]{3,10}-[A-Z0-9]{4,10}$/;

export const GenerateCertificateSchema = z.object({
  bookingId: z.string().uuid('Invalid booking UUID'),
  participantId: z.string().uuid('Invalid participant UUID'),
  batchId: z.string().uuid('Invalid batch UUID'),
});

export const BatchFinalizeSchema = z.object({
  batchId: z.string().uuid('Invalid batch UUID'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  markMissingAsAbsent: z.boolean().default(true),
});

export const RevokeCertificateSchema = z.object({
  certificateNumber: z
    .string()
    .regex(
      CERTIFICATE_NUMBER_REGEX,
      'Invalid certificate number format (e.g. EBS-CERT-2026-HARI-8F3A21)',
    ),
  reason: z
    .string()
    .min(10, 'Revocation reason must contain at least 10 characters explaining the action')
    .max(500, 'Revocation reason cannot exceed 500 characters'),
});

export const ReissueCertificateSchema = z.object({
  certificateNumber: z
    .string()
    .regex(
      CERTIFICATE_NUMBER_REGEX,
      'Invalid certificate number format (e.g. EBS-CERT-2026-HARI-8F3A21)',
    ),
  reason: z
    .string()
    .min(10, 'Reissue reason must contain at least 10 characters explaining the correction')
    .max(500, 'Reissue reason cannot exceed 500 characters'),
  correctedName: z
    .string()
    .min(2, 'Corrected name must be at least 2 characters')
    .max(150, 'Corrected name cannot exceed 150 characters')
    .optional(),
});

export const PublicCertificateVerifySchema = z.object({
  certificateNumber: z
    .string()
    .regex(
      CERTIFICATE_NUMBER_REGEX,
      'Invalid certificate number format (e.g. EBS-CERT-2026-HARI-8F3A21)',
    ),
  hash: z.string().min(8).max(64).optional(),
});

export const CertificateSearchQuerySchema = z.object({
  q: z.string().max(100).optional(),
  status: CertificateStatusEnum.optional(),
  batchId: z.string().uuid().optional(),
  experienceId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const CertificateSuperAdminControlsSchema = z.object({
  autoIssuanceEnabled: z.boolean().optional(),
  requireAdminBatchFinalize: z.boolean().optional(),
  directorName: z.string().min(2).max(100).optional(),
  leadGuideTitle: z.string().min(2).max(100).optional(),
});

export type GenerateCertificateInput = z.infer<typeof GenerateCertificateSchema>;
export type BatchFinalizeInput = z.infer<typeof BatchFinalizeSchema>;
export type RevokeCertificateInput = z.infer<typeof RevokeCertificateSchema>;
export type ReissueCertificateInput = z.infer<typeof ReissueCertificateSchema>;
export type PublicCertificateVerifyInput = z.infer<typeof PublicCertificateVerifySchema>;
export type CertificateSearchQueryInput = z.infer<typeof CertificateSearchQuerySchema>;
export type CertificateSuperAdminControlsInput = z.infer<
  typeof CertificateSuperAdminControlsSchema
>;
