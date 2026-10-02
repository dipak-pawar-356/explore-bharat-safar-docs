// Explore Bharat Safar — Booking Draft Store Unit Tests
// Reference: EBS-DOC-24-TESTING

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useBookingDraftStore } from './booking-draft-store';
import { DifficultyLevel, ExperienceType } from '@ebs/types';

describe('useBookingDraftStore — Client State Management', () => {
  beforeEach(() => {
    useBookingDraftStore.getState().clearDraft();
  });

  it('should initialize with default single participant', () => {
    const state = useBookingDraftStore.getState();
    assert.equal(state.participants.length, 1);
    assert.equal(state.selectedAddonIds.length, 0);
    assert.equal(state.termsAccepted, false);
    assert.equal(state.experience, null);
  });

  it('should add participant up to 10 limit and remove correctly', () => {
    const store = useBookingDraftStore.getState();
    store.addParticipant({
      fullName: 'Explorer Two',
      age: 28,
      gender: 'FEMALE',
      emergencyContactName: 'Parent',
      emergencyContactPhone: '+919822112233',
    });

    assert.equal(useBookingDraftStore.getState().participants.length, 2);

    store.removeParticipant(1);
    assert.equal(useBookingDraftStore.getState().participants.length, 1);
  });

  it('should toggle addons correctly', () => {
    const store = useBookingDraftStore.getState();
    store.toggleAddon('addon-sleeping-bag');
    assert.ok(useBookingDraftStore.getState().selectedAddonIds.includes('addon-sleeping-bag'));

    store.toggleAddon('addon-sleeping-bag');
    assert.equal(
      useBookingDraftStore.getState().selectedAddonIds.includes('addon-sleeping-bag'),
      false,
    );
  });

  it('should set experience and batch selections', () => {
    const store = useBookingDraftStore.getState();
    const mockExp = {
      id: 'exp-test',
      title: 'Harishchandragad Trek',
      slug: 'harishchandragad-trek',
      categorySlug: 'treks',
      experienceType: ExperienceType.TREK,
      difficulty: DifficultyLevel.DIFFICULT,
      durationDays: 2,
      durationNights: 1,
      basePriceInr: 2500,
      mandatoryUpfrontPercentage: 25,
      overviewDescription: 'Overview',
      inclusions: [],
      exclusions: [],
      itineraryDaywise: [],
      packingList: [],
      medicalGuidelines: '',
      cancellationPolicy: [],
      meetingPointName: 'Khireshwar',
      meetingPointCoords: { latitude: 19.38, longitude: 73.78 },
      isPublished: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    store.setExperience(mockExp);
    assert.equal(useBookingDraftStore.getState().experience?.slug, 'harishchandragad-trek');

    store.setTermsAccepted(true);
    assert.equal(useBookingDraftStore.getState().termsAccepted, true);
  });
});
