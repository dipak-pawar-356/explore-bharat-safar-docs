// Explore Bharat Safar — Section 4: Payment Domain Service
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-09-API, EBS-DOC-10-DATA, EBS-DOC-26-RULES, EBS-DOC-29-THIRD-PARTY

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import {
  BookingStatus,
  PaymentGatewayProvider,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
  UserRole,
  type PaymentIntentResponse,
  type PaymentVerificationResult,
  type PaymentTransactionEntity,
  type InvoiceEntity,
  type RefundRecordEntity,
  type SuperAdminPaymentControlsEntity,
  type SuperAdminPaymentControlsDto,
  type TransactionLedgerEntryEntity,
  type BookingOrder,
} from '@ebs/types';
import { BookingPaymentBridgeService } from '../../common/services/booking-payment-bridge.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { TransactionLedgerService } from './transaction-ledger.service';
import { RefundService } from './refund.service';
import { IdempotencyService } from './idempotency.service';
import type {
  CreatePaymentIntentDto,
  VerifyPaymentSignatureDto,
  ProcessRefundDto,
} from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  // In-memory persistent transactional entities
  private readonly transactions = new Map<string, PaymentTransactionEntity>();
  private readonly invoices = new Map<string, InvoiceEntity>();
  private readonly processedWebhookEvents = new Set<string>();

  // Sequential invoice counter
  private invoiceCounter = 100;

  constructor(
    private readonly bookingBridge: BookingPaymentBridgeService,
    private readonly gatewayService: PaymentGatewayService,
    private readonly ledgerService: TransactionLedgerService,
    private readonly refundService: RefundService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  /**
   * Initializes a payment intent and gateway order.
   * Enforces 24h idempotency replay defense and Super Admin payment percentages.
   */
  async createPaymentIntent(
    userId: string,
    dto: CreatePaymentIntentDto,
    idempotencyKey?: string,
  ): Promise<PaymentIntentResponse> {
    const endpoint = '/api/v1/payments/intent';

    // 1. Idempotency validation
    if (idempotencyKey) {
      const cached = this.idempotencyService.checkIdempotency(idempotencyKey, endpoint, dto);
      if (cached) {
        return cached.responsePayload as PaymentIntentResponse;
      }
    }

    // 2. Booking lookup & validation (dto.orderId can be bookingId or orderNumber)
    const booking = this.bookingBridge.getBooking(dto.orderId);
    if (!booking) {
      throw new NotFoundException({
        errorCode: 'EBS_BOOKING_NOT_FOUND',
        message: `Booking order ${dto.orderId} does not exist.`,
      });
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException({
        errorCode: 'EBS_ACCESS_DENIED',
        message: 'You are not authorized to initiate payment for this booking.',
      });
    }

    if (
      booking.status !== BookingStatus.PENDING_PAYMENT &&
      booking.status !== BookingStatus.DRAFT
    ) {
      throw new BadRequestException({
        errorCode: 'EBS_INVALID_BOOKING_STATE',
        message: `Cannot initiate payment for booking in '${booking.status}' state.`,
      });
    }

    // 3. Super Admin Payment Percentage enforcement
    const controls = this.gatewayService.getConfig();
    const minAdvancePercentage = controls.defaultAdvancePercentage; // 10% - 100%
    const totalAmount = booking.pricing.totalBookingAmount;
    const requiredMinAdvance = Math.round(totalAmount * (minAdvancePercentage / 100) * 100) / 100;

    const requestedAmount =
      dto.amountInr ?? booking.pricing.mandatoryAdvanceDeposit ?? requiredMinAdvance;

    // Validate requested amount
    if (requestedAmount < requiredMinAdvance && requestedAmount < totalAmount) {
      throw new BadRequestException({
        errorCode: 'EBS_BELOW_MINIMUM_ADVANCE',
        message: `Minimum required deposit is ${minAdvancePercentage}% (${requiredMinAdvance} INR).`,
      });
    }

    // 4. Gateway Order Creation via Orchestrator
    const gatewayResponse = await this.gatewayService.createOrderWithOrchestration({
      orderId: booking.id,
      amountInr: requestedAmount,
      gatewayProvider: dto.gatewayProvider || controls.primaryGateway,
      paymentMethod: dto.paymentMethod || PaymentMethod.UPI,
      customerEmail: dto.customerEmail || booking.userEmail,
      customerPhone: dto.customerPhone,
      notes: {
        bookingId: booking.id,
        orderNumber: booking.orderNumber,
      },
    });

    // 5. Cache response in idempotency registry
    if (idempotencyKey) {
      this.idempotencyService.storeIdempotency(idempotencyKey, endpoint, dto, gatewayResponse, 201);
    }

    this.logger.log(
      `Payment Intent created: Order ${gatewayResponse.gatewayOrderId} for booking ${booking.orderNumber}. Amount: ${requestedAmount} INR`,
    );

    return gatewayResponse;
  }

  /**
   * Cryptographically verifies payment callback signature, commits double-entry ledger,
   * updates booking status to CONFIRMED, and generates statutory GST invoice.
   */
  async verifyPayment(
    userId: string,
    dto: VerifyPaymentSignatureDto,
  ): Promise<PaymentVerificationResult> {
    const booking = this.bookingBridge.getBooking(dto.orderId);
    if (!booking) {
      throw new NotFoundException(`Booking ${dto.orderId} not found.`);
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Access denied to booking payment confirmation.');
    }

    // Check if already paid / confirmed (idempotency guard)
    if (booking.status === BookingStatus.CONFIRMED && booking.paymentTransactionId) {
      const existingTx = this.transactions.get(booking.paymentTransactionId);
      const existingInv = Array.from(this.invoices.values()).find(i => i.bookingId === booking.id);
      if (existingTx && existingInv) {
        return {
          isVerified: true,
          transactionId: existingTx.id,
          orderId: booking.orderNumber,
          amountPaid: existingTx.amountPaid,
          bookingStatus: booking.status,
          invoiceNumber: existingInv.invoiceNumber,
        };
      }
    }

    // 1. Cryptographic Signature Verification
    const adapter = this.gatewayService.getAdapter(dto.gatewayProvider);
    const isValid = await adapter.verifySignature({
      orderId: dto.orderId,
      gatewayReference: dto.gatewayReference,
      gatewayPaymentId: dto.gatewayPaymentId,
      gatewaySignature: dto.gatewaySignature,
    });

    if (!isValid) {
      this.logger.warn(
        `PAYMENT FRAUD WARNING: Invalid signature for order ${dto.orderId} via ${dto.gatewayProvider}`,
      );
      throw new BadRequestException({
        errorCode: 'EBS_INVALID_SIGNATURE',
        message: 'Cryptographic signature verification failed. Transaction rejected.',
      });
    }

    // 2. Record Payment Transaction Entity
    const amountPaid =
      booking.pricing.mandatoryAdvanceDeposit || booking.pricing.totalBookingAmount;
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const transaction: PaymentTransactionEntity = {
      id: txId,
      bookingId: booking.id,
      gatewayReference: dto.gatewayReference || dto.gatewayPaymentId,
      gatewayPaymentId: dto.gatewayPaymentId,
      gatewayProvider: dto.gatewayProvider || PaymentGatewayProvider.RAZORPAY,
      paymentMethod: PaymentMethod.UPI,
      amountPaid,
      currency: 'INR',
      transactionType: TransactionType.ADVANCE_DEPOSIT,
      transactionStatus: TransactionStatus.SUCCESS,
      refundedAmount: 0,
      gatewayPayload: {
        orderId: dto.orderId,
        paymentId: dto.gatewayPaymentId,
        provider: dto.gatewayProvider,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.transactions.set(transaction.id, transaction);

    // 3. Double-Entry Financial Ledger Commit
    this.ledgerService.recordAdvancePayment(booking.id, transaction.id, amountPaid);

    // 4. Update Booking State to CONFIRMED
    const updatedBooking = this.bookingBridge.updateBookingPaymentState(
      booking.id,
      BookingStatus.CONFIRMED,
      amountPaid,
      transaction.id,
    );

    // 5. Generate Statutory GST Invoice (SAC 998555)
    const invoice = this.generateTaxInvoice(updatedBooking, amountPaid);
    this.invoices.set(invoice.id, invoice);

    this.logger.log(
      `Payment Verified & Confirmed: Booking ${booking.orderNumber}, Tx: ${transaction.id}, Invoice: ${invoice.invoiceNumber}`,
    );

    return {
      isVerified: true,
      transactionId: transaction.id,
      orderId: updatedBooking.orderNumber,
      amountPaid,
      bookingStatus: updatedBooking.status,
      invoiceNumber: invoice.invoiceNumber,
    };
  }

  /**
   * Secure Webhook Handler with HMAC verification, replay defense, and idempotency.
   */
  async handleWebhook(
    provider: PaymentGatewayProvider,
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
  ): Promise<{ received: boolean; status: string }> {
    const adapter = this.gatewayService.getAdapter(provider);

    // 1. Verify HMAC Signature
    const isSignatureValid = await adapter.verifyWebhookSignature(headers, rawBody);
    if (!isSignatureValid) {
      this.logger.warn(`Rejected invalid webhook signature from ${provider}`);
      throw new BadRequestException('Invalid webhook signature.');
    }

    // 2. Parse & Deduplicate
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(rawBody);
    } catch {
      throw new BadRequestException('Invalid webhook payload format.');
    }

    const eventId =
      (event.id as string) ||
      (event.event_id as string) ||
      (headers['x-razorpay-event-id'] as string) ||
      `evt_${Date.now()}`;

    if (this.processedWebhookEvents.has(eventId)) {
      this.logger.log(`Duplicate webhook event ${eventId} safely ignored.`);
      return { received: true, status: 'ALREADY_PROCESSED' };
    }
    this.processedWebhookEvents.add(eventId);

    // 3. Process Event Data
    this.logger.log(`Webhook received and verified from ${provider}: ${eventId}`);

    // If payload contains booking / payment capture info, handle confirmation
    const paymentEntity = (event.payload as Record<string, unknown>)?.payment as Record<
      string,
      unknown
    >;
    const entity = (paymentEntity?.entity as Record<string, unknown>) || event;
    const notes = (entity.notes as Record<string, unknown>) || {};
    const bookingId = (notes.bookingId as string) || (event.bookingId as string);

    if (bookingId) {
      const booking = this.bookingBridge.getBooking(bookingId);
      if (booking && booking.status !== BookingStatus.CONFIRMED) {
        const amount =
          Number(entity.amount || 0) / (provider === PaymentGatewayProvider.RAZORPAY ? 100 : 1);
        const paymentId = (entity.id as string) || `webhook_pay_${Date.now()}`;

        const txId = `tx_wh_${Date.now()}`;
        const transaction: PaymentTransactionEntity = {
          id: txId,
          bookingId: booking.id,
          gatewayReference: paymentId,
          gatewayPaymentId: paymentId,
          gatewayProvider: provider,
          paymentMethod: PaymentMethod.UPI,
          amountPaid: amount || booking.pricing.mandatoryAdvanceDeposit,
          currency: 'INR',
          transactionType: TransactionType.ADVANCE_DEPOSIT,
          transactionStatus: TransactionStatus.SUCCESS,
          refundedAmount: 0,
          gatewayPayload: event,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.transactions.set(txId, transaction);

        this.ledgerService.recordAdvancePayment(booking.id, txId, transaction.amountPaid);
        const updated = this.bookingBridge.updateBookingPaymentState(
          booking.id,
          BookingStatus.CONFIRMED,
          transaction.amountPaid,
          txId,
        );
        const invoice = this.generateTaxInvoice(updated, transaction.amountPaid);
        this.invoices.set(invoice.id, invoice);
      }
    }

    return { received: true, status: 'PROCESSED' };
  }

  /**
   * Dispatches cancellation refund, executes policy tier deductions, and ledger entries.
   */
  async processCancellationRefund(
    userId: string,
    userRoles: UserRole[],
    dto: ProcessRefundDto,
  ): Promise<RefundRecordEntity> {
    const booking = this.bookingBridge.getBooking(dto.bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking ${dto.bookingId} not found.`);
    }

    // Role verification: only the booking owner or Admin/SuperAdmin can initiate refund
    const isAdmin =
      userRoles.includes(UserRole.SUPER_ADMIN) ||
      userRoles.includes(UserRole.FINANCE_ADMIN) ||
      userRoles.includes(UserRole.SYSTEM_ADMIN);
    if (!isAdmin && booking.userId !== userId) {
      throw new ForbiddenException('You are not authorized to cancel this booking.');
    }

    if (dto.adminOverride && !isAdmin) {
      throw new ForbiddenException('Administrative override requires ADMIN role.');
    }

    const departureDate = this.bookingBridge.getDepartureDate(booking.batchId);
    const totalPaid = booking.advanceAmountPaid || booking.pricing.mandatoryAdvanceDeposit || 0;
    const txId = booking.paymentTransactionId || `tx_${booking.id}`;

    const refund = await this.refundService.processRefund(dto, totalPaid, departureDate, txId);

    // Update booking status
    const newStatus = isAdmin ? BookingStatus.CANCELLED_BY_ADMIN : BookingStatus.CANCELLED_BY_USER;
    this.bookingBridge.updateBookingPaymentState(booking.id, newStatus, 0);

    return refund;
  }

  /**
   * Retrieves single invoice for booking order.
   */
  async getInvoiceByBooking(
    bookingId: string,
    userId: string,
    userRoles: UserRole[],
  ): Promise<InvoiceEntity> {
    const booking = this.bookingBridge.getBooking(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found.`);
    }

    const isAdmin =
      userRoles.includes(UserRole.SUPER_ADMIN) ||
      userRoles.includes(UserRole.FINANCE_ADMIN) ||
      userRoles.includes(UserRole.SYSTEM_ADMIN);
    if (!isAdmin && booking.userId !== userId) {
      throw new ForbiddenException('Access denied to invoice.');
    }

    const invoice = Array.from(this.invoices.values()).find(i => i.bookingId === bookingId);
    if (!invoice) {
      throw new NotFoundException(`Tax invoice for booking ${bookingId} has not been generated.`);
    }

    return invoice;
  }

  /**
   * Retrieves transaction history for a specific traveller.
   */
  async getTravellerTransactions(userId: string): Promise<PaymentTransactionEntity[]> {
    const userBookings = this.bookingBridge.getTravellerBookings(userId);
    const bookingIds = new Set(userBookings.map(b => b.id));

    return Array.from(this.transactions.values())
      .filter(tx => bookingIds.has(tx.bookingId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Administrative view of double-entry ledger transactions and balances.
   */
  getAdminLedger(filter?: { bookingId?: string; page?: number; limit?: number }): {
    entries: TransactionLedgerEntryEntity[];
    total: number;
    balances: Record<string, number>;
  } {
    const { items, total } = this.ledgerService.getLedgerEntries(filter);
    const balances = this.ledgerService.getAccountBalances();
    return {
      entries: items,
      total,
      balances,
    };
  }

  /**
   * Super Admin payment controls getters and updates.
   */
  getPaymentControls(): SuperAdminPaymentControlsEntity {
    return this.gatewayService.getConfig();
  }

  updatePaymentControls(dto: SuperAdminPaymentControlsDto): SuperAdminPaymentControlsEntity {
    return this.gatewayService.updateConfig(dto);
  }

  /**
   * Generates statutory GST invoice with SAC Code 998555 and sequential numbering.
   */
  private generateTaxInvoice(booking: BookingOrder, amountPaid: number): InvoiceEntity {
    this.invoiceCounter += 1;
    const year = new Date().getFullYear();
    const invoiceNumber = `EBS-INV-${year}-${String(this.invoiceCounter).padStart(6, '0')}`;

    // 5% GST split into 2.5% CGST and 2.5% SGST
    const subtotal = Math.round((amountPaid / 1.05) * 100) / 100;
    const totalGst = Math.round((amountPaid - subtotal) * 100) / 100;
    const cgstAmount = Math.round((totalGst / 2) * 100) / 100;
    const sgstAmount = Math.round((totalGst - cgstAmount) * 100) / 100;

    return {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invoiceNumber,
      bookingId: booking.id,
      customerName: booking.userName || 'Valued Traveller',
      customerEmail: booking.userEmail,
      sacCode: '998555',
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      grandTotal: amountPaid,
      advancePaid: amountPaid,
      balanceDue: booking.balanceAmountDue ?? 0,
      pdfVaultUri: `/invoices/${invoiceNumber}.pdf`,
      issuedAt: new Date().toISOString(),
    };
  }

  clearAll(): void {
    this.transactions.clear();
    this.invoices.clear();
    this.processedWebhookEvents.clear();
  }
}
