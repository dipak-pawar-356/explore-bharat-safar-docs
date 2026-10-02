// Explore Bharat Safar — Social Controller Unit & Integration Tests
// Reference: EBS-DOC-15-SOCIAL, EBS-DOC-09-API Section 5.6

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { UserRole, PostType, PostVisibility, AccountStatus, type User } from '@ebs/types';
import { SocialProfileService } from './services/social-profile.service';
import { SocialGraphService } from './services/social-graph.service';
import { SocialPostsService } from './services/social-posts.service';
import { SocialFeedService } from './services/social-feed.service';
import { SocialMediaService } from './services/social-media.service';
import { SocialCommunityService } from './services/social-community.service';
import { IdentitySocialBridgeService } from '../../common/services/identity-social-bridge.service';
import type { FastifyRequest } from 'fastify';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';

describe('SocialController', () => {
  let controller: SocialController;
  let service: SocialService;

  const mockUser: User = {
    id: 'usr_traveller_sprint2_001',
    email: 'amitabh.sharma@example.com',
    fullName: 'Amitabh Sharma',
    phoneNumber: '+919822001122',
    roles: [UserRole.TRAVELLER],
    permissions: [],
    status: AccountStatus.ACTIVE,
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockReq = { ip: '127.0.0.1' } as unknown as FastifyRequest;

  beforeEach(() => {
    const profileService = new SocialProfileService();
    const graphService = new SocialGraphService(profileService);
    const postsService = new SocialPostsService(profileService, graphService);
    const feedService = new SocialFeedService(postsService, graphService);
    const mediaService = new SocialMediaService();
    const communityService = new SocialCommunityService(postsService);
    const identityBridge = new IdentitySocialBridgeService();

    service = new SocialService(
      profileService,
      graphService,
      postsService,
      feedService,
      mediaService,
      communityService,
      identityBridge,
    );

    controller = new SocialController(service);
  });

  it('GET /api/v1/social/profile/:username should return public profile envelope', async () => {
    const res = await controller.getProfile('amitabh_sharma', mockUser);
    assert.ok(res.data);
    assert.equal(res.data.username, 'amitabh_sharma');
    assert.equal(res.data.isProfilePublic, true);
  });

  it('PATCH /api/v1/social/profile should update profile settings', async () => {
    const res = await controller.updateProfile(
      mockUser,
      {
        displayName: 'Amitabh Sharma - Explorer',
        bio: 'Updated bio text for testing.',
      },
      mockReq,
    );

    assert.ok(res.data);
    assert.equal(res.data.displayName, 'Amitabh Sharma - Explorer');
    assert.equal(res.message, 'Traveller profile updated successfully.');
  });

  it('POST /api/v1/social/posts should publish new post', async () => {
    const res = await controller.createPost(
      mockUser,
      {
        postType: PostType.EXPEDITION_JOURNAL,
        title: 'Torna Fort Winter Climb',
        content:
          'Challenging dawn ascent to the first fort captured by Chhatrapati Shivaji Maharaj in 1646.',
        visibility: PostVisibility.PUBLIC,
      },
      mockReq,
    );

    assert.ok(res.data);
    assert.equal(res.data.title, 'Torna Fort Winter Climb');
    assert.equal(res.message, 'Post published successfully.');
  });

  it('GET /api/v1/social/feed should return paginated home feed', async () => {
    const res = await controller.getFeed('HOME', undefined, '10', mockUser);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.length >= 2);
    assert.equal(res.meta.limit, 10);
  });

  it('GET /api/v1/social/communities should list available travel guilds', async () => {
    const res = await controller.getCommunities();
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.length >= 2);
  });
});
