// Explore Bharat Safar — Section 4: Traveller Dynamic Profile Page
// Reference: EBS-DOC-15-SOCIAL Section 2 & 8, EBS-BLU-44-SOC Section 3

'use client';

import React, { useState } from 'react';
import {
  AdventureGrade,
  BadgeType,
  PostType,
  PostVisibility,
  PostStatus,
  type TravellerProfileEntity,
  type SocialGraphRelation,
  type PostEntity,
  type UpdateProfileDto,
} from '@ebs/types';
import { TravellerProfileView, ProfileSettingsModal } from '@/features/social-feed';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const isSelf = params.username === 'my_profile' || params.username === 'aarav_expeditions';

  const [profile, setProfile] = useState<TravellerProfileEntity>({
    id: 'prof_aarav_001',
    userId: 'usr_aarav_001',
    username: params.username,
    displayName:
      params.username === 'aarav_expeditions' ? 'Aarav Sharma' : params.username.replace(/_/g, ' '),
    bio: 'High-altitude mountaineer and Western Ghats researcher. Documenting forgotten passes, Sahyadri rock-cut water cisterns, and sacred groves across Maharashtra.',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    homeState: 'Maharashtra',
    homeCity: 'Pune',
    spokenLanguages: ['Marathi', 'Hindi', 'English'],
    adventureGrade: AdventureGrade.EXPEDITION_LEADER,
    badges: [
      BadgeType.SAHYADRI_SENTINEL,
      BadgeType.HIMALAYAN_WANDERER,
      BadgeType.HERITAGE_CUSTODIAN,
      BadgeType.SOVEREIGN_EXPLORER,
    ],
    visitedStatesCount: 14,
    visitedDistrictsCount: 38,
    completedExpeditionsCount: 19,
    totalElevationMeters: 28450,
    followersCount: 1420,
    followingCount: 312,
    isProfilePublic: true,
    isSoloDiscoveryEnabled: true,
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2026-09-15T12:00:00.000Z',
  });

  const [relation, setRelation] = useState<SocialGraphRelation>({
    isFollowing: false,
    isFollowedBy: false,
    isPendingFollowRequest: false,
    isBlocked: false,
    isMuted: false,
  });

  const [posts, setPosts] = useState<PostEntity[]>([
    {
      id: 'post_prof_001',
      profileId: profile.id,
      author: {
        id: profile.id,
        userId: profile.userId,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        adventureGrade: profile.adventureGrade,
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
      createdAt: '2026-09-28T06:00:00.000Z',
      updatedAt: '2026-09-28T06:00:00.000Z',
    },
    {
      id: 'post_prof_002',
      profileId: profile.id,
      author: {
        id: profile.id,
        userId: profile.userId,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        adventureGrade: profile.adventureGrade,
      },
      postType: PostType.PHOTO_SHOWCASE,
      title: 'Monsoon Mist Cascades over Torna Fort Zunjar Machi',
      content:
        'Heavy downpours along the ridge to Zunjar Machi created instant waterfalls dropping straight into the Velhe valley. Caution on the wet basalt steps.\n\n#Torna #SahyadriTrails #MonsoonClimbs',
      mediaUrls: [
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
      ],
      hashtags: ['Torna', 'SahyadriTrails', 'MonsoonClimbs'],
      mentions: [],
      locationName: 'Torna Fort, Pune, Maharashtra',
      visibility: PostVisibility.PUBLIC,
      status: PostStatus.PUBLISHED,
      reactionCount: 56,
      commentCount: 14,
      createdAt: '2026-09-25T11:30:00.000Z',
      updatedAt: '2026-09-25T11:30:00.000Z',
    },
  ]);

  const [drafts] = useState<PostEntity[]>([
    {
      id: 'draft_prof_001',
      profileId: profile.id,
      author: {
        id: profile.id,
        userId: profile.userId,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        adventureGrade: profile.adventureGrade,
      },
      postType: PostType.EXPEDITION_JOURNAL,
      title: 'Upcoming Winter Pass Traverse: Pin Bhaba Valley Plan',
      content: 'Draft field notes for the high altitude Bhaba pass crossing scheduled for October.',
      mediaUrls: [],
      hashtags: ['Draft'],
      mentions: [],
      visibility: PostVisibility.PRIVATE,
      status: PostStatus.DRAFT,
      reactionCount: 0,
      commentCount: 0,
      createdAt: '2026-09-29T18:00:00.000Z',
      updatedAt: '2026-09-29T18:00:00.000Z',
    },
  ]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleFollowToggle = async () => {
    if (relation.isFollowing) {
      setRelation(prev => ({ ...prev, isFollowing: false, isPendingFollowRequest: false }));
      setProfile(prev => ({ ...prev, followersCount: Math.max(0, prev.followersCount - 1) }));
    } else if (profile.isProfilePublic) {
      setRelation(prev => ({ ...prev, isFollowing: true, isPendingFollowRequest: false }));
      setProfile(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
    } else {
      setRelation(prev => ({ ...prev, isPendingFollowRequest: true }));
    }
  };

  const handleBlockUser = async () => {
    setRelation(prev => ({ ...prev, isBlocked: !prev.isBlocked, isFollowing: false }));
  };

  const handleMuteUser = async () => {
    setRelation(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const handleSaveProfileSettings = async (dto: UpdateProfileDto) => {
    setProfile(prev => ({
      ...prev,
      displayName: dto.displayName ?? prev.displayName,
      bio: dto.bio ?? prev.bio,
      avatarUrl: dto.avatarUrl ?? prev.avatarUrl,
      coverImageUrl: dto.coverImageUrl ?? prev.coverImageUrl,
      homeState: dto.homeState ?? prev.homeState,
      homeCity: dto.homeCity ?? prev.homeCity,
      spokenLanguages: dto.spokenLanguages ?? prev.spokenLanguages,
      isProfilePublic: dto.isProfilePublic ?? prev.isProfilePublic,
      isSoloDiscoveryEnabled: dto.isSoloDiscoveryEnabled ?? prev.isSoloDiscoveryEnabled,
    }));
  };

  const handleDeletePost = async (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  return (
    <div className="space-y-6">
      <TravellerProfileView
        profile={profile}
        relation={relation}
        isOwnProfile={isSelf}
        posts={posts}
        drafts={drafts}
        onFollowToggle={handleFollowToggle}
        onBlockUser={handleBlockUser}
        onMuteUser={handleMuteUser}
        onEditProfile={() => setIsSettingsOpen(true)}
        onDeletePost={handleDeletePost}
      />

      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSave={handleSaveProfileSettings}
      />
    </div>
  );
}
