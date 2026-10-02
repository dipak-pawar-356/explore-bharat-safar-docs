// Explore Bharat Safar — Section 3: Traveller Booking History & Cancellation Dashboard
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-26-RULES

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_BOOKINGS, calculateRefundEstimate } from '@/lib/booking-data';
import { BookingStatus, type BookingOrder, type CancellationRefundEstimate } from '@ebs/types';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<BookingOrder[]>(MOCK_BOOKINGS);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<BookingOrder | null>(
    null,
  );
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelEstimate, setCancelEstimate] = useState<CancellationRefundEstimate | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleOpenCancelModal = (booking: BookingOrder) => {
    setSelectedBookingForCancel(booking);
    // Simulate 20 days prior to departure for realistic preview
    const estimate = calculateRefundEstimate(booking, 20);
    setCancelEstimate(estimate);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    setIsCancelling(true);

    // Simulate cancellation API request
    await new Promise(resolve => setTimeout(resolve, 600));

    setBookings(prev =>
      prev.map(b =>
        b.id === selectedBookingForCancel.id
          ? { ...b, status: BookingStatus.CANCELLED_BY_USER }
          : b,
      ),
    );

    setIsCancelling(false);
    setSelectedBookingForCancel(null);
    setCancellationReason('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600 block mb-1">
            Traveller Account
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            My Expeditions & Booking History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your past and upcoming adventures, digital passes, and cancellation requests.
          </p>
        </div>
        <Link
          href="/experiences"
          className="px-4 py-2 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          + Book New Expedition
        </Link>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <p className="text-slate-500 text-sm">
            You do not have any active or past expedition bookings.
          </p>
          <Link href="/experiences" className="text-saffron-600 font-bold text-xs underline">
            Browse Bharat Experiences
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'FULLY_PAID';
            const isCancelled =
              booking.status === 'CANCELLED_BY_USER' || booking.status === 'CANCELLED_BY_ADMIN';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 transition hover:border-slate-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        #{booking.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCancelled
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {booking.experienceTitle}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Fare</span>
                    <span className="text-lg font-black text-slate-900">
                      ₹{booking.pricing.totalBookingAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Travellers
                    </span>
                    <span className="font-medium text-slate-800">
                      {booking.participantCount} Person(s)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Advance Paid
                    </span>
                    <span className="font-medium text-emerald-700">
                      ₹{booking.pricing.mandatoryAdvanceDeposit.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Balance Due
                    </span>
                    <span className="font-medium text-slate-800">
                      ₹{booking.pricing.outstandingBalanceDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Waiver Signed
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {booking.termsVersion}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <Link
                    href={`/confirmation/${booking.orderNumber}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition"
                  >
                    View Digital Pass
                  </Link>

                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => handleOpenCancelModal(booking)}
                      className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl font-bold text-xs transition"
                    >
                      Request Cancellation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation & Refund Tier Modal */}
      {selectedBookingForCancel && cancelEstimate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-rose-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cancel Booking #{selectedBookingForCancel.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">{selectedBookingForCancel.experienceTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForCancel(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-600">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  Statutory Refund Estimate:
                </span>
                <div className="flex justify-between">
                  <span>Days Before Departure:</span>
                  <span className="font-semibold text-slate-800">
                    {cancelEstimate.daysBeforeDeparture} Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Applicable Policy Tier:</span>
                  <span className="font-bold text-blue-700">
                    {cancelEstimate.refundPercentage}% Refund
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Retained Operational Fee:</span>
                  <span className="text-rose-700">
                    ₹{cancelEstimate.cancellationFee.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                  <span className="text-slate-900">Eligible Refund Credit:</span>
                  <span className="text-emerald-700">
                    ₹{cancelEstimate.eligibleRefundAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1">
                  {cancelEstimate.policyTierNote}
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Cancellation Reason (Required):
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={e => setCancellationReason(e.target.value)}
                  placeholder="e.g., Medical emergency, sudden schedule conflict..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForCancel(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold rounded-lg"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={!cancellationReason.trim() || isCancelling}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-xs transition"
                >
                  {isCancelling ? 'Processing...' : 'Confirm & Process Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
