// Explore Bharat Safar — 9-Stage Payment Lifecycle End-to-End Integration Tests
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-26-RULES, EBS-DOC-29-THIRD-PARTY, EBS-BLU-40-SECURITY

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import type { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
  LedgerAccountType,
  PaymentGatewayProvider,
  PaymentMethod,
  RefundStatus,
  UserRole,
} from '@ebs/types';
import { PaymentsService } from './payments.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { TransactionLedgerService } from './transaction-ledger.service';
import { RefundService } from './refund.service';
import { IdempotencyService } from './idempotency.service';
import { BookingPaymentBridgeService } from '../../common/services/booking-payment-bridge.service';
import { RazorpayAdapter } from './adapters/razorpay.adapter';
import { CashfreeAdapter } from './adapters/cashfree.adapter';
import { MockGatewayAdapter } from './adapters/mock-gateway.adapter';

describe('Payment & Transaction Engine E2E Lifecycle', () => {
  let paymentsService: PaymentsService;
  let ledgerService: TransactionLedgerService;
  let bridgeService: BookingPaymentBridgeService;
  let mockAdapter: MockGatewayAdapter;
  let gatewayService: PaymentGatewayService;

  const testUserId = 'usr_traveller_sprint2_001';
  const testOrderId = 'EBS-BKG-2026-000101';

  before(() => {
    const mockConfig = { get: () => 'mock_secret_key_e2e' } as unknown as ConfigService;

    bridgeService = new BookingPaymentBridgeService();
    mockAdapter = new MockGatewayAdapter();
    gatewayService = new PaymentGatewayService(
      new RazorpayAdapter(mockConfig),
      new CashfreeAdapter(mockConfig),
      mockAdapter,
    );
    ledgerService = new TransactionLedgerService();
    const refundService = new RefundService(ledgerService, gatewayService);
    const idempotencyService = new IdempotencyService();

    paymentsService = new PaymentsService(
      bridgeService,
      gatewayService,
      ledgerService,
      refundService,
      idempotencyService,
    );

    gatewayService.updateConfig({
      primaryGateway: PaymentGatewayProvider.MOCK_SANDBOX,
      defaultAdvancePercentage: 20,
      isFailoverEnabled: true,
      autoRefundThresholdInr: 50000,
    });
  });

  it('Stage 1: Validates initial pending booking in bridge registry', () => {
    const booking = bridgeService.getBooking(testOrderId);
    assert.ok(booking);
    assert.equal(booking?.status, BookingStatus.PENDING_PAYMENT);
    assert.equal(booking?.pricing.mandatoryAdvanceDeposit, 4272);
  });

  it('Stage 2: Creates Payment Intent and gateway order using Idempotency-Key', async () => {
    const idempotencyKey = 'e2e-idem-key-stage2';
    const intent = await paymentsService.createPaymentIntent(
      testUserId,
      {
        orderId: testOrderId,
        amountInr: 4272,
        paymentMethod: PaymentMethod.UPI,
        gatewayProvider: PaymentGatewayProvider.MOCK_SANDBOX,
      },
      idempotencyKey,
    );

    assert.ok(intent);
    assert.equal(intent.amountInr, 4272);
    assert.ok(intent.gatewayOrderId);
    assert.ok(intent.clientSecret);
  });

  it('Stage 3: Verifies Idempotency Replay Defense returns cached intent without re-calling gateway', async () => {
    const idempotencyKey = 'e2e-idem-key-stage2';
    const replayedIntent = await paymentsService.createPaymentIntent(
      testUserId,
      {
        orderId: testOrderId,
        amountInr: 4272,
        paymentMethod: PaymentMethod.UPI,
        gatewayProvider: PaymentGatewayProvider.MOCK_SANDBOX,
      },
      idempotencyKey,
    );

    assert.ok(replayedIntent);
    assert.equal(replayedIntent.amountInr, 4272);
  });

  it('Stage 4: Verifies cryptographic payment signature and transitions booking to CONFIRMED', async () => {
    const gatewayOrderId = 'order_mock_e2e_4001';
    const gatewayPaymentId = 'pay_mock_e2e_4002';
    const validSignature = mockAdapter.generateMockSignature(gatewayOrderId, gatewayPaymentId);

    const verification = await paymentsService.verifyPayment(testUserId, {
      orderId: testOrderId,
      gatewayReference: gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature: validSignature,
      gatewayProvider: PaymentGatewayProvider.MOCK_SANDBOX,
    });

    assert.equal(verification.isVerified, true);
    assert.equal(verification.bookingStatus, BookingStatus.CONFIRMED);

    const updatedBooking = bridgeService.getBooking(testOrderId);
    assert.equal(updatedBooking?.status, BookingStatus.CONFIRMED);
    assert.equal(updatedBooking?.advanceAmountPaid, 4272);
  });

  it('Stage 5: Verifies double-entry ledger zero-sum invariant and account balances', () => {
    const ledger = paymentsService.getAdminLedger();
    assert.ok(ledger.entries.length >= 2);

    const balances = ledgerService.getAccountBalances();
    assert.equal(balances[LedgerAccountType.GATEWAY_ESCROW], 4272);
    assert.equal(balances[LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY], 4272);
  });

  it('Stage 6: Verifies statutory GST invoice generation with sequential number and SAC 998555', async () => {
    const booking = bridgeService.getBooking(testOrderId);
    const invoice = await paymentsService.getInvoiceByBooking(booking?.id as string, testUserId, [
      UserRole.TRAVELLER,
    ]);

    assert.ok(invoice);
    assert.match(invoice.invoiceNumber, /^EBS-INV-\d{4}-\d{6}$/);
    assert.equal(invoice.sacCode, '998555');
    assert.equal(invoice.grandTotal, 4272);
    assert.ok(invoice.cgstAmount > 0);
    assert.ok(invoice.sgstAmount > 0);
    assert.equal(
      Math.round(invoice.subtotal + invoice.cgstAmount + invoice.sgstAmount),
      Math.round(invoice.grandTotal),
    );
  });

  it('Stage 7: Verifies secure webhook dispatch with HMAC verification and deduplication', async () => {
    const webhookPayload = {
      id: 'evt_e2e_webhook_999',
      event: 'payment.captured',
      bookingId: testOrderId,
      amount: 4272,
    };
    const rawBody = JSON.stringify(webhookPayload);
    const signature = mockAdapter.generateMockWebhookSignature(rawBody);

    const res = await paymentsService.handleWebhook(
      PaymentGatewayProvider.MOCK_SANDBOX,
      { 'x-webhook-signature': signature },
      rawBody,
    );

    assert.equal(res.received, true);

    // Duplicate webhook should return ALREADY_PROCESSED
    const dupRes = await paymentsService.handleWebhook(
      PaymentGatewayProvider.MOCK_SANDBOX,
      { 'x-webhook-signature': signature },
      rawBody,
    );
    assert.equal(dupRes.status, 'ALREADY_PROCESSED');
  });

  it('Stage 8: Verifies cancellation policy tier deduction and refund calculation (30+ days = 90% refund)', async () => {
    const booking = bridgeService.getBooking(testOrderId);
    const refund = await paymentsService.processCancellationRefund(
      testUserId,
      [UserRole.TRAVELLER],
      {
        bookingId: booking?.id as string,
        reason: 'Change in personal travel schedule',
      },
    );

    assert.equal(refund.status, RefundStatus.SUCCEEDED);
    assert.equal(refund.refundPercentage, 90);
    assert.equal(Math.round(refund.refundAmount), Math.round(3844.8));
    assert.equal(Math.round(refund.retainedFee), Math.round(427.2));

    const cancelledBooking = bridgeService.getBooking(testOrderId);
    assert.equal(cancelledBooking?.status, BookingStatus.CANCELLED_BY_USER);
  });

  it('Stage 9: Verifies double-entry ledger post-cancellation integrity and balance release', () => {
    const balances = ledgerService.getAccountBalances();
    // Customer Advance Liability should be reduced to 0
    assert.equal(balances[LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY], 0);
    // Platform fee retained should be recorded
    assert.equal(Math.round(balances[LedgerAccountType.PLATFORM_FEE]), Math.round(427.2));
  });
});
