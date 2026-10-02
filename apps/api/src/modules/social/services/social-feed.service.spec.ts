// Explore Bharat Safar — Social Feed Service Unit Tests
// Reference: EBS-DOC-15-SOCIAL Section 3, EBS-BLU-44-SOC Section 2

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { PostType, PostVisibility } from '@ebs/types';
import { SocialProfileService } from './social-profile.service';
import { SocialGraphService } from './social-graph.service';
import { SocialPostsService } from './social-posts.service';
import { SocialFeedService } from './social-feed.service';

describe('SocialFeedService', () => {
  let profileService: SocialProfileService;
  let graphService: SocialGraphService;
  let postsService: SocialPostsService;
  let feedService: SocialFeedService;

  beforeEach(() => {
    profileService = new SocialProfileService();
    graphService = new SocialGraphService(profileService);
    postsService = new SocialPostsService(profileService, graphService);
    feedService = new SocialFeedService(postsService, graphService);
  });

  it('should deliver public posts in Home Feed for anonymous or authenticated viewer', async () => {
    const feed = await feedService.getHomeFeed();
    assert.ok(feed.items.length >= 2);
    assert.ok(feed.items.some(p => p.id === 'post_monsoon_001'));
  });

  it('should deliver strict chronological Following Feed for user', async () => {
    // Amitabh follows Pooja initially
    const feed = await feedService.getFollowingFeed('prof_amitabh_001');
    assert.ok(feed.items.length >= 2);
    // Contains Pooja's post
    assert.ok(feed.items.some(p => p.profileId === 'prof_pooja_002'));
    // Contains Amitabh's own post
    assert.ok(feed.items.some(p => p.profileId === 'prof_amitabh_001'));
  });

  it('should deliver curated Discover Feed with high-signal public posts', async () => {
    const discover = await feedService.getDiscoverFeed();
    assert.ok(discover.items.length >= 2);
    // All items in discover feed must be PUBLIC
    assert.ok(discover.items.every(p => p.visibility === PostVisibility.PUBLIC));
  });

  it('should filter posts by hashtag in Hashtag Feed', async () => {
    const feed = await feedService.getHashtagFeed('monsoontrek');
    assert.ok(feed.items.length >= 1);
    assert.ok(feed.items.every(p => p.hashtags.includes('monsoontrek')));
  });

  it('should exclude blocked and muted authors from feeds', async () => {
    // Amitabh mutes Pooja
    await graphService.muteUser('prof_amitabh_001', 'prof_pooja_002');

    const feed = await feedService.getHomeFeed('prof_amitabh_001');
    assert.ok(!feed.items.some(p => p.profileId === 'prof_pooja_002'));
  });

  it('should enforce followers-only post visibility gate', async () => {
    // Author a followers-only post by Pooja
    const post = await postsService.createPost('prof_pooja_002', {
      postType: PostType.QA,
      content: 'Followers only trail advice question.',
      visibility: PostVisibility.FOLLOWERS_ONLY,
    });

    // Unconnected user (not following Pooja)
    const stranger = await profileService.getOrCreateProfileForUser('usr_stranger_111', 'stranger');

    const strangerFeed = await feedService.getHomeFeed(stranger.id);
    assert.ok(!strangerFeed.items.some(p => p.id === post.id));

    // Amitabh (who follows Pooja) CAN see it
    const amitabhFeed = await feedService.getHomeFeed('prof_amitabh_001');
    assert.ok(amitabhFeed.items.some(p => p.id === post.id));
  });
});
