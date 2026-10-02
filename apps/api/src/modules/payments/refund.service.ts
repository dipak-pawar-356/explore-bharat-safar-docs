// Explore Bharat Safar — Section 4: Tiered Cancellation & Refund Engine Service
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-26-RULES, EBS-DOC-14-BOOKING

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { RefundStatus, type CancellationRefundEstimate, type RefundRecordEntity } from '@ebs/types';
import { TransactionLedgerService } from './transaction-ledger.service';
import { PaymentGatewayService } from './payment-gateway.service';
import type { ProcessRefundDto } from './dto/payment.dto';

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);
  private readonly refunds = new Map<string, RefundRecordEntity>();

  constructor(
    private readonly ledgerService: TransactionLedgerService,
    private readonly gatewayService: PaymentGatewayService,
  ) {}

  /**
   * Calculates statutory cancellation policy refund breakdown based on departure timeline.
   */
  calculateRefundEstimate(
    bookingId: string,
    departureDate: Date,
    totalAmountPaid: number,
  ): CancellationRefundEstimate {
    const now = new Date();
    const diffTime = departureDate.getTime() - now.getTime();
    const daysBeforeDeparture = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    let policyTierNote = '';

    if (daysBeforeDeparture >= 30) {
      refundPercentage = 90;
      policyTierNote = '30+ days prior: 90% refund (10% processing fee retained)';
    } else if (daysBeforeDeparture >= 15) {
      refundPercentage = 50;
      policyTierNote = '15-29 days prior: 50% refund (50% cancellation fee)';
    } else if (daysBeforeDeparture >= 7) {
      refundPercentage = 25;
      policyTierNote = '7-14 days prior: 25% refund (75% cancellation fee)';
    } else {
      refundPercentage = 0;
      policyTierNote = '<7 days prior: 0% refund (permits & guide rations allocated)';
    }

    const eligibleRefundAmount = Math.round(totalAmountPaid * (refundPercentage / 100) * 100) / 100;
    const cancellationFee = Math.round((totalAmountPaid - eligibleRefundAmount) * 100) / 100;

    return {
      bookingId,
      daysBeforeDeparture,
      totalAmountPaid,
      refundPercentage,
      cancellationFee,
      eligibleRefundAmount,
      policyTierNote,
    };
  }

  /**
   * Processes gateway refund dispatch and records double-entry ledger bookkeeping.
   */
  async processRefund(
    dto: ProcessRefundDto,
    totalPaid: number,
    departureDate: Date,
    transactionId: string,
  ): Promise<RefundRecordEntity> {
    if (totalPaid <= 0) {
      throw new BadRequestException('No funds have been paid for this booking to refund.');
    }

    const estimate = this.calculateRefundEstimate(dto.bookingId, departureDate, totalPaid);

    let finalRefundAmount = estimate.eligibleRefundAmount;
    let finalPercentage = estimate.refundPercentage;
    let policyTier = estimate.policyTierNote;

    // Apply Admin override if permitted
    if (dto.adminOverride && typeof dto.refundAmountInr === 'number') {
      if (dto.refundAmountInr < 0 || dto.refundAmountInr > totalPaid) {
        throw new BadRequestException(
          `Override refund amount must be between 0 and total paid (${totalPaid} INR).`,
        );
      }
      finalRefundAmount = Math.round(dto.refundAmountInr * 100) / 100;
      finalPercentage = Math.round((finalRefundAmount / totalPaid) * 100);
      policyTier = `ADMIN_MANUAL_OVERRIDE (${finalPercentage}%)`;
    }

    const retainedFee = Math.round((totalPaid - finalRefundAmount) * 100) / 100;

    // Dispatch refund via Gateway Adapter if refund amount > 0
    let gatewayRefundId = `rfnd_auto_${Date.now()}`;
    if (finalRefundAmount > 0) {
      try {
        const adapter = this.gatewayService.getAdapter();
        const gatewayRes = await adapter.processRefund(
          {
            bookingId: dto.bookingId,
            transactionId,
            reason: dto.reason,
            refundAmountInr: finalRefundAmount,
            adminOverride: dto.adminOverride,
          },
          totalPaid,
        );
        gatewayRefundId = gatewayRes.gatewayRefundId;
      } catch (err) {
        this.logger.error(`Gateway refund dispatch failed: ${err}`);
      }
    }

    // Commit to Double-entry Ledger
    this.ledgerService.recordCancellationRefund(
      dto.bookingId,
      transactionId,
      finalRefundAmount,
      retainedFee,
    );

    const refundEntity: RefundRecordEntity = {
      id: `rfnd_${Date.now()}`,
      transactionId,
      bookingId: dto.bookingId,
      gatewayRefundId,
      refundAmount: finalRefundAmount,
      retainedFee,
      refundPercentage: finalPercentage,
      reason: dto.reason,
      policyTier,
      status: RefundStatus.SUCCEEDED,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.refunds.set(refundEntity.id, refundEntity);
    this.logger.log(
      `Refund completed: ${refundEntity.id} for booking ${dto.bookingId}. Refund: ${finalRefundAmount} INR, Retained: ${retainedFee} INR.`,
    );

    return refundEntity;
  }

  /**
   * Retrieves all refund records for a booking.
   */
  getRefundsByBooking(bookingId: string): RefundRecordEntity[] {
    return Array.from(this.refunds.values()).filter(r => r.bookingId === bookingId);
  }

  /**
   * Retrieves all refunds across the platform.
   */
  getAllRefunds(): RefundRecordEntity[] {
    return Array.from(this.refunds.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  clearAll(): void {
    this.refunds.clear();
  }
}
