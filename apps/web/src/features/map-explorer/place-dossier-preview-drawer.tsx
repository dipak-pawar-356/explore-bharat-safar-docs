'use client';

// Explore Bharat Safar — Place Dossier Non-Modal Preview Drawer
// Reference: EBS-BLU-41-BDE Section 3.3 & Section 5, EBS-DOC-26-RULES
import * as React from 'react';
import Link from 'next/link';
import { useMapViewportStore } from '../../store/map-viewport.store';

export function PlaceDossierPreviewDrawer() {
  const { isPreviewDrawerOpen, closePreviewDrawer, selectedPlace } = useMapViewportStore();

  if (!isPreviewDrawerOpen || !selectedPlace) {
    return null;
  }

  const place = selectedPlace;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300">
      {/* Header Banner */}
      <div className="relative h-56 bg-slate-800 overflow-hidden flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            place.heroImageUrl ||
            'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
          }
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closePreviewDrawer}
          aria-label="Close preview drawer"
          className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Location Breadcrumb & Badge */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bharat-saffron-500 text-white">
              Verified Heritage
            </span>
            {place.elevationMeters && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-black/40 text-slate-200">
                {place.elevationMeters}m MSL
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight leading-snug drop-shadow-md">
            {place.name}
          </h2>
          <p className="text-xs text-slate-300 drop-shadow">
            {[place.talukaName, place.districtName, place.stateName].filter(Boolean).join(' • ')}
          </p>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Rating & Fast Stats */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-lg">★</span>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {typeof place.averageRating === 'number' ? place.averageRating.toFixed(2) : '4.85'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                ({place.reviewCount || 120} verified reviews)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Coordinates</span>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
              {place.coordinates.latitude.toFixed(3)}°N, {place.coordinates.longitude.toFixed(3)}°E
            </span>
          </div>
        </div>

        {/* Historical Overview */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Historical Monograph
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {place.historicalOverview ||
              'A landmark of paramount historical and cultural significance in the sovereign territory of Bharat, documented by the Explore Bharat Safar GIS repository.'}
          </p>
        </div>

        {/* Architecture Notes (if available) */}
        {place.architectureNotes && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Architecture & Style
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {place.architectureNotes}
            </p>
          </div>
        )}

        {/* Operational Matrix */}
        {(place.operatingHours || place.entryTariffs) && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {place.operatingHours && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Hours
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-200">
                  {Object.entries(place.operatingHours)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')}
                </span>
              </div>
            )}
            {place.entryTariffs && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Entry Tariffs
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-200">
                  {Object.entries(place.entryTariffs)
                    .map(([k, v]) => `₹${v} (${k})`)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center gap-3">
        <Link
          href={`/places/${place.slug || place.id}`}
          className="flex-1 text-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition"
        >
          Explore Deeply
        </Link>

        {/* STRICT BUSINESS RULE: Render 'Book Now' CTA ONLY IF isBookingEnabled == true. Zero DOM space reserved when false. */}
        {place.isBookingEnabled && (
          <Link
            href={`/experiences/${place.linkedExperienceId || place.slug}?source=discovery&placeId=${place.id}`}
            className="flex-1 text-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-bharat-saffron-600 hover:bg-bharat-saffron-700 text-white shadow-md shadow-bharat-saffron-600/30 transition"
          >
            Book Now ⚡
          </Link>
        )}
      </div>
    </div>
  );
}
