// Explore Bharat Safar — Social Profile Service Unit Tests
// Reference: EBS-DOC-15-SOCIAL Section 2

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AdventureGrade, BadgeType } from '@ebs/types';
import { SocialProfileService } from './social-profile.service';

describe('SocialProfileService', () => {
  let service: SocialProfileService;

  beforeEach(() => {
    service = new SocialProfileService();
  });

  it('should retrieve existing seeded public profile by username', async () => {
    const profile = await service.getProfileByUsername('amitabh_sharma');
    assert.equal(profile.username, 'amitabh_sharma');
    assert.equal(profile.displayName, 'Amitabh Sharma');
    assert.equal(profile.isProfilePublic, true);
    assert.ok(profile.badges.includes(BadgeType.SOVEREIGN_EXPLORER));
  });

  it('should mask private account details when accessed by non-owner', async () => {
    // pooja_deshmukh is seeded as private (isProfilePublic: false)
    const masked = await service.getProfileByUsername('pooja_deshmukh', 'prof_amitabh_001');
    assert.equal(masked.username, 'pooja_deshmukh');
    assert.equal(masked.bio, 'This account is private. Follow to view their journeys.');
    assert.equal(masked.coverImageUrl, undefined);
    assert.equal(masked.homeCity, undefined);
  });

  it('should not mask private account details when accessed by the owner', async () => {
    const unmasked = await service.getProfileByUsername('pooja_deshmukh', 'prof_pooja_002');
    assert.equal(unmasked.username, 'pooja_deshmukh');
    assert.ok(unmasked.bio?.includes('Heritage architecture enthusiast'));
    assert.ok(unmasked.coverImageUrl !== undefined);
  });

  it('should provision new profile for authenticated user on first visit', async () => {
    const newProfile = await service.getOrCreateProfileForUser(
      'usr_new_999',
      'kailash_rathore',
      'Kailash Rathore',
    );
    assert.equal(newProfile.userId, 'usr_new_999');
    assert.equal(newProfile.username, 'kailash_rathore');
    assert.equal(newProfile.displayName, 'Kailash Rathore');
    assert.equal(newProfile.isProfilePublic, true);
  });

  it('should update profile settings and recalculate badges', async () => {
    const updated = await service.updateProfile('prof_amitabh_001', {
      displayName: 'Amitabh Sharma - Mountain Guide',
      bio: 'Certified wilderness first-responder and high-altitude leader.',
      homeCity: 'Nashik',
      isSoloDiscoveryEnabled: false,
    });

    assert.equal(updated.displayName, 'Amitabh Sharma - Mountain Guide');
    assert.equal(updated.homeCity, 'Nashik');
    assert.equal(updated.isSoloDiscoveryEnabled, false);
  });

  it('should search profiles by username and display name substring', async () => {
    const results = await service.searchProfiles('amitabh');
    assert.equal(results.total, 1);
    assert.equal(results.items[0].username, 'amitabh_sharma');

    const noMatch = await service.searchProfiles('nonexistent_user_999');
    assert.equal(noMatch.total, 0);
  });

  it('should dynamically derive adventure grades according to elevation and expeditions', () => {
    const rookieGrade = service.calculateAdventureGrade({
      completedExpeditionsCount: 1,
      totalElevationMeters: 500,
    });
    assert.equal(rookieGrade, AdventureGrade.ROOKIE);

    const leaderGrade = service.calculateAdventureGrade({
      completedExpeditionsCount: 25,
      totalElevationMeters: 18000,
    });
    assert.equal(leaderGrade, AdventureGrade.EXPEDITION_LEADER);
  });
});
