'use client';

// Explore Bharat Safar — Section 2: Agrarian Calendar & Ecological Rhythms
// Reference: EBS-BLU-42-VKS Section 2.2
import * as React from 'react';
import type { AgrarianCropInfo } from '@ebs/types';

interface AgrarianCalendarProps {
  crops: AgrarianCropInfo[];
  waterSources?: string[];
  elevationMeters?: number;
}

export function AgrarianCalendar({
  crops,
  waterSources = [],
  elevationMeters,
}: AgrarianCalendarProps) {
  const [activeSeason, setActiveSeason] = React.useState<'ALL' | 'KHARIF' | 'RABI' | 'ZAID'>('ALL');

  const filteredCrops =
    activeSeason === 'ALL' ? crops : crops.filter(c => c.season === activeSeason);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🌾</span> Agrarian Calendar & Seasonal Crop Cycles
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Centuries-old agricultural rhythms, indigenous crop varieties, and traditional water
            harvesting systems.
          </p>
        </div>

        {/* Season Filter Buttons */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 self-start">
          {(['ALL', 'KHARIF', 'RABI', 'ZAID'] as const).map(season => (
            <button
              key={season}
              type="button"
              onClick={() => setActiveSeason(season)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSeason === season
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {season === 'ALL'
                ? 'All Cycles'
                : season === 'KHARIF'
                  ? 'Kharif (Monsoon)'
                  : season === 'RABI'
                    ? 'Rabi (Winter)'
                    : 'Zaid (Summer)'}
            </button>
          ))}
        </div>
      </div>

      {/* Seasonal Crop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCrops.map((crop, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  crop.season === 'KHARIF'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                    : crop.season === 'RABI'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                }`}
              >
                {crop.season}
              </span>
              <span className="text-xs text-slate-400">💧 {crop.waterSource}</span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white">{crop.cropName}</h4>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sowing Period:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {crop.sowingPeriod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Harvest Period:</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400 font-semibold">
                  {crop.harvestPeriod}
                </span>
              </div>
            </div>

            {crop.indigenousVarieties && crop.indigenousVarieties.length > 0 && (
              <div className="pt-2 text-[11px] text-slate-500">
                <span className="block mb-1 font-semibold text-slate-400">Native Landraces:</span>
                <div className="flex flex-wrap gap-1">
                  {crop.indigenousVarieties.map((v, vIdx) => (
                    <span
                      key={vIdx}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ecological & Water Resources Panel */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Topographic Elevation
          </h5>
          <p className="text-base font-black text-slate-900 dark:text-white font-mono">
            {elevationMeters ? `${elevationMeters} m AMSL` : '620 m AMSL (Deccan Ridge)'}
          </p>
          <span className="text-[11px] text-slate-400">Temperate highland micro-climate</span>
        </div>

        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Traditional Water Harvesting
          </h5>
          <div className="flex flex-wrap gap-1 mt-1">
            {(waterSources.length > 0
              ? waterSources
              : ['Perennial Barav (Stepwell)', 'Gram Panchayat Talao', 'Mountain Stream Bandhara']
            ).map((src, sIdx) => (
              <span
                key={sIdx}
                className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-medium"
              >
                {src}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Soil Profile & Watershed
          </h5>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Basaltic black cotton soil mixed with fertile alluvial terrace loam, ideal for organic
            pulses and aromatic paddy.
          </p>
        </div>
      </div>
    </div>
  );
}
