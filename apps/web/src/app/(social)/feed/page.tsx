// Explore Bharat Safar — Section 4: Traveller Social Activity Feed
// Reference: EBS-DOC-15-SOCIAL, EBS-BLU-44-SOC Section 5

'use client';

import React, { useState } from 'react';
import {
  PostType,
  PostVisibility,
  PostStatus,
  AdventureGrade,
  type PostEntity,
  type CreatePostDto,
} from '@ebs/types';
import { PostComposer, FeedStream } from '@/features/social-feed';

const INITIAL_FEED_POSTS: PostEntity[] = [
  {
    id: 'post_sahyadri_001',
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
    title: 'Harishchandragad Konkan Kada Sunrise — Cloud Inversion Crossing',
    content:
      'Reached the summit plateau at 05:30 IST via Khireshwar route. The escarpment drop into the Konkan plains was cloaked in dense circular mist clouds. Heavy morning winds from south-west. Make sure to carry 3L of water past the temple cave.\n\n#WesternGhats #Harishchandragad #TrekBharat #MonsoonTrails',
    mediaUrls: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    ],
    hashtags: ['WesternGhats', 'Harishchandragad', 'TrekBharat', 'MonsoonTrails'],
    mentions: [],
    locationName: 'Harishchandragad, Ahmednagar, Maharashtra',
    visibility: PostVisibility.PUBLIC,
    status: PostStatus.PUBLISHED,
    reactionCount: 24,
    commentCount: 6,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post_himalaya_002',
    profileId: 'prof_priya_002',
    author: {
      id: 'prof_priya_002',
      userId: 'usr_priya_002',
      username: 'priya_wanderer',
      displayName: 'Priya Sundaram',
      avatarUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      adventureGrade: AdventureGrade.SUMMITEER,
    },
    postType: PostType.TRAIL_ADVISORY,
    title: 'Monsoon Route Advisory: Tamhini Ghat Flash Flood Points',
    content:
      'Immediate caution for travellers heading toward Plus Valley via Tamhini. Stream crossings near the waterfall trail have risen by 2 feet due to persistent catchment rainfall. Trekking with a local village guide from Dongarwadi is strictly advised.\n\n#SafetyAdvisory #TamhiniGhat #MonsoonAlert',
    mediaUrls: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    ],
    hashtags: ['SafetyAdvisory', 'TamhiniGhat', 'MonsoonAlert'],
    mentions: ['aarav_expeditions'],
    locationName: 'Tamhini Ghat, Pune, Maharashtra',
    visibility: PostVisibility.PUBLIC,
    status: PostStatus.PUBLISHED,
    reactionCount: 42,
    commentCount: 11,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export default function SocialFeedPage() {
  const [posts, setPosts] = useState<PostEntity[]>(INITIAL_FEED_POSTS);

  const handlePostCreated = async (newPostDto: CreatePostDto) => {
    // Optimistic creation
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
      visibility: newPostDto.visibility || PostVisibility.PUBLIC,
      status: newPostDto.status || PostStatus.PUBLISHED,
      reactionCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPosts([created, ...posts]);
  };

  const handleDeletePost = async (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  return (
    <div className="space-y-6">
      {/* Feed Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <span className="text-xs font-mono font-bold text-bharat-saffron-600 uppercase tracking-widest">
          Sovereign Explorer Network &bull; Section 4
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
          Traveller Activity Feed
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Explore authentic field journals, high-altitude photography, and real-time trail
          advisories contributed by verified explorers across Bharat.
        </p>
      </div>

      {/* Post Authoring Composer */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* Feed Stream */}
      <FeedStream
        initialPosts={posts}
        currentProfileId="prof_current_user"
        onDeletePost={handleDeletePost}
      />
    </div>
  );
}
