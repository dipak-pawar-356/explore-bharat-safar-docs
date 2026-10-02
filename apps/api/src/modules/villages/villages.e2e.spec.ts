// Explore Bharat Safar — Section 2: Village Knowledge System E2E Lifecycle & Security Gates Suite
// Reference: EBS-DOC-52 Section 57 (Journey 2: Cadastral Search -> Heritage Dossier -> Artisan Connect -> Update -> Moderate & Merge)
// Reference: EBS-BLU-42-VKS, EBS-DOC-40-SEC Section 4 & 36
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VillagesService } from './villages.service';
import { prisma } from '@ebs/database';
import { ForbiddenException } from '@nestjs/common';
import { VillageScopeGuard } from '../../common/guards/village-scope.guard';
import { UserRole } from '@ebs/types';
import type { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import type { AuditLogService } from '../../common/services/audit-log.service';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/explore_bharat_safar?schema=public';
}

function createMockContext(
  user: unknown,
  params: Record<string, unknown> = {},
  body: Record<string, unknown> = {},
): ExecutionContext {
  const req = { user, params, body, query: {} };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => ({}),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

interface StoredStagingRecord {
  id: string;
  villageId: string;
  submittedBy: string;
  updateType: string;
  payload: Record<string, unknown>;
  status: string;
  reviewComments: string | null;
  submittedAt: Date;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  village: typeof stateTemplate.village;
}

const stateTemplate = {
  village: {
    id: 'vil-pune-velhe-001',
    talukaId: 'tal-velhe-uuid',
    lgdCode: '556789',
    nameEn: 'Velhe',
    nameLocal: 'वेल्हे',
    pincode: '412212',
    populationCount: 3840,
    elevationMeters: 620,
    historicalChronicles: 'Historic gateway fortress assembly settlement.',
    etymologyMeaning: 'Derived from ancient river valley pass.',
    approvalStatus: 'PUBLISHED',
    assignedAdminUserId: 'user-va-1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    taluka: {
      id: 'tal-velhe-uuid',
      name: 'Velhe',
      district: {
        id: 'dist-pune-uuid',
        name: 'Pune',
        headquarters: 'Pune',
        state: {
          id: 'state-mh-uuid',
          name: 'Maharashtra',
          isoCode: 'IN-MH',
        },
      },
    },
    panchayat: {
      id: 'pan-velhe-001',
      villageId: 'vil-pune-velhe-001',
      gramPanchayatName: 'Velhe Gram Panchayat',
      gramSevakName: 'Sunil V. More',
      sarpanchName: 'Rajendra Anandrao Patil',
      officePhone: '02144-223101',
      officeAddress: 'Main Bazaar Road, Velhe',
      officeTimings: '09:30 AM – 05:30 PM',
      updatedAt: new Date('2026-01-01'),
    },
  },
};

