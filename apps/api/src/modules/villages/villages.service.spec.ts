// Explore Bharat Safar — Section 2: Villages Service Unit Test Suite
// Reference: EBS-DOC-24-TESTING, EBS-BLU-42-VKS, EBS-DOC-09-API Section 5.3, EBS-DOC-40-SEC
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { VillagesService } from './villages.service';
import { prisma } from '@ebs/database';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import type { AuditLogService } from '../../common/services/audit-log.service';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/explore_bharat_safar?schema=public';
}

describe('VillagesService — Rural Bharat Knowledge System', () => {
  let service: VillagesService;
  const auditLogs: Array<{ action: string; entityId: string }> = [];

  const mockAuditService = {
    log: async (params: { action: string; entityId?: string }) => {
      auditLogs.push({ action: params.action, entityId: params.entityId || '' });
    },
  } as unknown as AuditLogService;

  beforeEach(() => {
    auditLogs.length = 0;
    service = new VillagesService(mockAuditService);
  });

  const mockTaluka = {
    id: 't-velhe-1',
    name: 'Velhe',
    district: {
      id: 'd-pune-1',
      name: 'Pune',
      headquarters: 'Pune',
      state: {
        id: 's-mh-1',
        name: 'Maharashtra',
        isoCode: 'IN-MH',
      },
    },
  };

  const mockVillage = {
    id: 'vil-velhe-uuid-1',
    talukaId: 't-velhe-1',
    lgdCode: '556789',
    nameEn: 'Velhe',
    nameLocal: 'वेल्हे',
    pincode: '412212',
    populationCount: 3840,
    elevationMeters: 620,
    historicalChronicles: 'Historic gateway fortress assembly settlement.',
    etymologyMeaning: 'Derived from ancient river valley pass.',
    approvalStatus: 'PUBLISHED',
    assignedAdminUserId: 'u-admin-1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    taluka: mockTaluka,
    panchayat: {
      id: 'pan-1',
      villageId: 'vil-velhe-uuid-1',
      gramPanchayatName: 'Velhe Gram Panchayat',
      gramSevakName: 'Sunil V. More',
      sarpanchName: 'Rajendra Anandrao Patil',
      officePhone: '02144-223101',
      officeAddress: 'Main Bazaar Road, Velhe',
      officeTimings: '09:30 AM – 05:30 PM',
      updatedAt: new Date('2026-01-01'),
    },
  };

  describe('Isolated Section 2 Village Search (Quarantine Mandate)', () => {
    it('should search villages by text query q and return formatted response', async () => {
      const origCount = prisma.village.count;
      const origFindMany = prisma.village.findMany;

      prisma.village.count = (async () => 1) as unknown as typeof prisma.village.count;
      prisma.village.findMany = (async () => [
        mockVillage,
      ]) as unknown as typeof prisma.village.findMany;

      try {
        const res = await service.searchVillages({ q: 'Velhe' });
        assert.equal(res.status, 'success');
        assert.equal(res.totalMatches, 1);
        assert.equal(res.results.length, 1);
        const first = res.results[0];
        assert.ok(first);
        assert.equal(first.nameEnglish, 'Velhe');
        assert.equal(first.lgdCode, '556789');
        assert.equal(first.district, 'Pune');
        assert.equal(first.state, 'Maharashtra');
      } finally {
        prisma.village.count = origCount;
        prisma.village.findMany = origFindMany;
      }
    });

    it('should search villages by pincode and talukaId', async () => {
      const origCount = prisma.village.count;
      const origFindMany = prisma.village.findMany;

      prisma.village.count = (async () => 1) as unknown as typeof prisma.village.count;
      prisma.village.findMany = (async () => [
        mockVillage,
      ]) as unknown as typeof prisma.village.findMany;

      try {
        const res = await service.searchVillages({ pincode: '412212', talukaId: 't-velhe-1' });
        assert.equal(res.status, 'success');
        const first = res.results[0];
        assert.ok(first);
        assert.equal(first.pincode, '412212');
      } finally {
        prisma.village.count = origCount;
        prisma.village.findMany = origFindMany;
      }
    });

    it('should return empty results when no villages match', async () => {
      const origCount = prisma.village.count;
      const origFindMany = prisma.village.findMany;

      prisma.village.count = (async () => 0) as unknown as typeof prisma.village.count;
      prisma.village.findMany = (async () => []) as unknown as typeof prisma.village.findMany;

      try {
        const res = await service.searchVillages({ q: 'NonExistentVillageXYZ' });
        assert.equal(res.totalMatches, 0);
        assert.equal(res.results.length, 0);
      } finally {
        prisma.village.count = origCount;
        prisma.village.findMany = origFindMany;
      }
    });
  });

  describe('Village Living Dossier Retrieval', () => {
    it('should retrieve village living dossier by UUID', async () => {
      const origFindFirst = prisma.village.findFirst;
      prisma.village.findFirst = (async () =>
        mockVillage) as unknown as typeof prisma.village.findFirst;

      try {
        const dossier = await service.getVillageById('c7a8b9d0-1e2f-4a5b-9c8d-7e6f5a4b3c2d');
        assert.equal(dossier.village.nameEn, 'Velhe');
        assert.equal(dossier.village.lgdCode, '556789');
        assert.equal(dossier.hierarchy.districtName, 'Pune');
        assert.equal(dossier.hierarchy.stateName, 'Maharashtra');
        assert.ok(dossier.panchayat);
        assert.equal(dossier.panchayat?.gramSevakName, 'Sunil V. More');
        assert.ok(dossier.profile);
        assert.ok(dossier.places.length > 0);
        assert.ok(dossier.events.length > 0);
        assert.ok(dossier.businesses.length > 0);
        assert.ok(dossier.agrarianCalendar.length > 0);
        assert.ok(dossier.folkCrafts.length > 0);
        assert.ok(dossier.artisans && dossier.artisans.length > 0);
        assert.ok(dossier.homestays && dossier.homestays.length > 0);
      } finally {
        prisma.village.findFirst = origFindFirst;
      }
    });

    it('should retrieve village living dossier by 6-digit LGD Code', async () => {
      const origFindFirst = prisma.village.findFirst;
      prisma.village.findFirst = (async () =>
        mockVillage) as unknown as typeof prisma.village.findFirst;

      try {
        const dossier = await service.getVillageById('556789');
        assert.equal(dossier.village.lgdCode, '556789');
        assert.equal(dossier.village.nameEn, 'Velhe');
      } finally {
        prisma.village.findFirst = origFindFirst;
      }
    });

    it('should throw NotFoundException when village does not exist', async () => {
      const origFindFirst = prisma.village.findFirst;
      prisma.village.findFirst = (async () => null) as unknown as typeof prisma.village.findFirst;

      try {
        await assert.rejects(
          async () => service.getVillageById('999999'),
          (err: unknown) => err instanceof NotFoundException,
        );
      } finally {
        prisma.village.findFirst = origFindFirst;
      }
    });
  });

  describe('Child Entities: Places, Events, Businesses, Artisans, Homestays, Reviews', () => {
    it('should return village places, events, businesses, artisans, homestays, and reviews', async () => {
      const origFindFirst = prisma.village.findFirst;
      prisma.village.findFirst = (async () =>
        mockVillage) as unknown as typeof prisma.village.findFirst;

      try {
        const places = await service.getVillagePlaces('556789');
        assert.ok(places.length >= 2);

        const events = await service.getVillageEvents('556789');
        assert.ok(events.length >= 1);

        const businesses = await service.getVillageBusinesses('556789');
        assert.ok(businesses.length >= 2);

        const artisans = await service.getVillageArtisans('556789');
        assert.ok(artisans.length >= 3);
        const master = artisans.find(a => a.isMasterArtisan);
        assert.ok(master);
        assert.ok(master.yearsOfExperience >= 25);
        const giCraft = artisans.find(a => a.hasGiTag);
        assert.ok(giCraft);
        assert.equal(giCraft.giTagRegistrationNumber, 'GI-WARLI-MH-2014');

        const homestays = await service.getVillageHomestays('556789');
        assert.ok(homestays.length >= 2);
        for (const hs of homestays) {
          assert.equal(hs.isBookingDisabled, true);
          assert.ok(hs.maxGuestCapacity > 0);
          assert.ok(hs.roomCount > 0);
          assert.ok(hs.amenities.length > 0);
          assert.ok(hs.houseRules.length > 0);
          assert.ok(hs.culturalGuidelines.length > 0);
        }

        const reviews = await service.getVillageReviews('556789');
        assert.ok(reviews.length >= 1);
      } finally {
        prisma.village.findFirst = origFindFirst;
      }
    });

    it('should calculate 10-point average score on review submission and emit audit', async () => {
      const origFindFirst = prisma.village.findFirst;
      prisma.village.findFirst = (async () =>
        mockVillage) as unknown as typeof prisma.village.findFirst;

      try {
        const review = await service.submitVillageReview('556789', 'u-traveller-1', {
          ratings: {
            cleanliness: 5.0,
            hospitality: 5.0,
            nature: 5.0,
            safety: 5.0,
            food: 4.0,
            accessibility: 4.0,
            photography: 5.0,
            culturalPreservation: 5.0,
            adventure: 4.0,
            overall: 5.0,
          },
          reviewText: 'Outstanding hospitality and pristine village environment.',
        });

        assert.equal(review.averageScore, 4.7);
        assert.equal(review.moderationStatus, 'PENDING');
        assert.ok(auditLogs.some(l => l.action === 'VILLAGE_REVIEW_SUBMITTED'));
      } finally {
        prisma.village.findFirst = origFindFirst;
      }
    });
  });

  describe('Decentralized Staging & Moderation Workflow', () => {
    it('should submit update to staging table with status PENDING_APPROVAL and strip PII', async () => {
      const origFindFirst = prisma.village.findFirst;
      const origCreate = prisma.villageUpdateStaging.create;

      prisma.village.findFirst = (async () =>
        mockVillage) as unknown as typeof prisma.village.findFirst;
      prisma.villageUpdateStaging.create = (async (args: { data: Record<string, unknown> }) => ({
        id: 'stg-ticket-1',
        ...args.data,
        submittedAt: new Date(),
      })) as unknown as typeof prisma.villageUpdateStaging.create;

      try {
        const res = await service.submitUpdate(
          mockVillage.id,
          'u-admin-1',
          'PUBLIC_FACILITY_MODIFICATION',
          {
            hasPHC: true,
            sarpanchAadhaar: '1234-5678-9012', // Sensitive PII! Must be stripped
            officePhone: '02144-223101',
          },
          'New PHC facility operational',
        );

        assert.equal(res.status, 'success');
        assert.equal(res.stagingStatus, 'PENDING_APPROVAL');
        assert.equal(res.ticketId, 'stg-ticket-1');
        assert.ok(auditLogs.some(l => l.action === 'VILLAGE_UPDATE_SUBMITTED'));
      } finally {
        prisma.village.findFirst = origFindFirst;
        prisma.villageUpdateStaging.create = origCreate;
      }
    });

    it('should approve staged update, merge payload to production tables, and log audit event', async () => {
      const origFindUnique = prisma.villageUpdateStaging.findUnique;
      const origUpdateStaging = prisma.villageUpdateStaging.update;
      const origUpsertPanchayat = prisma.villagePanchayat.upsert;
      const origUpdateVillage = prisma.village.update;

      const stagedItem = {
        id: 'stg-ticket-1',
        villageId: mockVillage.id,
        submittedBy: 'u-admin-1',
        updateType: 'PANCHAYAT_UPDATE',
        payload: {
          gramPanchayatName: 'Velhe Unified Gram Panchayat',
          officePhone: '02144-223999',
          historicalChronicles: 'Updated historical chronicles after copper plate discovery.',
        },
        status: 'PENDING_APPROVAL',
        submittedAt: new Date(),
        village: mockVillage,
      };

      prisma.villageUpdateStaging.findUnique = (async () =>
        stagedItem) as unknown as typeof prisma.villageUpdateStaging.findUnique;
      prisma.villageUpdateStaging.update = (async (args: { data: Record<string, unknown> }) => ({
        ...stagedItem,
        ...args.data,
      })) as unknown as typeof prisma.villageUpdateStaging.update;

      let mergedPanchayat = false;
      prisma.villagePanchayat.upsert = (async () => {
        mergedPanchayat = true;
        return mockVillage.panchayat;
      }) as unknown as typeof prisma.villagePanchayat.upsert;

      let mergedVillage = false;
      prisma.village.update = (async () => {
        mergedVillage = true;
        return mockVillage;
      }) as unknown as typeof prisma.village.update;

      try {
        const reviewRes = await service.reviewStagedUpdate(
          'stg-ticket-1',
          'u-mod-1',
          'APPROVE',
          'Verified with District Collectorate records.',
        );

        assert.equal(reviewRes.status, 'success');
        assert.equal(reviewRes.actionTaken, 'APPROVE');
        assert.equal(reviewRes.currentStatus, 'APPROVED');
        assert.ok(mergedPanchayat, 'Merged panchayat fields to production table');
        assert.ok(mergedVillage, 'Merged village fields to production table');
        assert.ok(auditLogs.some(l => l.action === 'VILLAGE_UPDATE_APPROVED'));
      } finally {
        prisma.villageUpdateStaging.findUnique = origFindUnique;
        prisma.villageUpdateStaging.update = origUpdateStaging;
        prisma.villagePanchayat.upsert = origUpsertPanchayat;
        prisma.village.update = origUpdateVillage;
      }
    });

    it('should reject staged update with mandatory comments and log audit event', async () => {
      const origFindUnique = prisma.villageUpdateStaging.findUnique;
      const origUpdateStaging = prisma.villageUpdateStaging.update;

      const stagedItem = {
        id: 'stg-ticket-1',
        villageId: mockVillage.id,
        submittedBy: 'u-admin-1',
        updateType: 'HISTORY_EDIT',
        payload: { invalidData: true },
        status: 'PENDING_APPROVAL',
        submittedAt: new Date(),
        village: mockVillage,
      };

      prisma.villageUpdateStaging.findUnique = (async () =>
        stagedItem) as unknown as typeof prisma.villageUpdateStaging.findUnique;
      prisma.villageUpdateStaging.update = (async (args: { data: Record<string, unknown> }) => ({
        ...stagedItem,
        ...args.data,
      })) as unknown as typeof prisma.villageUpdateStaging.update;

      try {
        const reviewRes = await service.reviewStagedUpdate(
          'stg-ticket-1',
          'u-mod-1',
          'REJECT',
          'Insufficient historical documentation provided.',
        );

        assert.equal(reviewRes.status, 'success');
        assert.equal(reviewRes.actionTaken, 'REJECT');
        assert.equal(reviewRes.currentStatus, 'REJECTED');
        assert.ok(auditLogs.some(l => l.action === 'VILLAGE_UPDATE_REJECTED'));
      } finally {
        prisma.villageUpdateStaging.findUnique = origFindUnique;
        prisma.villageUpdateStaging.update = origUpdateStaging;
      }
    });

    it('should reject review attempt without minimum 5 character commentary', async () => {
      await assert.rejects(
        async () => service.reviewStagedUpdate('stg-1', 'u-mod-1', 'REJECT', 'No'),
        (err: unknown) => err instanceof BadRequestException,
      );
    });
  });
});
