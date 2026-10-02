'use client';

// Explore Bharat Safar — Section 3: High-Precision Slot Lock Countdown Hook
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

import * as React from 'react';

export interface UseSlotLockTimerOptions {
  expiresAt?: string | Date | null;
  initialSeconds?: number;
  onExpire?: () => void;
}

export function useSlotLockTimer(
  options: UseSlotLockTimerOptions | number = 900,
  onExpireCallback?: () => void,
) {
  const opts: UseSlotLockTimerOptions = React.useMemo(() => {
    return typeof options === 'number'
      ? { initialSeconds: options, onExpire: onExpireCallback }
      : options;
  }, [options, onExpireCallback]);

  const onExpireRef = React.useRef(opts.onExpire);
  React.useEffect(() => {
    onExpireRef.current = opts.onExpire;
  }, [opts.onExpire]);

  const calculateRemainingSeconds = React.useCallback((): number => {
    if (opts.expiresAt) {
      const targetTime = new Date(opts.expiresAt).getTime();
      const diff = Math.floor((targetTime - Date.now()) / 1000);
      return Math.max(0, diff);
    }
    return opts.initialSeconds ?? 900;
  }, [opts.expiresAt, opts.initialSeconds]);

  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(calculateRemainingSeconds);
  const [isExpired, setIsExpired] = React.useState<boolean>(secondsRemaining <= 0);

  React.useEffect(() => {
    // If target timestamp is given, sync immediately
    const initial = calculateRemainingSeconds();
    setSecondsRemaining(initial);
    setIsExpired(initial <= 0);

    if (initial <= 0) {
      onExpireRef.current?.();
      return;
    }

    const intervalId = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        setIsExpired(true);
        clearInterval(intervalId);
        onExpireRef.current?.();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [calculateRemainingSeconds]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = secondsRemaining > 0 && secondsRemaining <= 180; // Under 3 mins

  return {
    secondsRemaining,
    formattedTime,
    isWarning,
    isExpired,
  };
}
