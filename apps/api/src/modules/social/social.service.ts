// Explore Bharat Safar — Section 4: Master Social Platform Orchestration Service
// Reference: EBS-DOC-15-SOCIAL, EBS-BLU-44-SOC, EBS-DOC-09-API Section 5.6

import { Injectable, Logger } from '@nestjs/common';
import {
  SocialActionType,
  type SocialAuditLogEntity,
  type TravellerProfileEntity,
  type TravellerProfileSummary,
  type PostEntity,
  type CommunityEntity,
  type FollowRequestEntity,
  type SocialGraphRelation,
  type PreSignedUploadResult,
  CommunityRole,
} from '@ebs/types';
import {
  UpdateProfileDto,
  CreatePostDto,
  UpdatePostDto,
  CreateCommunityDto,
  UploadMediaPreSignedDto,
  SearchTravellerQueryDto,
} from './dto/social.dto';
import { SocialProfileService } from './services/social-profile.service';
import { SocialGraphService } from './services/social-graph.service';
import { SocialPostsService } from './services/social-posts.service';
import { SocialFeedService } from './services/social-feed.service';
import { SocialMediaService } from './services/social-media.service';
import { SocialCommunityService } from './services/social-community.service';
import { IdentitySocialBridgeService } from '../../common/services/identity-social-bridge.service';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  // In-memory audit logs registry
  private readonly auditLogs: SocialAuditLogEntity[] = [];

  constructor(
    public readonly profileService: SocialProfileService,
    public readonly graphService: SocialGraphService,
    public readonly postsService: SocialPostsService,
    public readonly feedService: SocialFeedService,
    public readonly mediaService: SocialMediaService,
    public readonly communityService: SocialCommunityService,
    private readonly identityBridge: IdentitySocialBridgeService,
  ) {}

  // ==========================================
  // PROFILE METHODS
  // ==========================================

  async getProfile(username: string, viewerUserId?: string): Promise<TravellerProfileEntity> {
    const viewerProfileId = viewerUserId
      ? (await this.profileService.getOrCreateProfileForUser(viewerUserId)).id
      : undefined;

    return this.profileService.getProfileByUsername(username, viewerProfileId);
  }

  async getMyProfile(userId: string): Promise<TravellerProfileEntity> {
    return this.profileService.getOrCreateProfileForUser(userId);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    ipAddress?: string,
  ): Promise<TravellerProfileEntity> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    const updated = await this.profileService.updateProfile(profile.id, dto);

    this.logAudit({
      actorId: userId,
      action: SocialActionType.PROFILE_UPDATE,
      targetType: 'PROFILE',
      targetId: profile.id,
      ipAddress,
      metadata: { displayName: updated.displayName, isProfilePublic: updated.isProfilePublic },
    });

    return updated;
  }

  async searchTravellers(
    dto: SearchTravellerQueryDto,
  ): Promise<{ items: TravellerProfileSummary[]; total: number }> {
    return this.profileService.searchProfiles(dto.query, dto.grade, dto.state, dto.page, dto.limit);
  }

  // ==========================================
  // SOCIAL GRAPH METHODS
  // ==========================================

  async followUser(
    followerUserId: string,
    targetProfileId: string,
    ipAddress?: string,
  ): Promise<{ status: 'FOLLOWING' | 'REQUEST_SENT' }> {
    const followerProfile = await this.profileService.getOrCreateProfileForUser(followerUserId);
    const result = await this.graphService.follow(followerProfile.id, targetProfileId);

    const action =
      result.status === 'FOLLOWING'
        ? SocialActionType.FOLLOW
        : SocialActionType.FOLLOW_REQUEST_CREATE;

    this.logAudit({
      actorId: followerUserId,
      action,
      targetType: 'PROFILE',
      targetId: targetProfileId,
      ipAddress,
    });

    return result;
  }

  async unfollowUser(
    followerUserId: string,
    targetProfileId: string,
    ipAddress?: string,
  ): Promise<void> {
    const followerProfile = await this.profileService.getOrCreateProfileForUser(followerUserId);
    await this.graphService.unfollow(followerProfile.id, targetProfileId);

    this.logAudit({
      actorId: followerUserId,
      action: SocialActionType.UNFOLLOW,
      targetType: 'PROFILE',
      targetId: targetProfileId,
      ipAddress,
    });
  }

  async getFollowRequests(userId: string): Promise<FollowRequestEntity[]> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    return this.graphService.getFollowRequests(profile.id);
  }

  async acceptFollowRequest(userId: string, requestId: string, ipAddress?: string): Promise<void> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    await this.graphService.acceptFollowRequest(profile.id, requestId);

    this.logAudit({
      actorId: userId,
      action: SocialActionType.FOLLOW_REQUEST_ACCEPT,
      targetType: 'FOLLOW_REQUEST',
      targetId: requestId,
      ipAddress,
    });
  }

  async rejectFollowRequest(userId: string, requestId: string, ipAddress?: string): Promise<void> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    await this.graphService.rejectFollowRequest(profile.id, requestId);

    this.logAudit({
      actorId: userId,
      action: SocialActionType.FOLLOW_REQUEST_REJECT,
      targetType: 'FOLLOW_REQUEST',
      targetId: requestId,
      ipAddress,
    });
  }

  async getFollowers(profileId: string): Promise<TravellerProfileSummary[]> {
    return this.graphService.getFollowers(profileId);
  }

  async getFollowing(profileId: string): Promise<TravellerProfileSummary[]> {
    return this.graphService.getFollowing(profileId);
  }

  async blockUser(
    blockerUserId: string,
    targetProfileId: string,
    ipAddress?: string,
  ): Promise<void> {
    const blockerProfile = await this.profileService.getOrCreateProfileForUser(blockerUserId);
    await this.graphService.blockUser(blockerProfile.id, targetProfileId);

    this.logAudit({
      actorId: blockerUserId,
      action: SocialActionType.BLOCK_USER,
      targetType: 'PROFILE',
      targetId: targetProfileId,
      ipAddress,
    });
  }

  async unblockUser(
    blockerUserId: string,
    targetProfileId: string,
    ipAddress?: string,
  ): Promise<void> {
    const blockerProfile = await this.profileService.getOrCreateProfileForUser(blockerUserId);
    await this.graphService.unblockUser(blockerProfile.id, targetProfileId);

    this.logAudit({
      actorId: blockerUserId,
      action: SocialActionType.UNBLOCK_USER,
      targetType: 'PROFILE',
      targetId: targetProfileId,
      ipAddress,
    });
  }

  async muteUser(muterUserId: string, targetProfileId: string, ipAddress?: string): Promise<void> {
    const muterProfile = await this.profileService.getOrCreateProfileForUser(muterUserId);
    await this.graphService.muteUser(muterProfile.id, targetProfileId);

    this.logAudit({
      actorId: muterUserId,
      action: SocialActionType.MUTE_USER,
      targetType: 'PROFILE',
      targetId: targetProfileId,
      ipAddress,
    });
  }

  async unmuteUser(
    muterUserId: string,
    targetProfileId: string,
    ipAddress?: string,
  ): Promise<void> {
    const muterProfile = await this.profileService.getOrCreateProfileForUser(muterUserId);
    await this.graphService.unmuteUser(muterProfile.id, targetProfileId);

    this.logAudit({
      actorId: muterUserId,
      action: SocialActionType.UNMUTE_USER,
      targetType: 'PROFILE',
      targetId: targetProfileId,
      ipAddress,
    });
  }

  async getRelationship(
    viewerUserId: string,
    targetProfileId: string,
  ): Promise<SocialGraphRelation> {
    const viewerProfile = await this.profileService.getOrCreateProfileForUser(viewerUserId);
    return this.graphService.getRelationship(viewerProfile.id, targetProfileId);
  }

  // ==========================================
  // POSTS & FEEDS METHODS
  // ==========================================

  async createPost(userId: string, dto: CreatePostDto, ipAddress?: string): Promise<PostEntity> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    const post = await this.postsService.createPost(profile.id, dto);

    this.logAudit({
      actorId: userId,
      action: SocialActionType.POST_CREATE,
      targetType: 'POST',
      targetId: post.id,
      ipAddress,
      metadata: { postType: post.postType, hashtags: post.hashtags },
    });

    return post;
  }

  async getPostById(postId: string, viewerUserId?: string): Promise<PostEntity> {
    const viewerProfileId = viewerUserId
      ? (await this.profileService.getOrCreateProfileForUser(viewerUserId)).id
      : undefined;

    return this.postsService.getPostById(postId, viewerProfileId);
  }

  async updatePost(
    userId: string,
    postId: string,
    dto: UpdatePostDto,
    ipAddress?: string,
  ): Promise<PostEntity> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    const post = await this.postsService.updatePost(profile.id, postId, dto);

    this.logAudit({
      actorId: userId,
      action: SocialActionType.POST_UPDATE,
      targetType: 'POST',
      targetId: postId,
      ipAddress,
    });

    return post;
  }

  async deletePost(userId: string, postId: string, ipAddress?: string): Promise<void> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    await this.postsService.deletePost(profile.id, postId);

    this.logAudit({
      actorId: userId,
      action: SocialActionType.POST_DELETE,
      targetType: 'POST',
      targetId: postId,
      ipAddress,
    });
  }

  async getFeed(
    viewerUserId?: string,
    feedType: 'HOME' | 'FOLLOWING' | 'DISCOVER' = 'HOME',
    cursor?: string,
    limit = 20,
  ): Promise<{ items: PostEntity[]; nextCursor?: string }> {
    const viewerProfileId = viewerUserId
      ? (await this.profileService.getOrCreateProfileForUser(viewerUserId)).id
      : undefined;

    if (feedType === 'FOLLOWING') {
      if (!viewerProfileId) {
        return { items: [] };
      }
      return this.feedService.getFollowingFeed(viewerProfileId, cursor, limit);
    }

    if (feedType === 'DISCOVER') {
      return this.feedService.getDiscoverFeed(viewerProfileId, cursor, limit);
    }

    return this.feedService.getHomeFeed(viewerProfileId, cursor, limit);
  }

  async getHashtagFeed(
    hashtag: string,
    viewerUserId?: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ items: PostEntity[]; nextCursor?: string }> {
    const viewerProfileId = viewerUserId
      ? (await this.profileService.getOrCreateProfileForUser(viewerUserId)).id
      : undefined;

    return this.feedService.getHashtagFeed(hashtag, viewerProfileId, cursor, limit);
  }

  async getUserPosts(username: string, viewerUserId?: string, limit = 20): Promise<PostEntity[]> {
    const targetProfile = await this.profileService.getProfileByUsername(username);
    const viewerProfileId = viewerUserId
      ? (await this.profileService.getOrCreateProfileForUser(viewerUserId)).id
      : undefined;

    return this.feedService.getUserPosts(targetProfile.id, viewerProfileId, limit);
  }

  // ==========================================
  // MEDIA METHODS
  // ==========================================

  async requestPreSignedMediaUpload(
    userId: string,
    dto: UploadMediaPreSignedDto,
  ): Promise<PreSignedUploadResult> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    return this.mediaService.generatePreSignedUploadUrl(profile.id, dto);
  }

  // ==========================================
  // COMMUNITY METHODS
  // ==========================================

  async createCommunity(
    userId: string,
    dto: CreateCommunityDto,
    ipAddress?: string,
  ): Promise<CommunityEntity> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    const community = await this.communityService.createCommunity(profile.id, dto);

    this.logAudit({
      actorId: userId,
      action: SocialActionType.COMMUNITY_CREATE,
      targetType: 'COMMUNITY',
      targetId: community.id,
      ipAddress,
      metadata: { slug: community.slug, title: community.title },
    });

    return community;
  }

  async getCommunities(query?: string): Promise<CommunityEntity[]> {
    return this.communityService.getCommunities(query);
  }

  async getCommunity(slug: string, viewerUserId?: string): Promise<CommunityEntity> {
    const viewerProfileId = viewerUserId
      ? (await this.profileService.getOrCreateProfileForUser(viewerUserId)).id
      : undefined;

    return this.communityService.getCommunityBySlug(slug, viewerProfileId);
  }

  async joinCommunity(userId: string, slug: string, ipAddress?: string): Promise<void> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    await this.communityService.joinCommunity(profile.id, slug);

    this.logAudit({
      actorId: userId,
      action: SocialActionType.COMMUNITY_JOIN,
      targetType: 'COMMUNITY',
      targetId: slug,
      ipAddress,
    });
  }

  async leaveCommunity(userId: string, slug: string, ipAddress?: string): Promise<void> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    await this.communityService.leaveCommunity(profile.id, slug);

    this.logAudit({
      actorId: userId,
      action: SocialActionType.COMMUNITY_LEAVE,
      targetType: 'COMMUNITY',
      targetId: slug,
      ipAddress,
    });
  }

  async updateCommunityMemberRole(
    userId: string,
    slug: string,
    targetProfileId: string,
    newRole: CommunityRole,
    ipAddress?: string,
  ): Promise<void> {
    const profile = await this.profileService.getOrCreateProfileForUser(userId);
    await this.communityService.updateMemberRole(profile.id, slug, targetProfileId, newRole);

    this.logAudit({
      actorId: userId,
      action: SocialActionType.COMMUNITY_ROLE_CHANGE,
      targetType: 'COMMUNITY_MEMBER',
      targetId: `${slug}:${targetProfileId}`,
      ipAddress,
      metadata: { newRole },
    });
  }

  async getCommunityPosts(slug: string, viewerUserId?: string, limit = 20): Promise<PostEntity[]> {
    const viewerProfileId = viewerUserId
      ? (await this.profileService.getOrCreateProfileForUser(viewerUserId)).id
      : undefined;

    return this.communityService.getCommunityPosts(slug, viewerProfileId, limit);
  }

  // ==========================================
  // AUDIT LOGGING
  // ==========================================

  getAuditLogs(actorId?: string): SocialAuditLogEntity[] {
    if (!actorId) return [...this.auditLogs];
    return this.auditLogs.filter(l => l.actorId === actorId);
  }

  private logAudit(entry: Omit<SocialAuditLogEntity, 'id' | 'createdAt'>): void {
    const log: SocialAuditLogEntity = {
      id: `slog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs.push(log);
  }
}
