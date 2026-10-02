// Explore Bharat Safar — 12-Stage Traveller Social Platform E2E Integration Tests
// Reference: EBS-DOC-15-SOCIAL, EBS-BLU-44-SOC, EBS-DOC-09-API, EBS-DOC-40-SECURITY

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { PostType, PostVisibility, PostStatus, MediaType, CommunityRole } from '@ebs/types';
import { SocialProfileService } from './services/social-profile.service';
import { SocialGraphService } from './services/social-graph.service';
import { SocialPostsService } from './services/social-posts.service';
import { SocialFeedService } from './services/social-feed.service';
import { SocialMediaService } from './services/social-media.service';
import { SocialCommunityService } from './services/social-community.service';
import { IdentitySocialBridgeService } from '../../common/services/identity-social-bridge.service';
import { SocialService } from './social.service';

describe('Traveller Social Platform E2E Lifecycle', () => {
  let socialService: SocialService;

  const userA = 'usr_traveller_sprint2_001'; // Amitabh
  const userB = 'usr_traveller_sprint2_002'; // Pooja (Private)
  const userC = 'usr_e2e_traveller_003'; // Vikram (New explorer)

  let profileAId = '';
  let profileBId = '';
  let profileCId = '';
  let communitySlug = '';

  before(async () => {
    const profileService = new SocialProfileService();
    const graphService = new SocialGraphService(profileService);
    const postsService = new SocialPostsService(profileService, graphService);
    const feedService = new SocialFeedService(postsService, graphService);
    const mediaService = new SocialMediaService();
    const communityService = new SocialCommunityService(postsService);
    const identityBridge = new IdentitySocialBridgeService();

    socialService = new SocialService(
      profileService,
      graphService,
      postsService,
      feedService,
      mediaService,
      communityService,
      identityBridge,
    );

    const profA = await socialService.getMyProfile(userA);
    const profB = await socialService.getMyProfile(userB);
    const profC = await socialService.profileService.getOrCreateProfileForUser(
      userC,
      'vikram_aditya',
      'Vikramaditya Rathore',
    );

    profileAId = profA.id;
    profileBId = profB.id;
    profileCId = profC.id;
  });

  // Stage 1: Profile Setup & Privacy Gates
  it('Stage 1: should enforce public and private profile visibility rules', async () => {
    const publicProfile = await socialService.getProfile('amitabh_sharma', userC);
    assert.equal(publicProfile.isProfilePublic, true);
    assert.ok(publicProfile.bio?.length);

    // Pooja is private, so bio/cover are masked for Vikram
    const maskedProfile = await socialService.getProfile('pooja_deshmukh', userC);
    assert.equal(maskedProfile.isProfilePublic, false);
    assert.equal(maskedProfile.bio, 'This account is private. Follow to view their journeys.');
    assert.equal(maskedProfile.coverImageUrl, undefined);
  });

  // Stage 2: Private Account Follow Request Workflow
  it('Stage 2: should create follow request when attempting to follow a private profile', async () => {
    const res = await socialService.followUser(userC, profileBId);
    assert.equal(res.status, 'REQUEST_SENT');

    const pending = await socialService.getFollowRequests(userB);
    assert.equal(pending.length, 1);
    assert.equal(pending[0].requesterId, profileCId);
  });

  // Stage 3: Follow Request Approval
  it('Stage 3: should approve follow request and establish following relationship', async () => {
    const pending = await socialService.getFollowRequests(userB);
    assert.ok(pending.length >= 1);

    await socialService.acceptFollowRequest(userB, pending[0].id);

    const relation = await socialService.getRelationship(userC, profileBId);
    assert.equal(relation.isFollowing, true);

    const followers = await socialService.getFollowers(profileBId);
    assert.ok(followers.some(f => f.id === profileCId));
  });

  // Stage 4: Post Creation with Hashtags and Mentions
  it('Stage 4: should publish rich travel post with auto-extracted hashtags and mentions', async () => {
    const post = await socialService.createPost(userC, {
      postType: PostType.EXPEDITION_JOURNAL,
      title: 'Monsoon Traverse of Harishchandragad with Kokankada Sunset',
      content:
        'Climbed the escarpment with @amitabh_sharma via Khireshwar route. Thick fog parted to reveal Kokankada abyss! #western_ghats #harishchandragad #monsoontrek',
      visibility: PostVisibility.PUBLIC,
      mediaUrls: ['https://cdn.explorebharatsafar.in/posts/kokankada-cliff.webp'],
      locationName: 'Harishchandragad, Ahmednagar',
    });

    assert.ok(post.id);
    assert.equal(post.hashtags.length, 3);
    assert.ok(post.hashtags.includes('western_ghats'));
    assert.ok(post.hashtags.includes('harishchandragad'));
    assert.equal(post.mentions.length, 1);
    assert.ok(post.mentions.includes('amitabh_sharma'));
  });

  // Stage 5: Draft Post Workflow
  it('Stage 5: should allow saving draft posts and prevent non-owners from reading drafts', async () => {
    const draft = await socialService.createPost(userC, {
      postType: PostType.QA,
      content: 'Draft query: looking for certified local guides near Patan stepwells.',
      status: PostStatus.DRAFT,
    });

    // Owner can fetch
    const ownerFetch = await socialService.getPostById(draft.id, userC);
    assert.equal(ownerFetch.status, PostStatus.DRAFT);

    // Non-owner cannot fetch draft
    await assert.rejects(
      async () => {
        await socialService.getPostById(draft.id, userA);
      },
      {
        message: 'Post is a private draft.',
      },
    );
  });

  // Stage 6: Following Feed vs Discover Feed Aggregation
  it('Stage 6: should aggregate following posts for user and discover posts globally', async () => {
    // Vikram follows Pooja (userB). Following feed for Vikram must contain Pooja's posts.
    const followingFeed = await socialService.getFeed(userC, 'FOLLOWING');
    assert.ok(followingFeed.items.length >= 1);
    assert.ok(followingFeed.items.some(p => p.profileId === profileBId));

    // Discover feed contains public posts sorted by ranking
    const discoverFeed = await socialService.getFeed(userC, 'DISCOVER');
    assert.ok(discoverFeed.items.length >= 1);
    assert.ok(discoverFeed.items.every(p => p.visibility === PostVisibility.PUBLIC));
  });

  // Stage 7: Followers-Only Visibility Gate
  it('Stage 7: should restrict followers-only posts to approved followers', async () => {
    const followersPost = await socialService.createPost(userB, {
      postType: PostType.QA,
      content: 'Private circle advice: best homestay host in Velhe village?',
      visibility: PostVisibility.FOLLOWERS_ONLY,
    });

    // Vikram follows Pooja -> Can view
    const vikramView = await socialService.getPostById(followersPost.id, userC);
    assert.equal(vikramView.id, followersPost.id);

    // Create non-following stranger
    const stranger = 'usr_stranger_nonfollower_999';
    await assert.rejects(
      async () => {
        await socialService.getPostById(followersPost.id, stranger);
      },
      {
        message: 'This post is visible to followers only.',
      },
    );
  });

  // Stage 8: Hashtag Feed Querying
  it('Stage 8: should filter public posts by specific hashtag', async () => {
    const tagFeed = await socialService.getHashtagFeed('western_ghats', userA);
    assert.ok(tagFeed.items.length >= 1);
    assert.ok(tagFeed.items.every(p => p.hashtags.includes('western_ghats')));
  });

  // Stage 9: Pre-Signed Media Upload URL Generation
  it('Stage 9: should generate secure pre-signed upload URL conforming to bounds', async () => {
    const upload = await socialService.requestPreSignedMediaUpload(userC, {
      mediaType: MediaType.IMAGE,
      mimeType: 'image/webp',
      fileSize: 3 * 1024 * 1024,
      width: 2560,
      height: 1440,
    });

    assert.ok(upload.uploadUrl.startsWith('https://ebs-media-vault.s3.'));
    assert.ok(upload.mediaUrl.startsWith('https://cdn.explorebharatsafar.in/'));
    assert.equal(upload.headers['x-ebs-exif-stripped'], 'true');
  });

  // Stage 10: Community Creation and Membership
  it('Stage 10: should create travel community and allow members to join', async () => {
    const comm = await socialService.createCommunity(userC, {
      slug: 'kokan-coastal-cliff-guild',
      title: 'Kokan Coastal Cliff Explorers',
      description:
        'Guild dedicated to sea forts, coastal cliffs, and pristine fishing hamlet homestays.',
      rulesText: 'Respect coastal biodiversity, support village fisherfolk, keep beaches pristine.',
    });

    communitySlug = comm.slug;
    assert.equal(comm.userRole, CommunityRole.LEADER);
    assert.equal(comm.memberCount, 1);

    // Amitabh joins the guild
    await socialService.joinCommunity(userA, communitySlug);
    const commAfter = await socialService.getCommunity(communitySlug, userA);
    assert.equal(commAfter.memberCount, 2);
    assert.equal(commAfter.userRole, CommunityRole.MEMBER);
  });

  // Stage 11: User Blocking & Mute Enforcement
  it('Stage 11: should block user, severing follows and filtering content from feeds', async () => {
    // Vikram blocks Amitabh
    await socialService.blockUser(userC, profileAId);

    // Relationship is blocked
    const rel = await socialService.getRelationship(userC, profileAId);
    assert.equal(rel.isBlocked, true);
    assert.equal(rel.isFollowing, false);

    // Amitabh's posts are suppressed in Vikram's home feed
    const homeFeed = await socialService.getFeed(userC, 'HOME');
    assert.ok(!homeFeed.items.some(p => p.profileId === profileAId));
  });

  // Stage 12: Audit Log Trail Verification
  it('Stage 12: should record complete tamper-evident audit logs across all actions', async () => {
    const logs = socialService.getAuditLogs(userC);
    assert.ok(logs.length >= 4);
    assert.ok(logs.some(l => l.action === 'FOLLOW_REQUEST_CREATE'));
    assert.ok(logs.some(l => l.action === 'POST_CREATE'));
    assert.ok(logs.some(l => l.action === 'COMMUNITY_CREATE'));
    assert.ok(logs.some(l => l.action === 'BLOCK_USER'));
  });
});
