// Explore Bharat Safar — Traveller Feed Stream Component
// Reference: EBS-DOC-15-SOCIAL Section 4, EBS-BLU-44-SOC Section 5

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Users,
  Sparkles,
  MapPin,
  Clock,
  Lock,
  Share2,
  Trash2,
  MessageSquare,
  Filter,
} from 'lucide-react';
import { PostType, PostVisibility, AdventureGrade } from '@ebs/types';
import type { PostEntity } from '@ebs/types';
import { MediaViewerModal } from './media-viewer-modal';

export interface FeedStreamProps {
  initialPosts?: PostEntity[];
  currentProfileId?: string;
  onDeletePost?: (postId: string) => Promise<void>;
  onHashtagClick?: (tag: string) => void;
  onTabChange?: (tab: 'discover' | 'following') => void;
  activeTab?: 'discover' | 'following';
}

export function FeedStream({
  initialPosts = [],
  currentProfileId,
  onDeletePost,
  onHashtagClick,
  onTabChange,
  activeTab = 'discover',
}: FeedStreamProps) {
  const [selectedFeedType, setSelectedFeedType] = useState<'discover' | 'following'>(activeTab);
  const [filterType, setFilterType] = useState<PostType | 'ALL'>('ALL');
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    urls: string[];
    index: number;
    authorName?: string;
    locationName?: string;
  }>({
    isOpen: false,
    urls: [],
    index: 0,
  });

  const handleTabSwitch = (tab: 'discover' | 'following') => {
    setSelectedFeedType(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const filteredPosts = initialPosts.filter(post => {
    if (filterType === 'ALL') return true;
    return post.postType === filterType;
  });

  const getAdventureGradeBadge = (grade: AdventureGrade) => {
    switch (grade) {
      case AdventureGrade.EXPEDITION_LEADER:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      case AdventureGrade.SUMMITEER:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300';
      case AdventureGrade.PATHFINDER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
      case AdventureGrade.EXPLORER:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
      case AdventureGrade.ROOKIE:
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
    }
  };

  const getPostTypeBadge = (type: PostType) => {
    switch (type) {
      case PostType.EXPEDITION_JOURNAL:
        return {
          label: 'Expedition Journal',
          color: 'text-bharat-saffron-600 bg-bharat-saffron-50 dark:bg-bharat-saffron-950/40',
        };
      case PostType.PHOTO_SHOWCASE:
        return { label: 'Photo Showcase', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' };
      case PostType.TRAIL_ADVISORY:
        return {
          label: 'Trail Advisory',
          color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
        };
      case PostType.QA:
        return {
          label: 'Q&A Query',
          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
        };
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const renderContentWithHighlights = (content: string) => {
    const parts = content.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith('#') && part.length > 1) {
        const tag = part.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
        return (
          <span
            key={i}
            onClick={() => onHashtagClick && onHashtagClick(tag)}
            className="text-bharat-saffron-600 dark:text-bharat-saffron-400 font-semibold cursor-pointer hover:underline"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith('@') && part.length > 1) {
        const username = part.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
        return (
          <Link
            key={i}
            href={`/profile/${username}`}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            {part}
          </Link>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Feed Controls Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Stream Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => handleTabSwitch('discover')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedFeedType === 'discover'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-bharat-saffron-600" />
            <span>Curated Discover</span>
          </button>

          <button
            onClick={() => handleTabSwitch('following')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedFeedType === 'following'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Following Stream</span>
          </button>
        </div>

        {/* Filter by Type */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as PostType | 'ALL')}
            className="bg-transparent text-xs font-semibold text-slate-600 dark:text-slate-300 border-none focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Post Types</option>
            <option value={PostType.EXPEDITION_JOURNAL}>Journals</option>
            <option value={PostType.PHOTO_SHOWCASE}>Photo Showcases</option>
            <option value={PostType.TRAIL_ADVISORY}>Advisories</option>
            <option value={PostType.QA}>Q&A</option>
          </select>
        </div>
      </div>

      {/* Feed Stream Cards */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-bharat-saffron-600 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            No Trail Updates Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {selectedFeedType === 'following'
              ? 'Follow more travellers across Bharat or switch to Curated Discover to view public expeditions.'
              : 'Be the pioneer! Record your trail journal or share scenic photos from your recent expedition.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => {
            const typeBadge = getPostTypeBadge(post.postType);
            const isAuthor = currentProfileId === post.profileId;

            return (
              <article
                key={post.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all hover:shadow-md space-y-4"
              >
                {/* Post Author Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/profile/${post.author.username}`}
                      className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                    >
                      {post.author.avatarUrl ? (
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-sm">
                          {post.author.displayName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/profile/${post.author.username}`}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-bharat-saffron-600 transition-colors"
                        >
                          {post.author.displayName}
                        </Link>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getAdventureGradeBadge(
                            post.author.adventureGrade,
                          )}`}
                        >
                          {post.author.adventureGrade.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <Link href={`/profile/${post.author.username}`} className="hover:underline">
                          @{post.author.username}
                        </Link>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${typeBadge.color}`}
                    >
                      {typeBadge.label}
                    </span>

                    {post.visibility !== PostVisibility.PUBLIC && (
                      <span
                        className="p-1 text-slate-400"
                        title={`Visibility: ${post.visibility.replace('_', ' ')}`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}

                    {isAuthor && onDeletePost && (
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Post Title */}
                {post.title && (
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {post.title}
                  </h3>
                )}

                {/* Post Body Content */}
                <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {renderContentWithHighlights(post.content)}
                </div>

                {/* Location Badge */}
                {post.locationName && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200/50 dark:border-emerald-900/50">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{post.locationName}</span>
                  </div>
                )}

                {/* Media Grid */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div
                    className={`grid gap-2 pt-1 ${
                      post.mediaUrls.length === 1
                        ? 'grid-cols-1'
                        : post.mediaUrls.length === 2
                          ? 'grid-cols-2'
                          : 'grid-cols-2 sm:grid-cols-3'
                    }`}
                  >
                    {post.mediaUrls.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          setLightboxState({
                            isOpen: true,
                            urls: post.mediaUrls,
                            index: idx,
                            authorName: post.author.displayName,
                            locationName: post.locationName,
                          })
                        }
                        className={`relative rounded-2xl overflow-hidden cursor-pointer group border border-slate-100 dark:border-slate-800 ${
                          post.mediaUrls.length === 1 ? 'aspect-video' : 'aspect-square'
                        }`}
                      >
                        <img
                          src={url}
                          alt="Post media"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>✨</span>
                      <span>{post.reactionCount} reactions</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.commentCount} comments</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/feed#post-${post.id}`,
                        );
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                    title="Copy share link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Media Viewer Lightbox */}
      <MediaViewerModal
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState(prev => ({ ...prev, isOpen: false }))}
        mediaUrls={lightboxState.urls}
        initialIndex={lightboxState.index}
        authorName={lightboxState.authorName}
        locationName={lightboxState.locationName}
      />
    </div>
  );
}
