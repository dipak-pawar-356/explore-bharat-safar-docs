// Explore Bharat Safar — Section 4: Fintech & Payment Module
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-09-API

import { Module } from '@nestjs/common';
import { BookingPaymentBridgeService } from '../../common/services/booking-payment-bridge.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { TransactionLedgerService } from './transaction-ledger.service';
import { RefundService } from './refund.service';
import { IdempotencyService } from './idempotency.service';
import { RazorpayAdapter } from './adapters/razorpay.adapter';
import { CashfreeAdapter } from './adapters/cashfree.adapter';
import { MockGatewayAdapter } from './adapters/mock-gateway.adapter';

@Module({
  controllers: [PaymentsController],
  providers: [
    BookingPaymentBridgeService,
    PaymentsService,
    PaymentGatewayService,
    TransactionLedgerService,
    RefundService,
    IdempotencyService,
    RazorpayAdapter,
    CashfreeAdapter,
    MockGatewayAdapter,
  ],
  exports: [
    BookingPaymentBridgeService,
    PaymentsService,
    PaymentGatewayService,
    TransactionLedgerService,
    RefundService,
    IdempotencyService,
  ],
})
export class PaymentsModule {}
