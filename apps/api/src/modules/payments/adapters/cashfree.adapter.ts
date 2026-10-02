// Explore Bharat Safar — Section 4: Cashfree Payment Gateway Adapter
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-29-THIRD-PARTY

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
export class CashfreeAdapter implements IPaymentGatewayAdapter {
  private readonly logger = new Logger(CashfreeAdapter.name);
  readonly provider = PaymentGatewayProvider.CASHFREE;

  private readonly appId: string;
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('CASHFREE_APP_ID') || 'cf_test_app_id';
    this.secretKey =
      this.configService.get<string>('CASHFREE_SECRET_KEY') || 'cf_test_secret_key_2026';
  }

  async createOrder(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const timestamp = Date.now();
    const orderId = `cf_order_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
    const paymentSessionId = `session_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
    const amountInr = request.amountInr || 0;

    this.logger.log(
      `Cashfree Order created: ${orderId} for order ${request.orderId}, amount: ${amountInr} INR`,
    );

    return {
      intentId: `pi_cf_${timestamp}`,
      orderId: request.orderId,
      gatewayOrderId: orderId,
      gatewayReference: orderId,
      amountInr,
      currency: 'INR',
      provider: this.provider,
      clientSecret: paymentSessionId,
      paymentSessionId,
      keyId: this.appId,
      expiryTimestamp: new Date(timestamp + 15 * 60 * 1000).toISOString(),
    };
  }

  async verifySignature(payload: PaymentVerificationPayload): Promise<boolean> {
    const dataToSign = `${payload.gatewayReference}|${payload.gatewayPaymentId}`;
    return verifyHmacSha256Hex(dataToSign, payload.gatewaySignature, this.secretKey);
  }

  async processRefund(
    payload: RefundRequestPayload,
    originalTransactionAmount: number,
  ): Promise<RefundResponseRecord> {
    const refundAmount = payload.refundAmountInr ?? originalTransactionAmount;
    const gatewayRefundId = `rfnd_cf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    this.logger.log(
      `Cashfree Refund processed for booking ${payload.bookingId}: ${refundAmount} INR, refund ID: ${gatewayRefundId}`,
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
      policyTierNote: 'CASHFREE_STANDARD_REFUND',
      processedAt: new Date().toISOString(),
    };
  }

  async verifyWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
  ): Promise<boolean> {
    const signature =
      (headers['x-webhook-signature'] as string) || (headers['x-cf-signature'] as string);
    const timestamp = (headers['x-webhook-timestamp'] as string) || '';

    if (!signature) {
      this.logger.warn('Missing Cashfree webhook signature header.');
      return false;
    }

    const payloadToVerify = timestamp ? `${timestamp}${rawBody}` : rawBody;
    return verifyHmacSha256Hex(payloadToVerify, signature, this.secretKey);
  }

  generateTestSignature(orderId: string, paymentId: string): string {
    return createHmacSha256Hex(`${orderId}|${paymentId}`, this.secretKey);
  }

  generateTestWebhookSignature(rawBody: string, timestamp?: string): string {
    const payloadToVerify = timestamp ? `${timestamp}${rawBody}` : rawBody;
    return createHmacSha256Hex(payloadToVerify, this.secretKey);
  }
}
