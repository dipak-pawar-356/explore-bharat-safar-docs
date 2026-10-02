// Explore Bharat Safar — Social Community Service Unit Tests
// Reference: EBS-DOC-15-SOCIAL Section 5.2, EBS-BLU-44-SOC Section 9

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CommunityRole } from '@ebs/types';
import { SocialProfileService } from './social-profile.service';
import { SocialGraphService } from './social-graph.service';
import { SocialPostsService } from './social-posts.service';
import { SocialCommunityService } from './social-community.service';

describe('SocialCommunityService', () => {
  let profileService: SocialProfileService;
  let graphService: SocialGraphService;
  let postsService: SocialPostsService;
  let communityService: SocialCommunityService;

  beforeEach(() => {
    profileService = new SocialProfileService();
    graphService = new SocialGraphService(profileService);
    postsService = new SocialPostsService(profileService, graphService);
    communityService = new SocialCommunityService(postsService);
  });

  it('should retrieve seeded communities', async () => {
    const list = await communityService.getCommunities();
    assert.ok(list.length >= 2);
    assert.ok(list.some(c => c.slug === 'western-ghats-monsoon-trekkers'));
  });

  it('should create new community and appoint creator as LEADER', async () => {
    const comm = await communityService.createCommunity('prof_pooja_002', {
      slug: 'himalayan-high-pass-explorers',
      title: 'Himalayan High Pass Explorers Guild',
      description:
        'Expeditions navigating challenging Himalayan cols, passes, and high-altitude glacial moraines.',
      rulesText: 'Safety first, acclimatization discipline mandatory, leave-no-trace ethic.',
    });

    assert.equal(comm.slug, 'himalayan-high-pass-explorers');
    assert.equal(comm.userRole, CommunityRole.LEADER);
    assert.equal(comm.memberCount, 1);
  });

  it('should allow user to join and leave community with member count updates', async () => {
    const slug = 'western-ghats-monsoon-trekkers';
    const initial = await communityService.getCommunityBySlug(slug);
    const initialCount = initial.memberCount;

    // Pooja joins Western Ghats guild
    await communityService.joinCommunity('prof_pooja_002', slug);
    const afterJoin = await communityService.getCommunityBySlug(slug, 'prof_pooja_002');
    assert.equal(afterJoin.memberCount, initialCount + 1);
    assert.equal(afterJoin.userRole, CommunityRole.MEMBER);

    // Pooja leaves guild
    await communityService.leaveCommunity('prof_pooja_002', slug);
    const afterLeave = await communityService.getCommunityBySlug(slug);
    assert.equal(afterLeave.memberCount, initialCount);
  });

  it('should allow community LEADER to promote member to MODERATOR', async () => {
    const slug = 'western-ghats-monsoon-trekkers';
    // Pooja joins
    await communityService.joinCommunity('prof_pooja_002', slug);

    // Amitabh is LEADER, promotes Pooja to MODERATOR
    await communityService.updateMemberRole(
      'prof_amitabh_001',
      slug,
      'prof_pooja_002',
      CommunityRole.MODERATOR,
    );

    const poojaView = await communityService.getCommunityBySlug(slug, 'prof_pooja_002');
    assert.equal(poojaView.userRole, CommunityRole.MODERATOR);
  });

  it('should reject non-leader trying to modify roles', async () => {
    const slug = 'western-ghats-monsoon-trekkers';
    await communityService.joinCommunity('prof_pooja_002', slug);

    await assert.rejects(
      async () => {
        // Pooja is MEMBER, tries to promote herself to LEADER
        await communityService.updateMemberRole(
          'prof_pooja_002',
          slug,
          'prof_pooja_002',
          CommunityRole.LEADER,
        );
      },
      {
        message: 'Only community leaders can modify member roles.',
      },
    );
  });
});
