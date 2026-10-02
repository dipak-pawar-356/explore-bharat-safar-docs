// Explore Bharat Safar — Section 3: Sold-Out Batch Waitlist Enrollment Modal
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

'use client';

import React, { useState } from 'react';
import type { BatchEntity } from '@ebs/types';

export interface WaitlistModalProps {
  isOpen: boolean;
  batch: BatchEntity | null;
  experienceTitle?: string;
  onClose: () => void;
  onSubmit: (data: {
    batchId: string;
    partySize: number;
    contactPhone: string;
  }) => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  batch,
  experienceTitle,
  onClose,
  onSubmit,
  isLoading = false,
  className = '',
}) => {
  const [partySize, setPartySize] = useState<number>(1);
  const [contactPhone, setContactPhone] = useState<string>('+91');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !batch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate phone number format (E.164 Indian mobile format: +91 followed by 10 digits)
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(contactPhone.trim())) {
      setError(
        'Please provide a valid Indian mobile number (+91 followed by 10 digits starting with 6-9).',
      );
      return;
    }

    if (partySize < 1 || partySize > 10) {
      setError('Party size must be between 1 and 10 travellers.');
      return;
    }

    try {
      await onSubmit({
        batchId: batch.id,
        partySize,
        contactPhone: contactPhone.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join waitlist. Please try again.';
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className={`bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-amber-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 id="waitlist-title" className="text-base font-bold text-slate-900">
              Join Batch Waitlist
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-amber-100 transition-colors"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">
              {experienceTitle || 'Expedition Departure'}
            </p>
            <p>
              Dates: <span className="font-medium text-slate-700">{batch.batchStartDate}</span> to{' '}
              <span className="font-medium text-slate-700">{batch.batchEndDate}</span>
            </p>
            <p className="text-amber-800 font-medium">
              Status: Current batch is completely booked.
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            When another traveller cancels their slot, waitlisted members are immediately
            prioritized on a strict First-Come, First-Served basis via automated SMS notification.
          </p>

          {/* Party size input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Party Size (Slots Required)
            </label>
            <select
              value={partySize}
              onChange={e => setPartySize(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Traveller' : 'Travellers'}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              SMS Alert Mobile Number (E.164 Format)
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              placeholder="+919876543210"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <p className="text-[10px] text-slate-400">
              Must include country code prefix (e.g., +91)
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {isLoading ? 'Joining...' : 'Confirm Waitlist Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
