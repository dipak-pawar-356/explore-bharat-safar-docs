// Explore Bharat Safar — Payments Controller Unit Tests
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-09-API

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { FastifyRequest } from 'fastify';
import {
  AccountStatus,
  BookingStatus,
  PaymentGatewayProvider,
  PaymentMethod,
  RefundStatus,
  UserRole,
  type User,
} from '@ebs/types';
import { PaymentsController } from './payments.controller';
import type { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;

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

  const mockPaymentsService = {
    createPaymentIntent: async () => ({
      intentId: 'pi_test_123',
      orderId: 'bkg-100',
      gatewayOrderId: 'order_rzp_123',
      amountInr: 4000,
      currency: 'INR',
      provider: PaymentGatewayProvider.RAZORPAY,
    }),
    verifyPayment: async () => ({
      isVerified: true,
      transactionId: 'tx_123',
      orderId: 'EBS-BKG-2026-000101',
      amountPaid: 4000,
      bookingStatus: BookingStatus.CONFIRMED,
      invoiceNumber: 'EBS-INV-2026-000101',
    }),
    handleWebhook: async () => ({
      received: true,
      status: 'PROCESSED',
    }),
    processCancellationRefund: async () => ({
      id: 'rfnd_123',
      transactionId: 'tx_123',
      bookingId: 'bkg-100',
      refundAmount: 3600,
      retainedFee: 400,
      refundPercentage: 90,
      reason: 'Trip cancelled by guest',
      policyTier: 'TIER_1_GREATER_THAN_30_DAYS',
      status: RefundStatus.SUCCEEDED,
    }),
    getInvoiceByBooking: async () => ({
      id: 'inv_123',
      invoiceNumber: 'EBS-INV-2026-000101',
      bookingId: 'bkg-100',
      sacCode: '998555',
    }),
    getTravellerTransactions: async () => [],
    getAdminLedger: () => ({
      entries: [],
      total: 0,
      balances: {},
    }),
    getPaymentControls: () => ({
      primaryGateway: PaymentGatewayProvider.RAZORPAY,
      defaultAdvancePercentage: 20,
    }),
    updatePaymentControls: () => ({
      primaryGateway: PaymentGatewayProvider.CASHFREE,
      defaultAdvancePercentage: 30,
    }),
  } as unknown as PaymentsService;

  beforeEach(() => {
    controller = new PaymentsController(mockPaymentsService);
  });

  it('should create payment intent', async () => {
    const res = await controller.createPaymentIntent(
      mockUser,
      {
        orderId: 'bkg-100',
        amountInr: 4000,
        paymentMethod: PaymentMethod.UPI,
      },
      'idem-key-1',
    );

    assert.equal(res.status, 'success');
    assert.equal(res.data.intentId, 'pi_test_123');
  });

  it('should verify payment signature', async () => {
    const res = await controller.verifyPayment(mockUser, {
      orderId: 'bkg-100',
      gatewayReference: 'order_rzp_123',
      gatewayPaymentId: 'pay_rzp_456',
      gatewaySignature: 'sig_valid',
      gatewayProvider: PaymentGatewayProvider.RAZORPAY,
    });

    assert.equal(res.status, 'success');
    assert.equal(res.data.isVerified, true);
  });

  it('should handle incoming webhook', async () => {
    const mockReq = {
      body: JSON.stringify({ event: 'payment.captured' }),
    } as unknown as FastifyRequest;

    const res = await controller.handleWebhook(
      PaymentGatewayProvider.RAZORPAY,
      { 'x-razorpay-signature': 'sig' },
      mockReq,
    );

    assert.equal(res.status, 'success');
    assert.equal(res.data.received, true);
  });

  it('should process refund', async () => {
    const res = await controller.processRefund(mockUser, {
      bookingId: 'bkg-100',
      reason: 'Trip cancelled by guest',
    });

    assert.equal(res.status, 'success');
    assert.equal(res.data.id, 'rfnd_123');
  });

  it('should retrieve tax invoice', async () => {
    const res = await controller.getInvoice(mockUser, 'bkg-100');
    assert.equal(res.status, 'success');
    assert.equal(res.data.sacCode, '998555');
  });

  it('should retrieve admin ledger', async () => {
    const res = await controller.getAdminLedger({});
    assert.equal(res.status, 'success');
    assert.ok(res.data);
  });

  it('should retrieve and update Super Admin payment controls', async () => {
    const getRes = await controller.getPaymentControls();
    assert.equal(getRes.status, 'success');
    assert.equal(getRes.data.defaultAdvancePercentage, 20);

    const updateRes = await controller.updatePaymentControls({
      primaryGateway: PaymentGatewayProvider.CASHFREE,
      defaultAdvancePercentage: 30,
      isFailoverEnabled: true,
      autoRefundThresholdInr: 60000,
    });
    assert.equal(updateRes.status, 'success');
    assert.equal(updateRes.data.defaultAdvancePercentage, 30);
  });
});
