// Explore Bharat Safar — Section 4: Fintech & Payment Engine DTOs
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-09-API, EBS-DOC-48-VALIDATION

import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  Min,
  Max,
  IsBoolean,
  MinLength,
  MaxLength,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PaymentGatewayProvider,
  PaymentMethod,
  type PaymentIntentRequest,
  type PaymentVerificationPayload,
  type RefundRequestPayload,
  type SuperAdminPaymentControlsDto,
} from '@ebs/types';

export class CreatePaymentIntentDto implements PaymentIntentRequest {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  amountInr?: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod = PaymentMethod.UPI;

  @IsEnum(PaymentGatewayProvider)
  @IsOptional()
  gatewayProvider?: PaymentGatewayProvider;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsOptional()
  customerEmail?: string;

  @IsObject()
  @IsOptional()
  notes?: Record<string, string>;
}

export class VerifyPaymentSignatureDto implements PaymentVerificationPayload {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  gatewayReference!: string;

  @IsString()
  @IsNotEmpty()
  gatewayPaymentId!: string;

  @IsString()
  @IsNotEmpty()
  gatewaySignature!: string;

  @IsEnum(PaymentGatewayProvider)
  @IsOptional()
  gatewayProvider?: PaymentGatewayProvider;
}

export class ProcessRefundDto implements RefundRequestPayload {
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  refundAmountInr?: number;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason!: string;

  @IsBoolean()
  @IsOptional()
  adminOverride?: boolean = false;
}

export class UpdateSuperAdminPaymentControlsDto implements SuperAdminPaymentControlsDto {
  @IsNumber()
  @Min(10)
  @Max(100)
  defaultAdvancePercentage!: number;

  @IsEnum(PaymentGatewayProvider)
  primaryGateway!: PaymentGatewayProvider;

  @IsBoolean()
  isFailoverEnabled!: boolean;

  @IsNumber()
  @Min(1000)
  autoRefundThresholdInr!: number;
}

export class PaymentHistoryQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  status?: string;
}
