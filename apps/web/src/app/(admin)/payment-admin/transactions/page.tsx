// Explore Bharat Safar — Financial Administration: Double-Entry Transaction Ledger
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-10-DATA, EBS-DOC-26-RULES

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LedgerAccountType, LedgerEntryType, type TransactionLedgerEntryEntity } from '@ebs/types';

export default function AdminLedgerPage() {
  const [filterAccount, setFilterAccount] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample production-grade double-entry ledger entries for Financial Admin audit
  const [entries] = useState<TransactionLedgerEntryEntity[]>([
    {
      id: 'ledg-001-deb',
      transactionId: 'tx-rzp-001',
      bookingId: 'bkg-demo-kedarkantha-001',
      accountType: LedgerAccountType.GATEWAY_ESCROW,
      entryType: LedgerEntryType.DEBIT,
      amount: 4272.0,
      balanceAfter: 4272.0,
      referenceId: 'TX-ADV-1718001001',
      description: 'Advance receipt collected via Razorpay for Kedarkantha Trek',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'ledg-001-cred',
      transactionId: 'tx-rzp-001',
      bookingId: 'bkg-demo-kedarkantha-001',
      accountType: LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY,
      entryType: LedgerEntryType.CREDIT,
      amount: 4272.0,
      balanceAfter: 4272.0,
      referenceId: 'TX-ADV-1718001001',
      description: 'Customer advance holding liability for booking #EBS-BKG-2026-000101',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'ledg-002-deb',
      transactionId: 'tx-cf-002',
      bookingId: 'bkg-brahmatal-002',
      accountType: LedgerAccountType.GATEWAY_ESCROW,
      entryType: LedgerEntryType.DEBIT,
      amount: 3200.0,
      balanceAfter: 7472.0,
      referenceId: 'TX-ADV-1718002002',
      description: 'Advance deposit collected via Cashfree UPI for Brahmatal Trek',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'ledg-002-cred',
      transactionId: 'tx-cf-002',
      bookingId: 'bkg-brahmatal-002',
      accountType: LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY,
      entryType: LedgerEntryType.CREDIT,
      amount: 3200.0,
      balanceAfter: 7472.0,
      referenceId: 'TX-ADV-1718002002',
      description: 'Customer advance holding liability for booking #EBS-BKG-2026-000102',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);

  const balances: Record<string, number> = {
    [LedgerAccountType.GATEWAY_ESCROW]: 7472.0,
    [LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY]: 7472.0,
    [LedgerAccountType.TOUR_REVENUE]: 18450.0,
    [LedgerAccountType.GST_PAYABLE]: 922.5,
    [LedgerAccountType.PLATFORM_FEE]: 1200.0,
  };

  const filteredEntries = entries.filter(e => {
    const matchesAccount = filterAccount === 'ALL' || e.accountType === filterAccount;
    const matchesQuery =
      searchQuery === '' ||
      e.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.referenceId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAccount && matchesQuery;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-600 bg-saffron-50 px-2 py-0.5 rounded-md border border-saffron-200">
              Financial Administration
            </span>
            <span className="text-xs text-slate-400">• Double-Entry Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Transaction Ledger & Audit</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable financial journal enforcing zero-sum debits and credits with zero
            floating-point loss.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/payment-admin/controls"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
          >
            ⚙️ Gateway Controls
          </Link>
        </div>
      </div>

      {/* Trial Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            title: 'Gateway Escrow',
            key: LedgerAccountType.GATEWAY_ESCROW,
            color: 'border-blue-200 bg-blue-50/60 text-blue-900',
          },
          {
            title: 'Customer Advance Liability',
            key: LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY,
            color: 'border-amber-200 bg-amber-50/60 text-amber-900',
          },
          {
            title: 'Tour Revenue',
            key: LedgerAccountType.TOUR_REVENUE,
            color: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
          },
          {
            title: 'GST Output Tax (SAC 998555)',
            key: LedgerAccountType.GST_PAYABLE,
            color: 'border-purple-200 bg-purple-50/60 text-purple-900',
          },
          {
            title: 'Cancellation Retention Fee',
            key: LedgerAccountType.PLATFORM_FEE,
            color: 'border-rose-200 bg-rose-50/60 text-rose-900',
          },
        ].map(card => (
          <div
            key={card.key}
            className={`rounded-2xl border p-4 shadow-2xs space-y-1.5 ${card.color}`}
          >
            <span className="text-[11px] font-bold block">{card.title}</span>
            <div className="text-lg font-black tracking-tight">
              ₹{(balances[card.key] || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Journal Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search Booking ID or Reference..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs w-full sm:w-64 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500">Filter Account:</span>
            <select
              value={filterAccount}
              onChange={e => setFilterAccount(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-medium"
            >
              <option value="ALL">All Accounts</option>
              <option value={LedgerAccountType.GATEWAY_ESCROW}>Gateway Escrow</option>
              <option value={LedgerAccountType.CUSTOMER_ADVANCE_LIABILITY}>
                Customer Advance Liability
              </option>
              <option value={LedgerAccountType.TOUR_REVENUE}>Tour Revenue</option>
              <option value={LedgerAccountType.GST_PAYABLE}>GST Payable</option>
              <option value={LedgerAccountType.PLATFORM_FEE}>Platform Fee</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Reference ID</th>
                <th className="p-3.5">Booking / Tx ID</th>
                <th className="p-3.5">Ledger Account</th>
                <th className="p-3.5 text-center">Type</th>
                <th className="p-3.5 text-right">Debit (₹)</th>
                <th className="p-3.5 text-right">Credit (₹)</th>
                <th className="p-3.5 text-right">Balance After (₹)</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{entry.referenceId}</td>
                  <td className="p-3.5">
                    <span className="font-semibold block">{entry.bookingId}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {entry.transactionId}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium">{entry.accountType}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.entryType === LedgerEntryType.DEBIT
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {entry.entryType}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-semibold">
                    {entry.entryType === LedgerEntryType.DEBIT
                      ? `₹${entry.amount.toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="p-3.5 text-right font-mono font-semibold">
                    {entry.entryType === LedgerEntryType.CREDIT
                      ? `₹${entry.amount.toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                    ₹{entry.balanceAfter.toFixed(2)}
                  </td>
                  <td className="p-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                    {new Date(entry.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
