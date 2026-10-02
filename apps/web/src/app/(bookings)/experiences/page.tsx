// Explore Bharat Safar — Section 3: Bharat Experiences & Expeditions Catalog Page
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ExperienceCatalogueGrid } from '@/features/booking-wizard/experience-catalogue-grid';
import { MOCK_EXPERIENCES } from '@/lib/booking-data';
import type { ExperienceEntity } from '@ebs/types';

export default function ExperiencesCatalogPage() {
  const router = useRouter();

  const handleSelectExperience = (exp: ExperienceEntity) => {
    router.push(`/experiences/${exp.slug}`);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-saffron-600 block mb-1">
              Curated Expeditions & High Altitude Treks
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Explore Sovereign Bharat
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Ascend ancient Maratha fortresses, cross glaciated Himalayan passes, and immerse in
              living indigenous village traditions with certified mountain guides and sovereign
              environmental stewardship.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Real-Time Batches
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              DPDP Act 2023 Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Catalog Grid with Category Filtering & Search */}
      <ExperienceCatalogueGrid
        initialExperiences={MOCK_EXPERIENCES}
        onSelectExperience={handleSelectExperience}
      />
    </div>
  );
}
