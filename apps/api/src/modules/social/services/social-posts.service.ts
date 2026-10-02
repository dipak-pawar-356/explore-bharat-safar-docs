// Explore Bharat Safar — Section 4: Posts Subsystem Domain Service
// Reference: EBS-DOC-15-SOCIAL Section 3, EBS-BLU-44-SOC Section 3, EBS-DOC-26-RULES Section 5

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PostType, PostVisibility, PostStatus, AdventureGrade, type PostEntity } from '@ebs/types';
import { CreatePostDto, UpdatePostDto } from '../dto/social.dto';
import { SocialProfileService } from './social-profile.service';
import { SocialGraphService } from './social-graph.service';

@Injectable()
export class SocialPostsService {
  private readonly logger = new Logger(SocialPostsService.name);

  // In-memory persistent registry for posts: postId -> PostEntity
  private readonly posts = new Map<string, PostEntity>();
  // Rate-limiting tracking: profileId -> timestamps of creations in last hour
  private readonly creationTimestamps = new Map<string, number[]>();

  constructor(
    private readonly profileService: SocialProfileService,
    private readonly graphService: SocialGraphService,
  ) {
    this.seedInitialPosts();
  }

  /**
   * Creates a travel post or expedition journal.
   * Enforces 6 posts/hour anti-spam rate limiting.
   */
  async createPost(profileId: string, dto: CreatePostDto): Promise<PostEntity> {
    this.enforceRateLimit(profileId);

    const profile = await this.profileService.getProfileById(profileId);
    const authorSummary = this.profileService.toSummary(profile);

    // Business Rule (EBS-DOC-26-RULES Sec 5): Published expedition journals require at least 20 chars
    const status = dto.status || PostStatus.PUBLISHED;
    if (
      status === PostStatus.PUBLISHED &&
      dto.postType === PostType.EXPEDITION_JOURNAL &&
      dto.content.trim().length < 20
    ) {
      throw new BadRequestException('Expedition journal must be at least 20 characters.');
    }

    const hashtags = this.parseHashtags(dto.content);
    const mentions = this.parseMentions(dto.content);

    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const post: PostEntity = {
      id: postId,
      profileId,
      author: authorSummary,
      postType: dto.postType,
      title: dto.title?.trim(),
      content: dto.content.trim(),
      mediaUrls: dto.mediaUrls || [],
      hashtags,
      mentions,
      placeId: dto.placeId,
      villageId: dto.villageId,
      locationName: dto.locationName?.trim(),
      visibility: dto.visibility || PostVisibility.PUBLIC,
      status,
      reactionCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.posts.set(postId, post);
    this.recordCreationTimestamp(profileId);

    this.logger.log(
      `Created ${post.postType} post ${postId} by @${profile.username} with ${hashtags.length} hashtags`,
    );
    return post;
  }

  /**
   * Updates an authored post.
   */
  async updatePost(profileId: string, postId: string, dto: UpdatePostDto): Promise<PostEntity> {
    const post = this.posts.get(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundException(`Post ${postId} not found.`);
    }

    if (post.profileId !== profileId) {
      throw new ForbiddenException('You are not authorized to edit this post.');
    }

    if (dto.title !== undefined) post.title = dto.title.trim();
    if (dto.content !== undefined) {
      post.content = dto.content.trim();
      post.hashtags = this.parseHashtags(post.content);
      post.mentions = this.parseMentions(post.content);
    }
    if (dto.visibility !== undefined) post.visibility = dto.visibility;
    if (dto.status !== undefined) post.status = dto.status;
    if (dto.mediaUrls !== undefined) post.mediaUrls = dto.mediaUrls;
    if (dto.locationName !== undefined) post.locationName = dto.locationName.trim();

    post.updatedAt = new Date().toISOString();
    this.posts.set(postId, post);

    return post;
  }

  /**
   * Soft-deletes a post.
   */
  async deletePost(profileId: string, postId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundException(`Post ${postId} not found.`);
    }

    if (post.profileId !== profileId) {
      throw new ForbiddenException('You are not authorized to delete this post.');
    }

    post.deletedAt = new Date().toISOString();
    post.status = PostStatus.ARCHIVED;
    this.posts.set(postId, post);

    this.logger.log(`Post ${postId} deleted by owner ${profileId}`);
  }

