// Explore Bharat Safar — Community & Guild Components
// Reference: EBS-DOC-15-SOCIAL Section 7, EBS-BLU-44-SOC Section 8

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LogIn,
  LogOut,
} from 'lucide-react';
import { CommunityRole } from '@ebs/types';
import type { CommunityEntity, PostEntity, CreatePostDto } from '@ebs/types';
import { FeedStream } from './feed-stream';
import { PostComposer } from './post-composer';

// ---------------------------------------------------------------------------
// 1. Community Directory Card
// ---------------------------------------------------------------------------

export interface CommunityCardProps {
  community: CommunityEntity;
  isMember?: boolean;
  onJoinToggle?: (communityId: string) => Promise<void>;
}

export function CommunityCard({ community, isMember = false, onJoinToggle }: CommunityCardProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onJoinToggle) return;
    try {
      setLoading(true);
      await onJoinToggle(community.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Banner */}
        <div className="h-28 w-full bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 relative overflow-hidden">
          {community.bannerUrl && (
            <img
              src={community.bannerUrl}
              alt={community.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          {community.isVerified && (
            <div className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-emerald-600 shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={`/guilds/${community.slug}`}
                className="font-bold text-base text-slate-900 dark:text-white group-hover:text-bharat-saffron-600 transition-colors line-clamp-1"
              >
                {community.title}
              </Link>
              <span className="text-xs font-mono text-slate-400">c/{community.slug}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {community.description}
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{community.memberCount.toLocaleString()} members</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{community.postCount.toLocaleString()} posts</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            isMember
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600'
              : 'bg-bharat-saffron-600 hover:bg-bharat-saffron-700 text-white shadow-sm'
          }`}
        >
          {isMember ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Member (Leave)</span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              <span>Join Guild</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Community Header
// ---------------------------------------------------------------------------

export interface CommunityHeaderProps {
  community: CommunityEntity;
  isMember?: boolean;
  userRole?: CommunityRole;
  onJoinToggle?: (communityId: string) => Promise<void>;
}

export function CommunityHeader({
  community,
  isMember = false,
  userRole,
  onJoinToggle,
}: CommunityHeaderProps) {
  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!onJoinToggle) return;
    try {
      setLoading(true);
      await onJoinToggle(community.id);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role?: CommunityRole) => {
    if (!role) return null;
    switch (role) {
      case CommunityRole.LEADER:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      case CommunityRole.MODERATOR:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300';
      case CommunityRole.MEMBER:
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm space-y-4">
      {/* Banner */}
      <div className="h-44 md:h-56 w-full bg-gradient-to-r from-emerald-700 via-teal-800 to-indigo-900 relative overflow-hidden">
        {community.bannerUrl && (
          <img
            src={community.bannerUrl}
            alt={community.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="px-6 pb-6 pt-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {community.title}
              </h1>
              {community.isVerified && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
              {userRole && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(
                    userRole,
                  )}`}
                >
                  {userRole}
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-slate-400">c/{community.slug}</span>
          </div>

          <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
              isMember
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600'
                : 'bg-bharat-saffron-600 hover:bg-bharat-saffron-700 text-white'
            }`}
          >
            {isMember ? (
              <>
                <LogOut className="w-4 h-4" />
                <span>Leave Guild</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Join Guild</span>
              </>
            )}
          </button>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
          {community.description}
        </p>

        {/* Stats and Rules Accordion */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-4 font-semibold">
            <span>{community.memberCount.toLocaleString()} Explorers</span>
            <span>&bull;</span>
            <span>{community.postCount.toLocaleString()} Field Notes</span>
          </div>

          {community.rulesText && (
            <button
              onClick={() => setShowRules(!showRules)}
              className="font-semibold text-bharat-saffron-600 hover:underline flex items-center gap-1"
            >
              <span>Guild Conduct Rules</span>
              {showRules ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Rules Dropdown Content */}
        {showRules && community.rulesText && (
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line animate-in fade-in duration-150">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              Community Charter & Safety Guidelines:
            </span>
            {community.rulesText}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Community Discussion Stream
// ---------------------------------------------------------------------------

export interface CommunityDiscussionStreamProps {
  community: CommunityEntity;
  posts: PostEntity[];
  isMember?: boolean;
  onPostCreated?: (post: CreatePostDto) => Promise<void>;
  onDeletePost?: (postId: string) => Promise<void>;
}

export function CommunityDiscussionStream({
  community,
  posts,
  isMember = false,
  onPostCreated,
  onDeletePost,
}: CommunityDiscussionStreamProps) {
  return (
    <div className="space-y-6">
      {/* Post Composer if Member */}
      {isMember ? (
        <PostComposer
          communityId={community.id}
          onPostCreated={onPostCreated}
          placeholder={`Share an update or question with the ${community.title} guild...`}
        />
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          Join this guild to participate in expedition discussions and trail reports.
        </div>
      )}

      {/* Discussion Posts */}
      <FeedStream initialPosts={posts} onDeletePost={onDeletePost} />
    </div>
  );
}
