// Explore Bharat Safar — Section 3: Payment & Transaction Engine Contracts
// Reference: EBS-DOC-21-PAY, EBS-DOC-29-SERVICES, EBS-DOC-09-API, EBS-DOC-10-DATA, EBS-DOC-26-RULES, EBS-DOC-36-STATE

export enum PaymentGatewayProvider {
  RAZORPAY = 'RAZORPAY',
  CASHFREE = 'CASHFREE',
  MOCK_SANDBOX = 'MOCK_SANDBOX',
}

export enum PaymentMethod {
  UPI = 'UPI',
  CARD = 'CARD',
  NET_BANKING = 'NET_BANKING',
  WALLET = 'WALLET',
  OFFLINE_BASECAMP = 'OFFLINE_BASECAMP',
}

export enum TransactionType {
  ADVANCE_DEPOSIT = 'ADVANCE_DEPOSIT',
  BALANCE_SETTLEMENT = 'BALANCE_SETTLEMENT',
  FULL_PAYMENT = 'FULL_PAYMENT',
  CANCELLATION_REFUND = 'CANCELLATION_REFUND',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
}

export enum TransactionStatus {
  CREATED = 'CREATED',
  INTENT_CREATED = 'INTENT_CREATED',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUND_PENDING = 'REFUND_PENDING',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED',
  DISPUTED = 'DISPUTED',
}

export enum LedgerAccountType {
  GATEWAY_ESCROW = 'GATEWAY_ESCROW',
  CUSTOMER_ADVANCE_LIABILITY = 'CUSTOMER_ADVANCE_LIABILITY',
  TOUR_REVENUE = 'TOUR_REVENUE',
  GST_PAYABLE = 'GST_PAYABLE',
  REFUND_EXPENSE = 'REFUND_EXPENSE',
  PLATFORM_FEE = 'PLATFORM_FEE',
}

export enum LedgerEntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

// -------------------------------------------------------------
// Core Domain Entities
// -------------------------------------------------------------

export interface PaymentIntentRequest {
  orderId: string;
  amountInr?: number;
  paymentMethod?: PaymentMethod;
  gatewayProvider?: PaymentGatewayProvider;
  customerPhone?: string;
  customerEmail?: string;
  notes?: Record<string, string>;
}

export interface PaymentIntentResponse {
  intentId: string;
  orderId: string;
  gatewayOrderId: string;
  gatewayReference: string;
  amountInr: number;
  currency: string;
  provider: PaymentGatewayProvider;
  clientSecret?: string;
  paymentSessionId?: string;
  keyId?: string;
  expiryTimestamp: string;
}

export interface PaymentVerificationPayload {
  orderId: string;
  gatewayReference: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}

export interface PaymentVerificationResult {
  isVerified: boolean;
  transactionId: string;
  orderId: string;
  amountPaid: number;
  bookingStatus: string;
  invoiceNumber: string;
}

export interface PaymentTransactionEntity {
  id: string;
  bookingId: string;
  gatewayReference: string;
  gatewayPaymentId?: string;
  gatewayProvider: PaymentGatewayProvider;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  currency: string;
  transactionType: TransactionType;
  transactionStatus: TransactionStatus;
  idempotencyKey?: string;
  refundedAmount: number;
  failureReason?: string;
  gatewayPayload: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceEntity {
  id: string;
  invoiceNumber: string; // e.g. EBS-INV-2026-000101
  bookingId: string;
  customerName: string;
  customerEmail?: string;
  sacCode: string; // '998555' (Tour Operator Services)
  subtotal: number;
  cgstAmount: number; // 2.5%
  sgstAmount: number; // 2.5%
  igstAmount: number; // 5.0% for interstate
  grandTotal: number;
  advancePaid: number;
  balanceDue: number;
  pdfVaultUri?: string;
  issuedAt: string;
}

export interface TransactionLedgerEntryEntity {
  id: string;
  transactionId: string;
  bookingId: string;
  accountType: LedgerAccountType;
  entryType: LedgerEntryType;
  amount: number;
  balanceAfter: number;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface RefundRecordEntity {
  id: string;
  transactionId: string;
  bookingId: string;
  gatewayRefundId?: string;
  refundAmount: number;
  retainedFee: number;
  refundPercentage: number;
  reason: string;
  policyTier: string;
  status: RefundStatus;
  processedAt?: string;
  createdAt: string;
}

export interface RefundRequestPayload {
  bookingId: string;
  transactionId?: string;
  refundAmountInr?: number;
  reason: string;
  adminOverride?: boolean;
}

export interface RefundResponseRecord {
  refundId: string;
  bookingId: string;
  transactionId: string;
  gatewayRefundId: string;
  amountRefunded: number;
  retainedFee: number;
  refundPercentage: number;
  status: RefundStatus;
  policyTierNote: string;
  processedAt: string;
}

export interface SuperAdminPaymentControlsDto {
  defaultAdvancePercentage: number; // 10 - 100
  primaryGateway: PaymentGatewayProvider;
  isFailoverEnabled: boolean;
  autoRefundThresholdInr: number;
}

export interface SuperAdminPaymentControlsEntity extends SuperAdminPaymentControlsDto {
  id: string;
  updatedByUserId?: string;
  updatedAt: string;
}

export interface WebhookEventPayload {
  event: string;
  provider: PaymentGatewayProvider;
  payload: Record<string, any>;
  signature: string;
  timestamp?: string;
}
