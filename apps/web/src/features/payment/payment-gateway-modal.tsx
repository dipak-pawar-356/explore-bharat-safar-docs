// Explore Bharat Safar — Section 4: Universal Payment Gateway Modal
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-09-API Section 5.5, EBS-DOC-29-THIRD-PARTY

'use client';

import React, { useState } from 'react';
import { PaymentGatewayProvider, PaymentMethod, type PaymentVerificationResult } from '@ebs/types';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  bookingId: string;
  totalBookingAmount: number;
  mandatoryAdvanceDeposit: number;
  outstandingBalanceDue: number;
  adminUpfrontPercentage: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onPaymentSuccess: (result: PaymentVerificationResult) => void;
}

export function PaymentGatewayModal({
  isOpen,
  onClose,
  orderNumber,
  bookingId,
  totalBookingAmount,
  mandatoryAdvanceDeposit,
  outstandingBalanceDue,
  adminUpfrontPercentage,
  customerName = 'Valued Traveller',
  customerEmail,
  customerPhone,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const [provider, setProvider] = useState<PaymentGatewayProvider>(
    PaymentGatewayProvider.MOCK_SANDBOX,
  );
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.UPI);
  const [upiId, setUpiId] = useState('traveller@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // 1. Generate Idempotency Key
      const _idempotencyKey = `idem_${bookingId}_${Date.now()}`;

      // In real browser client or sandbox simulation:
      // Step A: Payment Intent Initiation
      await new Promise(r => setTimeout(r, 600));

      // Step B: Gateway Signature Verification
      const mockGatewayOrderId = `order_mock_${orderNumber}_${Date.now()}`;
      const mockGatewayPaymentId = `pay_mock_${Date.now()}`;
      const _mockSignature = `mock_sig_${mockGatewayOrderId}_${mockGatewayPaymentId}`;

      const verificationResult: PaymentVerificationResult = {
        isVerified: true,
        transactionId: `tx_web_${Date.now()}`,
        orderId: orderNumber,
        amountPaid: mandatoryAdvanceDeposit,
        bookingStatus: 'CONFIRMED',
        invoiceNumber: `EBS-INV-${new Date().getFullYear()}-${String(
          Math.floor(100000 + Math.random() * 900000),
        )}`,
      };

      setIsProcessing(false);
      onPaymentSuccess(verificationResult);
    } catch (err: unknown) {
      setIsProcessing(false);
      setErrorMsg(
        err instanceof Error ? err.message : 'Payment authorization failed. Please try again.',
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-saffron-600 to-amber-600 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💳</span>
              <span className="font-bold text-lg tracking-tight">Explore Bharat Safar Pay</span>
            </div>
            <p className="text-xs text-saffron-100 mt-0.5 font-medium">
              Order #{orderNumber} • 256-Bit Encrypted & DPDP Act Compliant
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            aria-label="Close Payment Modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Price Breakdown Card */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4.5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Total Expedition Fare:</span>
              <span className="font-semibold text-slate-800">
                ₹{totalBookingAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">
                Mandatory Advance Deposit ({adminUpfrontPercentage}%):
              </span>
              <span className="font-bold text-saffron-700 text-base">
                ₹{mandatoryAdvanceDeposit.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-amber-200/60">
              <span>Remaining Balance Due (At Basecamp):</span>
              <span className="font-medium text-slate-700">
                ₹{outstandingBalanceDue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-[11px] text-amber-800 flex items-center gap-1.5 pt-0.5">
              <span>🛡️</span>
              <span>Includes 5% statutory GST (SAC Code 998555: Tour Operator Services).</span>
            </div>
            {(customerName || customerEmail) && (
              <div className="text-[11px] text-slate-600 pt-1 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-1">
                <span>
                  Billed To:{' '}
                  <strong className="font-semibold text-slate-800">{customerName}</strong>
                </span>
                {customerEmail && <span className="text-slate-500">{customerEmail}</span>}
                {customerPhone && (
                  <span className="text-slate-500 font-mono text-[10px]">{customerPhone}</span>
                )}
              </div>
            )}
          </div>

          {/* Gateway Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: PaymentGatewayProvider.MOCK_SANDBOX, label: '⚡ Sandbox (Mock)' },
                { id: PaymentGatewayProvider.RAZORPAY, label: 'Razorpay' },
                { id: PaymentGatewayProvider.CASHFREE, label: 'Cashfree' },
              ].map(gw => (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => setProvider(gw.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    provider === gw.id
                      ? 'border-saffron-600 bg-saffron-50/60 text-saffron-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {gw.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: PaymentMethod.UPI, label: 'UPI / QR', icon: '📱' },
                { id: PaymentMethod.CARD, label: 'Cards', icon: '💳' },
                { id: PaymentMethod.NET_BANKING, label: 'NetBanking', icon: '🏦' },
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                    method === m.id
                      ? 'border-saffron-600 bg-saffron-50/50 text-saffron-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-xs font-bold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Method Details Pane */}
          {method === PaymentMethod.UPI && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Scan UPI QR Code</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Zero Convenience Fee
                </span>
              </div>
              <div className="flex items-center justify-center p-3 bg-white rounded-xl border border-slate-200 w-36 h-36 mx-auto shadow-2xs">
                <div className="text-center space-y-1">
                  <div className="text-4xl">🏁</div>
                  <div className="text-[10px] text-slate-500 font-mono">ebs-pay-qr-v1</div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">
                  Or enter Virtual Payment Address (VPA):
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="username@upi"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>
          )}

          {method === PaymentMethod.CARD && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Card Number</label>
                <input
                  type="text"
                  disabled
                  placeholder="•••• •••• •••• 4242 (Simulated)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-medium">Expiry</label>
                  <input
                    type="text"
                    disabled
                    placeholder="12/28"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium">CVV</label>
                  <input
                    type="text"
                    disabled
                    placeholder="•••"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {method === PaymentMethod.NET_BANKING && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <label className="text-slate-600 font-medium">Select Bank</label>
              <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-700">
                <option>State Bank of India (SBI)</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Punjab National Bank (PNB)</option>
              </select>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePayNow}
            disabled={isProcessing}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-saffron-600 to-amber-600 hover:from-saffron-700 hover:to-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin text-base">⏳</span>
                <span>Authorizing Deposit...</span>
              </>
            ) : (
              <>
                <span>Pay ₹{mandatoryAdvanceDeposit.toLocaleString('en-IN')} Now</span>
                <span className="text-xs font-normal opacity-90">
                  ({adminUpfrontPercentage}% Upfront)
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
