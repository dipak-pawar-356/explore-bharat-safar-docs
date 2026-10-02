// Explore Bharat Safar — Section 4: Communities & Explorer Guilds Directory
// Reference: EBS-DOC-15-SOCIAL Section 7, EBS-BLU-44-SOC Section 8

'use client';

import React, { useState } from 'react';
import { Search, Compass } from 'lucide-react';
import type { CommunityEntity } from '@ebs/types';
import { CommunityCard } from '@/features/social-feed';

const MOCK_COMMUNITIES: CommunityEntity[] = [
  {
    id: 'comm_sahyadri_01',
    slug: 'sahyadri-explorers',
    title: 'Sahyadri Sentinel Guild',
    description:
      'A brotherhood of Western Ghats trail blazers dedicated to cataloguing ancient forts, ridge routes, rock-cut water tanks, and seasonal monsoon passes.',
    bannerUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    creatorProfileId: 'prof_aarav_001',
    rulesText:
      '1. Leave No Trace (LNT) is strictly enforced.\n2. No commercial solicitations.\n3. Respect heritage inscriptions and rock carvings.\n4. Share verified water source updates.',
    isVerified: true,
    memberCount: 2840,
    postCount: 540,
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
  },
  {
    id: 'comm_himalaya_02',
    slug: 'himalayan-high-passes',
    title: 'Himalayan Pass Traverse Circle',
    description:
      'Expedition leaders and alpine trekkers navigating >4,500m passes across Ladakh, Himachal, Uttarakhand, and Sikkim.',
    bannerUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    creatorProfileId: 'prof_priya_002',
    rulesText:
      '1. Accurate GPS track logs and altitude data required for route reports.\n2. Prioritize AMS safety precautions.\n3. Environmental stewardship on high glaciers.',
    isVerified: true,
    memberCount: 1950,
    postCount: 310,
    createdAt: '2025-03-15T00:00:00.000Z',
    updatedAt: '2026-09-18T00:00:00.000Z',
  },
  {
    id: 'comm_gramodaya_03',
    slug: 'gramodaya-living-heritage',
    title: 'Gramodaya Artisans & Living Traditions',
    description:
      'Documenting indigenous crafts, oral histories, folk music, handlooms, and sustainable village homestays throughout rural Bharat.',
    bannerUrl:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    creatorProfileId: 'prof_artisan_003',
    rulesText:
      '1. Respect indigenous village knowledge and consent.\n2. Promote fair-trade artisan crafts without exploitation.\n3. Maintain authentic cultural context.',
    isVerified: true,
    memberCount: 1220,
    postCount: 190,
    createdAt: '2025-05-10T00:00:00.000Z',
    updatedAt: '2026-09-12T00:00:00.000Z',
  },
];

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<CommunityEntity[]>(MOCK_COMMUNITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({
    comm_sahyadri_01: true,
  });

  const handleJoinToggle = async (communityId: string) => {
    const isCurrentlyMember = !!joinedMap[communityId];
    setJoinedMap(prev => ({ ...prev, [communityId]: !isCurrentlyMember }));
    setCommunities(prev =>
      prev.map(c =>
        c.id === communityId
          ? {
              ...c,
              memberCount: isCurrentlyMember ? Math.max(0, c.memberCount - 1) : c.memberCount + 1,
            }
          : c,
      ),
    );
  };

  const filteredCommunities = communities.filter(
    c =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-bharat-saffron-600 uppercase tracking-widest">
            Sovereign Guilds &bull; Section 4
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Explorer Communities & Guilds
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Join sovereign expedition guilds organized around specific mountain ranges, high passes,
            and living rural traditions.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search guilds or regions..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Guilds Grid */}
      {filteredCommunities.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <Compass className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">No Guilds Found</h3>
          <p className="text-xs text-slate-500">
            No explorer guilds match your search query &quot;{searchQuery}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map(community => (
            <CommunityCard
              key={community.id}
              community={community}
              isMember={!!joinedMap[community.id]}
              onJoinToggle={handleJoinToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
