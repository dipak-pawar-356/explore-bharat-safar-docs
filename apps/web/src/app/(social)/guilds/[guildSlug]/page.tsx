// Explore Bharat Safar — Section 4: Community Guild Details Page
// Reference: EBS-DOC-15-SOCIAL Section 7, EBS-BLU-44-SOC Section 8

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  CommunityRole,
  PostType,
  PostVisibility,
  PostStatus,
  AdventureGrade,
  type CommunityEntity,
  type PostEntity,
  type CreatePostDto,
} from '@ebs/types';
import { CommunityHeader, CommunityDiscussionStream } from '@/features/social-feed';

export default function GuildDetailPage({ params }: { params: { guildSlug: string } }) {
  const [community, setCommunity] = useState<CommunityEntity>({
    id: `comm_${params.guildSlug}`,
    slug: params.guildSlug,
    title:
      params.guildSlug === 'sahyadri-explorers'
        ? 'Sahyadri Sentinel Guild'
        : params.guildSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description:
      'A brotherhood of Western Ghats trail blazers dedicated to cataloguing ancient forts, ridge routes, rock-cut water tanks, and seasonal monsoon passes.',
    bannerUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    creatorProfileId: 'prof_aarav_001',
    rulesText:
      '1. Leave No Trace (LNT) is strictly enforced.\n2. No commercial solicitations.\n3. Respect heritage inscriptions and rock carvings.\n4. Share verified water source updates.',
    isVerified: true,
    memberCount: 2840,
    postCount: 124,
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    userRole: CommunityRole.MEMBER,
  });

  const [isMember, setIsMember] = useState(true);

  const [posts, setPosts] = useState<PostEntity[]>([
    {
      id: 'post_comm_001',
      profileId: 'prof_aarav_001',
      author: {
        id: 'prof_aarav_001',
        userId: 'usr_aarav_001',
        username: 'aarav_expeditions',
        displayName: 'Aarav Sharma',
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        adventureGrade: AdventureGrade.EXPEDITION_LEADER,
      },
      postType: PostType.EXPEDITION_JOURNAL,
      title: 'Monsoon Water Source Status — Harishchandragad Caves',
      content:
        'All three cisterns outside Kedareshwar cave are currently overflowing with clean drinking water. Remember to boil or filter water collected past 12:00 IST due to cloud sediment.\n\n#SahyadriGuild #WaterReport #TrailSafety',
      mediaUrls: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      ],
      hashtags: ['SahyadriGuild', 'WaterReport', 'TrailSafety'],
      mentions: [],
      locationName: 'Harishchandragad, Maharashtra',
      visibility: PostVisibility.COMMUNITY_ONLY,
      status: PostStatus.PUBLISHED,
      reactionCount: 31,
      commentCount: 9,
      createdAt: '2026-09-29T10:00:00.000Z',
      updatedAt: '2026-09-29T10:00:00.000Z',
    },
  ]);

  const handleJoinToggle = async () => {
    setIsMember(prev => !prev);
    setCommunity(prev => ({
      ...prev,
      memberCount: isMember ? Math.max(0, prev.memberCount - 1) : prev.memberCount + 1,
      userRole: isMember ? undefined : CommunityRole.MEMBER,
    }));
  };

  const handlePostCreated = async (newPostDto: CreatePostDto) => {
    const created: PostEntity = {
      id: `post_${Date.now()}`,
      profileId: 'prof_current_user',
      author: {
        id: 'prof_current_user',
        userId: 'usr_current_user',
        username: 'current_explorer',
        displayName: 'You (Explorer)',
        adventureGrade: AdventureGrade.EXPLORER,
      },
      postType: newPostDto.postType,
      title: newPostDto.title,
      content: newPostDto.content,
      mediaUrls: newPostDto.mediaUrls || [],
      hashtags: [],
      mentions: [],
      locationName: newPostDto.locationName,
      visibility: PostVisibility.COMMUNITY_ONLY,
      status: PostStatus.PUBLISHED,
      reactionCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPosts([created, ...posts]);
    setCommunity(prev => ({ ...prev, postCount: prev.postCount + 1 }));
  };

  const handleDeletePost = async (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
    setCommunity(prev => ({ ...prev, postCount: Math.max(0, prev.postCount - 1) }));
  };

  return (
    <div className="space-y-6">
      {/* Back to Communities link */}
      <div>
        <Link
          href="/communities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Explorer Communities</span>
        </Link>
      </div>

      {/* Community Header */}
      <CommunityHeader
        community={community}
        isMember={isMember}
        userRole={community.userRole}
        onJoinToggle={handleJoinToggle}
      />

      {/* Discussion Stream */}
      <CommunityDiscussionStream
        community={community}
        posts={posts}
        isMember={isMember}
        onPostCreated={handlePostCreated}
        onDeletePost={handleDeletePost}
      />
    </div>
  );
}
