'use client';

// Explore Bharat Safar — Discovery Engine Category Filter Chips
// Reference: EBS-BLU-41-BDE Section 6
import * as React from 'react';
import { useMapViewportStore } from '../../store/map-viewport.store';
import { StandardCategorySlug } from '@ebs/types';

interface CategoryOption {
  slug: string;
  name: string;
  icon: string;
}

const CATEGORIES: CategoryOption[] = [
  { slug: 'all', name: 'All Categories', icon: '✨' },
  { slug: StandardCategorySlug.FORT, name: 'Forts & Citadels', icon: '🏰' },
  { slug: StandardCategorySlug.TEMPLE, name: 'Sacred Temples', icon: '🛕' },
  { slug: StandardCategorySlug.UNESCO_SITE, name: 'UNESCO World Heritage', icon: '🏛️' },
  { slug: StandardCategorySlug.WATERFALL, name: 'Waterfalls', icon: '🌊' },
  { slug: StandardCategorySlug.CAVE, name: 'Rock-Cut Caves', icon: '⛰️' },
  { slug: StandardCategorySlug.WILDLIFE, name: 'Wildlife & Tigers', icon: '🐅' },
  { slug: StandardCategorySlug.BIRD_SANCTUARY, name: 'Bird Sanctuaries', icon: '🦜' },
  { slug: StandardCategorySlug.LAKE, name: 'Sacred Lakes', icon: '🏞️' },
  { slug: StandardCategorySlug.RIVER_GHAT, name: 'River Ghats & Sangams', icon: '🚣' },
  { slug: StandardCategorySlug.BEACH, name: 'Coastal Beaches', icon: '🏖️' },
  { slug: StandardCategorySlug.MOUNTAIN_PASS, name: 'Mountain Passes', icon: '🏔️' },
  { slug: StandardCategorySlug.TREKKING, name: 'Trekking Trails', icon: '🥾' },
  { slug: StandardCategorySlug.CAMPING, name: 'Wilderness Camping', icon: '⛺' },
  { slug: StandardCategorySlug.MUSEUM, name: 'Museums & Archives', icon: '🖼️' },
  { slug: StandardCategorySlug.CUISINE, name: 'Culinary Heritage', icon: '🍲' },
  { slug: StandardCategorySlug.HIDDEN_GEM, name: 'Hidden Gems', icon: '💎' },
];

export function CategoryFilterBar({ className = '' }: { className?: string }) {
  const { activeCategory, setActiveCategory } = useMapViewportStore();

  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-2 ${className}`}>
      <div className="flex items-center gap-2 px-1 min-w-max">
        {CATEGORIES.map(cat => {
          const isActive =
            (activeCategory === null && cat.slug === 'all') || activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setActiveCategory(cat.slug === 'all' ? null : cat.slug)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shadow-sm ${
                isActive
                  ? 'bg-bharat-saffron-600 text-white shadow-bharat-saffron-600/30 shadow-md ring-2 ring-bharat-saffron-500 ring-offset-1'
                  : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