  /**
   * Retrieves single post with visibility and block validation.
   */
  async getPostById(postId: string, viewerProfileId?: string): Promise<PostEntity> {
    const post = this.posts.get(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundException(`Post ${postId} not found.`);
    }

    if (viewerProfileId) {
      if (this.graphService.isBlocked(post.profileId, viewerProfileId)) {
        throw new NotFoundException('Post not available.');
      }
    }

    // Check visibility
    const isAuthor = viewerProfileId === post.profileId;
    if (!isAuthor) {
      if (post.status === PostStatus.DRAFT) {
        throw new NotFoundException('Post is a private draft.');
      }
      if (post.visibility === PostVisibility.PRIVATE) {
        throw new ForbiddenException('This post is private.');
      }
      if (post.visibility === PostVisibility.FOLLOWERS_ONLY) {
        if (!viewerProfileId || !this.graphService.isFollowing(viewerProfileId, post.profileId)) {
          throw new ForbiddenException('This post is visible to followers only.');
        }
      }
    }

    return post;
  }

  /**
   * Extracts hashtags from text.
   */
  parseHashtags(content: string): string[] {
    const matches = content.match(/#[a-zA-Z0-9_]{2,50}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map(h => h.substring(1).toLowerCase())));
  }

  /**
   * Extracts mentions from text.
   */
  parseMentions(content: string): string[] {
    const matches = content.match(/@[a-zA-Z0-9_]{3,30}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map(m => m.substring(1).toLowerCase())));
  }

  getAllActivePosts(): PostEntity[] {
    return Array.from(this.posts.values()).filter(p => !p.deletedAt);
  }

  /**
   * Enforces 6 posts/hour limit per EBS-DOC-09-API Sec 1.7.
   */
  private enforceRateLimit(profileId: string): void {
    const now = Date.now();
    const oneHourAgo = now - 3600 * 1000;
    const timestamps = (this.creationTimestamps.get(profileId) || []).filter(t => t > oneHourAgo);

    if (timestamps.length >= 6) {
      throw new HttpException(
        'Post creation rate limit exceeded. Maximum 6 posts allowed per hour.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private recordCreationTimestamp(profileId: string): void {
    const timestamps = this.creationTimestamps.get(profileId) || [];
    timestamps.push(Date.now());
    this.creationTimestamps.set(profileId, timestamps);
  }

  private seedInitialPosts(): void {
    const p1: PostEntity = {
      id: 'post_monsoon_001',
      profileId: 'prof_amitabh_001',
      author: {
        id: 'prof_amitabh_001',
        userId: 'usr_traveller_sprint2_001',
        username: 'amitabh_sharma',
        displayName: 'Amitabh Sharma',
        avatarUrl: 'https://cdn.explorebharatsafar.in/avatars/amitabh.webp',
        adventureGrade: AdventureGrade.PATHFINDER,
      },
      postType: PostType.EXPEDITION_JOURNAL,
      title: 'Monsoon Traverse of Harishchandragad via Khireshwar',
      content:
        'Commenced the trek early morning from Khireshwar village. The Taramati peak ridge was blanketed in dense mist with monsoon waterfalls cascading down the Kokankada cliff. Zero-trace camping respected.',
      mediaUrls: [
        'https://cdn.explorebharatsafar.in/posts/kokankada_cliff.webp',
        'https://cdn.explorebharatsafar.in/posts/taramati_summit.webp',
      ],
      hashtags: ['western_ghats', 'harishchandragad', 'monsoontrek', 'sahyadri'],
      mentions: [],
      locationName: 'Harishchandragad, Ahmednagar',
      visibility: PostVisibility.PUBLIC,
      status: PostStatus.PUBLISHED,
      reactionCount: 0,
      commentCount: 0,
      createdAt: '2026-08-16T12:00:00.000Z',
      updatedAt: '2026-08-16T12:00:00.000Z',
    };

    const p2: PostEntity = {
      id: 'post_heritage_002',
      profileId: 'prof_pooja_002',
      author: {
        id: 'prof_pooja_002',
        userId: 'usr_traveller_sprint2_002',
        username: 'pooja_deshmukh',
        displayName: 'Pooja Deshmukh',
        avatarUrl: 'https://cdn.explorebharatsafar.in/avatars/pooja.webp',
        adventureGrade: AdventureGrade.EXPLORER,
      },
      postType: PostType.PHOTO_SHOWCASE,
      title: 'Sacred Groves and Stone Bas-Reliefs of Velhe',
      content:
        'Documenting ancient Devrai (sacred groves) in rural Maharashtra. These community-conserved forest fragments protect endangered native flora and ancient stone guardians.',
      mediaUrls: ['https://cdn.explorebharatsafar.in/posts/sacred_grove.webp'],
      hashtags: ['devrai', 'sacredgroves', 'ruralbharat', 'heritage'],
      mentions: ['amitabh_sharma'],
      locationName: 'Velhe, Pune District',
      visibility: PostVisibility.PUBLIC,
      status: PostStatus.PUBLISHED,
      reactionCount: 0,
      commentCount: 0,
      createdAt: '2026-08-20T14:30:00.000Z',
      updatedAt: '2026-08-20T14:30:00.000Z',
    };

    this.posts.set(p1.id, p1);
    this.posts.set(p2.id, p2);
  }
}
