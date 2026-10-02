// Explore Bharat Safar — Section 3: Booking Manifest Summary (RSC)
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

import * as React from 'react';

export interface BookingManifestSummaryProps {
  batchId: string;
  experienceName: string;
  totalCapacity: number;
  confirmedCount: number;
  lockedCount: number;
  availableSlots?: number;
}

export function BookingManifestSummary({
  batchId,
  experienceName,
  totalCapacity,
  confirmedCount,
  lockedCount,
  availableSlots = Math.max(0, totalCapacity - confirmedCount - lockedCount),
}: BookingManifestSummaryProps) {
  const confirmedPercent = Math.min(100, Math.round((confirmedCount / totalCapacity) * 100));
  const lockedPercent = Math.min(100, Math.round((lockedCount / totalCapacity) * 100));

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-bharat-indigo-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-bharat-terracotta-600 dark:text-bharat-terracotta-400">
            Batch #{batchId.substring(0, 12)}
          </span>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
            {experienceName}
          </h3>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
            availableSlots === 0
              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
              : availableSlots <= 5
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {availableSlots === 0 ? 'SOLD OUT' : availableSlots <= 5 ? 'FILLING FAST' : 'OPEN'}
        </span>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-bharat-evergreen-600 transition-all duration-500"
            style={{ width: `${confirmedPercent}%` }}
            title={`Confirmed: ${confirmedCount}`}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${lockedPercent}%` }}
            title={`15m Lock Held: ${lockedCount}`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-bharat-evergreen-600 inline-block" />
            Confirmed: {confirmedCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Locked (15m): {lockedCount}
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-200">
            Available: {availableSlots} / {totalCapacity}
          </span>
        </div>
      </div>
    </div>
  );
}
