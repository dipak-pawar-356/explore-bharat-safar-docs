'use client';

// Explore Bharat Safar — Level 2: District Administrative Dossier Card
// Reference: EBS-BLU-41-BDE Section 4.3
import * as React from 'react';
import { useMapViewportStore } from '../../store/map-viewport.store';
import type { TalukaEntity } from '@ebs/types';

export function DistrictDrilldownCard() {
  const { selectedDistrict, selectedState, drillDownToTaluka, drillDownToState } =
    useMapViewportStore();
  const [talukas, setTalukas] = React.useState<TalukaEntity[]>([]);
  const [emergencyDir, setEmergencyDir] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!selectedDistrict) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/v1/discovery/districts/${selectedDistrict.id}`)
      .then(res => res.json())
      .then(json => {
        if (isMounted) {
          const districtData = json.data || json;
          setTalukas(districtData.talukas || []);
          setEmergencyDir(districtData.emergencyDirectory || {});
        }
      })
      .catch(() => {
        if (isMounted) setTalukas([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDistrict]);

  if (!selectedDistrict) return null;

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {selectedState && (
              <button
                type="button"
                onClick={() => drillDownToState(selectedState)}
                className="text-xs font-semibold text-bharat-saffron-600 hover:text-bharat-saffron-700 flex items-center gap-1"
              >
                ← {selectedState.name}
              </button>
            )}
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              District Administration
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {selectedDistrict.name}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Collectorate HQ:{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {selectedDistrict.headquarters}
            </strong>
          </p>
        </div>
      </div>

      {/* Emergency Helpline Directory */}
      {Object.keys(emergencyDir).length > 0 && (
        <div className="p-3.5 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-2 flex items-center gap-1.5">
            <span>🚨</span> District Emergency Directory
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(emergencyDir).map(([k, v]) => (
              <div key={k} className="text-xs">
                <span className="text-slate-500 dark:text-slate-400 capitalize block">
                  {k.replace(/([A-Z])/g, ' $1')}:
                </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constituent Talukas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Constituent Talukas / Tehsils ({talukas.length})
          </h3>
          <span className="text-xs text-slate-400">Select taluka to view places</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {talukas.map(taluka => (
              <button
                key={taluka.id}
                type="button"
                onClick={() =>
                  drillDownToTaluka({
                    ...taluka,
                    districtId: selectedDistrict.id,
                    districtName: selectedDistrict.name,
                    stateName: selectedState?.name,
                  })
                }
                className="text-left p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-bharat-saffron-50/50 dark:hover:bg-bharat-saffron-950/20 hover:border-bharat-saffron-200 dark:hover:border-bharat-saffron-800 transition"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {taluka.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {taluka.placesCount || 0} heritage sites
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
