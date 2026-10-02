// Explore Bharat Safar — Super Admin: Global Payment Gateway & Deposit Controls
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-29-THIRD-PARTY, EBS-BLU-40-SECURITY

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PaymentGatewayProvider } from '@ebs/types';

export default function SuperAdminPaymentControlsPage() {
  const [primaryGateway, setPrimaryGateway] = useState<PaymentGatewayProvider>(
    PaymentGatewayProvider.RAZORPAY,
  );
  const [advancePercentage, setAdvancePercentage] = useState<number>(20);
  const [isFailoverEnabled, setIsFailoverEnabled] = useState<boolean>(true);
  const [autoRefundThreshold, setAutoRefundThreshold] = useState<number>(50000);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Super Admin Only
            </span>
            <span className="text-xs text-slate-400">• FinTech Controls</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Payment Engine Governance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure system-wide advance deposit ratios, gateway routing, and circuit breaker
            parameters.
          </p>
        </div>

        <Link
          href="/payment-admin/transactions"
          className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs"
        >
          &larr; View Ledger Journal
        </Link>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span>✓</span>
          <span>Payment controls successfully saved and updated across the cluster.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Advance Deposit Ratio Slider */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Mandatory Upfront Advance Deposit Ratio
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory percentage collected from travellers at the time of reservation. The
                remaining balance is collected at the expedition basecamp.
              </p>
            </div>
            <div className="text-2xl font-black text-saffron-600 font-mono">
              {advancePercentage}%
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={advancePercentage}
              onChange={e => setAdvancePercentage(Number(e.target.value))}
              className="w-full accent-saffron-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-bold text-slate-400">
              <span>10% (Minimum Allowed)</span>
              <span>25% (Standard Trek)</span>
              <span>50% (High Altitude Expedition)</span>
              <span>100% (Full Payment)</span>
            </div>
          </div>
        </div>

        {/* Primary Payment Gateway */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Primary Payment Gateway Provider</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Default gateway selected for customer checkout sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: PaymentGatewayProvider.RAZORPAY,
                name: 'Razorpay',
                desc: 'UPI, NetBanking, Credit/Debit Cards, EMI',
                badge: 'Recommended',
              },
              {
                id: PaymentGatewayProvider.CASHFREE,
                name: 'Cashfree Payments',
                desc: 'UPI AutoPay, Dynamic QR, NetBanking',
                badge: 'Active Partner',
              },
              {
                id: PaymentGatewayProvider.MOCK_SANDBOX,
                name: 'Mock Sandbox',
                desc: 'Deterministic test simulator for staging & QA',
                badge: 'Development',
              },
            ].map(gw => (
              <label
                key={gw.id}
                onClick={() => setPrimaryGateway(gw.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  primaryGateway === gw.id
                    ? 'border-saffron-600 bg-saffron-50/50 shadow-xs ring-1 ring-saffron-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">{gw.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {gw.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{gw.desc}</p>
                </div>
                <div className="pt-3">
                  <input
                    type="radio"
                    name="primaryGateway"
                    checked={primaryGateway === gw.id}
                    onChange={() => setPrimaryGateway(gw.id)}
                    className="accent-saffron-600"
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Dynamic Failover & Circuit Breaker */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Automated Gateway Failover & Circuit Breaker
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically routes incoming payment attempts to secondary gateway if primary
                encounters 3 consecutive timeouts or provider outages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFailoverEnabled(!isFailoverEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                isFailoverEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isFailoverEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Auto-Refund Threshold */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Automated Cancellation Refund Threshold (INR)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Refunds below this amount are dispatched immediately without secondary human review.
              Amounts above require dual-authorization by Finance Admin.
            </p>
          </div>
          <div className="max-w-xs">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="1000"
                step="5000"
                value={autoRefundThreshold}
                onChange={e => setAutoRefundThreshold(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            Save Payment Controls
          </button>
        </div>
      </form>
    </div>
  );
}
