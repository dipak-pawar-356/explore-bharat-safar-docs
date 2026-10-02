// Explore Bharat Safar — Section 3: Booking Confirmation & Digital Expedition Pass
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

'use client';

import React from 'react';
import Link from 'next/link';
import { useBookingDraftStore } from '@/store/booking-draft-store';

export default function ConfirmationPage({ params }: { params: { bookingReference: string } }) {
  const { activeOrder } = useBookingDraftStore();

  const bookingRef = params.bookingReference;
  const experienceTitle =
    activeOrder?.experienceTitle || 'Torna Fort Monsoon Ridge Trek & Waterfall Traverse';
  const participantCount = activeOrder?.participantCount || 2;
  const totalAmount = activeOrder?.pricing.totalBookingAmount || 6720;
  const advancePaid = activeOrder?.pricing.mandatoryAdvanceDeposit || 2016;
  const balanceDue = activeOrder?.pricing.outstandingBalanceDue || 4704;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl font-bold shadow-xs">
          ✓
        </div>
        <h1 className="text-3xl font-black text-slate-900">Expedition Confirmed!</h1>
        <p className="text-xs text-slate-500">
          Your slots have been successfully locked and verified in the sovereign manifest.
        </p>
      </div>

      {/* Digital Expedition Boarding Pass */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg overflow-hidden">
        {/* Pass Top Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between gap-4 border-b-2 border-dashed border-slate-700">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-saffron-400 block mb-1">
              Sovereign Expedition Pass
            </span>
            <h2 className="text-xl font-bold text-white">{experienceTitle}</h2>
            <p className="text-xs text-slate-300 mt-1">
              {participantCount} Confirmed {participantCount === 1 ? 'Traveller' : 'Travellers'}
            </p>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Reference</span>
            <span className="text-xl font-black font-mono text-saffron-400">{bookingRef}</span>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold mt-1">
              CONFIRMED
            </span>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Reporting Hub
              </span>
              <span className="font-semibold text-slate-800">Velhe Basecamp, MH</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Reporting Time
              </span>
              <span className="font-semibold text-slate-800">06:30 AM IST</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Lead Guide
              </span>
              <span className="font-semibold text-slate-800">IMF Certified Leader</span>
            </div>
          </div>

          {/* Payment & Balance Status */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Advance Paid:</span>
              <span className="font-bold text-emerald-700 text-sm">
                ₹{advancePaid.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Balance Due at Basecamp:</span>
              <span className="font-bold text-slate-900 text-sm">
                ₹{balanceDue.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Total Fare:</span>
              <span className="font-bold text-slate-900 text-sm">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Key Guidelines */}
          <div className="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-4">
            <p className="font-semibold text-slate-700">Next Steps & Basecamp Protocols:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Carry a valid Government Photo ID (Aadhaar / Voter ID / Passport) for basecamp
                check-in.
              </li>
              <li>
                Present this digital pass or mention booking reference #{bookingRef} on arrival.
              </li>
              <li>Ensure all mandatory packing gear is inspected during equipment check.</li>
            </ul>
          </div>
        </div>

        {/* Pass Actions */}
        <div className="bg-slate-100 p-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            A confirmation email & SMS has been dispatched with detailed offline GPX trail
            coordinates.
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition"
          >
            Download Pass PDF
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
        <Link
          href="/history"
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center transition"
        >
          View in My Bookings &rarr;
        </Link>
        <Link
          href="/experiences"
          className="px-6 py-3 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold text-center transition"
        >
          Explore More Expeditions
        </Link>
      </div>
    </div>
  );
}
