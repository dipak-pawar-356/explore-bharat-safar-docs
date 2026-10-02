// Explore Bharat Safar — Section 4: Mock Sandbox Payment Gateway Adapter
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-29-THIRD-PARTY

import { Injectable, Logger } from '@nestjs/common';
import {
  PaymentGatewayProvider,
  RefundStatus,
  type PaymentIntentRequest,
  type PaymentIntentResponse,
  type PaymentVerificationPayload,
  type RefundRequestPayload,
  type RefundResponseRecord,
} from '@ebs/types';
import { createHmacSha256Hex, verifyHmacSha256Hex } from '@ebs/security-crypto';
import type { IPaymentGatewayAdapter } from '../payment-gateway.interface';

@Injectable()
export class MockGatewayAdapter implements IPaymentGatewayAdapter {
  private readonly logger = new Logger(MockGatewayAdapter.name);
  readonly provider = PaymentGatewayProvider.MOCK_SANDBOX;
  private readonly mockSecret = 'ebs_mock_webhook_secret_sandbox_key_2026';

  async createOrder(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const timestamp = Date.now();
    const gatewayOrderId = `order_mock_${request.orderId}_${timestamp}`;
    const clientSecret = `mock_secret_${request.orderId}_${timestamp}`;
    const amountInr = request.amountInr || 0;

    this.logger.log(
      `Mock Gateway Order created: ${gatewayOrderId} for order ${request.orderId}, amount: ${amountInr} INR`,
    );

    return {
      intentId: `pi_mock_${timestamp}`,
      orderId: request.orderId,
      gatewayOrderId,
      gatewayReference: gatewayOrderId,
      amountInr,
      currency: 'INR',
      provider: this.provider,
      clientSecret,
      paymentSessionId: `mock_session_${timestamp}`,
      keyId: 'mock_key_sandbox',
      expiryTimestamp: new Date(timestamp + 15 * 60 * 1000).toISOString(),
    };
  }

  async verifySignature(payload: PaymentVerificationPayload): Promise<boolean> {
    if (payload.gatewaySignature.startsWith('mock_sig_')) {
      return true;
    }

    const payloadString = `${payload.gatewayReference}|${payload.gatewayPaymentId}`;
    return verifyHmacSha256Hex(payloadString, payload.gatewaySignature, this.mockSecret);
  }

  async processRefund(
    payload: RefundRequestPayload,
    originalTransactionAmount: number,
  ): Promise<RefundResponseRecord> {
    const refundAmount = payload.refundAmountInr ?? originalTransactionAmount;
    const gatewayRefundId = `rfnd_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    this.logger.log(
      `Mock Refund processed for booking ${payload.bookingId}: amount ${refundAmount} INR, refund ID: ${gatewayRefundId}`,
    );

    return {
      refundId: gatewayRefundId,
      bookingId: payload.bookingId,
      transactionId: payload.transactionId || payload.bookingId,
      gatewayRefundId,
      amountRefunded: refundAmount,
      retainedFee: Math.max(0, originalTransactionAmount - refundAmount),
      refundPercentage: Math.round((refundAmount / (originalTransactionAmount || 1)) * 100),
      status: RefundStatus.SUCCEEDED,
      policyTierNote: 'MOCK_POLICY_EVALUATED',
      processedAt: new Date().toISOString(),
    };
  }

  async verifyWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
  ): Promise<boolean> {
    const signature =
      (headers['x-razorpay-signature'] as string) ||
      (headers['x-webhook-signature'] as string) ||
      (headers['x-mock-signature'] as string);

    if (!signature) {
      return false;
    }

    if (signature === 'valid-mock-signature' || signature.startsWith('mock_sig_')) {
      return true;
    }

    return verifyHmacSha256Hex(rawBody, signature, this.mockSecret);
  }

  generateMockSignature(orderId: string, paymentId: string): string {
    return createHmacSha256Hex(`${orderId}|${paymentId}`, this.mockSecret);
  }

  generateMockWebhookSignature(rawBody: string): string {
    return createHmacSha256Hex(rawBody, this.mockSecret);
  }
}
