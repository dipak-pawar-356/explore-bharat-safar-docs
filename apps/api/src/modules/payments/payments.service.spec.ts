// Explore Bharat Safar — Payments Domain Service Unit Tests
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-09-API, EBS-DOC-10-DATA, EBS-DOC-26-RULES

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
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

describe('PaymentsService', () => {
  let service: PaymentsService;
  let bridge: BookingPaymentBridgeService;
  let gatewayService: PaymentGatewayService;
  let mockAdapter: MockGatewayAdapter;

  beforeEach(() => {
    const mockConfig = {
      get: (key: string) => {
        if (key === 'RAZORPAY_KEY_ID') return 'rzp_test_mock_id';
        if (key === 'RAZORPAY_KEY_SECRET') return 'rzp_test_mock_secret';
        if (key === 'RAZORPAY_WEBHOOK_SECRET') return 'rzp_test_webhook_secret';
        if (key === 'CASHFREE_APP_ID') return 'cf_test_mock_id';
        if (key === 'CASHFREE_SECRET_KEY') return 'cf_test_mock_secret';
        return null;
      },
    } as unknown as ConfigService;

    bridge = new BookingPaymentBridgeService();
    mockAdapter = new MockGatewayAdapter();
    gatewayService = new PaymentGatewayService(
      new RazorpayAdapter(mockConfig),
      new CashfreeAdapter(mockConfig),
      mockAdapter,
    );
    const ledger = new TransactionLedgerService();
    const refund = new RefundService(ledger, gatewayService);
    const idempotency = new IdempotencyService();

    service = new PaymentsService(bridge, gatewayService, ledger, refund, idempotency);

    // Default test gateway configuration to Mock Sandbox
    gatewayService.updateConfig({
      primaryGateway: PaymentGatewayProvider.MOCK_SANDBOX,
      defaultAdvancePercentage: 20,
      isFailoverEnabled: true,
      autoRefundThresholdInr: 50000,
    });
  });

  describe('createPaymentIntent', () => {
    it('should initialize order and return gateway intent for valid booking', async () => {
      const response = await service.createPaymentIntent('usr_traveller_sprint2_001', {
        orderId: 'EBS-BKG-2026-000101',
        amountInr: 4272,
        paymentMethod: PaymentMethod.UPI,
        gatewayProvider: PaymentGatewayProvider.MOCK_SANDBOX,
      });

      assert.ok(response);
      assert.equal(response.amountInr, 4272);
      assert.equal(response.provider, PaymentGatewayProvider.MOCK_SANDBOX);
      assert.ok(response.gatewayOrderId);
    });

    it('should reject payment creation from unauthorized user', async () => {
      await assert.rejects(async () => {
        await service.createPaymentIntent('unauthorized_user_999', {
          orderId: 'EBS-BKG-2026-000101',
          amountInr: 4272,
          paymentMethod: PaymentMethod.UPI,
        });
      });
    });

    it('should reject payment if requested amount is below Super Admin mandatory advance percentage', async () => {
      await assert.rejects(async () => {
        await service.createPaymentIntent('usr_traveller_sprint2_001', {
          orderId: 'EBS-BKG-2026-000101',
          amountInr: 1000,
          paymentMethod: PaymentMethod.UPI,
        });
      });
    });

    it('should return cached order on identical idempotency replay within 24h', async () => {
      const idempotencyKey = 'idem-test-key-uuid-12345';
      const dto = {
        orderId: 'EBS-BKG-2026-000101',
        amountInr: 4272,
        paymentMethod: PaymentMethod.UPI,
      };

      const firstResponse = await service.createPaymentIntent(
        'usr_traveller_sprint2_001',
        dto,
        idempotencyKey,
      );

      const secondResponse = await service.createPaymentIntent(
        'usr_traveller_sprint2_001',
        dto,
        idempotencyKey,
      );

      assert.equal(secondResponse.gatewayOrderId, firstResponse.gatewayOrderId);
      assert.equal(secondResponse.clientSecret, firstResponse.clientSecret);
    });

    it('should reject duplicate idempotency key if request payload parameters differ (409 Conflict)', async () => {
      const idempotencyKey = 'idem-conflict-key-555';
      await service.createPaymentIntent(
        'usr_traveller_sprint2_001',
        {
          orderId: 'EBS-BKG-2026-000101',
          amountInr: 4272,
          paymentMethod: PaymentMethod.UPI,
        },
        idempotencyKey,
      );

      await assert.rejects(async () => {
        await service.createPaymentIntent(
          'usr_traveller_sprint2_001',
          {
            orderId: 'EBS-BKG-2026-000101',
            amountInr: 5000,
            paymentMethod: PaymentMethod.UPI,
          },
          idempotencyKey,
        );
      });
    });
  });

  describe('verifyPayment & GST Invoice Generation', () => {
    it('should verify signature, confirm booking, record double-entry ledger, and generate statutory GST invoice', async () => {
      const orderNumber = 'EBS-BKG-2026-000101';
      const gatewayOrderId = 'order_mock_12345';
      const gatewayPaymentId = 'pay_mock_67890';
      const validSignature = mockAdapter.generateMockSignature(gatewayOrderId, gatewayPaymentId);

      const result = await service.verifyPayment('usr_traveller_sprint2_001', {
        orderId: orderNumber,
        gatewayReference: gatewayOrderId,
        gatewayPaymentId,
        gatewaySignature: validSignature,
        gatewayProvider: PaymentGatewayProvider.MOCK_SANDBOX,
      });

      assert.equal(result.isVerified, true);
      assert.equal(result.orderId, orderNumber);
      assert.equal(result.bookingStatus, BookingStatus.CONFIRMED);
      assert.match(result.invoiceNumber, /^EBS-INV-\d{4}-\d{6}$/);

      // Verify booking state
      const booking = bridge.getBooking(orderNumber);
      assert.equal(booking?.status, BookingStatus.CONFIRMED);
      assert.ok((booking?.advanceAmountPaid ?? 0) > 0);

      // Verify invoice details
      const invoice = await service.getInvoiceByBooking(
        booking?.id as string,
        'usr_traveller_sprint2_001',
        [UserRole.TRAVELLER],
      );
      assert.equal(invoice.sacCode, '998555');
      assert.ok(invoice.cgstAmount > 0);
      assert.ok(invoice.sgstAmount > 0);
      assert.equal(
        Math.round(invoice.subtotal + invoice.cgstAmount + invoice.sgstAmount),
        Math.round(invoice.grandTotal),
      );
    });

    it('should reject invalid or forged cryptographic signatures', async () => {
      await assert.rejects(async () => {
        await service.verifyPayment('usr_traveller_sprint2_001', {
          orderId: 'EBS-BKG-2026-000101',
          gatewayReference: 'order_mock_123',
          gatewayPaymentId: 'pay_mock_456',
          gatewaySignature: 'forged_fake_signature_abc_123',
          gatewayProvider: PaymentGatewayProvider.MOCK_SANDBOX,
        });
      });
    });
  });

  describe('handleWebhook', () => {
    it('should verify webhook HMAC and confirm payment asynchronously', async () => {
      const payload = {
        id: 'evt_webhook_test_001',
        event: 'payment.captured',
        bookingId: 'bkg-demo-kedarkantha-001',
        amount: 4272,
      };
      const rawBody = JSON.stringify(payload);
      const signature = mockAdapter.generateMockWebhookSignature(rawBody);

      const result = await service.handleWebhook(
        PaymentGatewayProvider.MOCK_SANDBOX,
        {
          'x-webhook-signature': signature,
        },
        rawBody,
      );

      assert.equal(result.received, true);
      assert.equal(result.status, 'PROCESSED');

      // Duplicate delivery should be safely ignored
      const duplicateResult = await service.handleWebhook(
        PaymentGatewayProvider.MOCK_SANDBOX,
        {
          'x-webhook-signature': signature,
        },
        rawBody,
      );
      assert.equal(duplicateResult.status, 'ALREADY_PROCESSED');
    });

    it('should reject webhooks with missing or invalid HMAC signatures', async () => {
      await assert.rejects(async () => {
        await service.handleWebhook(
          PaymentGatewayProvider.MOCK_SANDBOX,
          {
            'x-webhook-signature': 'invalid_hmac_hash',
          },
          JSON.stringify({ test: 123 }),
        );
      });
    });
  });

  describe('processCancellationRefund', () => {
    it('should process cancellation refund and update booking state', async () => {
      const booking = bridge.getBooking('EBS-BKG-2026-000101');
      bridge.updateBookingPaymentState(
        booking?.id as string,
        BookingStatus.CONFIRMED,
        4272,
        'tx-advance-init',
      );

      const refund = await service.processCancellationRefund(
        'usr_traveller_sprint2_001',
        [UserRole.TRAVELLER],
        {
          bookingId: booking?.id as string,
          reason: 'Personal schedule conflict',
        },
      );

      assert.ok(refund);
      assert.equal(refund.status, RefundStatus.SUCCEEDED);
      assert.ok(refund.refundAmount > 0);

      const updatedBooking = bridge.getBooking(booking?.id as string);
      assert.equal(updatedBooking?.status, BookingStatus.CANCELLED_BY_USER);
    });
  });
});
