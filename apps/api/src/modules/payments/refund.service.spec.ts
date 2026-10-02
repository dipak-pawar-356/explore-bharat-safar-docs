// Explore Bharat Safar — Tiered Cancellation & Refund Engine Unit Tests
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-26-RULES

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { RefundStatus } from '@ebs/types';
import { RefundService } from './refund.service';
import { TransactionLedgerService } from './transaction-ledger.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { RazorpayAdapter } from './adapters/razorpay.adapter';
import { CashfreeAdapter } from './adapters/cashfree.adapter';
import { MockGatewayAdapter } from './adapters/mock-gateway.adapter';
import type { ConfigService } from '@nestjs/config';

describe('RefundService', () => {
  let service: RefundService;

  beforeEach(() => {
    const mockConfig = { get: () => 'mock_secret' } as unknown as ConfigService;
    const ledger = new TransactionLedgerService();
    const gateway = new PaymentGatewayService(
      new RazorpayAdapter(mockConfig),
      new CashfreeAdapter(mockConfig),
      new MockGatewayAdapter(),
    );
    service = new RefundService(ledger, gateway);
  });

  describe('calculateRefundEstimate', () => {
    it('should return 90% refund when cancelled 30+ days before departure', () => {
      const departureDate = new Date(Date.now() + 35 * 86400000); // 35 days in future
      const estimate = service.calculateRefundEstimate('bkg-1', departureDate, 10000);

      assert.equal(estimate.refundPercentage, 90);
      assert.equal(estimate.eligibleRefundAmount, 9000);
      assert.equal(estimate.cancellationFee, 1000);
      assert.ok(estimate.policyTierNote.includes('30+ days prior'));
    });

    it('should return 50% refund when cancelled 15-29 days before departure', () => {
      const departureDate = new Date(Date.now() + 20 * 86400000); // 20 days in future
      const estimate = service.calculateRefundEstimate('bkg-2', departureDate, 10000);

      assert.equal(estimate.refundPercentage, 50);
      assert.equal(estimate.eligibleRefundAmount, 5000);
      assert.equal(estimate.cancellationFee, 5000);
      assert.ok(estimate.policyTierNote.includes('15-29 days prior'));
    });

    it('should return 25% refund when cancelled 7-14 days before departure', () => {
      const departureDate = new Date(Date.now() + 10 * 86400000); // 10 days in future
      const estimate = service.calculateRefundEstimate('bkg-3', departureDate, 10000);

      assert.equal(estimate.refundPercentage, 25);
      assert.equal(estimate.eligibleRefundAmount, 2500);
      assert.equal(estimate.cancellationFee, 7500);
      assert.ok(estimate.policyTierNote.includes('7-14 days prior'));
    });

    it('should return 0% refund when cancelled <7 days before departure', () => {
      const departureDate = new Date(Date.now() + 3 * 86400000); // 3 days in future
      const estimate = service.calculateRefundEstimate('bkg-4', departureDate, 10000);

      assert.equal(estimate.refundPercentage, 0);
      assert.equal(estimate.eligibleRefundAmount, 0);
      assert.equal(estimate.cancellationFee, 10000);
      assert.ok(estimate.policyTierNote.includes('<7 days prior'));
    });
  });

  describe('processRefund', () => {
    it('should execute automated refund and ledger entries for eligible cancellation', async () => {
      const departureDate = new Date(Date.now() + 35 * 86400000);
      const refund = await service.processRefund(
        {
          bookingId: 'bkg-100',
          reason: 'Medical emergency prior to trek',
        },
        8000,
        departureDate,
        'tx-100',
      );

      assert.equal(refund.status, RefundStatus.SUCCEEDED);
      assert.equal(refund.refundPercentage, 90);
      assert.equal(refund.refundAmount, 7200);
      assert.equal(refund.retainedFee, 800);
    });

    it('should support admin manual override refund amount', async () => {
      const departureDate = new Date(Date.now() + 2 * 86400000); // Normal: 0%
      const refund = await service.processRefund(
        {
          bookingId: 'bkg-admin-override',
          reason: 'Severe weather advisory, approved full goodwill refund',
          refundAmountInr: 8000,
          adminOverride: true,
        },
        8000,
        departureDate,
        'tx-override',
      );

      assert.equal(refund.refundAmount, 8000);
      assert.equal(refund.retainedFee, 0);
      assert.equal(refund.refundPercentage, 100);
      assert.ok(refund.policyTier.includes('ADMIN_MANUAL_OVERRIDE'));
    });

    it('should reject invalid override amount greater than total paid', async () => {
      const departureDate = new Date(Date.now() + 10 * 86400000);
      await assert.rejects(async () => {
        await service.processRefund(
          {
            bookingId: 'bkg-invalid',
            reason: 'Invalid amount requested',
            refundAmountInr: 12000,
            adminOverride: true,
          },
          8000,
          departureDate,
          'tx-invalid',
        );
      });
    });
  });
});
