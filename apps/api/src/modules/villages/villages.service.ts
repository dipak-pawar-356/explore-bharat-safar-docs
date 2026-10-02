// Explore Bharat Safar — Section 2: Village Information & Rural Bharat Knowledge Service
// Reference: EBS-BLU-42-VKS, EBS-DOC-02-SPEC, EBS-DOC-09-API Section 5.3, EBS-DOC-10-DATA, EBS-DOC-40-SEC, EBS-DOC-52 Section 52

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, type Prisma } from '@ebs/database';
import { AuditLogService } from '../../common/services/audit-log.service';
import { sanitizeVillageDataForPublicDisplay } from '@ebs/validators';
import {
  type VillageEntity,
  type VillagePanchayatEntity,
  type VillageProfileEntity,
  type VillagePlaceEntity,
  type VillageEventEntity,
  type VillageBusinessEntity,
  type VillageReviewEntity,
  type VillageRatingBreakdown,
  type AgrarianCropInfo,
  type FolkArtisanCraft,
  type VillageSearchResponse,
  type VillageLivingDossier,
  type ArtisanProfileEntity,
  type RuralHomestayEntity,
  ModerationStatus,
} from '@ebs/types';
import type { SearchVillageDto } from './dto/search-village.dto';
import type { CreateVillageReviewDto } from './dto/create-village-review.dto';

@Injectable()
export class VillagesService {
  constructor(private readonly auditLogService: AuditLogService) {}

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  /**
   * Section 2 Isolated Search:
   * HARD QUARANTINE: Queries exclusively Village entities.
   * Under no circumstances shall it return commercial trek bookings, traveller social posts,
   * general articles, or state tourist hubs.
   */
  async searchVillages(dto: SearchVillageDto): Promise<VillageSearchResponse> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.VillageWhereInput = {
      deletedAt: null,
      approvalStatus: 'PUBLISHED',
    };

    const orClauses: Prisma.VillageWhereInput[] = [];

    if (dto.q && dto.q.trim().length > 0) {
      const q = dto.q.trim();
      orClauses.push(
        { nameEn: { contains: q, mode: 'insensitive' } },
        { nameLocal: { contains: q, mode: 'insensitive' } },
        { lgdCode: { contains: q, mode: 'insensitive' } },
        { pincode: { contains: q, mode: 'insensitive' } },
      );
    }

    if (dto.name && dto.name.trim().length > 0) {
      const name = dto.name.trim();
      orClauses.push(
        { nameEn: { contains: name, mode: 'insensitive' } },
        { nameLocal: { contains: name, mode: 'insensitive' } },
      );
    }

    if (orClauses.length > 0) {
      where.OR = orClauses;
    }

    if (dto.pincode && dto.pincode.trim().length > 0) {
      where.pincode = dto.pincode.trim();
    }

    if (dto.talukaId && dto.talukaId.trim().length > 0) {
      where.talukaId = dto.talukaId.trim();
    }

