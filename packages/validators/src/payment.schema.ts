// Explore Bharat Safar — Section 3: Universal Payment Validation Schemas
// Reference: EBS-DOC-21-PAY, EBS-DOC-29-SERVICES, EBS-DOC-09-API, EBS-DOC-26-RULES

import { z } from 'zod';

export const PaymentGatewayProviderEnum = z.enum(['RAZORPAY', 'CASHFREE', 'MOCK_SANDBOX']);
export const PaymentMethodEnum = z.enum([
  'UPI',
  'CARD',
  'NET_BANKING',
  'WALLET',
  'OFFLINE_BASECAMP',
]);
export const TransactionStatusEnum = z.enum([
  'CREATED',
  'INTENT_CREATED',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'REFUND_PENDING',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
  'EXPIRED',
  'DISPUTED',
]);

export const CreatePaymentIntentSchema = z.object({
  orderId: z.string().min(1, 'Order reference ID is mandatory'),
  amountInr: z.number().positive('Amount must be positive').optional(),
  gatewayProvider: PaymentGatewayProviderEnum.default('RAZORPAY'),
  paymentMethod: PaymentMethodEnum.default('UPI'),
  customerPhone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Must be a valid Indian E.164 mobile number')
    .optional(),
  customerEmail: z.string().email('Invalid email address format').optional(),
  notes: z.record(z.string()).optional(),
});

export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentSchema>;

export const VerifyPaymentSignatureSchema = z.object({
  orderId: z.string().min(1, 'Order ID is mandatory'),
  gatewayReference: z.string().min(1, 'Gateway reference / Order ID is mandatory'),
  gatewayPaymentId: z.string().min(1, 'Gateway Payment ID is mandatory'),
  gatewaySignature: z.string().min(1, 'Cryptographic payment signature is mandatory'),
});

export type VerifyPaymentSignatureInput = z.infer<typeof VerifyPaymentSignatureSchema>;

export const ProcessRefundSchema = z.object({
  bookingId: z.string().min(1, 'Booking reference ID is mandatory'),
  transactionId: z.string().optional(),
  refundAmountInr: z.number().positive('Refund amount must be positive').optional(),
  reason: z
    .string()
    .min(5, 'Cancellation refund reason must be at least 5 characters')
    .max(500, 'Reason must not exceed 500 characters'),
  adminOverride: z.boolean().default(false),
});

export type ProcessRefundInput = z.infer<typeof ProcessRefundSchema>;

export const SuperAdminPaymentControlsSchema = z.object({
  defaultAdvancePercentage: z
    .number()
    .min(10, 'Mandatory upfront deposit cannot be lower than 10%')
    .max(100, 'Mandatory upfront deposit cannot exceed 100%'),
  primaryGateway: PaymentGatewayProviderEnum,
  isFailoverEnabled: z.boolean(),
  autoRefundThresholdInr: z
    .number()
    .min(0, 'Auto refund threshold cannot be negative')
    .max(100000, 'Auto refund threshold max limit is ₹1,00,000'),
});

export type SuperAdminPaymentControlsInput = z.infer<typeof SuperAdminPaymentControlsSchema>;

export const PaymentHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: TransactionStatusEnum.optional(),
});

export type PaymentHistoryQueryInput = z.infer<typeof PaymentHistoryQuerySchema>;
