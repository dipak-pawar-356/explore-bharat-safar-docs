// Explore Bharat Safar — Section 3: Experience Dossier & Departure Selection Page
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExperienceDossierView } from '@/features/booking-wizard/experience-dossier-view';
import { MOCK_EXPERIENCES } from '@/lib/booking-data';
import type { ExperienceEntity } from '@ebs/types';

export default function ExperienceDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const experience = MOCK_EXPERIENCES.find((e: ExperienceEntity) => e.slug === params.slug);

  if (!experience) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Experience Dossier Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested expedition &quot;{params.slug}&quot; could not be located in the sovereign
          catalogue.
        </p>
        <Link
          href="/experiences"
          className="inline-flex px-6 py-2.5 rounded-xl bg-saffron-600 text-white font-bold text-sm"
        >
          &larr; Return to Catalogue
        </Link>
      </div>
    );
  }

  const handleBookNow = () => {
    router.push(`/experiences/${experience.slug}/book`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/experiences" className="hover:text-slate-800 transition">
          Experiences
        </Link>
        <span>&rsaquo;</span>
        <span className="font-semibold text-slate-800">{experience.title}</span>
      </div>

      <ExperienceDossierView experience={experience} onBookNow={handleBookNow} />
    </div>
  );
}
