'use client';

// Explore Bharat Safar — Section 3: Live Batch Departure & Slot Selector Component
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

import * as React from 'react';
import type { BatchEntity } from '@ebs/types';

export interface BatchSlotSelectorProps {
  batches: BatchEntity[];
  selectedBatchId: string | null;
  onSelectBatch: (batch: BatchEntity) => void;
  onJoinWaitlist?: (batch: BatchEntity) => void;
  upfrontPercentage?: number;
}

export function BatchSlotSelector({
  batches,
  selectedBatchId,
  onSelectBatch,
  onJoinWaitlist,
  upfrontPercentage = 25,
}: BatchSlotSelectorProps) {
  if (batches.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white dark:bg-bharat-indigo-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <span className="text-3xl">📅</span>
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
          No Scheduled Departures Available
        </div>
        <p className="text-[11px] text-slate-500">
          New batches for the upcoming season are being curated by our expedition team.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <span>📅</span> Select Scheduled Departure Batch
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          Pay {upfrontPercentage}% upfront to hold slot
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {batches.map(batch => {
          const isSelected = selectedBatchId === batch.id;
          const isSoldOut = batch.availableSlots === 0;
          const isFillingFast = batch.availableSlots > 0 && batch.availableSlots <= 5;

          const advanceDeposit =
            Math.round(batch.batchPriceInr * (upfrontPercentage / 100) * 100) / 100;

          return (
            <div
              key={batch.id}
              onClick={() => {
                if (!isSoldOut) onSelectBatch(batch);
              }}
              className={`p-4 rounded-2xl border transition duration-200 flex flex-col justify-between gap-3 text-left ${
                isSoldOut
                  ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80 cursor-not-allowed'
                  : isSelected
                    ? 'bg-bharat-saffron-50/50 dark:bg-bharat-saffron-950/30 border-bharat-saffron-500 shadow-sm cursor-pointer ring-2 ring-bharat-saffron-500/20'
                    : 'bg-white dark:bg-bharat-indigo-900 border-slate-200 dark:border-slate-800 hover:border-bharat-saffron-300 cursor-pointer shadow-xs'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-black text-slate-900 dark:text-white">
                    <span>{batch.batchStartDate}</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span>{batch.batchEndDate}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                      isSoldOut
                        ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                        : isFillingFast
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {isSoldOut
                      ? 'SOLD OUT'
                      : isFillingFast
                        ? `${batch.availableSlots} SLOTS LEFT`
                        : 'AVAILABLE'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span>⏰</span>
                  <span>Reporting: {batch.reportingTime}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Price</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    ₹{batch.batchPriceInr.toLocaleString('en-IN')}
                    <span className="text-[10px] font-medium text-bharat-saffron-600 dark:text-bharat-saffron-400 ml-1">
                      (₹{advanceDeposit} advance)
                    </span>
                  </div>
                </div>

                {isSoldOut ? (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onJoinWaitlist?.(batch);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
                  >
                    Join Waitlist
                  </button>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-bharat-saffron-600 bg-bharat-saffron-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