describe('Village Knowledge System E2E Journey & Governance Suite', () => {
  it('should execute full 8-stage Rural Bharat lifecycle with zero-trust multi-tenant isolation', async () => {
    const auditLogs: Array<{ action: string; entityId: string; newValues?: unknown }> = [];
    const mockAuditService = {
      log: async (params: { action: string; entityId?: string; newValues?: unknown }) => {
        auditLogs.push({
          action: params.action,
          entityId: params.entityId || '',
          newValues: params.newValues,
        });
      },
    } as unknown as AuditLogService;

    const villagesService = new VillagesService(mockAuditService);

    const state = {
      village: { ...stateTemplate.village, panchayat: { ...stateTemplate.village.panchayat } },
      stagingUpdates: new Map<string, StoredStagingRecord>(),
    };

    // Mock Prisma hooks for isolated E2E execution
    const origVillageCount = prisma.village.count;
    const origVillageFindMany = prisma.village.findMany;
    const origVillageFindFirst = prisma.village.findFirst;
    const origVillageUpdate = prisma.village.update;
    const origPanchayatUpsert = prisma.villagePanchayat.upsert;
    const origStagingCreate = prisma.villageUpdateStaging.create;
    const origStagingFindUnique = prisma.villageUpdateStaging.findUnique;
    const origStagingFindMany = prisma.villageUpdateStaging.findMany;
    const origStagingCount = prisma.villageUpdateStaging.count;
    const origStagingUpdate = prisma.villageUpdateStaging.update;

    prisma.village.count = (async () => 1) as unknown as typeof prisma.village.count;
    prisma.village.findMany = (async () => [
      state.village,
    ]) as unknown as typeof prisma.village.findMany;
    prisma.village.findFirst = (async (args: {
      where?: { OR?: Array<{ id?: string; lgdCode?: string }>; id?: string; lgdCode?: string };
    }) => {
      if (!args?.where) return state.village;
      const orList = args.where.OR || [args.where];
      const match = orList.some(
        c =>
          (c.id && c.id === state.village.id) || (c.lgdCode && c.lgdCode === state.village.lgdCode),
      );
      return match ? state.village : null;
    }) as unknown as typeof prisma.village.findFirst;

    prisma.village.update = (async (args: { data: Record<string, unknown> }) => {
      Object.assign(state.village, args.data);
      return state.village;
    }) as unknown as typeof prisma.village.update;

    prisma.villagePanchayat.upsert = (async (args: { update: Record<string, unknown> }) => {
      Object.assign(state.village.panchayat, args.update);
      return state.village.panchayat;
    }) as unknown as typeof prisma.villagePanchayat.upsert;

    prisma.villageUpdateStaging.create = (async (args: {
      data: {
        villageId: string;
        submittedBy: string;
        updateType: string;
        payload: Record<string, unknown>;
        status: string;
        reviewComments?: string | null;
      };
    }) => {
      const record: StoredStagingRecord = {
        id: `stg-${state.stagingUpdates.size + 1}`,
        villageId: args.data.villageId,
        submittedBy: args.data.submittedBy,
        updateType: args.data.updateType,
        payload: args.data.payload,
        status: args.data.status,
        reviewComments: args.data.reviewComments ?? null,
        submittedAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
        village: state.village,
      };
      state.stagingUpdates.set(record.id, record);
      return record;
    }) as unknown as typeof prisma.villageUpdateStaging.create;

    prisma.villageUpdateStaging.findUnique = (async (args: { where: { id: string } }) => {
      const record = state.stagingUpdates.get(args.where.id);
      return record ? { ...record, village: state.village } : null;
    }) as unknown as typeof prisma.villageUpdateStaging.findUnique;

    prisma.villageUpdateStaging.findMany = (async () => {
      return Array.from(state.stagingUpdates.values()).map(r => ({
        ...r,
        submitter: { id: r.submittedBy, email: 'submitter@bharat.in' },
      }));
    }) as unknown as typeof prisma.villageUpdateStaging.findMany;

    prisma.villageUpdateStaging.count = (async () =>
      state.stagingUpdates.size) as unknown as typeof prisma.villageUpdateStaging.count;

    prisma.villageUpdateStaging.update = (async (args: {
      where: { id: string };
      data: Partial<StoredStagingRecord>;
    }) => {
      const record = state.stagingUpdates.get(args.where.id);
      if (record) {
        Object.assign(record, args.data);
        return record;
      }
      return null;
    }) as unknown as typeof prisma.villageUpdateStaging.update;

    try {
      // -------------------------------------------------------------
      // STAGE 1: Isolated Section 2 Village Search (Quarantine Mandate)
      // -------------------------------------------------------------
      const searchRes = await villagesService.searchVillages({ q: 'Velhe', pincode: '412212' });
      assert.equal(searchRes.status, 'success');
      assert.equal(searchRes.totalMatches, 1);
      const searchFirst = searchRes.results[0];
      assert.ok(searchFirst);
      assert.equal(searchFirst.lgdCode, '556789');
      assert.equal(searchFirst.nameEnglish, 'Velhe');
      assert.equal(searchFirst.district, 'Pune');
      assert.equal(searchFirst.state, 'Maharashtra');

      // -------------------------------------------------------------
      // STAGE 2: Living Dossier & Gram Panchayat Retrieval by LGD Code
      // -------------------------------------------------------------
      const dossier = await villagesService.getVillageById('556789');
      assert.equal(dossier.village.nameEn, 'Velhe');
      assert.equal(dossier.hierarchy.districtName, 'Pune');
      assert.equal(dossier.panchayat?.sarpanchName, 'Rajendra Anandrao Patil');
      assert.equal(dossier.panchayat?.gramSevakName, 'Sunil V. More');
      assert.equal(dossier.profile?.connectivityProfile.roadType, 'PMGSY_PAVED');
      assert.ok(dossier.profile?.healthcareProfile.hasPHC);

      // -------------------------------------------------------------
      // STAGE 3: Connect with Artisans & Homestays (DPDP Masking)
      // -------------------------------------------------------------
      const crafts = dossier.folkCrafts;
      assert.ok(crafts.length >= 2);
      const warliCraft = crafts.find(c => c.craftName.includes('Warli'));
      assert.ok(warliCraft);
      assert.equal(warliCraft?.hasGiTag, true);

      const artisans = await villagesService.getVillageArtisans('556789');
      assert.ok(artisans.length >= 3);
      const masterArtisan = artisans.find(a => a.isMasterArtisan);
      assert.ok(masterArtisan);
      assert.ok(masterArtisan.yearsOfExperience >= 25);
      assert.ok(masterArtisan.contactPhone.includes('Masked'));

      const homestays = await villagesService.getVillageHomestays('556789');
      assert.ok(homestays.length >= 2);
      for (const hs of homestays) {
        assert.equal(hs.isBookingDisabled, true); // Strictly directory view only — NO bookings or payments
        assert.ok(hs.amenities.length > 0);
        assert.ok(hs.houseRules.length > 0);
        assert.ok(hs.culturalGuidelines.length > 0);
        assert.ok(hs.contactPhone.includes('Masked'));
      }

      const businesses = await villagesService.getVillageBusinesses('556789');
      assert.ok(businesses.length >= 2);
      const homestay = businesses.find(b => b.category === 'HOMESTAY');
      assert.ok(homestay);
      assert.ok(
        homestay?.contactPhone.includes('Masked'),
        'DPDP compliance: Phone number is masked',
      );

      // -------------------------------------------------------------
      // STAGE 4: Submitting 10-Point Multidimensional Explorer Review
      // -------------------------------------------------------------
      const review = await villagesService.submitVillageReview('556789', 'u-explorer-1', {
        ratings: {
          cleanliness: 4.8,
          hospitality: 5.0,
          nature: 5.0,
          safety: 5.0,
          food: 4.8,
          accessibility: 4.2,
          photography: 4.9,
          culturalPreservation: 4.8,
          adventure: 4.5,
          overall: 4.8,
        },
        reviewText:
          'Magnificent rural cultural experience with pristine stepwells and warm community reception.',
      });
      assert.equal(review.averageScore, 4.78);
      assert.equal(review.moderationStatus, 'PENDING');
      assert.ok(auditLogs.some(l => l.action === 'VILLAGE_REVIEW_SUBMITTED'));

      // -------------------------------------------------------------
      // STAGE 5: Multi-Tenant VillageScopeGuard Tenancy Isolation
      // -------------------------------------------------------------
      const mockReflector = {
        getAllAndOverride: () => 'id',
      } as unknown as Reflector;
      const guard = new VillageScopeGuard(mockReflector);

      // 5a: Village Admin for Velhe accessing Velhe -> Permitted
      const validAdminCtx = createMockContext(
        {
          id: 'user-va-1',
          roles: [UserRole.VILLAGE_ADMIN],
          assignedVillageId: 'vil-pune-velhe-001',
        },
        { id: 'vil-pune-velhe-001' },
      );
      assert.equal(guard.canActivate(validAdminCtx), true);

      // 5b: Village Admin for Velhe attempting to mutate another village -> 403 Forbidden!
      const foreignVillageCtx = createMockContext(
        {
          id: 'user-va-1',
          roles: [UserRole.VILLAGE_ADMIN],
          assignedVillageId: 'vil-pune-velhe-001',
        },
        { id: 'vil-meghalaya-mawlynnong-999' },
      );
      assert.throws(() => guard.canActivate(foreignVillageCtx), ForbiddenException);

      // 5c: Super Admin mutating any village -> Permitted
      const superAdminCtx = createMockContext(
        {
          id: 'user-sa-1',
          roles: [UserRole.SUPER_ADMIN],
        },
        { id: 'vil-meghalaya-mawlynnong-999' },
      );
      assert.equal(guard.canActivate(superAdminCtx), true);

      // -------------------------------------------------------------
      // STAGE 6: Staging Queue Submission with DPDP PII Stripping
      // -------------------------------------------------------------
      const stageRes = await villagesService.submitUpdate(
        state.village.id,
        'user-va-1',
        'PANCHAYAT_UPDATE',
        {
          gramPanchayatName: 'Velhe Model Gram Panchayat',
          officePhone: '02144-223999',
          sarpanchAadhaar: '9999-8888-7777', // Sensitive PII! Must be stripped
          personalMobile: '+919876543210', // Sensitive PII! Must be stripped
          historicalChronicles: 'Updated chronicles following inscription verification.',
        },
        'Verified in Gram Sabha meeting resolutions.',
      );

      assert.equal(stageRes.status, 'success');
      assert.equal(stageRes.stagingStatus, 'PENDING_APPROVAL');
      assert.ok(stageRes.ticketId);

      // Verify PII was stripped from staged payload
      const stagedPayload = state.stagingUpdates.get(stageRes.ticketId)?.payload;
      assert.equal(stagedPayload?.gramPanchayatName, 'Velhe Model Gram Panchayat');
      assert.equal(stagedPayload?.sarpanchAadhaar, undefined);
      assert.equal(stagedPayload?.personalMobile, undefined);

      // -------------------------------------------------------------
      // STAGE 7: Moderator Review, Approval & Production Table Merge
      // -------------------------------------------------------------
      const queue = await villagesService.getModerationQueue('PENDING_APPROVAL');
      assert.equal(queue.items.length, 1);
      const firstQueueItem = queue.items[0];
      assert.ok(firstQueueItem);
      assert.equal(firstQueueItem.id, stageRes.ticketId);

      const reviewRes = await villagesService.reviewStagedUpdate(
        stageRes.ticketId,
        'user-mod-1',
        'APPROVE',
        'Approved after site verification and Gram Sevak signature.',
      );

      assert.equal(reviewRes.status, 'success');
      assert.equal(reviewRes.actionTaken, 'APPROVE');
      assert.equal(reviewRes.currentStatus, 'APPROVED');

      // Verify production table was updated!
      assert.equal(state.village.panchayat.gramPanchayatName, 'Velhe Model Gram Panchayat');
      assert.equal(state.village.panchayat.officePhone, '02144-223999');
      assert.equal(
        state.village.historicalChronicles,
        'Updated chronicles following inscription verification.',
      );

      // Verify audit log appended
      assert.ok(auditLogs.some(l => l.action === 'VILLAGE_UPDATE_APPROVED'));

      // -------------------------------------------------------------
      // STAGE 8: Rejection Governance Workflow
      // -------------------------------------------------------------
      const rejectStaging = await villagesService.submitUpdate(
        state.village.id,
        'user-va-1',
        'HISTORY_EDIT',
        { invalidClaim: 'Unverified myth' },
        'Draft submission',
      );

      const rejectRes = await villagesService.reviewStagedUpdate(
        rejectStaging.ticketId,
        'user-mod-1',
        'REJECT',
        'Lacks historical citations from Gazetteer or archaeological records.',
      );

      assert.equal(rejectRes.actionTaken, 'REJECT');
      assert.equal(rejectRes.currentStatus, 'REJECTED');
      assert.ok(auditLogs.some(l => l.action === 'VILLAGE_UPDATE_REJECTED'));
    } finally {
      prisma.village.count = origVillageCount;
      prisma.village.findMany = origVillageFindMany;
      prisma.village.findFirst = origVillageFindFirst;
      prisma.village.update = origVillageUpdate;
      prisma.villagePanchayat.upsert = origPanchayatUpsert;
      prisma.villageUpdateStaging.create = origStagingCreate;
      prisma.villageUpdateStaging.findUnique = origStagingFindUnique;
      prisma.villageUpdateStaging.findMany = origStagingFindMany;
      prisma.villageUpdateStaging.count = origStagingCount;
      prisma.villageUpdateStaging.update = origStagingUpdate;
    }
  });
});
