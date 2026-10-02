// Explore Bharat Safar — Section 3: Experience Dossier & Technical Telemetry View
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-26-RULES

'use client';

import React, { useState } from 'react';
import type { ExperienceEntity } from '@ebs/types';

export interface ExperienceDossierViewProps {
  experience: ExperienceEntity;
  onBookNow?: () => void;
  currencySymbol?: string;
  className?: string;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; badge: string; desc: string }> = {
  EASY: {
    label: 'Easy',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Gentle terrain, suitable for first-time trekkers and families.',
  },
  MODERATE: {
    label: 'Moderate',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Moderate climbs, 5-7 hours daily hiking. Requires good stamina.',
  },
  DIFFICULT: {
    label: 'Difficult',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Steep ascents, high altitude, rough trails. Prior trekking experience required.',
  },
  CHALLENGING: {
    label: 'Challenging',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    desc: 'High-altitude passes, glaciated moraines, sub-zero camps. High endurance needed.',
  },
  TECHNICAL: {
    label: 'Technical Expedition',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    desc: 'Requires technical ice axe, crampons, rope-work, and mountaineering credentials.',
  },
};

export const ExperienceDossierView: React.FC<ExperienceDossierViewProps> = ({
  experience,
  onBookNow,
  currencySymbol = '₹',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<
    'itinerary' | 'gear' | 'safety' | 'policy' | 'inclusions'
  >('itinerary');

  const diffConfig = DIFFICULTY_CONFIG[experience.difficulty] || DIFFICULTY_CONFIG.MODERATE;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Hero Banner / Title Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-saffron-600 text-white rounded-full">
              {experience.experienceType.replace('_', ' ')}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${diffConfig.badge}`}>
              {diffConfig.label}
            </span>
            <span className="text-xs font-medium px-3 py-1 bg-slate-800 text-slate-300 rounded-full">
              {experience.durationDays}D / {experience.durationNights}N
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{experience.title}</h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {experience.overviewDescription}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                Altitude
              </span>
              <span className="text-lg font-bold text-white">
                {experience.maxAltitudeMeters
                  ? `${experience.maxAltitudeMeters.toLocaleString('en-IN')} m`
                  : 'Variable'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                Total Trail
              </span>
              <span className="text-lg font-bold text-white">
                {experience.totalTrekDistanceKm
                  ? `${experience.totalTrekDistanceKm} km`
                  : 'Scenic Walk'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                Base Tariff
              </span>
              <span className="text-lg font-bold text-saffron-400">
                {currencySymbol}
                {experience.basePriceInr.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                Upfront Lock
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {experience.mandatoryUpfrontPercentage}%
              </span>
            </div>
          </div>
        </div>

        {onBookNow && (
          <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onBookNow}
              className="px-8 py-3.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <span>Select Departure & Book</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-4 text-sm font-semibold">
        {(
          [
            { id: 'itinerary', label: 'Daywise Itinerary' },
            { id: 'inclusions', label: 'Inclusions & Exclusions' },
            { id: 'gear', label: 'Gear Checklist' },
            { id: 'safety', label: 'Medical & Safety' },
            { id: 'policy', label: 'Cancellation Terms' },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-saffron-600 text-saffron-700'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Expedition Route & Timeline</h2>
              <p className="text-xs text-slate-500">
                Detailed day-to-day high altitude route, camps, and elevation profile.
              </p>
            </div>

            <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
              {experience.itineraryDaywise.map(day => (
                <div key={day.dayNumber} className="relative">
                  {/* Step bullet */}
                  <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-saffron-600 text-white font-bold text-xs ring-4 ring-white">
                    {day.dayNumber}
                  </span>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Day {day.dayNumber}: {day.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{day.description}</p>

                    <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                      {day.altitudeMeters && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium">
                          Altitude: {day.altitudeMeters.toLocaleString('en-IN')} m
                        </span>
                      )}
                      {day.elevationGainMeters && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md font-medium">
                          Elevation Gain: +{day.elevationGainMeters} m
                        </span>
                      )}
                      {day.trailDistanceKm && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                          Distance: {day.trailDistanceKm} km
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md font-medium">
                        Stay: {day.accommodationType}
                      </span>
                      {day.mealsProvided.length > 0 && (
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md font-medium">
                          Meals: {day.mealsProvided.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inclusions & Exclusions Tab */}
        {activeTab === 'inclusions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">
                  ✓
                </span>
                What’s Included
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {experience.inclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-rose-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-xs">
                  ✕
                </span>
                What’s Excluded
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {experience.exclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Gear Checklist Tab */}
        {activeTab === 'gear' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Mandatory Expedition Packing List
              </h3>
              <p className="text-xs text-slate-500">
                Ensure all required apparel and equipment are packed. Verified gear can also be
                rented at checkout.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {experience.packingList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                >
                  <span className="w-2 h-2 rounded-full bg-saffron-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety & Medical Tab */}
        {activeTab === 'safety' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                High Altitude Medical Protocols & AMS
              </h3>
              <p className="text-xs text-slate-500">
                Statutory health guidance under IMF safety norms and state adventure travel
                mandates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed">
              <p className="font-bold mb-1">Acute Mountain Sickness (AMS) & Evacuation Protocol:</p>
              <p>{experience.medicalGuidelines}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-1">Meeting & Reporting Basecamp</h4>
                <p>{experience.meetingPointName}</p>
                <p className="font-mono text-slate-500 mt-1">
                  Coordinates: {experience.meetingPointCoords.latitude.toFixed(4)}° N,{' '}
                  {experience.meetingPointCoords.longitude.toFixed(4)}° E
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-1">Evacuation Infrastructure</h4>
                <p>
                  Expeditions carry pulse oximeters, portable hyperbaric chambers (Gamow bags), and
                  medical-grade oxygen cylinders. Emergency SOS satellite telemetry is maintained.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Policy Tab */}
        {activeTab === 'policy' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Tiered Cancellation & Refund Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Refunds are processed automatically to the original payment source within 5-7
                banking days.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="p-3">Timeline Prior to Departure</th>
                    <th className="p-3">Refund Eligibility</th>
                    <th className="p-3">Retained Operational Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {experience.cancellationPolicy.map((tier, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-medium text-slate-900">
                        {tier.maxDaysBeforeDeparture
                          ? `${tier.minDaysBeforeDeparture} to ${tier.maxDaysBeforeDeparture} days`
                          : `${tier.minDaysBeforeDeparture}+ days`}
                      </td>
                      <td className="p-3 font-bold text-emerald-700">{tier.refundPercentage}%</td>
                      <td className="p-3 text-slate-600">{tier.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
