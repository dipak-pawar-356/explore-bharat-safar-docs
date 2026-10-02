// Explore Bharat Safar — Section 4: Feed Foundation & Aggregation Service
// Reference: EBS-DOC-15-SOCIAL Section 3, EBS-BLU-44-SOC Section 2, EBS-DOC-26-RULES

import { Injectable, Logger } from '@nestjs/common';
import { PostVisibility, PostStatus, AdventureGrade, type PostEntity } from '@ebs/types';
import { SocialPostsService } from './social-posts.service';
import { SocialGraphService } from './social-graph.service';

@Injectable()
export class SocialFeedService {
  private readonly logger = new Logger(SocialFeedService.name);

  constructor(
    private readonly postsService: SocialPostsService,
    private readonly graphService: SocialGraphService,
  ) {}

  /**
   * Generates personal Home Feed (following + discovery mix).
   */
  async getHomeFeed(
    viewerProfileId?: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ items: PostEntity[]; nextCursor?: string }> {
    const allPosts = this.postsService.getAllActivePosts();
    const excludedIds = viewerProfileId
      ? this.graphService.getBlockedAndMutedIds(viewerProfileId)
      : new Set<string>();

    const visiblePosts = allPosts.filter(post => {
      if (post.status !== PostStatus.PUBLISHED) return false;
      if (excludedIds.has(post.profileId)) return false;

      // Visibility Gate
      if (post.visibility === PostVisibility.PRIVATE) {
        return viewerProfileId === post.profileId;
      }
      if (post.visibility === PostVisibility.FOLLOWERS_ONLY) {
        if (!viewerProfileId) return false;
        if (viewerProfileId === post.profileId) return true;
        return this.graphService.isFollowing(viewerProfileId, post.profileId);
      }
      return true;
    });

    // Chronological sort
    visiblePosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return this.paginate(visiblePosts, cursor, limit);
  }

  /**
   * Generates strict chronological Following Feed.
   */
  async getFollowingFeed(
    viewerProfileId: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ items: PostEntity[]; nextCursor?: string }> {
    const followingIds = new Set(this.graphService.getFollowingIds(viewerProfileId));
    followingIds.add(viewerProfileId); // Include own posts

    const allPosts = this.postsService.getAllActivePosts();
    const excludedIds = this.graphService.getBlockedAndMutedIds(viewerProfileId);

    const followingPosts = allPosts.filter(post => {
      if (post.status !== PostStatus.PUBLISHED) return false;
      if (!followingIds.has(post.profileId)) return false;
      if (excludedIds.has(post.profileId)) return false;
      if (post.visibility === PostVisibility.PRIVATE && post.profileId !== viewerProfileId) {
        return false;
      }
      return true;
    });

    followingPosts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return this.paginate(followingPosts, cursor, limit);
  }

  /**
   * Generates Curated Discover Feed using foundational scoring formula.
   * Reference: EBS-BLU-44-SOC Section 2.1
   */
  async getDiscoverFeed(
    viewerProfileId?: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ items: PostEntity[]; nextCursor?: string }> {
    const allPosts = this.postsService.getAllActivePosts();
    const excludedIds = viewerProfileId
      ? this.graphService.getBlockedAndMutedIds(viewerProfileId)
      : new Set<string>();

    const publicPosts = allPosts.filter(post => {
      if (post.status !== PostStatus.PUBLISHED) return false;
      if (post.visibility !== PostVisibility.PUBLIC) return false;
      if (excludedIds.has(post.profileId)) return false;
      return true;
    });

    // Foundational Ranking Formula:
    // Score = w_recency * exp(-lambda * deltaT) + w_grade * gradeWeight
    const now = Date.now();
    const scoredPosts = publicPosts.map(post => {
      const ageHours = Math.max(0, (now - new Date(post.createdAt).getTime()) / (1000 * 3600));
      const recencyScore = Math.exp(-0.02 * ageHours); // Half-life ~35 hours
      const gradeWeight = this.getGradeWeight(post.author.adventureGrade);
      const score = 0.7 * recencyScore + 0.3 * gradeWeight;
      return { post, score };
    });

    scoredPosts.sort((a, b) => b.score - a.score);
    const sorted = scoredPosts.map(sp => sp.post);

    return this.paginate(sorted, cursor, limit);
  }

  /**
   * Generates feed of posts tagged with given hashtag.
   */
  async getHashtagFeed(
    hashtag: string,
    viewerProfileId?: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ items: PostEntity[]; nextCursor?: string }> {
    const normalizedTag = hashtag.toLowerCase().replace(/^#/, '');
    const allPosts = this.postsService.getAllActivePosts();
    const excludedIds = viewerProfileId
      ? this.graphService.getBlockedAndMutedIds(viewerProfileId)
      : new Set<string>();

    const matches = allPosts.filter(post => {
      if (post.status !== PostStatus.PUBLISHED) return false;
      if (post.visibility !== PostVisibility.PUBLIC) return false;
      if (excludedIds.has(post.profileId)) return false;
      return post.hashtags.includes(normalizedTag);
    });

    matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return this.paginate(matches, cursor, limit);
  }

  /**
   * Retrieves all visible posts authored by a specific profile.
   */
  async getUserPosts(
    targetProfileId: string,
    viewerProfileId?: string,
    limit = 20,
  ): Promise<PostEntity[]> {
    const allPosts = this.postsService.getAllActivePosts();
    const isOwner = viewerProfileId === targetProfileId;
    const isFollowing = viewerProfileId
      ? this.graphService.isFollowing(viewerProfileId, targetProfileId)
      : false;

    const userPosts = allPosts.filter(post => {
      if (post.profileId !== targetProfileId) return false;
      if (!isOwner && post.status !== PostStatus.PUBLISHED) return false;
      if (!isOwner && post.visibility === PostVisibility.PRIVATE) return false;
      if (!isOwner && post.visibility === PostVisibility.FOLLOWERS_ONLY && !isFollowing) {
        return false;
      }
      return true;
    });

    userPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return userPosts.slice(0, limit);
  }

  private getGradeWeight(grade: AdventureGrade): number {
    switch (grade) {
      case AdventureGrade.EXPEDITION_LEADER:
        return 1.0;
      case AdventureGrade.SUMMITEER:
        return 0.85;
      case AdventureGrade.PATHFINDER:
        return 0.7;
      case AdventureGrade.EXPLORER:
        return 0.55;
      case AdventureGrade.ROOKIE:
      default:
        return 0.4;
    }
  }

  private paginate(
    posts: PostEntity[],
    cursor?: string,
    limit = 20,
  ): { items: PostEntity[]; nextCursor?: string } {
    let startIndex = 0;
    if (cursor) {
      const idx = posts.findIndex(p => p.id === cursor);
      if (idx !== -1) {
        startIndex = idx + 1;
      }
    }

    const items = posts.slice(startIndex, startIndex + limit);
    const nextCursor =
      startIndex + limit < posts.length && items.length > 0
        ? items[items.length - 1].id
        : undefined;

    return { items, nextCursor };
  }
}
