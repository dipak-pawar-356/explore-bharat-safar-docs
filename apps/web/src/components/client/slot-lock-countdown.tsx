'use client';

// Explore Bharat Safar — Section 3: Live 15-Minute Slot Lock Countdown Timer
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

import * as React from 'react';
import { useSlotLockTimer } from '../../hooks/use-slot-lock-timer';

export interface SlotLockCountdownProps {
  expiresAt?: string | Date | null;
  initialSeconds?: number;
  onExpire?: () => void;
  className?: string;
}

export function SlotLockCountdown({
  expiresAt,
  initialSeconds = 900,
  onExpire,
  className = '',
}: SlotLockCountdownProps) {
  const { secondsRemaining, formattedTime, isWarning, isExpired } = useSlotLockTimer({
    expiresAt,
    initialSeconds,
    onExpire,
  });

  const percentLeft = Math.min(100, Math.max(0, (secondsRemaining / 900) * 100));

  if (isExpired) {
    return (
      <div
        className={`px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-red-700 dark:text-red-400 ${className}`}
      >
        <div className="flex items-center gap-2 text-xs font-bold">
          <span>⚠️</span>
          <span>15-Minute Slot Reservation Expired</span>
        </div>
        <span className="text-xs font-mono font-black">00:00</span>
      </div>
    );
  }

  return (
    <div
      className={`px-4 py-3 rounded-2xl transition-all duration-300 border flex items-center justify-between gap-4 ${
        isWarning
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 animate-pulse'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-base">{isWarning ? '⏳' : '🔒'}</span>
        <div>
          <div className="text-xs font-black tracking-wide uppercase">
            {isWarning ? 'Hold Expiring Soon' : 'Slots Reserved For You'}
          </div>
          <div className="text-[11px] opacity-80">
            Complete your checkout before the timer reaches zero
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Visual progress bar */}
        <div className="hidden sm:block w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isWarning ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${percentLeft}%` }}
          />
        </div>

        <div className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-current font-mono font-black text-sm tracking-wider shadow-sm">
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
