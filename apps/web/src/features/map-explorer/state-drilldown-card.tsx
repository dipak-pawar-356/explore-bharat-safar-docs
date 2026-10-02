'use client';

// Explore Bharat Safar — Level 1: State Geographic Dossier Card
// Reference: EBS-BLU-41-BDE Section 4.2
import * as React from 'react';
import Link from 'next/link';
import { useMapViewportStore } from '../../store/map-viewport.store';
import type { DistrictEntity } from '@ebs/types';

export function StateDrilldownCard() {
  const { selectedState, drillDownToDistrict, resetToNationalView } = useMapViewportStore();
  const [districts, setDistricts] = React.useState<DistrictEntity[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!selectedState) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/v1/discovery/states/${selectedState.id}`)
      .then(res => res.json())
      .then(json => {
        if (isMounted) {
          const rawDistricts = json.data?.districts || json.districts || [];
          setDistricts(rawDistricts);
        }
      })
      .catch(() => {
        if (isMounted) setDistricts([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedState]);

  if (!selectedState) return null;

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={resetToNationalView}
              className="text-xs font-semibold text-bharat-saffron-600 hover:text-bharat-saffron-700 flex items-center gap-1"
            >
              ← Sovereign Bharat
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              {selectedState.isoCode}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {selectedState.name}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Capital:{' '}
            <strong className="text-slate-700 dark:text-slate-200">{selectedState.capital}</strong>{' '}
            • Official Languages: {selectedState.officialLanguages?.join(', ') || 'N/A'}
          </p>
        </div>

        <Link
          href={`/states/${selectedState.isoCode?.toLowerCase() || selectedState.id}`}
          className="py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-bharat-saffron-50 dark:bg-bharat-saffron-950/40 text-bharat-saffron-600 hover:bg-bharat-saffron-100 transition"
        >
          View Full State Dossier →
        </Link>
      </div>

      {/* Constituent Districts Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Administrative Districts (
            {districts.length || selectedState.districtsCount || 'Loading...'})
          </h3>
          <span className="text-xs text-slate-400">Select district to zoom</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg
              className="animate-spin h-6 w-6 text-bharat-saffron-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {districts.map(dist => (
              <button
                key={dist.id}
                type="button"
                onClick={() =>
                  drillDownToDistrict({
                    ...dist,
                    stateId: selectedState.id,
                    stateName: selectedState.name,
                  })
                }
                className="text-left p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-bharat-saffron-50/50 dark:hover:bg-bharat-saffron-950/20 hover:border-bharat-saffron-200 dark:hover:border-bharat-saffron-800 transition"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {dist.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  HQ: {dist.headquarters || dist.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
