// Explore Bharat Safar — Payment Gateway Service Unit Tests
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-29-THIRD-PARTY

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { ConfigService } from '@nestjs/config';
import { PaymentGatewayProvider } from '@ebs/types';
import { PaymentGatewayService } from './payment-gateway.service';
import { RazorpayAdapter } from './adapters/razorpay.adapter';
import { CashfreeAdapter } from './adapters/cashfree.adapter';
import { MockGatewayAdapter } from './adapters/mock-gateway.adapter';

describe('PaymentGatewayService', () => {
  let service: PaymentGatewayService;
  let razorpayAdapter: RazorpayAdapter;
  let cashfreeAdapter: CashfreeAdapter;
  let mockAdapter: MockGatewayAdapter;

  const mockConfigService = {
    get: (key: string) => {
      if (key === 'RAZORPAY_KEY_ID') return 'rzp_test_mock_id';
      if (key === 'RAZORPAY_KEY_SECRET') return 'rzp_test_mock_secret';
      if (key === 'RAZORPAY_WEBHOOK_SECRET') return 'rzp_test_webhook_secret';
      if (key === 'CASHFREE_APP_ID') return 'cf_test_mock_id';
      if (key === 'CASHFREE_SECRET_KEY') return 'cf_test_mock_secret';
      return null;
    },
  } as unknown as ConfigService;

  beforeEach(() => {
    razorpayAdapter = new RazorpayAdapter(mockConfigService);
    cashfreeAdapter = new CashfreeAdapter(mockConfigService);
    mockAdapter = new MockGatewayAdapter();
    service = new PaymentGatewayService(razorpayAdapter, cashfreeAdapter, mockAdapter);
  });

  describe('Configuration & Super Admin Controls', () => {
    it('should return initial default payment configuration', () => {
      const config = service.getConfig();
      assert.equal(config.primaryGateway, PaymentGatewayProvider.RAZORPAY);
      assert.equal(config.defaultAdvancePercentage, 20);
      assert.equal(config.isFailoverEnabled, true);
      assert.equal(config.autoRefundThresholdInr, 50000);
    });

    it('should allow Super Admin to update advance percentage within 10% - 100%', () => {
      const updated = service.updateConfig({
        primaryGateway: PaymentGatewayProvider.CASHFREE,
        defaultAdvancePercentage: 35,
        isFailoverEnabled: false,
        autoRefundThresholdInr: 75000,
      });

      assert.equal(updated.primaryGateway, PaymentGatewayProvider.CASHFREE);
      assert.equal(updated.defaultAdvancePercentage, 35);
      assert.equal(updated.isFailoverEnabled, false);
      assert.equal(updated.autoRefundThresholdInr, 75000);
    });

    it('should reject advance percentage below 10%', () => {
      assert.throws(() => {
        service.updateConfig({
          primaryGateway: PaymentGatewayProvider.RAZORPAY,
          defaultAdvancePercentage: 5,
          isFailoverEnabled: true,
          autoRefundThresholdInr: 50000,
        });
      });
    });

    it('should reject advance percentage above 100%', () => {
      assert.throws(() => {
        service.updateConfig({
          primaryGateway: PaymentGatewayProvider.RAZORPAY,
          defaultAdvancePercentage: 110,
          isFailoverEnabled: true,
          autoRefundThresholdInr: 50000,
        });
      });
    });
  });

  describe('Adapter Resolution & Circuit Breaker', () => {
    it('should resolve the configured adapter correctly', () => {
      const adapter = service.getAdapter(PaymentGatewayProvider.MOCK_SANDBOX);
      assert.equal(adapter.provider, PaymentGatewayProvider.MOCK_SANDBOX);
    });

    it('should trip circuit breaker and failover after 3 consecutive errors when failover enabled', async () => {
      // Record 3 failures on primary gateway (RAZORPAY)
      service.recordFailure(PaymentGatewayProvider.RAZORPAY);
      service.recordFailure(PaymentGatewayProvider.RAZORPAY);
      service.recordFailure(PaymentGatewayProvider.RAZORPAY);

      // Next call requesting RAZORPAY should automatically route to fallback (CASHFREE)
      const routedAdapter = service.getAdapter(PaymentGatewayProvider.RAZORPAY);
      assert.equal(routedAdapter.provider, PaymentGatewayProvider.CASHFREE);
    });

    it('should reset failure counter upon successful transaction', () => {
      service.recordFailure(PaymentGatewayProvider.RAZORPAY);
      service.recordFailure(PaymentGatewayProvider.RAZORPAY);
      service.recordSuccess(PaymentGatewayProvider.RAZORPAY);

      // Circuit remains closed and returns RAZORPAY
      const adapter = service.getAdapter(PaymentGatewayProvider.RAZORPAY);
      assert.equal(adapter.provider, PaymentGatewayProvider.RAZORPAY);
    });
  });

  describe('Order Creation Orchestration', () => {
    it('should orchestrate order creation on sandbox adapter cleanly', async () => {
      const response = await service.createOrderWithOrchestration({
        orderId: 'bkg-test-001',
        amountInr: 5000,
        gatewayProvider: PaymentGatewayProvider.MOCK_SANDBOX,
      });

      assert.ok(response);
      assert.equal(response.amountInr, 5000);
      assert.equal(response.provider, PaymentGatewayProvider.MOCK_SANDBOX);
      assert.ok(response.gatewayOrderId.includes('order_mock_bkg-test-001'));
    });
  });
});
