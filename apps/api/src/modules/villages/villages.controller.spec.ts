// Explore Bharat Safar — Section 2: Villages Controller Unit Test Suite
// Reference: EBS-DOC-24-TESTING, EBS-DOC-09-API Section 5.3
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { VillagesController } from './villages.controller';
import type { VillagesService } from './villages.service';
import {
  ModerationStatus,
  type VillageLivingDossier,
  type VillageSearchResponse,
} from '@ebs/types';

describe('VillagesController — API Gateway Layer', () => {
  let controller: VillagesController;
  let mockVillagesService: Partial<VillagesService>;

  const mockDossier: Partial<VillageLivingDossier> = {
    village: {
      id: 'vil-1',
      talukaId: 't-1',
      lgdCode: '556789',
      nameEn: 'Velhe',
      nameLocal: 'वेल्हे',
      pincode: '412212',
      centroid: { latitude: 18.2975, longitude: 73.6339 },
      approvalStatus: ModerationStatus.PUBLISHED,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    hierarchy: {
      stateName: 'Maharashtra',
      stateIsoCode: 'IN-MH',
      districtName: 'Pune',
      districtHeadquarters: 'Pune',
      talukaName: 'Velhe',
    },
    places: [],
    events: [],
    businesses: [],
    recentReviews: [],
    agrarianCalendar: [],
    folkCrafts: [],
  };

  beforeEach(() => {
    mockVillagesService = {
      searchVillages: async (dto): Promise<VillageSearchResponse> => ({
        status: 'success',
        query: dto.q || '',
        totalMatches: 1,
        results: [
          {
            id: 'vil-1',
            lgdCode: '556789',
            nameEnglish: 'Velhe',
            nameLocal: 'वेल्हे',
            pincode: '412212',
            taluka: 'Velhe',
            district: 'Pune',
            state: 'Maharashtra',
            population: 3840,
            centroid: { latitude: 18.2975, longitude: 73.6339 },
          },
        ],
      }),
      getVillageById: async () => mockDossier as VillageLivingDossier,
      getVillagePlaces: async () => [],
      getVillageEvents: async () => [],
      getVillageBusinesses: async () => [],
      getVillageArtisans: async () => [],
      getVillageHomestays: async () => [],
      getVillageReviews: async () => [],
      submitVillageReview: async (_id, userId, dto) => ({
        id: 'rev-1',
        villageId: 'vil-1',
        userId,
        ratings: dto.ratings,
        averageScore: 4.8,
        reviewText: dto.reviewText,
        isVerifiedTraveller: true,
        moderationStatus: 'PENDING',
        createdAt: '2026-01-01',
      }),
      submitUpdate: async (_id, _userId, _type, _payload) => ({
        status: 'success',
        ticketId: 'stg-123',
        stagingStatus: 'PENDING_APPROVAL',
        message: 'Staged for moderation',
        submittedAt: '2026-01-01',
      }),
      getModerationQueue: async () => ({
        items: [],
        pagination: { page: 1, limit: 20, totalRecords: 0, totalPages: 0 },
      }),
      reviewStagedUpdate: async (stagingId, _modId, action, comments) => ({
        status: 'success',
        stagingId,
        actionTaken: action,
        currentStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        comments,
        reviewedAt: '2026-01-01',
      }),
    };

    controller = new VillagesController(mockVillagesService as VillagesService);
  });

  it('should delegate searchVillages query to service', async () => {
    const res = await controller.searchVillages('Velhe', undefined, '412212');
    assert.equal(res.status, 'success');
    const first = res.results[0];
    assert.ok(first);
    assert.equal(first.nameEnglish, 'Velhe');
  });

  it('should delegate getVillageById to service', async () => {
    const dossier = await controller.getVillageById('556789');
    assert.equal(dossier.village.nameEn, 'Velhe');
    assert.equal(dossier.village.lgdCode, '556789');
  });

  it('should delegate sub-resource ingress endpoints to service', async () => {
    const places = await controller.getVillagePlaces('vil-1');
    assert.ok(Array.isArray(places));

    const events = await controller.getVillageEvents('vil-1');
    assert.ok(Array.isArray(events));

    const businesses = await controller.getVillageBusinesses('vil-1');
    assert.ok(Array.isArray(businesses));

    const artisans = await controller.getVillageArtisans('vil-1');
    assert.ok(Array.isArray(artisans));

    const homestays = await controller.getVillageHomestays('vil-1');
    assert.ok(Array.isArray(homestays));

    const reviews = await controller.getVillageReviews('vil-1');
    assert.ok(Array.isArray(reviews));
  });

  it('should delegate submitVillageReview to service', async () => {
    const review = await controller.submitVillageReview('vil-1', 'u-traveller', {
      ratings: {
        cleanliness: 5,
        hospitality: 5,
        nature: 5,
        safety: 5,
        food: 4,
        accessibility: 4,
        photography: 5,
        culturalPreservation: 5,
        adventure: 4,
        overall: 5,
      },
      reviewText: 'Spectacular cultural heritage and welcoming community.',
    });

    assert.equal(review.villageId, 'vil-1');
    assert.equal(review.moderationStatus, 'PENDING');
  });

  it('should delegate submitUpdate to service', async () => {
    const res = await controller.submitUpdate('vil-1', 'u-admin-1', {
      updateType: 'PANCHAYAT_UPDATE',
      payload: { gramPanchayatName: 'Velhe Gram Panchayat' },
    });

    assert.equal(res.status, 'success');
    assert.equal(res.ticketId, 'stg-123');
  });

  it('should delegate moderation queue and review endpoints to service', async () => {
    const queue = await controller.getModerationQueue('PENDING_APPROVAL');
    assert.ok(Array.isArray(queue.items));

    const reviewRes = await controller.reviewStagingUpdate('stg-123', 'u-mod-1', {
      action: 'APPROVE',
      comments: 'Verified by district moderator.',
    });
    assert.equal(reviewRes.status, 'success');
    assert.equal(reviewRes.actionTaken, 'APPROVE');

    const patchRes = await controller.patchStagingUpdate('stg-123', 'u-mod-1', {
      action: 'REJECT',
      comments: 'Rejected due to incomplete verification.',
    });
    assert.equal(patchRes.actionTaken, 'REJECT');
  });
});
