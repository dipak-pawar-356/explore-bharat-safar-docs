'use client';

import * as React from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error to structured telemetry
    console.error('Unhandled App Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bharat-terracotta-100 dark:bg-bharat-indigo-900 flex items-center justify-center text-bharat-terracotta-600 mb-4">
        <span className="text-2xl font-bold">!</span>
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        System Anomaly Detected
      </h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        An unexpected error occurred while rendering the digital ecosystem view.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-bharat-saffron-600 text-white hover:bg-bharat-saffron-700 transition"
      >
        Retry Operation
      </button>
    </div>
  );
}
