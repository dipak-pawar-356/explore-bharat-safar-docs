// Explore Bharat Safar — Social Graph Service Unit Tests
// Reference: EBS-DOC-15-SOCIAL Section 6

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SocialProfileService } from './social-profile.service';
import { SocialGraphService } from './social-graph.service';

describe('SocialGraphService', () => {
  let profileService: SocialProfileService;
  let graphService: SocialGraphService;

  beforeEach(() => {
    profileService = new SocialProfileService();
    graphService = new SocialGraphService(profileService);
  });

  it('should allow following a public profile directly and increment counters', async () => {
    // Pooja follows Amitabh (Amitabh is public)
    const result = await graphService.follow('prof_pooja_002', 'prof_amitabh_001');
    assert.equal(result.status, 'FOLLOWING');

    const relation = await graphService.getRelationship('prof_pooja_002', 'prof_amitabh_001');
    assert.equal(relation.isFollowing, true);

    const amitabh = await profileService.getProfileById('prof_amitabh_001');
    assert.equal(amitabh.followersCount, 143); // Initially 142 + 1
  });

  it('should create follow request when attempting to follow a private profile', async () => {
    // Create new third user
    const newUser = await profileService.getOrCreateProfileForUser('usr_new_003', 'vikram_rathore');

    // Vikram follows Pooja (Pooja is private)
    const result = await graphService.follow(newUser.id, 'prof_pooja_002');
    assert.equal(result.status, 'REQUEST_SENT');

    const pendingRequests = await graphService.getFollowRequests('prof_pooja_002');
    assert.equal(pendingRequests.length, 1);
    assert.equal(pendingRequests[0].requesterId, newUser.id);

    // Accept request
    await graphService.acceptFollowRequest('prof_pooja_002', pendingRequests[0].id);

    const relationAfter = await graphService.getRelationship(newUser.id, 'prof_pooja_002');
    assert.equal(relationAfter.isFollowing, true);
  });

  it('should reject follow request without adding follower connection', async () => {
    const newUser = await profileService.getOrCreateProfileForUser('usr_new_004', 'raj_malhotra');
    await graphService.follow(newUser.id, 'prof_pooja_002');

    const pending = await graphService.getFollowRequests('prof_pooja_002');
    assert.equal(pending.length, 1);

    await graphService.rejectFollowRequest('prof_pooja_002', pending[0].id);

    const relation = await graphService.getRelationship(newUser.id, 'prof_pooja_002');
    assert.equal(relation.isFollowing, false);
    assert.equal(relation.isPendingFollowRequest, false);
  });

  it('should block a user and sever bidirectional follow relationships immediately', async () => {
    // Amitabh follows Pooja initially (seeded)
    assert.equal(graphService.isFollowing('prof_amitabh_001', 'prof_pooja_002'), true);

    // Pooja blocks Amitabh
    await graphService.blockUser('prof_pooja_002', 'prof_amitabh_001');

    // Follow connection must be severed
    assert.equal(graphService.isFollowing('prof_amitabh_001', 'prof_pooja_002'), false);

    const relation = await graphService.getRelationship('prof_amitabh_001', 'prof_pooja_002');
    assert.equal(relation.isBlocked, true);
    assert.equal(relation.isFollowing, false);
  });

  it('should mute user and filter in getBlockedAndMutedIds', async () => {
    await graphService.muteUser('prof_amitabh_001', 'prof_pooja_002');

    assert.equal(graphService.isMuted('prof_amitabh_001', 'prof_pooja_002'), true);
    const excluded = graphService.getBlockedAndMutedIds('prof_amitabh_001');
    assert.ok(excluded.has('prof_pooja_002'));

    // Unmute
    await graphService.unmuteUser('prof_amitabh_001', 'prof_pooja_002');
    assert.equal(graphService.isMuted('prof_amitabh_001', 'prof_pooja_002'), false);
  });
});
