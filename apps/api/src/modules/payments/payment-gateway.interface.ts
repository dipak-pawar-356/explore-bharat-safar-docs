// Explore Bharat Safar — Section 4: Payment Gateway Adapter Interface
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-29-THIRD-PARTY

import type {
  PaymentGatewayProvider,
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentVerificationPayload,
  RefundRequestPayload,
  RefundResponseRecord,
} from '@ebs/types';

export interface IPaymentGatewayAdapter {
  readonly provider: PaymentGatewayProvider;

  /**
   * Initializes order on payment gateway and returns client secrets / tokens.
   */
  createOrder(request: PaymentIntentRequest): Promise<PaymentIntentResponse>;

  /**
   * Cryptographically verifies payment callback signature using gateway secret.
   */
  verifySignature(payload: PaymentVerificationPayload): Promise<boolean>;

  /**
   * Dispatches automated or manual refund to source payment method.
   */
  processRefund(
    payload: RefundRequestPayload,
    originalTransactionAmount: number,
  ): Promise<RefundResponseRecord>;

  /**
   * Validates webhook HMAC signature against configured webhook secret.
   */
  verifyWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
  ): Promise<boolean>;
}