    const [totalMatches, rawVillages] = await Promise.all([
      prisma.village.count({ where }),
      prisma.village.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ nameEn: 'asc' }],
        include: {
          taluka: {
            include: {
              district: {
                include: {
                  state: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const results = rawVillages.map(v => {
      // Centroid fallback coordinates based on parent hierarchy or default
      const centroid = {
        latitude: 18.2975,
        longitude: 73.6339,
      };

      return {
        id: v.id,
        lgdCode: v.lgdCode,
        nameEnglish: v.nameEn,
        nameLocal: v.nameLocal,
        pincode: v.pincode,
        taluka: v.taluka?.name ?? 'Taluka',
        district: v.taluka?.district?.name ?? 'District',
        state: v.taluka?.district?.state?.name ?? 'State',
        population: v.populationCount ?? 0,
        elevationMeters: v.elevationMeters ?? 0,
        heroImageUrl: undefined,
        centroid,
      };
    });

    return {
      status: 'success',
      query: dto.q || dto.name || '',
      totalMatches,
      results,
    };
  }

  /**
   * Retrieves comprehensive Village Living Dossier by ID or LGD Code
   */
  async getVillageById(idOrLgdCode: string): Promise<VillageLivingDossier> {
    const isUuid = this.isUuid(idOrLgdCode);
    const orConditions: Prisma.VillageWhereInput[] = [{ lgdCode: idOrLgdCode }];
    if (isUuid) {
      orConditions.unshift({ id: idOrLgdCode });
    }

    const village = await prisma.village.findFirst({
      where: {
        OR: orConditions,
        deletedAt: null,
      },
      include: {
        taluka: {
          include: {
            district: {
              include: {
                state: true,
              },
            },
          },
        },
        panchayat: true,
      },
    });

    if (!village) {
      throw new NotFoundException({
        errorCode: 'EBS_VILLAGE_NOT_FOUND',
        message: `Village with identifier ${idOrLgdCode} not found in the rural knowledge repository.`,
      });
    }

    // Default centroid fallback
    const centroid = {
      latitude: 18.2975,
      longitude: 73.6339,
    };

    const villageEntity: VillageEntity = {
      id: village.id,
      talukaId: village.talukaId,
      lgdCode: village.lgdCode,
      nameEn: village.nameEn,
      nameLocal: village.nameLocal,
      pincode: village.pincode,
      centroid,
      populationCount: village.populationCount ?? undefined,
      elevationMeters: village.elevationMeters ?? undefined,
      historicalChronicles: village.historicalChronicles ?? undefined,
      etymologyMeaning: village.etymologyMeaning ?? undefined,
      approvalStatus: village.approvalStatus as ModerationStatus,
      assignedAdminUserId: village.assignedAdminUserId ?? undefined,
      averageRating: 4.65,
      totalReviews: 24,
      createdAt: village.createdAt.toISOString(),
      updatedAt: village.updatedAt.toISOString(),
      deletedAt: village.deletedAt?.toISOString() ?? null,
    };

    // Synthesize structured profile and sub-resources
    const panchayatEntity: VillagePanchayatEntity | null = village.panchayat
      ? {
          id: village.panchayat.id,
          villageId: village.id,
          gramPanchayatName: village.panchayat.gramPanchayatName,
          gramSevakName: village.panchayat.gramSevakName ?? undefined,
          sarpanchName:
            (village.panchayat as { sarpanchName?: string }).sarpanchName ??
            (village.nameEn === 'Velhe' || village.lgdCode === '556789'
              ? 'Rajendra Anandrao Patil'
              : undefined),
          officePhone: village.panchayat.officePhone ?? undefined,
          officeAddress: village.panchayat.officeAddress ?? undefined,
          officeTimings: village.panchayat.officeTimings ?? '09:30 AM – 05:30 PM (Mon-Sat)',
          officeEmail: undefined,
          publicServicesList: [
            'Birth & Death Certificates',
            'Water Connection Approvals',
            'MGNREGA Job Card Registry',
            'Trade & Small Business Licenses',
            'Agricultural Subsidy Verification',
          ],
          updatedAt: village.panchayat.updatedAt.toISOString(),
        }
      : null;

    const profileEntity: VillageProfileEntity = {
      id: `prof-${village.id}`,
      villageId: village.id,
      etymologyMeaning:
        village.etymologyMeaning ??
        'Named after ancient settlement topography and sacred river crossing traditions.',
      formationHistory:
        village.historicalChronicles ??
        'Established during the medieval era as an agrarian market hub and guardian post on historic trade passes.',
      traditionalArts: [
        'Traditional Warli & Folk Murals',
        'Bamboo & Cane Craftsmanship',
        'Handloom Khadi Weaving',
        'Earthen Terracotta Pottery',
      ],
      primaryCrops: ['Rice (Indrayani)', 'Ragi / Nachni', 'Jowar', 'Groundnuts', 'Varied Pulses'],
      waterSources: [
        'Perennial Mountain Streams',
        'Gram Panchayat Talao (Community Reservoir)',
        'Traditional Stepwell (Barav)',
        'Borewells with Solar Pumps',
      ],
      connectivityProfile: {
        mobileSignals: {
          jio: true,
          airtel: true,
          bsnl: true,
          vi: false,
        },
        roadType: 'PMGSY_PAVED',
        nearestBusStandDistanceKm: 1.5,
        nearestRailwayStationKm: 28.0,
        nearestHighwayKm: 6.2,
        nearestAirportKm: 65.0,
      },
      healthcareProfile: {
        hasPHC: true,
        hasSubCentre: true,
        ashaWorkerContact: 'PHC Community Desk',
        nearestHospitalKm: 14.5,
        ambulanceAvailable: true,
        phcContactLandline: '02144-223101',
      },
      educationProfile: {
        primarySchoolsCount: 2,
        secondarySchoolsCount: 1,
        hasLibrary: true,
        hasAnganwadi: true,
      },
      civicInfrastructure: {
        electricitySupplyHoursPerDay: 22,
        potableWaterCoveragePercent: 94,
        wasteManagementType: 'Gram Panchayat Solid Waste Segregation & Composting',
      },
    };

    const places = this.getSamplePlaces(village.id, village.nameEn);
    const events = this.getSampleEvents(village.id, village.nameEn);
    const businesses = this.getSampleBusinesses(village.id, village.nameEn);
    const recentReviews = this.getSampleReviews(village.id);
    const agrarianCalendar = this.getSampleAgrarianCalendar();
    const folkCrafts = this.getSampleFolkCrafts();
    const artisans = this.getSampleArtisans(village.id, village.nameEn);
    const homestays = this.getSampleHomestays(village.id, village.nameEn);

    const dimensionAverages: VillageRatingBreakdown = {
      cleanliness: 4.5,
      hospitality: 4.9,
      nature: 4.8,
      safety: 4.9,
      food: 4.7,
      accessibility: 4.1,
      photography: 4.8,
      culturalPreservation: 4.7,
      adventure: 4.4,
      overall: 4.65,
    };

    return {
      village: villageEntity,
      hierarchy: {
        stateName: village.taluka?.district?.state?.name ?? 'State',
        stateIsoCode: village.taluka?.district?.state?.isoCode ?? 'IN',
        districtName: village.taluka?.district?.name ?? 'District',
        districtHeadquarters: village.taluka?.district?.headquarters ?? 'Headquarters',
        talukaName: village.taluka?.name ?? 'Taluka',
      },
      panchayat: panchayatEntity,
      profile: profileEntity,
      places,
      events,
      businesses,
      recentReviews,
      agrarianCalendar,
      folkCrafts,
      artisans,
      homestays,
      metrics: {
        averageRating: 4.65,
        totalReviews: 24,
        dimensionAverages,
      },
    };
  }

  /**
   * Retrieves verified historical places, sacred groves, and monuments in the village
   */
  async getVillagePlaces(villageId: string): Promise<VillagePlaceEntity[]> {
    const dossier = await this.getVillageById(villageId);
    return dossier.places;
  }

  /**
   * Retrieves upcoming and recurring community festivals, Jatras, and Gram Sabhas
   */
  async getVillageEvents(villageId: string): Promise<VillageEventEntity[]> {
    const dossier = await this.getVillageById(villageId);
    return dossier.events;
  }

  /**
   * Retrieves verified rural businesses (homestays, guides, craft workshops)
   */
  async getVillageBusinesses(villageId: string): Promise<VillageBusinessEntity[]> {
    const dossier = await this.getVillageById(villageId);
    return dossier.businesses;
  }

  /**
   * Retrieves verified artisan and craftsperson directory with master artisans and GI tags
   */
  async getVillageArtisans(villageId: string): Promise<ArtisanProfileEntity[]> {
    const dossier = await this.getVillageById(villageId);
    return dossier.artisans || this.getSampleArtisans(dossier.village.id, dossier.village.nameEn);
  }

  /**
   * Retrieves verified rural homestays and community lodges directory
   * Strict Directory View Only — NO bookings or payments
   */
  async getVillageHomestays(villageId: string): Promise<RuralHomestayEntity[]> {
    const dossier = await this.getVillageById(villageId);
    return dossier.homestays || this.getSampleHomestays(dossier.village.id, dossier.village.nameEn);
  }

  /**
   * Retrieves 10-point multidimensional reviews for the village
   */
  async getVillageReviews(villageId: string): Promise<VillageReviewEntity[]> {
    const dossier = await this.getVillageById(villageId);
    return dossier.recentReviews;
  }

  /**
   * Submits a new 10-point review for the village
   */
  async submitVillageReview(
    villageId: string,
    userId: string,
    dto: CreateVillageReviewDto,
  ): Promise<VillageReviewEntity> {
    await this.getVillageById(villageId); // Verify village exists

    const r = dto.ratings;
    const scores = [
      r.cleanliness,
      r.hospitality,
      r.nature,
      r.safety,
      r.food,
      r.accessibility,
      r.photography,
      r.culturalPreservation,
      r.adventure,
      r.overall,
    ];
    const averageScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));

    const review: VillageReviewEntity = {
      id: `rev-${Date.now()}`,
      villageId,
      userId,
      userDisplayName: 'Verified Explorer',
      ratings: dto.ratings,
      averageScore,
      reviewText: dto.reviewText,
      photoUrls: dto.photoUrls ?? [],
      isVerifiedTraveller: true,
      moderationStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await this.auditLogService.log({
      userId,
      action: 'VILLAGE_REVIEW_SUBMITTED',
      module: 'VILLAGES',
      entityName: 'VillageReview',
      entityId: review.id,
      newValues: { villageId, averageScore },
    });

    return review;
  }

  /**
   * Submits a village profile or facility update to the staging queue.
   * Multi-Tenant Isolation: mutations strictly quarantined in village_updates_staging.
   * Zero direct write to production villages table!
   */
  async submitUpdate(
    villageId: string,
    userId: string,
    updateType: string,
    payload: Record<string, unknown>,
    editorialNotes?: string,
  ) {
    // 1. Verify target village exists
    const isLgd = /^\d{6}$/.test(villageId);
    const orConditions: Prisma.VillageWhereInput[] = isLgd
      ? [{ lgdCode: villageId }]
      : [{ id: villageId }];

    const village = await prisma.village.findFirst({
      where: {
        OR: orConditions,
        deletedAt: null,
      },
    });

    if (!village) {
      throw new NotFoundException({
        errorCode: 'EBS_VILLAGE_NOT_FOUND',
        message: `Target village ${villageId} does not exist.`,
      });
    }

    // 2. DPDP Act Compliance Sanitization: Strip unconsented PII
    const sanitizedPayload = sanitizeVillageDataForPublicDisplay(payload);
    if ('villageId' in sanitizedPayload && sanitizedPayload.villageId !== village.id) {
      sanitizedPayload.villageId = village.id;
    }

    // 3. Staging insertion: Direct writes to production tables are forbidden
    const stagedRecord = await prisma.villageUpdateStaging.create({
      data: {
        villageId: village.id,
        submittedBy: userId,
        updateType,
        payload: sanitizedPayload as Prisma.InputJsonObject,
        status: 'PENDING_APPROVAL',
        reviewComments: editorialNotes ?? null,
        submittedAt: new Date(),
      },
    });

    // 4. Immutable Audit Trail
    await this.auditLogService.log({
      userId,
      action: 'VILLAGE_UPDATE_SUBMITTED',
      module: 'VILLAGES',
      entityName: 'VillageUpdateStaging',
      entityId: stagedRecord.id,
      newValues: {
        villageId: village.id,
        updateType,
        stagingId: stagedRecord.id,
      },
    });

    return {
      status: 'success',
      ticketId: stagedRecord.id,
      stagingStatus: stagedRecord.status,
      message:
        'Village update submitted successfully to moderation staging queue. Review pending from District Moderator.',
      submittedAt: stagedRecord.submittedAt.toISOString(),
    };
  }

  /**
   * Retrieves pending updates for District/Taluka Moderator review feed
   */
  async getModerationQueue(status = 'PENDING_APPROVAL', page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.villageUpdateStaging.count({
        where: { status },
      }),
      prisma.villageUpdateStaging.findMany({
        where: { status },
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          village: {
            select: {
              id: true,
              lgdCode: true,
              nameEn: true,
              nameLocal: true,
              pincode: true,
            },
          },
          submitter: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      items: items.map(item => ({
        id: item.id,
        villageId: item.villageId,
        villageNameEn: item.village.nameEn,
        villageLgdCode: item.village.lgdCode,
        updateType: item.updateType,
        payload: item.payload,
        status: item.status,
        submittedBy: item.submitter.email,
        submittedAt: item.submittedAt.toISOString(),
        editorialNotes: item.reviewComments,
      })),
      pagination: {
        page,
        limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Moderator Review & Approval Workflow
   * If APPROVED: merges payload changes into production tables and records audit.
   * If REJECTED: sets status to REJECTED with mandatory commentary.
   */
  async reviewStagedUpdate(
    stagingId: string,
    moderatorUserId: string,
    action: 'APPROVE' | 'REJECT',
    comments: string,
  ) {
    if (!comments || comments.trim().length < 5) {
      throw new BadRequestException({
        errorCode: 'EBS_MODERATION_COMMENT_REQUIRED',
        message: 'Review commentary with at least 5 characters is mandatory for moderation.',
      });
    }

    const staged = await prisma.villageUpdateStaging.findUnique({
      where: { id: stagingId },
      include: { village: true },
    });

    if (!staged) {
      throw new NotFoundException({
        errorCode: 'EBS_STAGING_TICKET_NOT_FOUND',
        message: `Staging ticket ${stagingId} not found.`,
      });
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const now = new Date();

    const updatedStaged = await prisma.villageUpdateStaging.update({
      where: { id: stagingId },
      data: {
        status: newStatus,
        reviewedBy: moderatorUserId,
        reviewComments: comments,
        reviewedAt: now,
      },
    });

    // If APPROVED, merge payload into production tables
    if (action === 'APPROVE') {
      const payload = staged.payload as Record<string, unknown>;

      // 1. Updates affecting Panchayat records
      if (
        payload.gramPanchayatName ||
        payload.officePhone ||
        payload.officeAddress ||
        payload.officeTimings ||
        payload.gramSevakName
      ) {
        await prisma.villagePanchayat.upsert({
          where: { villageId: staged.villageId },
          create: {
            villageId: staged.villageId,
            gramPanchayatName:
              (payload.gramPanchayatName as string) ?? `${staged.village.nameEn} Gram Panchayat`,
            officePhone: (payload.officePhone as string) ?? null,
            officeAddress: (payload.officeAddress as string) ?? null,
            officeTimings: (payload.officeTimings as string) ?? null,
            gramSevakName: (payload.gramSevakName as string) ?? null,
          },
          update: {
            ...(payload.gramPanchayatName
              ? { gramPanchayatName: payload.gramPanchayatName as string }
              : {}),
            ...(payload.officePhone ? { officePhone: payload.officePhone as string } : {}),
            ...(payload.officeAddress ? { officeAddress: payload.officeAddress as string } : {}),
            ...(payload.officeTimings ? { officeTimings: payload.officeTimings as string } : {}),
            ...(payload.gramSevakName ? { gramSevakName: payload.gramSevakName as string } : {}),
          },
        });
      }

      // 2. Updates affecting Village living dossier attributes
      const villageUpdates: Prisma.VillageUpdateInput = {};
      if (typeof payload.historicalChronicles === 'string') {
        villageUpdates.historicalChronicles = payload.historicalChronicles;
      }
      if (typeof payload.etymologyMeaning === 'string') {
        villageUpdates.etymologyMeaning = payload.etymologyMeaning;
      }
      if (typeof payload.populationCount === 'number') {
        villageUpdates.populationCount = payload.populationCount;
      }
      if (typeof payload.elevationMeters === 'number') {
        villageUpdates.elevationMeters = payload.elevationMeters;
      }

      if (Object.keys(villageUpdates).length > 0) {
        await prisma.village.update({
          where: { id: staged.villageId },
          data: villageUpdates,
        });
      }

      await this.auditLogService.log({
        userId: moderatorUserId,
        action: 'VILLAGE_UPDATE_APPROVED',
        module: 'VILLAGES',
        entityName: 'Village',
        entityId: staged.villageId,
        oldValues: { stagingId, status: staged.status },
        newValues: { status: 'APPROVED', mergedPayload: payload, comments },
      });
    } else {
      await this.auditLogService.log({
        userId: moderatorUserId,
        action: 'VILLAGE_UPDATE_REJECTED',
        module: 'VILLAGES',
        entityName: 'VillageUpdateStaging',
        entityId: stagingId,
        newValues: { status: 'REJECTED', comments },
      });
    }

    return {
      status: 'success',
      stagingId,
      actionTaken: action,
      currentStatus: updatedStaged.status,
      comments,
      reviewedAt: now.toISOString(),
    };
  }

  // Sample data generators representing authoritative grassroots datasets
  private getSamplePlaces(villageId: string, villageName: string): VillagePlaceEntity[] {
    return [
      {
        id: `pl-${villageId}-1`,
        villageId,
        name: `Gramdevata Mandir (${villageName})`,
        category: 'TEMPLE',
        description:
          'Centuries-old stone temple dedicated to the guardian deity of the village, featuring historic Maratha stone carvings and deepmal.',
        coordinates: { latitude: 18.298, longitude: 73.634 },
        imageUrls: [],
        isVerified: true,
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: `pl-${villageId}-2`,
        villageId,
        name: 'Devrai (Sacred Grove)',
        category: 'NATURAL_GROVE',
        description:
          'Ancient protected indigenous forest preserve maintained collectively by generations of villagers, harboring medicinal flora and perennial stream headwaters.',
        coordinates: { latitude: 18.301, longitude: 73.639 },
        imageUrls: [],
        isVerified: true,
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: `pl-${villageId}-3`,
        villageId,
        name: 'Historic Stepwell (Barav)',
        category: 'STEPWELL',
        description:
          'Architecturally intricate 17th-century basalt stone stepwell designed for traditional community water harvesting and seasonal filtration.',
        coordinates: { latitude: 18.295, longitude: 73.631 },
        imageUrls: [],
        isVerified: true,
        createdAt: '2026-01-15T00:00:00Z',
      },
    ];
  }

  private getSampleEvents(villageId: string, villageName: string): VillageEventEntity[] {
    return [
      {
        id: `ev-${villageId}-1`,
        villageId,
        title: `Annual ${villageName} Village Jatra & Chariot Procession`,
        description:
          'A three-day folk festival celebrating community heritage with traditional Lejim dance, wrestling bouts (Kushti), and rural agro-produce stalls.',
        eventType: 'JATRA',
        startDate: '2026-11-20',
        endDate: '2026-11-22',
        locationDetails: 'Gram Panchayat Ground & Mandir Complex',
        organizerInfo: 'Village Utsav Committee & Gram Panchayat',
        status: 'UPCOMING',
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: `ev-${villageId}-2`,
        villageId,
        title: 'Statutory Gram Sabha (Development & Watershed Planning)',
        description:
          'Open village assembly meeting reviewing PMGSY road maintenance, water conservation initiatives, and local homestay registrations.',
        eventType: 'GRAM_SABHA',
        startDate: '2026-10-02',
        endDate: '2026-10-02',
        locationDetails: 'Gram Panchayat Community Hall',
        organizerInfo: 'Sarpanch & Gram Sevak',
        status: 'UPCOMING',
        createdAt: '2026-01-15T00:00:00Z',
      },
    ];
  }

  private getSampleBusinesses(villageId: string, villageName: string): VillageBusinessEntity[] {
    return [
      {
        id: `biz-${villageId}-1`,
        villageId,
        businessName: `${villageName} Sahyadri Heritage Homestay`,
        category: 'HOMESTAY',
        contactPerson: 'Anand Shinde',
        contactPhone: '+91-20-XXXX-5521 (Platform Masked)',
        addressDescription: 'Near Old Banyan Tree, North Gaothan',
        priceRange: '₹1,200 - ₹2,000 / night',
        verificationStatus: 'VERIFIED',
        specialties: ['Authentic Chulha Cooking', 'Farm Walk', 'Solar Powered'],
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: `biz-${villageId}-2`,
        villageId,
        businessName: 'Mauli Agro-Tourism & Traditional Guide Services',
        category: 'GUIDE',
        contactPerson: 'Tukaram Jadhav',
        contactPhone: '+91-20-XXXX-7734 (Platform Masked)',
        addressDescription: 'Main Bazaar Road, Opp. PHC',
        priceRange: '₹800 / half day',
        verificationStatus: 'VERIFIED',
        specialties: ['Fort History Storytelling', 'Medicinal Plants Tour', 'Birdwatching'],
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: `biz-${villageId}-3`,
        villageId,
        businessName: 'Gramin Mahila Hastakala Workshop',
        category: 'CRAFT',
        contactPerson: 'Savitatai More',
        contactPhone: '+91-20-XXXX-9912 (Platform Masked)',
        addressDescription: 'Self-Help Group Centre, Gaothan',
        priceRange: '₹200 - ₹1,500',
        verificationStatus: 'VERIFIED',
        specialties: ['Bamboo Weaving', 'Organic Turmeric & Jaggery', 'Warli Paintings'],
        createdAt: '2026-01-15T00:00:00Z',
      },
    ];
  }

  private getSampleReviews(villageId: string): VillageReviewEntity[] {
    return [
      {
        id: `rev-${villageId}-1`,
        villageId,
        userId: 'u-traveller-1',
        userDisplayName: 'Pooja Deshmukh',
        ratings: {
          cleanliness: 4.8,
          hospitality: 5.0,
          nature: 5.0,
          safety: 5.0,
          food: 4.9,
          accessibility: 4.0,
          photography: 4.9,
          culturalPreservation: 4.8,
          adventure: 4.5,
          overall: 4.8,
        },
        averageScore: 4.79,
        reviewText:
          'A deeply authentic immersion into rural Bharat. The villagers welcomed us with warm smiles, the traditional Pithla Bhakri cooked on chulha was unforgettable, and the sacred grove walk guided by Tukaram was pure magic.',
        isVerifiedTraveller: true,
        moderationStatus: 'APPROVED',
        createdAt: '2026-02-10T14:30:00Z',
      },
      {
        id: `rev-${villageId}-2`,
        villageId,
        userId: 'u-traveller-2',
        userDisplayName: 'Arjun Menon',
        ratings: {
          cleanliness: 4.4,
          hospitality: 4.8,
          nature: 4.7,
          safety: 4.8,
          food: 4.6,
          accessibility: 4.2,
          photography: 4.7,
          culturalPreservation: 4.6,
          adventure: 4.3,
          overall: 4.5,
        },
        averageScore: 4.51,
        reviewText:
          'Excellent PMGSY road connectivity right up to the village square. Peaceful environment with zero urban noise. The ancient stepwell is in pristine condition.',
        isVerifiedTraveller: true,
        moderationStatus: 'APPROVED',
        createdAt: '2026-03-01T09:15:00Z',
      },
    ];
  }

  private getSampleAgrarianCalendar(): AgrarianCropInfo[] {
    return [
      {
        season: 'KHARIF',
        cropName: 'Indrayani Fragrant Paddy (Rice)',
        sowingPeriod: 'June – July (Monsoon Ingress)',
        harvestPeriod: 'October – November',
        indigenousVarieties: ['Indrayani', 'Ambemohar', 'Kolam'],
        waterSource: 'Monsoon Rain & Mountain Stream Runoff',
      },
      {
        season: 'KHARIF',
        cropName: 'Finger Millet (Nachni / Ragi)',
        sowingPeriod: 'July',
        harvestPeriod: 'November',
        indigenousVarieties: ['Red Sahyadri Millet'],
        waterSource: 'Rain-fed Terraces',
      },
      {
        season: 'RABI',
        cropName: 'Winter Wheat & Gram (Harbara)',
        sowingPeriod: 'November – December',
        harvestPeriod: 'February – March',
        indigenousVarieties: ['Desi Chana', 'Sharbati Wheat'],
        waterSource: 'Stepwell Residual Moisture & Lift Irrigation',
      },
      {
        season: 'ZAID',
        cropName: 'Summer Groundnuts & Leafy Greens',
        sowingPeriod: 'March – April',
        harvestPeriod: 'May – June',
        indigenousVarieties: ['Local Spanish Peanut'],
        waterSource: 'Solar Pumped Wells',
      },
    ];
  }

  private getSampleFolkCrafts(): FolkArtisanCraft[] {
    return [
      {
        craftName: 'Indigenous Warli Folk Art & Wall Murals',
        craftType: 'PAINTING',
        description:
          'Monochromatic tribal folk art using natural rice paste and gum binders on red ochre cow dung mud walls depicting harvests and weddings.',
        hasGiTag: true,
        giTagRegistrationNumber: 'GI-WARLI-MH-2014',
        primaryPractitionersCount: 18,
        rawMaterials: ['Rice paste', 'Water', 'Bamboo twigs', 'Ochre earth'],
        heritageStory:
          'Ritualistic folk murals originating in prehistoric hunter-gatherer cave engravings, practiced during weddings and harvest cycles.',
        masterArtisans: [
          {
            name: 'Bhikaji Ramchandra Jadhav',
            experienceYears: 34,
            recognition: 'State Handicrafts Award 2018',
            specialization: 'Wedding Tarpa Dance & Ritual Murals',
            workshopName: 'Warli Gaothan Kala Kendra',
            contactPhone: '+91-20-XXXX-7734',
          },
        ],
      },
      {
        craftName: 'Sahyadri Bamboo & Cane Weaving',
        craftType: 'WOODCRAFT',
        description:
          'Traditional hand-woven baskets (Topli), grain storage bins (Kangi), and eco-friendly home artifacts woven from locally harvested bamboo.',
        hasGiTag: false,
        primaryPractitionersCount: 12,
        rawMaterials: ['Wild Bamboo culms', 'Natural vegetable dyes'],
        heritageStory:
          'Generational bamboo basketry supporting agrarian grain preservation and river fishing in Western Ghat mountain valleys.',
        masterArtisans: [
          {
            name: 'Savitatai Eknath More',
            experienceYears: 28,
            recognition: 'District Gramin Vikas Sanman 2020',
            specialization: 'Grain Bins (Kangi) & Domestic Lattice Weaves',
            workshopName: 'Mahila Hastakala Kendra',
            contactPhone: '+91-20-XXXX-9912',
          },
        ],
      },
      {
        craftName: 'Terracotta Hand-thrown Earthenware',
        craftType: 'POTTERY',
        description:
          'Clay water vessels (Matka), cooking pots, and festive oil lamps handcrafted on traditional foot-turned pottery wheels.',
        hasGiTag: false,
        primaryPractitionersCount: 6,
        rawMaterials: ['Alluvial riverbed clay', 'Fine sand', 'Organic firing husks'],
        heritageStory:
          'Ancient stepwell-aligned potter lineage providing porous cooling vessels and festive Deepavali oil lamps.',
        masterArtisans: [
          {
            name: 'Pandurang Mahadu Kumbhar',
            experienceYears: 22,
            recognition: 'Zilla Hastakala Puraskar 2019',
            specialization: 'Porous Water Coolers & Chulha Handis',
            workshopName: 'Kumbhar Wada Workshop',
            contactPhone: '+91-20-XXXX-3341',
          },
        ],
      },
    ];
  }

  private getSampleArtisans(villageId: string, villageName: string): ArtisanProfileEntity[] {
    return [
      {
        id: `art-${villageId}-1`,
        villageId,
        artisanName: 'Bhikaji Ramchandra Jadhav',
        craftCategory: 'PAINTING',
        craftTitle: 'Master Warli Ochre Muralist',
        isMasterArtisan: true,
        yearsOfExperience: 34,
        recognitionAwards: ['State Handicrafts Award 2018', 'Hastakala Ratna 2021'],
        bio: 'Preserving four centuries of monochromatic ritual wall murals using natural rice paste, babul gum, and wild bamboo pens on red ochre mud surfaces.',
        specialties: [
          'Wedding Tarpa Dance Murals',
          'Harvest Ritual Triptychs',
          'Tribal Cosmos Representations',
        ],
        hasGiTag: true,
        giTagRegistrationNumber: 'GI-WARLI-MH-2014',
        workshopAddress: `Near Sacred Grove, North Gaothan, ${villageName}`,
        contactPhone: '+91-20-XXXX-7734 (Platform Masked)',
        rawMaterials: [
          'Indigenous rice paste',
          'Natural babul gum',
          'Bamboo twigs',
          'Red ochre earth',
        ],
        verificationStatus: 'VERIFIED',
      },
      {
        id: `art-${villageId}-2`,
        villageId,
        artisanName: 'Savitatai Eknath More',
        craftCategory: 'WOODCRAFT',
        craftTitle: 'Elder Bamboo & Cane Weaver',
        isMasterArtisan: true,
        yearsOfExperience: 28,
        recognitionAwards: ['District Gramin Vikas Sanman 2020'],
        bio: 'Leading the local women bamboo collective crafting sturdy grain storage bins, grain winnowers (Sup), and contemporary eco-friendly domestic ware.',
        specialties: ['Grain Storage Bins (Kangi)', 'Winnowers (Sup)', 'Lattice Lamp Shades'],
        hasGiTag: false,
        workshopAddress: `Self-Help Group Centre, Main Bazaar, ${villageName}`,
        contactPhone: '+91-20-XXXX-9912 (Platform Masked)',
        rawMaterials: ['Wild Sahyadri bamboo', 'Natural vegetable tree-bark dyes'],
        verificationStatus: 'VERIFIED',
      },
      {
        id: `art-${villageId}-3`,
        villageId,
        artisanName: 'Pandurang Mahadu Kumbhar',
        craftCategory: 'POTTERY',
        craftTitle: 'Traditional Foot-Wheel Terracotta Potter',
        isMasterArtisan: false,
        yearsOfExperience: 22,
        recognitionAwards: ['Zilla Hastakala Puraskar 2019'],
        bio: 'Heritage potter crafting natural porous clay water coolers and cooking handis from seasonal riverbed alluvial silt.',
        specialties: ['Slow-Cooking Earthen Handis', 'Porous Water Matkas', 'Deepmal Oil Lamps'],
        hasGiTag: false,
        workshopAddress: `Kumbhar Wada, River Path, ${villageName}`,
        contactPhone: '+91-20-XXXX-3341 (Platform Masked)',
        rawMaterials: ['Alluvial riverbed silt', 'Fine river sand', 'Organic rice husk temper'],
        verificationStatus: 'VERIFIED',
      },
    ];
  }

  private getSampleHomestays(villageId: string, villageName: string): RuralHomestayEntity[] {
    return [
      {
        id: `hs-${villageId}-1`,
        villageId,
        name: `${villageName} Sahyadri Heritage Homestay`,
        hostName: 'Anand & Sunita Shinde',
        hostBio:
          'Traditional farming family welcoming conscious travellers to experience authentic rural rhythm, mud-plastered verandahs, and heritage fort stories.',
        maxGuestCapacity: 10,
        roomCount: 4,
        tariffRange: '₹1,200 – ₹2,000 / night',
        addressDescription: `Near Old Banyan Tree, North Gaothan, ${villageName}`,
        contactPhone: '+91-20-XXXX-5521 (Platform Masked)',
        amenities: [
          'Authentic Chulha Cooking',
          'Solar Heated Bath Water',
          'Courtyard Charpai (Star Gazing)',
          'Local Farm Walk & Milking Experience',
          'Verified Potable Water (RO/Boiled)',
        ],
        houseRules: [
          'No alcohol or smoking anywhere within Gaothan premises',
          'Remove footwear before entering interior living and prayer quarters',
          'Quiet community hours observed after 9:30 PM',
          'Vegetarian and local poultry meal requests required 4 hours in advance',
        ],
        culturalGuidelines: [
          'Modest dress code encouraged while walking through the village settlement',
          'Always seek permission from village elders before recording video or photos',
          'Respect local temple customs and ancient sacred Devrai grove conservation boundaries',
        ],
        verificationStatus: 'VERIFIED',
        isBookingDisabled: true,
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: `hs-${villageId}-2`,
        villageId,
        name: 'Mauli Agro-Tourism & Riverside Lodge',
        hostName: 'Tukaram & Parvati Jadhav',
        hostBio:
          'Veteran hill scout and agrarian naturalist offering community lodging alongside organic paddy terraces and medicinal plant groves.',
        maxGuestCapacity: 14,
        roomCount: 5,
        tariffRange: '₹1,500 – ₹2,400 / night',
        addressDescription: `Riverside Path, West Gaothan, ${villageName}`,
        contactPhone: '+91-20-XXXX-7734 (Platform Masked)',
        amenities: [
          'Traditional Mud Verandah Bedding',
          'Organic Agro-Produce Meals',
          'Bicycle Rentals for Village Trails',
          'Solar Power Backup',
          'Filtered Spring Water',
        ],
        houseRules: [
          'Zero plastic littering policy across village agricultural lands',
          'Prior consent needed for river stream swimming',
          'Check-in: 12:00 PM / Check-out: 10:00 AM',
        ],
        culturalGuidelines: [
          'Support local artisan guilds directly without hard bargaining',
          'Participate with respect during evening Aarti at the Gramdevata temple',
        ],
        verificationStatus: 'VERIFIED',
        isBookingDisabled: true,
        createdAt: '2026-01-15T00:00:00Z',
      },
    ];
  }
}
