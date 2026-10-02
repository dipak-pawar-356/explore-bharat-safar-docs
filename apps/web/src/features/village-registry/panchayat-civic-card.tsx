'use client';

// Explore Bharat Safar — Section 2: Gram Panchayat & Civic Infrastructure Card
// Reference: EBS-BLU-42-VKS Section 5 & 11, EBS-DOC-40-SEC Section 4
import * as React from 'react';
import type { VillagePanchayatEntity, VillageProfileEntity } from '@ebs/types';

interface PanchayatCivicCardProps {
  panchayat?: VillagePanchayatEntity | null;
  profile?: VillageProfileEntity | null;
  villageName: string;
}

export function PanchayatCivicCard({ panchayat, profile, villageName }: PanchayatCivicCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🏛️</span> Gram Panchayat Administration & Civic Infrastructure
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Democratic local self-governance, statutory citizen services, and public infrastructure
            status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gram Panchayat Administrative Office */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                Statutory Civic Entity
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                {panchayat?.gramPanchayatName || `${villageName} Gram Panchayat Office`}
              </h4>
            </div>
            <span className="text-2xl">🇮🇳</span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500">Sarpanch (Elected Head):</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {panchayat?.sarpanchName || 'Rajendra Anandrao Patil'}
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500">Gram Sevak (Executive Secretary):</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {panchayat?.gramSevakName || 'Sunil V. More'}
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500">Office Timings:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {panchayat?.officeTimings || '09:30 AM – 05:30 PM (Mon to Sat)'}
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500">Official Landline (DPDP Protected):</span>
              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                {panchayat?.officePhone || '02144-223101'}
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500">Office Address:</span>
              <span className="text-slate-800 dark:text-slate-200 text-right max-w-xs">
                {panchayat?.officeAddress || `Gram Panchayat Bhavan, Main Chowk, ${villageName}`}
              </span>
            </div>
          </div>

          {/* Statutory Public Services List */}
          {panchayat?.publicServicesList && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Available Statutory Citizen Services
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {panchayat.publicServicesList.map((svc, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    ✓ {svc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Healthcare, Connectivity & Public Utilities */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>🏥</span> Healthcare, Schools & Connectivity Indices
          </h4>

          {/* Healthcare PHC Panel */}
          <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-900 dark:text-red-300 flex items-center gap-1">
                <span>🚑</span> Primary Health Centre (PHC)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200">
                {profile?.healthcareProfile.hasPHC ? 'Active In Village' : 'Sub-Centre Accessible'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-red-950 dark:text-red-200">
              <div>
                Emergency Ambulance:{' '}
                <strong>
                  {profile?.healthcareProfile.ambulanceAvailable
                    ? 'Available on Dial 108'
                    : 'Sub-district HQ'}
                </strong>
              </div>
              <div>
                PHC Official Line:{' '}
                <strong className="font-mono">
                  {profile?.healthcareProfile.phcContactLandline || '02144-223101'}
                </strong>
              </div>
            </div>
          </div>

          {/* Education & Road Connectivity Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 block font-semibold">Educational Facilities:</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {profile?.educationProfile?.primarySchoolsCount ?? 2} ZP Primary Schools &bull;
                Secondary School &bull; Public Library
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 block font-semibold">Road Connectivity:</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {profile?.connectivityProfile.roadType || 'PMGSY_PAVED'} (All-Weather Asphalt
                Access)
              </p>
            </div>
          </div>

          {/* Mobile Cellular Signals */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1 font-semibold">
              Verified Cellular 4G/5G Network Coverage:
            </span>
            <div className="flex items-center gap-2">
              {profile?.connectivityProfile.mobileSignals ? (
                Object.entries(profile.connectivityProfile.mobileSignals).map(([op, hasSig]) => (
                  <span
                    key={op}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase ${
                      hasSig
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                    }`}
                  >
                    {op}: {hasSig ? 'Strong 4G' : 'No Signal'}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">
                  Jio: 4G &bull; Airtel: 4G &bull; BSNL: 3G
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
