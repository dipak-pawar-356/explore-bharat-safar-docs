'use client';

// Explore Bharat Safar — Section 2: 10-Point Multidimensional Reviews
// Reference: EBS-BLU-42-VKS Section 10
import * as React from 'react';
import type { VillageRatingBreakdown, VillageReviewEntity } from '@ebs/types';

interface VillageReviewCardProps {
  metrics: {
    averageRating: number;
    totalReviews: number;
    dimensionAverages: VillageRatingBreakdown;
  };
  reviews: VillageReviewEntity[];
}

const DIMENSION_LABELS: Array<{ key: keyof VillageRatingBreakdown; label: string; icon: string }> =
  [
    { key: 'cleanliness', label: 'Cleanliness & Sanitation', icon: '🧹' },
    { key: 'hospitality', label: 'Rural Hospitality', icon: '🤝' },
    { key: 'nature', label: 'Nature & Ecology', icon: '🌿' },
    { key: 'safety', label: 'Safety & Security', icon: '🛡️' },
    { key: 'food', label: 'Local Culinary Heritage', icon: '🍲' },
    { key: 'accessibility', label: 'Road Accessibility', icon: '🛣️' },
    { key: 'photography', label: 'Photography Potential', icon: '📸' },
    { key: 'culturalPreservation', label: 'Cultural Preservation', icon: '🪔' },
    { key: 'adventure', label: 'Outdoor Adventure', icon: '🧗' },
    { key: 'overall', label: 'Overall Travel Experience', icon: '⭐' },
  ];

export function VillageReviewCard({ metrics, reviews }: VillageReviewCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>⭐</span> 10-Point Multidimensional Explorer Experience
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Holistic qualitative ratings submitted exclusively by verified travellers across ten
            civic and cultural dimensions.
          </p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono flex items-center gap-1.5 justify-end">
            <span className="text-amber-500 text-2xl">★</span>
            <span>{metrics.averageRating.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-sans font-normal">/ 5.0</span>
          </div>
          <span className="text-xs text-slate-500">
            {metrics.totalReviews} Verified Explorer Reviews
          </span>
        </div>
      </div>

      {/* 10 Dimension Grid with Visual Bars */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DIMENSION_LABELS.map(dim => {
          const val = metrics.dimensionAverages[dim.key] || 4.5;
          const percent = Math.min(Math.max((val / 5.0) * 100, 10), 100);

          return (
            <div key={dim.key} className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <span>{dim.icon}</span> {dim.label}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {val.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reviews List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Recent Verified Traveller Experiences
        </h4>
        <div className="space-y-3">
          {reviews.map(rev => (
            <div
              key={rev.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-bharat-evergreen-100 text-bharat-evergreen-800 dark:bg-bharat-evergreen-950 dark:text-bharat-evergreen-300 font-bold text-xs flex items-center justify-center">
                    {rev.userDisplayName?.[0] ?? 'E'}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {rev.userDisplayName ?? 'Verified Traveller'}
                    </span>
                    {rev.isVerifiedTraveller && (
                      <span className="text-[10px] ml-1.5 font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                        ✓ Verified Journey
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-amber-500 flex items-center gap-1">
                  <span>★</span>
                  <span>{rev.averageScore.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                &ldquo;{rev.reviewText}&rdquo;
              </p>

              <div className="text-[10px] text-slate-400">
                Submitted on{' '}
                {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
