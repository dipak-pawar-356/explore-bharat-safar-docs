'use client';

// Explore Bharat Safar — Section 2: Folk Heritage & Historical Chronicles
// Reference: EBS-BLU-42-VKS Section 2.1 & 8
import * as React from 'react';
import type { VillageEventEntity, VillagePlaceEntity } from '@ebs/types';

interface FolkHeritageCardsProps {
  villageNameEn: string;
  villageNameLocal: string;
  etymologyMeaning?: string;
  formationHistory?: string;
  events?: VillageEventEntity[];
  places?: VillagePlaceEntity[];
}

export function FolkHeritageCards({
  villageNameEn,
  villageNameLocal,
  etymologyMeaning,
  formationHistory,
  events = [],
  places = [],
}: FolkHeritageCardsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📜</span> Living Folk Heritage, Etymology & Chronicles
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Preserving oral histories, naming origins, traditional festivals, and sacred guardian
            shrines.
          </p>
        </div>
      </div>

      {/* Etymology & Historical Foundation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏛️</span>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Linguistic Etymology & Origin
            </h4>
          </div>
          <div className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-serif">
            <span className="font-bold">{villageNameEn}</span> ({villageNameLocal}):{' '}
            {etymologyMeaning ||
              `Derived from regional linguistic roots referencing traditional mountain passes, river confluence sanctums, and guardian hero stones (Virgal) erected in ancient settlements.`}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
              Historical Chronicles & Settlement Timeline
            </h4>
          </div>
          <div className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
            {formationHistory ||
              `Chronicles dating back to the medieval Deccan Sultanate and Maratha periods document the settlement as a vital supplier of grains and mountain scouts, housing historic guardian bastions.`}
          </div>
        </div>
      </div>

      {/* Sacred Shrines & Historical Places */}
      {places.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>🛕</span> Sacred Guardian Shrines & Natural Heritage Sites
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {places.map(p => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                    {p.category}
                  </span>
                  {p.isVerified && (
                    <span className="text-[10px] font-semibold text-emerald-600">
                      ✓ Verified Site
                    </span>
                  )}
                </div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                  {p.description}
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  GPS: {p.coordinates.latitude.toFixed(4)}, {p.coordinates.longitude.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Jatras & Festivals */}
      {events.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>🎉</span> Annual Village Fairs, Jatras & Celebrations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.map(ev => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 uppercase text-[10px]">
                      {ev.eventType}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      📅 {ev.startDate} to {ev.endDate}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">{ev.title}</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{ev.description}</p>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Venue: <strong>{ev.locationDetails}</strong> &bull; Organized by:{' '}
                    {ev.organizerInfo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
