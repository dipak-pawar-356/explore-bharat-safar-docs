// Explore Bharat Safar — Section 4: Social Graph & Relationships Domain Service
// Reference: EBS-DOC-15-SOCIAL Section 6, EBS-BLU-44-SOC Section 6, EBS-DOC-26-RULES

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import {
  FollowRequestStatus,
  type FollowRequestEntity,
  type SocialGraphRelation,
  type TravellerProfileSummary,
} from '@ebs/types';
import { SocialProfileService } from './social-profile.service';

@Injectable()
export class SocialGraphService {
  private readonly logger = new Logger(SocialGraphService.name);

  // Key: `${followerId}:${followingId}` -> true
  private readonly follows = new Set<string>();
  // Follow requests: requestId -> FollowRequestEntity
  private readonly followRequests = new Map<string, FollowRequestEntity>();
  // Key: `${requesterId}:${targetId}` -> requestId
  private readonly requestKeyIndex = new Map<string, string>();
  // Blocks: `${blockerId}:${blockedId}` -> true
  private readonly blocks = new Set<string>();
  // Mutes: `${muterId}:${mutedId}` -> true
  private readonly mutes = new Set<string>();

  constructor(private readonly profileService: SocialProfileService) {
    this.seedInitialGraph();
  }

  /**
   * Follow a user or submit a follow request if account is private.
   */
  async follow(
    followerProfileId: string,
    targetProfileId: string,
  ): Promise<{ status: 'FOLLOWING' | 'REQUEST_SENT' }> {
    if (followerProfileId === targetProfileId) {
      throw new BadRequestException('You cannot follow your own profile.');
    }

    if (this.isBlocked(targetProfileId, followerProfileId)) {
      throw new ForbiddenException('Action blocked by user privacy policy.');
    }

    const followKey = `${followerProfileId}:${targetProfileId}`;
    if (this.follows.has(followKey)) {
      return { status: 'FOLLOWING' };
    }

    const targetProfile = await this.profileService.getProfileById(targetProfileId);

    // Private account requires approval
    if (!targetProfile.isProfilePublic) {
      const existingReqId = this.requestKeyIndex.get(followKey);
      if (existingReqId) {
        const req = this.followRequests.get(existingReqId);
        if (req && req.status === FollowRequestStatus.PENDING) {
          return { status: 'REQUEST_SENT' };
        }
      }

      const followerSummary = this.profileService.toSummary(
        await this.profileService.getProfileById(followerProfileId),
      );

      const requestId = `freq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const request: FollowRequestEntity = {
        id: requestId,
        requesterId: followerProfileId,
        targetId: targetProfileId,
        requester: followerSummary,
        status: FollowRequestStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.followRequests.set(requestId, request);
      this.requestKeyIndex.set(followKey, requestId);
      this.logger.log(
        `Created follow request from ${followerProfileId} to private profile ${targetProfileId}`,
      );
      return { status: 'REQUEST_SENT' };
    }

    // Public account -> Direct follow
    this.follows.add(followKey);
    this.profileService.adjustCounters(followerProfileId, 0, 1);
    this.profileService.adjustCounters(targetProfileId, 1, 0);

    this.logger.log(`User ${followerProfileId} followed public profile ${targetProfileId}`);
    return { status: 'FOLLOWING' };
  }

  /**
   * Unfollow a user or cancel pending follow request.
   */
  async unfollow(followerProfileId: string, targetProfileId: string): Promise<void> {
    const followKey = `${followerProfileId}:${targetProfileId}`;
    if (this.follows.has(followKey)) {
      this.follows.delete(followKey);
      this.profileService.adjustCounters(followerProfileId, 0, -1);
      this.profileService.adjustCounters(targetProfileId, -1, 0);
      this.logger.log(`User ${followerProfileId} unfollowed ${targetProfileId}`);
    }

    const reqId = this.requestKeyIndex.get(followKey);
    if (reqId) {
      this.followRequests.delete(reqId);
      this.requestKeyIndex.delete(followKey);
    }
  }

  /**
   * Retrieves pending follow requests for the authenticated user.
   */
  async getFollowRequests(targetProfileId: string): Promise<FollowRequestEntity[]> {
    return Array.from(this.followRequests.values()).filter(
      r => r.targetId === targetProfileId && r.status === FollowRequestStatus.PENDING,
    );
  }

  /**
   * Accepts a pending follow request.
   */
  async acceptFollowRequest(targetProfileId: string, requestId: string): Promise<void> {
    const request = this.followRequests.get(requestId);
    if (!request || request.targetId !== targetProfileId) {
      throw new NotFoundException('Follow request not found.');
    }

    request.status = FollowRequestStatus.ACCEPTED;
    request.updatedAt = new Date().toISOString();

    const followKey = `${request.requesterId}:${targetProfileId}`;
    if (!this.follows.has(followKey)) {
      this.follows.add(followKey);
      this.profileService.adjustCounters(request.requesterId, 0, 1);
      this.profileService.adjustCounters(targetProfileId, 1, 0);
    }

    this.logger.log(`Approved follow request ${requestId} for target ${targetProfileId}`);
  }

  /**
   * Rejects a pending follow request.
   */
  async rejectFollowRequest(targetProfileId: string, requestId: string): Promise<void> {
    const request = this.followRequests.get(requestId);
    if (!request || request.targetId !== targetProfileId) {
      throw new NotFoundException('Follow request not found.');
    }

    request.status = FollowRequestStatus.REJECTED;
    request.updatedAt = new Date().toISOString();
    this.followRequests.delete(requestId);
    this.requestKeyIndex.delete(`${request.requesterId}:${targetProfileId}`);
  }

  /**
   * Returns list of followers for a profile.
   */
  async getFollowers(profileId: string): Promise<TravellerProfileSummary[]> {
    const followerIds: string[] = [];
    for (const key of this.follows) {
      const [follower, following] = key.split(':');
      if (following === profileId) {
        followerIds.push(follower);
      }
    }

    const summaries: TravellerProfileSummary[] = [];
    for (const fid of followerIds) {
      try {
        const p = await this.profileService.getProfileById(fid);
        summaries.push(this.profileService.toSummary(p));
      } catch {
        // Ignore deleted
      }
    }
    return summaries;
  }

  /**
   * Returns list of following users for a profile.
   */
  async getFollowing(profileId: string): Promise<TravellerProfileSummary[]> {
    const followingIds: string[] = [];
    for (const key of this.follows) {
      const [follower, following] = key.split(':');
      if (follower === profileId) {
        followingIds.push(following);
      }
    }

    const summaries: TravellerProfileSummary[] = [];
    for (const fid of followingIds) {
      try {
        const p = await this.profileService.getProfileById(fid);
        summaries.push(this.profileService.toSummary(p));
      } catch {
        // Ignore deleted
      }
    }
    return summaries;
  }

  /**
   * Blocks a user, immediately breaking bidirectional follow connections.
   */
  async blockUser(blockerProfileId: string, targetProfileId: string): Promise<void> {
    if (blockerProfileId === targetProfileId) {
      throw new BadRequestException('You cannot block yourself.');
    }

    this.blocks.add(`${blockerProfileId}:${targetProfileId}`);
    // Sever both follow connections immediately
    await this.unfollow(blockerProfileId, targetProfileId);
    await this.unfollow(targetProfileId, blockerProfileId);

    this.logger.log(`User ${blockerProfileId} blocked ${targetProfileId}`);
  }

  /**
   * Unblocks a user.
   */
  async unblockUser(blockerProfileId: string, targetProfileId: string): Promise<void> {
    this.blocks.delete(`${blockerProfileId}:${targetProfileId}`);
    this.logger.log(`User ${blockerProfileId} unblocked ${targetProfileId}`);
  }

  /**
   * Mutes a user's content from feed.
   */
  async muteUser(muterProfileId: string, targetProfileId: string): Promise<void> {
    if (muterProfileId === targetProfileId) {
      throw new BadRequestException('You cannot mute yourself.');
    }
    this.mutes.add(`${muterProfileId}:${targetProfileId}`);
  }

  /**
   * Unmutes a user.
   */
  async unmuteUser(muterProfileId: string, targetProfileId: string): Promise<void> {
    this.mutes.delete(`${muterProfileId}:${targetProfileId}`);
  }

  /**
   * Checks full relationship state between viewer and target.
   */
  async getRelationship(
    viewerProfileId: string,
    targetProfileId: string,
  ): Promise<SocialGraphRelation> {
    const isFollowing = this.follows.has(`${viewerProfileId}:${targetProfileId}`);
    const isFollowedBy = this.follows.has(`${targetProfileId}:${viewerProfileId}`);
    const reqKey = `${viewerProfileId}:${targetProfileId}`;
    const reqId = this.requestKeyIndex.get(reqKey);
    const req = reqId ? this.followRequests.get(reqId) : undefined;
    const isPendingFollowRequest = req?.status === FollowRequestStatus.PENDING;
    const isBlocked =
      this.isBlocked(viewerProfileId, targetProfileId) ||
      this.isBlocked(targetProfileId, viewerProfileId);
    const isMuted = this.mutes.has(`${viewerProfileId}:${targetProfileId}`);

    return {
      isFollowing,
      isFollowedBy,
      isPendingFollowRequest,
      isBlocked,
      isMuted,
    };
  }

  isFollowing(followerId: string, targetId: string): boolean {
    return this.follows.has(`${followerId}:${targetId}`);
  }

  isBlocked(blockerId: string, targetId: string): boolean {
    return this.blocks.has(`${blockerId}:${targetId}`);
  }

  isMuted(muterId: string, targetId: string): boolean {
    return this.mutes.has(`${muterId}:${targetId}`);
  }

  getFollowingIds(profileId: string): string[] {
    const ids: string[] = [];
    for (const key of this.follows) {
      const [follower, following] = key.split(':');
      if (follower === profileId) ids.push(following);
    }
    return ids;
  }

  getBlockedAndMutedIds(viewerProfileId: string): Set<string> {
    const excluded = new Set<string>();
    for (const block of this.blocks) {
      const [b1, b2] = block.split(':');
      if (b1 === viewerProfileId) excluded.add(b2);
      if (b2 === viewerProfileId) excluded.add(b1);
    }
    for (const mute of this.mutes) {
      const [m1, m2] = mute.split(':');
      if (m1 === viewerProfileId) excluded.add(m2);
    }
    return excluded;
  }

  private seedInitialGraph(): void {
    // Amitabh follows Pooja initially
    this.follows.add('prof_amitabh_001:prof_pooja_002');
  }
}
