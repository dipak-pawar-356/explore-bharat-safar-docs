// Explore Bharat Safar — Traveller Profile View Component
// Reference: EBS-DOC-15-SOCIAL Section 2, EBS-BLU-44-SOC Section 3

'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Award,
  Globe2,
  Lock,
  UserPlus,
  UserCheck,
  Clock,
  Settings,
  MoreVertical,
  ShieldAlert,
  VolumeX,
  Volume2,
  BookOpen,
  Camera,
  FileText,
  FileCode2,
} from 'lucide-react';
import { AdventureGrade, BadgeType, PostType } from '@ebs/types';
import type { TravellerProfileEntity, SocialGraphRelation, PostEntity } from '@ebs/types';
import { FeedStream } from './feed-stream';

export interface TravellerProfileViewProps {
  profile: TravellerProfileEntity;
  relation?: SocialGraphRelation;
  isOwnProfile?: boolean;
  posts?: PostEntity[];
  drafts?: PostEntity[];
  onFollowToggle?: () => Promise<void>;
  onBlockUser?: () => Promise<void>;
  onMuteUser?: () => Promise<void>;
  onEditProfile?: () => void;
  onDeletePost?: (postId: string) => Promise<void>;
}

export function TravellerProfileView({
  profile,
  relation,
  isOwnProfile = false,
  posts = [],
  drafts = [],
  onFollowToggle,
  onBlockUser,
  onMuteUser,
  onEditProfile,
  onDeletePost,
}: TravellerProfileViewProps) {
  const [activeTab, setActiveTab] = useState<
    'all' | 'journals' | 'photos' | 'advisories' | 'drafts'
  >('all');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isPrivate = !profile.isProfilePublic;
  const isFollowing = relation?.isFollowing ?? false;
  const isPending = relation?.isPendingFollowRequest ?? false;
  const isBlocked = relation?.isBlocked ?? false;
  const isMuted = relation?.isMuted ?? false;

  // Gate content if account is private and viewer is neither owner nor approved follower
  const isContentGated = isPrivate && !isFollowing && !isOwnProfile;

  const handleFollowClick = async () => {
    if (!onFollowToggle) return;
    try {
      setActionLoading(true);
      await onFollowToggle();
    } finally {
      setActionLoading(false);
    }
  };

  const getAdventureGradeLabel = (grade: AdventureGrade) => {
    switch (grade) {
      case AdventureGrade.EXPEDITION_LEADER:
        return 'Expedition Leader';
      case AdventureGrade.SUMMITEER:
        return 'Summiteer';
      case AdventureGrade.PATHFINDER:
        return 'Pathfinder';
      case AdventureGrade.EXPLORER:
        return 'Explorer';
      case AdventureGrade.ROOKIE:
      default:
        return 'Rookie Trailblazer';
    }
  };

  const getBadgeDetails = (badge: BadgeType) => {
    switch (badge) {
      case BadgeType.SOVEREIGN_EXPLORER:
        return { name: 'Sovereign Explorer', desc: 'Explored 10+ Indian states', icon: '🇮🇳' };
      case BadgeType.SAHYADRI_SENTINEL:
        return { name: 'Sahyadri Sentinel', desc: 'Conquered 15+ Western Ghats forts', icon: '⛰️' };
      case BadgeType.HIMALAYAN_WANDERER:
        return {
          name: 'Himalayan Wanderer',
          desc: 'Ascended >4,000m high-altitude passes',
          icon: '🏔️',
        };
      case BadgeType.HERITAGE_CUSTODIAN:
        return {
          name: 'Heritage Custodian',
          desc: 'Documented 5+ UNESCO/ASI living sites',
          icon: '🏛️',
        };
      case BadgeType.VILLAGE_DOCUMENTER:
        return {
          name: 'Village Documenter',
          desc: 'Contributed 10+ Gramodaya village records',
          icon: '🌾',
        };
    }
  };

  const filteredPosts = posts.filter(p => {
    if (activeTab === 'journals') return p.postType === PostType.EXPEDITION_JOURNAL;
    if (activeTab === 'photos')
      return p.postType === PostType.PHOTO_SHOWCASE || (p.mediaUrls && p.mediaUrls.length > 0);
    if (activeTab === 'advisories') return p.postType === PostType.TRAIL_ADVISORY;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Profile Banner & Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Hero Cover Banner */}
        <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-amber-600 via-bharat-saffron-600 to-indigo-700 overflow-hidden">
          {profile.coverImageUrl ? (
            <img
              src={profile.coverImageUrl}
              alt={`${profile.displayName}'s cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          )}

          {isPrivate && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Private Account</span>
            </div>
          )}
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar and Top Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
            {/* Avatar with Status Ring */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-xl overflow-hidden shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-3xl sm:text-4xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                  {profile.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              {isOwnProfile ? (
                <button
                  onClick={onEditProfile}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Edit Passport</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleFollowClick}
                    disabled={actionLoading || isBlocked}
                    className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shadow-sm ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-red-50 hover:text-red-600'
                        : isPending
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200'
                          : 'bg-bharat-saffron-600 hover:bg-bharat-saffron-700 text-white'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : isPending ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Requested</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  {/* Options Menu Dropdown Toggle */}
                  <div className="relative">
                    <button
                      onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                      className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showOptionsMenu && (
                      <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-20 text-xs font-semibold animate-in fade-in duration-100">
                        {onMuteUser && (
                          <button
                            onClick={() => {
                              setShowOptionsMenu(false);
                              onMuteUser();
                            }}
                            className="w-full px-4 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          >
                            {isMuted ? (
                              <Volume2 className="w-4 h-4" />
                            ) : (
                              <VolumeX className="w-4 h-4" />
                            )}
                            <span>{isMuted ? 'Unmute Explorer' : 'Mute Explorer'}</span>
                          </button>
                        )}
                        {onBlockUser && (
                          <button
                            onClick={() => {
                              setShowOptionsMenu(false);
                              onBlockUser();
                            }}
                            className="w-full px-4 py-2 text-left flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            <span>{isBlocked ? 'Unblock Explorer' : 'Block Explorer'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Name & Identity */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {profile.displayName}
              </h1>

              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-bharat-saffron-600 border border-amber-200 dark:border-amber-900/60 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                {getAdventureGradeLabel(profile.adventureGrade)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>@{profile.username}</span>
              {(profile.homeCity || profile.homeState) && (
                <>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {[profile.homeCity, profile.homeState].filter(Boolean).join(', ')}
                  </span>
                </>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed pt-1 whitespace-pre-line">
                {profile.bio}
              </p>
            )}

            {/* Languages */}
            {profile.spokenLanguages && profile.spokenLanguages.length > 0 && (
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Languages: {profile.spokenLanguages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Travel Stats Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-xl font-black text-slate-900 dark:text-white">
                {profile.visitedStatesCount}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">States Visited</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-xl font-black text-slate-900 dark:text-white">
                {profile.visitedDistrictsCount}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Districts</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-xl font-black text-slate-900 dark:text-white">
                {profile.completedExpeditionsCount}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Expeditions</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-xl font-black text-slate-900 dark:text-white">
                {profile.totalElevationMeters.toLocaleString()}m
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Elevation</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-xl font-black text-slate-900 dark:text-white">
                {profile.followersCount}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Followers</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-xl font-black text-slate-900 dark:text-white">
                {profile.followingCount}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Following</span>
            </div>
          </div>

          {/* Badges Showcase */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-bharat-saffron-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Exploration Honors & Badges
                </h3>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {profile.badges.map(badge => {
                  const details = getBadgeDetails(badge);
                  return (
                    <div
                      key={badge}
                      className="px-3.5 py-2 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-center gap-2.5"
                      title={details.desc}
                    >
                      <span className="text-lg">{details.icon}</span>
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                          {details.name}
                        </span>
                        <span className="block text-[10px] text-slate-500">{details.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section or Privacy Barrier */}
      {isContentGated ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            This Account is Private
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Follow @{profile.username} to view their field notes, high-altitude photo showcases, and
            active trail logs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Post Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>All Posts</span>
              <span className="text-[10px] opacity-75">{posts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('journals')}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                activeTab === 'journals'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Journals</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                activeTab === 'photos'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photos</span>
            </button>

            <button
              onClick={() => setActiveTab('advisories')}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                activeTab === 'advisories'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Advisories</span>
            </button>

            {isOwnProfile && drafts.length > 0 && (
              <button
                onClick={() => setActiveTab('drafts')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                  activeTab === 'drafts'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Drafts ({drafts.length})</span>
              </button>
            )}
          </div>

          {/* Render Posts */}
          <FeedStream
            initialPosts={activeTab === 'drafts' ? drafts : filteredPosts}
            currentProfileId={profile.id}
            onDeletePost={onDeletePost}
          />
        </div>
      )}
    </div>
  );
}
