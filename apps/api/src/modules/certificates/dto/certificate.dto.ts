// Explore Bharat Safar — Certificate DTOs
// Reference: EBS-DOC-20-CERT, EBS-DOC-09-API Section 5.5

import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CertificateStatus,
  type GenerateCertificateDto as IGenerateCertificateDto,
  type BatchFinalizeDto as IBatchFinalizeDto,
  type RevokeCertificateDto as IRevokeCertificateDto,
  type ReissueCertificateDto as IReissueCertificateDto,
  type CertificateSearchQueryDto as ICertificateSearchQueryDto,
  type CertificateSuperAdminControlsDto as ICertificateSuperAdminControlsDto,
} from '@ebs/types';
import { CERTIFICATE_NUMBER_REGEX } from '@ebs/validators';

export class GenerateCertificateDto implements IGenerateCertificateDto {
  @IsUUID('4', { message: 'bookingId must be a valid UUID' })
  bookingId!: string;

  @IsUUID('4', { message: 'participantId must be a valid UUID' })
  participantId!: string;

  @IsUUID('4', { message: 'batchId must be a valid UUID' })
  batchId!: string;
}

export class BatchFinalizeDto implements IBatchFinalizeDto {
  @IsUUID('4', { message: 'batchId must be a valid UUID' })
  batchId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;

  @IsOptional()
  @IsBoolean()
  markMissingAsAbsent?: boolean = true;
}

export class RevokeCertificateDto implements IRevokeCertificateDto {
  @IsString()
  @Matches(CERTIFICATE_NUMBER_REGEX, {
    message: 'certificateNumber format must be EBS-CERT-YYYY-XXXX-XXXXXX',
  })
  certificateNumber!: string;

  @IsString()
  @MinLength(10, { message: 'Revocation reason must contain at least 10 characters' })
  @MaxLength(500, { message: 'Revocation reason cannot exceed 500 characters' })
  reason!: string;
}

export class ReissueCertificateDto implements IReissueCertificateDto {
  @IsString()
  @Matches(CERTIFICATE_NUMBER_REGEX, {
    message: 'certificateNumber format must be EBS-CERT-YYYY-XXXX-XXXXXX',
  })
  certificateNumber!: string;

  @IsString()
  @MinLength(10, { message: 'Reissue reason must contain at least 10 characters' })
  @MaxLength(500, { message: 'Reissue reason cannot exceed 500 characters' })
  reason!: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Corrected name must be at least 2 characters' })
  @MaxLength(150, { message: 'Corrected name cannot exceed 150 characters' })
  correctedName?: string;
}

export class CertificateSearchQueryDto implements ICertificateSearchQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsEnum(CertificateStatus)
  status?: CertificateStatus;

  @IsOptional()
  @IsUUID('4')
  batchId?: string;

  @IsOptional()
  @IsUUID('4')
  experienceId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CertificateSuperAdminControlsDto implements ICertificateSuperAdminControlsDto {
  @IsOptional()
  @IsBoolean()
  autoIssuanceEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  requireAdminBatchFinalize?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  directorName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  leadGuideTitle?: string;
}
