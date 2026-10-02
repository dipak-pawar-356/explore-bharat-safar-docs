// Explore Bharat Safar — Section 3: Pricing Summary & Invoice Breakdown Card
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-26-RULES

'use client';

import React, { useState } from 'react';
import type { PricingBreakdown } from '@ebs/types';
import { SlotLockCountdown } from '../../components/client/slot-lock-countdown';

export interface PricingSummaryCardProps {
  pricing: PricingBreakdown;
  participantCount: number;
  lockExpiresAt?: string | null;
  onLockExpired?: () => void;
  appliedCoupon?: string | null;
  onApplyCoupon?: (code: string) => Promise<boolean> | boolean;
  onRemoveCoupon?: () => void;
  onProceed?: () => void;
  proceedLabel?: string;
  isProceedDisabled?: boolean;
  isLoading?: boolean;
  currencySymbol?: string;
  className?: string;
}

export const PricingSummaryCard: React.FC<PricingSummaryCardProps> = ({
  pricing,
  participantCount,
  lockExpiresAt,
  onLockExpired,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onProceed,
  proceedLabel = 'Proceed to Reserve',
  isProceedDisabled = false,
  isLoading = false,
  currencySymbol = '₹',
  className = '',
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim() || !onApplyCoupon) return;
    setCouponError(null);
    setIsApplyingCoupon(true);

    try {
      const success = await onApplyCoupon(couponInput.trim().toUpperCase());
      if (success) {
        setCouponInput('');
      } else {
        setCouponError('Invalid or expired coupon code.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to apply coupon.';
      setCouponError(msg);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 ${className}`}
    >
      {/* Slot lock timer banner if active */}
      {lockExpiresAt && (
        <div>
          <SlotLockCountdown expiresAt={lockExpiresAt} onExpire={onLockExpired} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Fare Summary</h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
          {participantCount} {participantCount === 1 ? 'Traveller' : 'Travellers'}
        </span>
      </div>

      {/* Itemized breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Base Experience Tariff</span>
          <span className="font-semibold text-slate-800">
            {currencySymbol}
            {pricing.basePriceTotal.toLocaleString('en-IN')}
          </span>
        </div>

        {pricing.addOnsTotal > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Expedition Add-ons & Gear</span>
            <span className="font-semibold text-slate-800">
              +{currencySymbol}
              {pricing.addOnsTotal.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {pricing.discountTotal > 0 && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Coupon Discount ({appliedCoupon})</span>
            <span>
              -{currencySymbol}
              {pricing.discountTotal.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-800">
            {currencySymbol}
            {pricing.subtotal.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex justify-between text-slate-600">
          <div className="flex items-center gap-1">
            <span>Statutory GST (5%)</span>
            <span
              className="text-[10px] text-slate-400 cursor-help"
              title="Statutory 5% GST on adventure treks and rural tourism under CBIC guidelines"
            >
              ⓘ
            </span>
          </div>
          <span className="font-semibold text-slate-800">
            +{currencySymbol}
            {pricing.taxesGst.toLocaleString('en-IN')}
          </span>
        </div>

        {pricing.convenienceFee > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Gateway & Platform Fee</span>
            <span className="font-semibold text-slate-800">
              +{currencySymbol}
              {pricing.convenienceFee.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {/* Total Grand Amount */}
        <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
          <span className="text-base font-bold text-slate-900">Total Booking Value</span>
          <span className="text-2xl font-black text-saffron-700">
            {currencySymbol}
            {pricing.totalBookingAmount.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Upfront Deposit vs Balance Due Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 mt-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">
              Mandatory Advance ({pricing.adminUpfrontPercentage}%)
            </span>
            <span className="font-bold text-emerald-700 text-sm">
              {currencySymbol}
              {pricing.mandatoryAdvanceDeposit.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Balance due at Basecamp:</span>
            <span className="font-medium text-slate-700">
              {currencySymbol}
              {pricing.outstandingBalanceDue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 italic border-t border-slate-200/60 pt-1.5 mt-1">
            Remaining balance collected during physical reporting and document verification.
          </p>
        </div>
      </div>

      {/* Coupon section */}
      {onApplyCoupon && (
        <div className="border-t border-slate-100 pt-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300 tracking-wider">
                  {appliedCoupon}
                </span>
                <span className="text-xs text-emerald-700">Applied successfully</span>
              </div>
              {onRemoveCoupon && (
                <button
                  type="button"
                  onClick={onRemoveCoupon}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
                >
                  Remove
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Have a Promo / Trek Code?"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 uppercase tracking-wider"
                />
                <button
                  type="submit"
                  disabled={!couponInput.trim() || isApplyingCoupon}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {couponError && <p className="text-xs text-rose-600 font-medium">{couponError}</p>}
            </form>
          )}
        </div>
      )}

      {/* CTA Button */}
      {onProceed && (
        <button
          type="button"
          onClick={onProceed}
          disabled={isProceedDisabled || isLoading}
          className="w-full py-3.5 px-4 bg-saffron-600 hover:bg-saffron-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Processing Reservation...
            </span>
          ) : (
            <span>{proceedLabel}</span>
          )}
        </button>
      )}

      {/* Trust & Guarantee Badges */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-emerald-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Certified IMF/BMC Mountain Guides</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-saffron-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>DPDP Act 2023 Encrypted Vault</span>
        </div>
      </div>
    </div>
  );
};
