// Explore Bharat Safar — Double-Entry Transaction Ledger Unit Tests
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-10-DATA, EBS-DOC-26-RULES

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LedgerAccountType, LedgerEntryType } from '@ebs/types';
import { TransactionLedgerService } from './transaction-ledger.service';

describe('TransactionLedgerService', () => {
  let service: TransactionLedgerService;

  beforeEach(() => {
    service = new TransactionLedgerService();
  });

  describe('recordAdvancePayment', () => {
    it('should record matched DEBIT to GATEWAY_ESCROW and CREDIT to CUSTOMER_ADVANCE_LIABILITY', () => {
      const entries = service.recordAdvancePayment('bkg-100', 'tx-100', 4500.0);

      assert.equal(entries.length, 2);

      const debit = entries.find(e => e.entryType === LedgerEntryType.DEBIT);
      const credit = entries.find(e => e.entryType === LedgerEntryType.CREDIT);

      assert.ok(debit);
      assert.equal(debit.accountType, LedgerAccountType.GATEWAY_ESCROW);
      assert.equal(debit.amount, 4500.0);

      assert.ok(credit);
      assert.equal(credit.accountType, LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY);
      assert.equal(credit.amount, 4500.0);

      // Verify trial balances
      const balances = service.getAccountBalances();
      assert.equal(balances[LedgerAccountType.GATEWAY_ESCROW], 4500.0);
      assert.equal(balances[LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY], 4500.0);
    });

    it('should reject advance payment with zero or negative amounts', () => {
      assert.throws(() => {
        service.recordAdvancePayment('bkg-100', 'tx-100', 0);
      });

      assert.throws(() => {
        service.recordAdvancePayment('bkg-100', 'tx-100', -500);
      });
    });
  });

  describe('recordFullSettlement', () => {
    it('should release advance liability and recognize tour revenue and GST payable', () => {
      // Step 1: Advance payment of 3000
      service.recordAdvancePayment('bkg-200', 'tx-adv-200', 3000.0);

      // Step 2: Final settlement: Total 10500 (Subtotal 10000, CGST 250, SGST 250), Basecamp settlement: 7500
      const entries = service.recordFullSettlement(
        'bkg-200',
        'tx-fin-200',
        10000.0,
        250.0,
        250.0,
        7500.0,
      );

      assert.ok(entries.length >= 4);

      const balances = service.getAccountBalances();
      // Customer advance liability should be fully released (back to 0)
      assert.equal(balances[LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY], 0);
      // Recognized revenue should be 10000
      assert.equal(balances[LedgerAccountType.TOUR_REVENUE], 10000.0);
      // Statutory GST payable should be 500
      assert.equal(balances[LedgerAccountType.GST_PAYABLE], 500.0);
      // Total gateway escrow should be 3000 (advance) + 7500 (basecamp) = 10500
      assert.equal(balances[LedgerAccountType.GATEWAY_ESCROW], 10500.0);
    });
  });

  describe('recordCancellationRefund', () => {
    it('should debit customer liability and split between gateway refund and platform cancellation fee', () => {
      // 5000 advance paid initially
      service.recordAdvancePayment('bkg-300', 'tx-300', 5000.0);

      // Cancellation with 90% refund (4500 refund, 500 retained fee)
      const entries = service.recordCancellationRefund('bkg-300', 'tx-300', 4500.0, 500.0);

      assert.equal(entries.length, 3);

      const balances = service.getAccountBalances();
      // Customer advance liability is reduced to 0
      assert.equal(balances[LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY], 0);
      // Gateway clearing has refunded 4500, balance remaining is 500
      assert.equal(balances[LedgerAccountType.GATEWAY_ESCROW], 500.0);
      // Platform cancellation fee recognized is 500
      assert.equal(balances[LedgerAccountType.PLATFORM_FEE], 500.0);
    });
  });

  describe('Audit Querying & Pagination', () => {
    it('should paginate and filter ledger entries accurately', () => {
      service.recordAdvancePayment('bkg-1', 'tx-1', 1000);
      service.recordAdvancePayment('bkg-2', 'tx-2', 2000);

      const result = service.getLedgerEntries({ bookingId: 'bkg-1' });
      assert.equal(result.total, 2);
      assert.ok(result.items.every(e => e.bookingId === 'bkg-1'));
    });
  });
});
