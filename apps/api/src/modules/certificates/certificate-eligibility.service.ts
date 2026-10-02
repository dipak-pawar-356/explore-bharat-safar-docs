// Explore Bharat Safar — Certificate Quality Gates & Eligibility Evaluation Service
// Reference: EBS-DOC-20-CERT Section 2 (Strict Pre-requisite Quality Gates) & EBS-DOC-26-RULES Section 3

import { Injectable, Logger } from '@nestjs/common';
import {
  BookingStatus,
  BatchStatus,
  type CertificateEligibilityResult,
  type CertificateEligibilityChecks,
} from '@ebs/types';
import { BookingCertificateBridgeService } from '../../common/services/booking-certificate-bridge.service';

@Injectable()
export class CertificateEligibilityService {
  private readonly logger = new Logger(CertificateEligibilityService.name);

  constructor(private readonly bridgeService: BookingCertificateBridgeService) {}

  /**
   * Evaluates all 6 non-negotiable systemic quality gates.
   * Certificates will execute if and only if all criteria evaluate to TRUE.
   */
  evaluateEligibility(
    bookingId: string,
    participantId: string,
    isAlreadyIssued: boolean = false,
  ): CertificateEligibilityResult {
    const context = this.bridgeService.getParticipantContext(bookingId, participantId);

    const checks: CertificateEligibilityChecks = {
      experienceCompleted: false,
      batchFinalized: false,
      participantAttended: false,
      notCancelled: false,
      paymentsSettled: false,
      notAlreadyIssued: !isAlreadyIssued,
    };

    const reasons: string[] = [];

    if (!context) {
      reasons.push(`Participant or booking record not found for participant ${participantId}`);
      return { isEligible: false, reasons, checks };
    }

    const { participant, booking, batch } = context;

    // Gate 1: Batch / Experience Concluded
    const isBatchCompleted =
      batch.status === BatchStatus.COMPLETED ||
      new Date(batch.batchEndDate).getTime() <= Date.now();
    if (isBatchCompleted) {
      checks.experienceCompleted = true;
    } else {
      reasons.push(`Expedition batch ${batch.id} has not concluded yet.`);
    }

    // Gate 2: Batch Finalized by Admin
    const isFinalized = this.bridgeService.isBatchFinalized(batch.id);
    if (isFinalized) {
      checks.batchFinalized = true;
    } else {
      reasons.push(`Expedition batch ${batch.id} has not been finalized by the Trek Leader.`);
    }

    // Gate 3: On-Trail Attendance Verified
    if (participant.isAttendanceVerified) {
      checks.participantAttended = true;
    } else {
      reasons.push(
        `On-trail attendance has not been verified for participant ${participant.fullName}.`,
      );
    }

    // Gate 4: Not Cancelled
    const isCancelled =
      booking.status === BookingStatus.CANCELLED_BY_USER ||
      booking.status === BookingStatus.CANCELLED_BY_ADMIN ||
      booking.status === BookingStatus.EXPIRED;
    if (!isCancelled) {
      checks.notCancelled = true;
    } else {
      reasons.push(`Booking ${booking.orderNumber} is marked as CANCELLED.`);
    }

    // Gate 5: Zero Outstanding Balance Due
    const balanceDue = Number(
      booking.balanceAmountDue ?? booking.pricing.outstandingBalanceDue ?? 0,
    );
    if (balanceDue <= 0) {
      checks.paymentsSettled = true;
    } else {
      reasons.push(
        `Outstanding fiscal balance of ₹${balanceDue.toLocaleString('en-IN')} must be settled before certificate release.`,
      );
    }

    // Gate 6: Not Already Issued
    if (isAlreadyIssued) {
      reasons.push(
        `Active certificate has already been minted for participant ${participant.fullName}.`,
      );
    }

    const isEligible =
      checks.experienceCompleted &&
      checks.batchFinalized &&
      checks.participantAttended &&
      checks.notCancelled &&
      checks.paymentsSettled &&
      checks.notAlreadyIssued;

    if (!isEligible) {
      this.logger.warn(
        `Eligibility evaluation FAILED for participant ${participant.fullName} (${participantId}): ${reasons.join(' | ')}`,
      );
    }

    return {
      isEligible,
      reasons,
      checks,
    };
  }
}
