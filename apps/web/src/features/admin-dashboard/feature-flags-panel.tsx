'use client';

// Explore Bharat Safar — Feature Flags Panel Component
// Reference: EBS-DOC-13-ADMIN Section 1.1 "Zero Hardcoding"

import * as React from 'react';
import type { FeatureFlag } from '@ebs/types';

interface FeatureFlagsPanelProps {
  flags: FeatureFlag[];
  isLoading?: boolean;
  isSuperAdmin: boolean;
  onToggle?: (key: string, isEnabled: boolean) => void;
}

export function FeatureFlagsPanel({
  flags,
  isLoading,
  isSuperAdmin,
  onToggle,
}: FeatureFlagsPanelProps) {
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);

  const handleToggle = async (flag: FeatureFlag) => {
    if (!isSuperAdmin || !onToggle) return;
    setPendingKey(flag.key);
    try {
      onToggle(flag.key, !flag.isEnabled);
    } finally {
      setPendingKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array<null>(6)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 dark:text-slate-600">
        <div className="text-3xl mb-2">🚩</div>
        <div className="text-sm font-medium">No feature flags configured</div>
        <div className="text-xs mt-1">
          Feature flags are database-driven and appear here when configured.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Platform Feature Flags
        </h3>
        <span className="text-[10px] text-slate-400 dark:text-slate-600">
          {flags.filter(f => f.isEnabled).length}/{flags.length} enabled
        </span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {flags.map(flag => (
          <div key={flag.key} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-slate-900 dark:text-white">
                {flag.displayName}
              </div>
              {flag.description && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {flag.description}
                </div>
              )}
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600 mt-1">
                {flag.key}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  flag.isEnabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {flag.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
              {isSuperAdmin && onToggle && (
                <button
                  onClick={() => void handleToggle(flag)}
                  disabled={pendingKey === flag.key}
                  className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${
                    flag.isEnabled
                      ? 'bg-indigo-600 dark:bg-indigo-500'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label={`Toggle ${flag.displayName}`}
                  role="switch"
                  aria-checked={flag.isEnabled}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      flag.isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
