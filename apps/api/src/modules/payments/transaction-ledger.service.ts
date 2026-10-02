// Explore Bharat Safar — Section 4: Double-Entry Transaction Ledger Service
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-10-DATA, EBS-DOC-26-RULES

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { LedgerAccountType, LedgerEntryType, type TransactionLedgerEntryEntity } from '@ebs/types';

@Injectable()
export class TransactionLedgerService {
  private readonly logger = new Logger(TransactionLedgerService.name);

  // In-memory persistent double-entry ledger store
  private readonly entries: TransactionLedgerEntryEntity[] = [];

  // Account running balances
  private readonly balances = new Map<LedgerAccountType, number>();

  constructor() {
    // Initialize account chart of accounts
    Object.values(LedgerAccountType).forEach(account => {
      this.balances.set(account, 0);
    });
  }

  /**
   * Records initial advance payment booking deposit.
   * Debits Gateway Escrow and Credits Customer Advance Liability.
   */
  recordAdvancePayment(
    bookingId: string,
    transactionId: string,
    amountInr: number,
  ): TransactionLedgerEntryEntity[] {
    const roundedAmount = Math.round(amountInr * 100) / 100;
    if (roundedAmount <= 0) {
      throw new BadRequestException('Advance payment amount must be greater than zero.');
    }

    const referenceId = `TX-ADV-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. DEBIT: Gateway Escrow (asset increase)
    const currentGatewayBal = this.balances.get(LedgerAccountType.GATEWAY_ESCROW) || 0;
    const newGatewayBal = Math.round((currentGatewayBal + roundedAmount) * 100) / 100;
    this.balances.set(LedgerAccountType.GATEWAY_ESCROW, newGatewayBal);

    const debitEntry: TransactionLedgerEntryEntity = {
      id: `ledg_${Date.now()}_1`,
      transactionId,
      bookingId,
      accountType: LedgerAccountType.GATEWAY_ESCROW,
      entryType: LedgerEntryType.DEBIT,
      amount: roundedAmount,
      balanceAfter: newGatewayBal,
      referenceId,
      description: `Advance receipt collected via payment gateway for booking ${bookingId}`,
      createdAt: timestamp,
    };

    // 2. CREDIT: Customer Advance Liability (liability increase)
    const currentCustomerBal = this.balances.get(LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY) || 0;
    const newCustomerBal = Math.round((currentCustomerBal + roundedAmount) * 100) / 100;
    this.balances.set(LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY, newCustomerBal);

    const creditEntry: TransactionLedgerEntryEntity = {
      id: `ledg_${Date.now()}_2`,
      transactionId,
      bookingId,
      accountType: LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY,
      entryType: LedgerEntryType.CREDIT,
      amount: roundedAmount,
      balanceAfter: newCustomerBal,
      referenceId,
      description: `Customer advance holding deposit for booking ${bookingId}`,
      createdAt: timestamp,
    };

    this.verifyZeroSumInvariant([debitEntry], [creditEntry]);

    this.entries.push(debitEntry, creditEntry);
    this.logger.log(
      `Ledger: Advance payment of ${roundedAmount} INR recorded for booking ${bookingId}. Zero-sum invariant verified.`,
    );

    return [debitEntry, creditEntry];
  }

  /**
   * Records trip completion or full settlement:
   * Transfers Customer Advance into Tour Revenue and GST Payable.
   */
  recordFullSettlement(
    bookingId: string,
    transactionId: string,
    subtotalInr: number,
    cgstInr: number,
    sgstInr: number,
    balanceSettledAtBasecamp = 0,
  ): TransactionLedgerEntryEntity[] {
    const totalGst = Math.round((cgstInr + sgstInr) * 100) / 100;
    const grandTotal = Math.round((subtotalInr + totalGst) * 100) / 100;
    const timestamp = new Date().toISOString();
    const referenceId = `TX-SETTLE-${Date.now()}`;

    const debitEntries: TransactionLedgerEntryEntity[] = [];
    const creditEntries: TransactionLedgerEntryEntity[] = [];

    // Advance component released from liability
    const advancePaid = Math.round((grandTotal - balanceSettledAtBasecamp) * 100) / 100;
    if (advancePaid > 0) {
      const custBal = this.balances.get(LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY) || 0;
      const newCustBal = Math.round((custBal - advancePaid) * 100) / 100;
      this.balances.set(LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY, newCustBal);

      debitEntries.push({
        id: `ledg_${Date.now()}_deb_adv`,
        transactionId,
        bookingId,
        accountType: LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY,
        entryType: LedgerEntryType.DEBIT,
        amount: advancePaid,
        balanceAfter: newCustBal,
        referenceId,
        description: `Release advance deposit upon completion for booking ${bookingId}`,
        createdAt: timestamp,
      });
    }

    // Basecamp cash/card collection if any
    if (balanceSettledAtBasecamp > 0) {
      const gwBal = this.balances.get(LedgerAccountType.GATEWAY_ESCROW) || 0;
      const newGwBal = Math.round((gwBal + balanceSettledAtBasecamp) * 100) / 100;
      this.balances.set(LedgerAccountType.GATEWAY_ESCROW, newGwBal);

      debitEntries.push({
        id: `ledg_${Date.now()}_deb_bc`,
        transactionId,
        bookingId,
        accountType: LedgerAccountType.GATEWAY_ESCROW,
        entryType: LedgerEntryType.DEBIT,
        amount: balanceSettledAtBasecamp,
        balanceAfter: newGwBal,
        referenceId,
        description: `Basecamp final settlement collection for booking ${bookingId}`,
        createdAt: timestamp,
      });
    }

    // CREDIT: Tour Revenue
    const revBal = this.balances.get(LedgerAccountType.TOUR_REVENUE) || 0;
    const newRevBal = Math.round((revBal + subtotalInr) * 100) / 100;
    this.balances.set(LedgerAccountType.TOUR_REVENUE, newRevBal);

    creditEntries.push({
      id: `ledg_${Date.now()}_cred_rev`,
      transactionId,
      bookingId,
      accountType: LedgerAccountType.TOUR_REVENUE,
      entryType: LedgerEntryType.CREDIT,
      amount: subtotalInr,
      balanceAfter: newRevBal,
      referenceId,
      description: `Recognized tour operations revenue for booking ${bookingId}`,
      createdAt: timestamp,
    });

    // CREDIT: GST Payable (SAC 998555)
    const gstBal = this.balances.get(LedgerAccountType.GST_PAYABLE) || 0;
    const newGstBal = Math.round((gstBal + totalGst) * 100) / 100;
    this.balances.set(LedgerAccountType.GST_PAYABLE, newGstBal);

    creditEntries.push({
      id: `ledg_${Date.now()}_cred_gst`,
      transactionId,
      bookingId,
      accountType: LedgerAccountType.GST_PAYABLE,
      entryType: LedgerEntryType.CREDIT,
      amount: totalGst,
      balanceAfter: newGstBal,
      referenceId,
      description: `GST statutory liability (5% SAC 998555: CGST ${cgstInr} + SGST ${sgstInr}) for ${bookingId}`,
      createdAt: timestamp,
    });

    this.verifyZeroSumInvariant(debitEntries, creditEntries);

    this.entries.push(...debitEntries, ...creditEntries);
    return [...debitEntries, ...creditEntries];
  }

  /**
   * Records booking cancellation refund and penalty deduction:
   * Debits Customer Advance Liability, Credits Gateway Escrow (refunded to traveller),
   * and Credits Platform Fee (retained fee).
   */
  recordCancellationRefund(
    bookingId: string,
    transactionId: string,
    refundAmountInr: number,
    retainedFeeInr: number,
  ): TransactionLedgerEntryEntity[] {
    const totalDeducted = Math.round((refundAmountInr + retainedFeeInr) * 100) / 100;
    const timestamp = new Date().toISOString();
    const referenceId = `TX-RFND-${Date.now()}`;

    const debitEntries: TransactionLedgerEntryEntity[] = [];
    const creditEntries: TransactionLedgerEntryEntity[] = [];

    // 1. DEBIT: Customer Advance Liability (reduces holding liability)
    const custBal = this.balances.get(LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY) || 0;
    const newCustBal = Math.round((custBal - totalDeducted) * 100) / 100;
    this.balances.set(LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY, newCustBal);

    debitEntries.push({
      id: `ledg_${Date.now()}_rfnd_deb`,
      transactionId,
      bookingId,
      accountType: LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY,
      entryType: LedgerEntryType.DEBIT,
      amount: totalDeducted,
      balanceAfter: newCustBal,
      referenceId,
      description: `Debit customer advance deposit upon cancellation for ${bookingId}`,
      createdAt: timestamp,
    });

    // 2. CREDIT: Gateway Escrow (refund amount refunded back to customer's source account)
    if (refundAmountInr > 0) {
      const gwBal = this.balances.get(LedgerAccountType.GATEWAY_ESCROW) || 0;
      const newGwBal = Math.round((gwBal - refundAmountInr) * 100) / 100;
      this.balances.set(LedgerAccountType.GATEWAY_ESCROW, newGwBal);

      creditEntries.push({
        id: `ledg_${Date.now()}_rfnd_cred_gw`,
        transactionId,
        bookingId,
        accountType: LedgerAccountType.GATEWAY_ESCROW,
        entryType: LedgerEntryType.CREDIT,
        amount: refundAmountInr,
        balanceAfter: newGwBal,
        referenceId,
        description: `Dispatched refund to customer gateway/source for ${bookingId}`,
        createdAt: timestamp,
      });
    }

    // 3. CREDIT: Platform Fee (retained fee recognized as income)
    if (retainedFeeInr > 0) {
      const penBal = this.balances.get(LedgerAccountType.PLATFORM_FEE) || 0;
      const newPenBal = Math.round((penBal + retainedFeeInr) * 100) / 100;
      this.balances.set(LedgerAccountType.PLATFORM_FEE, newPenBal);

      creditEntries.push({
        id: `ledg_${Date.now()}_rfnd_cred_pen`,
        transactionId,
        bookingId,
        accountType: LedgerAccountType.PLATFORM_FEE,
        entryType: LedgerEntryType.CREDIT,
        amount: retainedFeeInr,
        balanceAfter: newPenBal,
        referenceId,
        description: `Cancellation retention fee for booking ${bookingId}`,
        createdAt: timestamp,
      });
    }

    this.verifyZeroSumInvariant(debitEntries, creditEntries);

    this.entries.push(...debitEntries, ...creditEntries);
    return [...debitEntries, ...creditEntries];
  }

  /**
   * Retrieves ledger journal entries with optional filtering.
   */
  getLedgerEntries(filter?: {
    bookingId?: string;
    accountType?: LedgerAccountType;
    page?: number;
    limit?: number;
  }): { items: TransactionLedgerEntryEntity[]; total: number } {
    let list = [...this.entries];

    if (filter?.bookingId) {
      list = list.filter(e => e.bookingId === filter.bookingId);
    }
    if (filter?.accountType) {
      list = list.filter(e => e.accountType === filter.accountType);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = filter?.page || 1;
    const limit = filter?.limit || 20;
    const startIndex = (page - 1) * limit;

    return {
      items: list.slice(startIndex, startIndex + limit),
      total: list.length,
    };
  }

  /**
   * Returns current trial balance snapshot across all accounts.
   */
  getAccountBalances(): Record<LedgerAccountType, number> {
    const snapshot: Partial<Record<LedgerAccountType, number>> = {};
    for (const [account, bal] of this.balances.entries()) {
      snapshot[account] = bal;
    }
    return snapshot as Record<LedgerAccountType, number>;
  }

  /**
   * Mathematical invariant check: Sum of debits must strictly equal sum of credits.
   */
  private verifyZeroSumInvariant(
    debits: TransactionLedgerEntryEntity[],
    credits: TransactionLedgerEntryEntity[],
  ): void {
    const totalDebit = debits.reduce((acc, curr) => acc + Math.round(curr.amount * 100), 0);
    const totalCredit = credits.reduce((acc, curr) => acc + Math.round(curr.amount * 100), 0);

    if (totalDebit !== totalCredit) {
      this.logger.error(
        `LEDGER INVARIANT VIOLATION: Total Debits (${totalDebit / 100}) != Total Credits (${totalCredit / 100})`,
      );
      throw new BadRequestException(
        'Financial ledger integrity error: Debits and credits do not balance.',
      );
    }
  }

  clearAll(): void {
    this.entries.length = 0;
    Object.values(LedgerAccountType).forEach(account => {
      this.balances.set(account, 0);
    });
  }
}
