// Explore Bharat Safar — Section 4: Razorpay Payment Gateway Adapter
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
export class RazorpayAdapter implements IPaymentGatewayAdapter {
  private readonly logger = new Logger(RazorpayAdapter.name);
  readonly provider = PaymentGatewayProvider.RAZORPAY;

  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_ebs_mock_id';
    this.keySecret =
      this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'rzp_test_ebs_mock_secret_key';
    this.webhookSecret =
      this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || 'rzp_test_ebs_webhook_secret';
  }

  async createOrder(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const timestamp = Date.now();
    const amountInr = request.amountInr || 0;
    const amountInPaise = Math.round(amountInr * 100);
    const orderId = `order_rzp_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;

    this.logger.log(
      `Razorpay Order created: ${orderId} for order ${request.orderId}, amount ${amountInPaise} paise`,
    );

    return {
      intentId: `pi_rzp_${timestamp}`,
      orderId: request.orderId,
      gatewayOrderId: orderId,
      gatewayReference: orderId,
      amountInr,
      currency: 'INR',
      provider: this.provider,
      clientSecret: this.keyId,
      keyId: this.keyId,
      expiryTimestamp: new Date(timestamp + 15 * 60 * 1000).toISOString(),
    };
  }

  async verifySignature(payload: PaymentVerificationPayload): Promise<boolean> {
    const dataToSign = `${payload.gatewayReference}|${payload.gatewayPaymentId}`;
    return verifyHmacSha256Hex(dataToSign, payload.gatewaySignature, this.keySecret);
  }

  async processRefund(
    payload: RefundRequestPayload,
    originalTransactionAmount: number,
  ): Promise<RefundResponseRecord> {
    const refundAmount = payload.refundAmountInr ?? originalTransactionAmount;
    const gatewayRefundId = `rfnd_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    this.logger.log(
      `Razorpay Refund dispatched for booking ${payload.bookingId}: ${refundAmount} INR, refund ID ${gatewayRefundId}`,
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
      policyTierNote: 'RAZORPAY_STANDARD_REFUND',
      processedAt: new Date().toISOString(),
    };
  }

  async verifyWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
  ): Promise<boolean> {
    const signature = headers['x-razorpay-signature'] as string;
    if (!signature) {
      this.logger.warn('Missing X-Razorpay-Signature header on incoming webhook.');
      return false;
    }

    return verifyHmacSha256Hex(rawBody, signature, this.webhookSecret);
  }

  generateTestSignature(orderId: string, paymentId: string): string {
    return createHmacSha256Hex(`${orderId}|${paymentId}`, this.keySecret);
  }

  generateTestWebhookSignature(rawBody: string): string {
    return createHmacSha256Hex(rawBody, this.webhookSecret);
  }
}
