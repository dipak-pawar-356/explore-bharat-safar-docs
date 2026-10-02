'use client';

// Explore Bharat Safar — Section 2: Comprehensive Village Monograph Layout
// Reference: EBS-BLU-42-VKS Section 2, EBS-DOC-02-SPEC Section 4, EBS-DOC-52 Section 52
import * as React from 'react';
import Link from 'next/link';
import type { VillageLivingDossier } from '@ebs/types';
import { FolkHeritageCards } from './folk-heritage-cards';
import { AgrarianCalendar } from './agrarian-calendar';
import { PanchayatCivicCard } from './panchayat-civic-card';
import { ArtisanShowcase } from './artisan-showcase';
import { VillageHomestaysGuides } from './village-homestays-guides';
import { VillageReviewCard } from './village-review-card';

interface VillageMonographLayoutProps {
  dossier: VillageLivingDossier;
}

type MonographTab = 'HERITAGE' | 'AGRARIAN' | 'CIVIC' | 'ARTISANS' | 'HOMESTAYS' | 'REVIEWS';

export function VillageMonographLayout({ dossier }: VillageMonographLayoutProps) {
  const [activeTab, setActiveTab] = React.useState<MonographTab>('HERITAGE');
  const {
    village,
    hierarchy,
    panchayat,
    profile,
    places,
    events,
    businesses,
    recentReviews,
    agrarianCalendar,
    folkCrafts,
    metrics,
  } = dossier;

  const tabs: Array<{ id: MonographTab; label: string; icon: string }> = [
    { id: 'HERITAGE', label: 'Heritage & Lore', icon: '📜' },
    { id: 'AGRARIAN', label: 'Agrarian Calendar', icon: '🌾' },
    { id: 'CIVIC', label: 'Gram Panchayat & Civic', icon: '🏛️' },
    { id: 'ARTISANS', label: 'Indigenous Artisans', icon: '🎨' },
    { id: 'HOMESTAYS', label: 'Homestays & Guides', icon: '🏡' },
    { id: 'REVIEWS', label: '10-Point Reviews', icon: '⭐' },
  ];

  return (
    <div className="space-y-6">
      {/* Sovereign Spatial Hierarchy Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-bharat-evergreen-700 transition">
          Bharat
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">
          {hierarchy.stateName}
        </span>
        <span>&rsaquo;</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">
          {hierarchy.districtName} District
        </span>
        <span>&rsaquo;</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">
          {hierarchy.talukaName} Taluka
        </span>
        <span>&rsaquo;</span>
        <span className="text-bharat-evergreen-700 dark:text-bharat-evergreen-400 font-bold">
          {village.nameEn}
        </span>
      </div>

      {/* Hero Monograph Dossier Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-bharat-indigo-950 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LGD Code: {village.lgdCode}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
                PIN: {village.pincode}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {village.approvalStatus}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{village.nameEn}</h1>
                {village.nameLocal && (
                  <span className="text-2xl text-emerald-300 font-serif font-medium">
                    ({village.nameLocal})
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {village.historicalChronicles ||
                  `Historic agrarian village settlement in ${hierarchy.talukaName} Taluka, known for sacred groves, generational handlooms, and fertile riverbed agriculture.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
              <div>
                Population:{' '}
                <strong className="text-white">
                  {village.populationCount?.toLocaleString('en-IN') ?? '3,840'}
                </strong>
              </div>
              <span>&bull;</span>
              <div>
                Elevation:{' '}
                <strong className="text-white">{village.elevationMeters ?? 620} m AMSL</strong>
              </div>
              <span>&bull;</span>
              <div>
                Panchayat HQ:{' '}
                <strong className="text-white">
                  {panchayat?.gramPanchayatName ?? `${village.nameEn} Bhavan`}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 self-start md:self-center">
            <Link
              href={`/villages/${village.lgdCode}/contribute`}
              className="px-5 py-3 rounded-2xl text-xs font-bold bg-bharat-evergreen-600 hover:bg-bharat-evergreen-700 text-white transition text-center shadow-lg hover:shadow-emerald-900/50 flex items-center justify-center gap-2"
            >
              <span>✍️</span> Contribute Knowledge &rarr;
            </Link>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-xl font-mono font-bold text-amber-400">
                ★ {metrics.averageRating.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400">
                {metrics.totalReviews} Verified Reviews
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monograph Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'HERITAGE' && (
          <FolkHeritageCards
            villageNameEn={village.nameEn}
            villageNameLocal={village.nameLocal}
            etymologyMeaning={village.etymologyMeaning}
            formationHistory={village.historicalChronicles}
            events={events}
            places={places}
          />
        )}

        {activeTab === 'AGRARIAN' && (
          <AgrarianCalendar
            crops={agrarianCalendar}
            waterSources={profile?.waterSources}
            elevationMeters={village.elevationMeters}
          />
        )}

        {activeTab === 'CIVIC' && (
          <PanchayatCivicCard
            panchayat={panchayat}
            profile={profile}
            villageName={village.nameEn}
          />
        )}

        {activeTab === 'ARTISANS' && (
          <ArtisanShowcase crafts={folkCrafts} workshops={businesses} artisans={dossier.artisans} />
        )}

        {activeTab === 'HOMESTAYS' && (
          <VillageHomestaysGuides businesses={businesses} homestays={dossier.homestays} />
        )}

        {activeTab === 'REVIEWS' && <VillageReviewCard metrics={metrics} reviews={recentReviews} />}
      </div>
    </div>
  );
}
