'use client';

// Explore Bharat Safar — Section 3: Experience & Adventure Catalogue Component
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

import * as React from 'react';
import Link from 'next/link';
import type { ExperienceEntity } from '@ebs/types';

export interface ExperienceCatalogueGridProps {
  initialExperiences?: ExperienceEntity[];
  onSelectExperience?: (exp: ExperienceEntity) => void;
}

export function ExperienceCatalogueGrid({
  initialExperiences = [],
  onSelectExperience,
}: ExperienceCatalogueGridProps) {
  const [experiences, setExperiences] = React.useState<ExperienceEntity[]>(initialExperiences);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('ALL');
  const [isLoading, setIsLoading] = React.useState(initialExperiences.length === 0);

  // Fetch experiences from API if not pre-seeded
  React.useEffect(() => {
    let isMounted = true;
    const url = new URL('/api/v1/bookings/experiences', window.location.origin);
    if (searchQuery) url.searchParams.set('q', searchQuery);
    if (selectedCategory !== 'ALL') url.searchParams.set('category', selectedCategory);
    if (selectedDifficulty !== 'ALL') url.searchParams.set('difficulty', selectedDifficulty);

    fetch(url.toString())
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (isMounted && json?.data?.items) {
          setExperiences(json.data.items);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const categories = [
    { id: 'ALL', label: 'All Expeditions', icon: '🧭' },
    { id: 'treks', label: 'Mountain & Fort Treks', icon: '⛰️' },
    { id: 'expeditions', label: 'Alpine Expeditions', icon: '🏔️' },
    { id: 'rural-homestays', label: 'Rural & Village Stays', icon: '🏡' },
  ];

  const difficulties: { id: string; label: string; color: string }[] = [
    { id: 'ALL', label: 'All Difficulties', color: 'border-slate-300 text-slate-700' },
    { id: 'EASY', label: 'Easy (Beginner)', color: 'border-emerald-300 text-emerald-700' },
    { id: 'MODERATE', label: 'Moderate', color: 'border-amber-300 text-amber-700' },
    { id: 'CHALLENGING', label: 'Challenging', color: 'border-orange-300 text-orange-700' },
    { id: 'DIFFICULT', label: 'Difficult (Pro)', color: 'border-red-300 text-red-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search fort treks, Himalayan passes, wildlife..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-bharat-indigo-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500 shadow-sm"
          />
        </div>

        {/* Difficulty Dropdown / Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {difficulties.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDifficulty(d.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                selectedDifficulty === d.id
                  ? 'bg-bharat-saffron-600 text-white border-bharat-saffron-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              selectedCategory === c.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Experiences Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-bharat-indigo-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-4xl">🏕️</div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            No Expeditions Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, difficulty filters, or category selection to find
            upcoming batches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map(exp => {
            const difficultyBadgeColors: Record<string, string> = {
              EASY: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200',
              MODERATE:
                'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200',
              CHALLENGING:
                'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 border-orange-200',
              DIFFICULT:
                'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200',
              TECHNICAL:
                'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200',
            };

            return (
              <div
                key={exp.id}
                className="group flex flex-col justify-between rounded-3xl bg-white dark:bg-bharat-indigo-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-bharat-saffron-300 dark:hover:border-bharat-saffron-800 transition duration-300"
              >
                {/* Visual Header / Banner */}
                <div className="h-44 bg-gradient-to-tr from-slate-900 to-slate-700 relative p-5 flex flex-col justify-between text-white overflow-hidden">
                  <div className="flex items-center justify-between gap-2 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md">
                      {exp.experienceType.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                        difficultyBadgeColors[exp.difficulty] || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {exp.difficulty}
                    </span>
                  </div>

                  <div className="z-10">
                    <h3 className="text-lg font-black leading-snug line-clamp-2">{exp.title}</h3>
                    <p className="text-[11px] text-slate-200 mt-1 flex items-center gap-2">
                      <span>📍 {exp.meetingPointName}</span>
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />
                </div>

                {/* Metrics Bar */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {exp.overviewDescription}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800/80 text-center">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">Duration</div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        {exp.durationDays}D / {exp.durationNights}N
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Max Altitude
                      </div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        {exp.maxAltitudeMeters ? `${exp.maxAltitudeMeters}m` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">Distance</div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        {exp.totalTrekDistanceKm ? `${exp.totalTrekDistanceKm} km` : 'Trail'}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        From (Pay {exp.mandatoryUpfrontPercentage}% Upfront)
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        ₹{exp.basePriceInr.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-slate-400"> / person</span>
                      </div>
                    </div>

                    {onSelectExperience ? (
                      <button
                        type="button"
                        onClick={() => onSelectExperience(exp)}
                        className="px-4 py-2.5 rounded-2xl bg-bharat-saffron-600 text-white font-bold text-xs hover:bg-bharat-saffron-700 transition shadow-sm group-hover:scale-105"
                      >
                        View Dossier &rarr;
                      </button>
                    ) : (
                      <Link
                        href={`/experiences/${exp.slug}`}
                        className="px-4 py-2.5 rounded-2xl bg-bharat-saffron-600 text-white font-bold text-xs hover:bg-bharat-saffron-700 transition shadow-sm group-hover:scale-105"
                      >
                        View Dossier &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
