// Explore Bharat Safar — Bharat Discovery Engine Domain Service
// Reference: EBS-BLU-41-BDE, EBS-DOC-09-API Section 5.2, EBS-DOC-10-DATA, EBS-DOC-16-MAP, EBS-DOC-18-SEARCH, EBS-DOC-26-RULES
import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ebs/database';
import {
  calculateHaversineDistanceKm,
  calculateTrigramSimilarity,
  calculateSpatialRelevanceScore,
  filterPointsWithinBoundingBox,
  OFFICIAL_BHARAT_TERRITORIES,
} from '@ebs/gis-core';
import { DiscoveryCacheService } from './discovery-cache.service';
import { SearchDiscoveryDto, DiscoverySearchLevel } from './dto/search-discovery.dto';
import { NearbyPlacesDto } from './dto/nearby-places.dto';
import { BoundingBoxDto } from './dto/bounding-box.dto';
import { PlaceQueryDto } from './dto/place-query.dto';
import {
  SpatialSearchResult,
  SpatialSearchResponse,
  StateEntity,
  DistrictEntity,
  TalukaEntity,
  PlaceEntity,
  PlaceCategory,
  Landmark3DEntity,
  GeoJsonFeatureCollection,
} from '@ebs/types';

@Injectable()
export class DiscoveryService {
  constructor(private readonly cacheService: DiscoveryCacheService) {}

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  private async resolveCategoryId(slugOrId?: string): Promise<string | undefined> {
    if (!slugOrId) return undefined;
    if (this.isUuid(slugOrId)) return slugOrId;

    const cat = await prisma.category.findUnique({
      where: { slug: slugOrId.toLowerCase().trim() },
    });
    return cat?.id;
  }

  /**
   * Retrieves all 28 States and 8 Union Territories with official Survey of India centroids and summaries.
   */
  async getStates(): Promise<StateEntity[]> {
    const cacheKey = this.cacheService.getStatesKey();
    const cached = await this.cacheService.get<StateEntity[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const states = await prisma.state.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { districts: true },
        },
      },
    });

    const formatted: StateEntity[] = states.map(s => {
      const dossier = (s.overviewDossier as Record<string, unknown>) || {};
      const territory = OFFICIAL_BHARAT_TERRITORIES.find(
        t =>
          t.isoCode.toUpperCase() === s.isoCode.toUpperCase() ||
          t.name.toLowerCase() === s.name.toLowerCase(),
      );
      const centroid = territory?.approxCentroid || { latitude: 20.5937, longitude: 78.9629 };

      return {
        id: s.id,
        name: s.name,
        isoCode: s.isoCode,
        capital: s.capital,
        officialLanguages: s.officialLanguages,
        centroid,
        overviewDossier: dossier,
        districtsCount: s._count.districts,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      };
    });

    await this.cacheService.set(cacheKey, formatted, 24 * 60 * 60 * 1000);
    return formatted;
  }

  /**
   * Retrieves full State dossier with constituent districts and centroid coordinates.
   */
  async getStateById(idOrSlug: string): Promise<StateEntity & { districts: DistrictEntity[] }> {
    const cacheKey = this.cacheService.getStateKey(idOrSlug);
    const cached = await this.cacheService.get<StateEntity & { districts: DistrictEntity[] }>(
      cacheKey,
    );
    if (cached) {
      return cached;
    }

    const isUuidIdentifier = this.isUuid(idOrSlug);
    const orConditions: Array<Record<string, unknown>> = [
      { isoCode: idOrSlug.toUpperCase() },
      { name: { equals: idOrSlug, mode: 'insensitive' } },
    ];
    if (isUuidIdentifier) {
      orConditions.unshift({ id: idOrSlug });
    }

    const state = await prisma.state.findFirst({
      where: {
        OR: orConditions,
        deletedAt: null,
      },
      include: {
        districts: {
          where: { deletedAt: null },
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { talukas: true },
            },
          },
        },
      },
    });

    if (!state) {
      throw new NotFoundException({
        errorCode: 'EBS_GEO_STATE_NOT_FOUND',
        message: `State with identifier ${idOrSlug} not found.`,
      });
    }

    const territory = OFFICIAL_BHARAT_TERRITORIES.find(
      t =>
        t.isoCode.toUpperCase() === state.isoCode.toUpperCase() ||
        t.name.toLowerCase() === state.name.toLowerCase(),
    );

    const result: StateEntity & { districts: DistrictEntity[] } = {
      id: state.id,
      name: state.name,
      isoCode: state.isoCode,
      capital: state.capital,
      officialLanguages: state.officialLanguages,
      centroid: territory?.approxCentroid || { latitude: 20.5937, longitude: 78.9629 },
      overviewDossier: state.overviewDossier as Record<string, unknown>,
      districts: state.districts.map(d => ({
        id: d.id,
        stateId: state.id,
        name: d.name,
        headquarters: d.headquarters,
        talukasCount: d._count.talukas,
        emergencyDirectory: d.emergencyDirectory as Record<string, string>,
      })),
      createdAt: state.createdAt.toISOString(),
      updatedAt: state.updatedAt.toISOString(),
    };

    await this.cacheService.set(cacheKey, result);
    return result;
  }

  /**
   * Retrieves District with constituent talukas and emergency directories.
   */
  async getDistrictById(
    id: string,
  ): Promise<
    DistrictEntity & { stateName: string; talukas: Array<TalukaEntity & { placesCount: number }> }
  > {
    const cacheKey = this.cacheService.getDistrictKey(id);
    const cached = await this.cacheService.get<
      DistrictEntity & { stateName: string; talukas: Array<TalukaEntity & { placesCount: number }> }
    >(cacheKey);
    if (cached) {
      return cached;
    }

    const isUuidIdentifier = this.isUuid(id);
    const orConditions: Array<Record<string, unknown>> = [
      { name: { equals: id, mode: 'insensitive' } },
    ];
    if (isUuidIdentifier) {
      orConditions.unshift({ id });
    }

    const district = await prisma.district.findFirst({
      where: {
        OR: orConditions,
        deletedAt: null,
      },
      include: {
        state: {
          select: {
            id: true,
            name: true,
            isoCode: true,
            capital: true,
          },
        },
        talukas: {
          where: { deletedAt: null },
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { places: true },
            },
          },
        },
      },
    });

    if (!district || district.deletedAt) {
      throw new NotFoundException({
        errorCode: 'EBS_GEO_DISTRICT_NOT_FOUND',
        message: `District with identifier ${id} not found.`,
      });
    }

    const result = {
      id: district.id,
      stateId: district.stateId,
      stateName: district.state.name,
      stateIsoCode: district.state.isoCode,
      name: district.name,
      headquarters: district.headquarters,
      emergencyDirectory: district.emergencyDirectory as Record<string, string>,
      talukas: district.talukas.map(t => ({
        id: t.id,
        districtId: district.id,
        name: t.name,
        placesCount: t._count.places,
      })),
      createdAt: district.createdAt.toISOString(),
      updatedAt: district.updatedAt.toISOString(),
    };

    await this.cacheService.set(cacheKey, result);
    return result;
  }

  /**
   * Retrieves Taluka with places registry and 3D landmarks.
   */
  async getTalukaById(id: string): Promise<TalukaEntity & { places: PlaceEntity[] }> {
    const cacheKey = this.cacheService.getTalukaKey(id);
    const cached = await this.cacheService.get<TalukaEntity & { places: PlaceEntity[] }>(cacheKey);
    if (cached) {
      return cached;
    }

    const isUuidIdentifier = this.isUuid(id);
    const orConditions: Array<Record<string, unknown>> = [
      { name: { equals: id, mode: 'insensitive' } },
    ];
    if (isUuidIdentifier) {
      orConditions.unshift({ id });
    }

    const taluka = await prisma.taluka.findFirst({
      where: {
        OR: orConditions,
        deletedAt: null,
      },
      include: {
        district: {
          include: {
            state: true,
          },
        },
        places: {
          where: { deletedAt: null },
          orderBy: { name: 'asc' },
          include: {
            landmark3D: true,
          },
        },
      },
    });

    if (!taluka || taluka.deletedAt) {
      throw new NotFoundException({
        errorCode: 'EBS_GEO_TALUKA_NOT_FOUND',
        message: `Taluka with identifier ${id} not found.`,
      });
    }

    const result = {
      id: taluka.id,
      districtId: taluka.districtId,
      districtName: taluka.district.name,
      stateName: taluka.district.state.name,
      name: taluka.name,
      places: taluka.places.map(p =>
        this.formatPlaceEntity(p, taluka.name, taluka.district.name, taluka.district.state.name),
      ),
      createdAt: taluka.createdAt.toISOString(),
      updatedAt: taluka.updatedAt.toISOString(),
    };

    await this.cacheService.set(cacheKey, result);
    return result;
  }

  /**
   * Retrieves paginated places with category and administrative filters.
   */
  async getPlaces(query: PlaceQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (query.category) {
      const resolvedCatId = await this.resolveCategoryId(query.category);
      if (resolvedCatId) {
        where.categoryIds = { has: resolvedCatId };
      }
    }

    if (query.talukaId) {
      where.talukaId = query.talukaId;
    } else if (query.districtId) {
      where.taluka = { districtId: query.districtId };
    } else if (query.stateId) {
      where.taluka = { district: { stateId: query.stateId } };
    }

    if (query.bookingEnabledOnly) {
      where.isBookingEnabled = true;
    }

    if (query.has3DLandmark) {
      where.landmark3D = { isNot: null };
    }

    if (query.minRating !== undefined) {
      where.averageRating = { gte: query.minRating };
    }

    const [totalRecords, rawPlaces] = await Promise.all([
      prisma.place.count({ where }),
      prisma.place.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ averageRating: 'desc' }, { name: 'asc' }],
        include: {
          landmark3D: true,
          taluka: {
            include: {
              district: {
                include: { state: true },
              },
            },
          },
        },
      }),
    ]);

    const items = rawPlaces.map(p =>
      this.formatPlaceEntity(
        p,
        p.taluka?.name,
        p.taluka?.district?.name,
        p.taluka?.district?.state?.name,
      ),
    );

    return {
      items,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        hasNextPage: page * limit < totalRecords,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Retrieves deep Place dossier including architectural monographs and booking status.
   */
  async getPlaceById(idOrSlug: string): Promise<PlaceEntity> {
    const cacheKey = this.cacheService.getPlaceKey(idOrSlug);
    const cached = await this.cacheService.get<PlaceEntity>(cacheKey);
    if (cached) {
      return cached;
    }

    const isUuidIdentifier = this.isUuid(idOrSlug);
    const orConditions: Array<Record<string, unknown>> = [
      { slug: idOrSlug.toLowerCase() },
      { name: { equals: idOrSlug, mode: 'insensitive' } },
    ];
    if (isUuidIdentifier) {
      orConditions.unshift({ id: idOrSlug });
    }

    const place = await prisma.place.findFirst({
      where: {
        OR: orConditions,
        deletedAt: null,
      },
      include: {
        landmark3D: true,
        taluka: {
          include: {
            district: {
              include: { state: true },
            },
          },
        },
      },
    });

    if (!place) {
      throw new NotFoundException({
        errorCode: 'EBS_GEO_PLACE_NOT_FOUND',
        message: `Place with identifier ${idOrSlug} not found.`,
      });
    }

    const formatted = this.formatPlaceEntity(
      place,
      place.taluka?.name,
      place.taluka?.district?.name,
      place.taluka?.district?.state?.name,
    );

    await this.cacheService.set(cacheKey, formatted);
    return formatted;
  }

  /**
   * Retrieves all hierarchical categories.
   */
  async getCategories(): Promise<PlaceCategory[]> {
    const cacheKey = this.cacheService.getCategoriesKey();
    const cached = await this.cacheService.get<PlaceCategory[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        children: true,
      },
    });

    await this.cacheService.set(cacheKey, categories, 24 * 60 * 60 * 1000);
    return categories as unknown as PlaceCategory[];
  }

  /**
   * Retrieves 3D landmark models catalog.
   */
  async getLandmarks3D(): Promise<
    Array<
      Landmark3DEntity & {
        place: {
          id: string;
          name: string;
          slug: string;
          heroImageUrl?: string;
          isBookingEnabled: boolean;
          location: string;
        };
      }
    >
  > {
    const cacheKey = this.cacheService.getLandmarks3DKey();
    const cached = await this.cacheService.get<
      Array<
        Landmark3DEntity & {
          place: {
            id: string;
            name: string;
            slug: string;
            heroImageUrl?: string;
            isBookingEnabled: boolean;
            location: string;
          };
        }
      >
    >(cacheKey);
    if (cached) {
      return cached;
    }

    const landmarks = await prisma.landmark3D.findMany({
      include: {
        place: {
          select: {
            id: true,
            name: true,
            slug: true,
            averageRating: true,
            isBookingEnabled: true,
            taluka: {
              select: {
                name: true,
                district: {
                  select: {
                    name: true,
                    state: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const result = landmarks.map(lm => ({
      id: lm.id,
      placeId: lm.placeId,
      name: lm.name,
      modelAssetUri: lm.modelAssetUri,
      renderScale: Number(lm.renderScale),
      boundingRadiusPx: lm.boundingRadiusPx,
      place: {
        id: lm.place.id,
        name: lm.place.name,
        slug: lm.place.slug,
        heroImageUrl: undefined as string | undefined,
        isBookingEnabled: lm.place.isBookingEnabled,
        location: `${lm.place.taluka.name}, ${lm.place.taluka.district.name}, ${lm.place.taluka.district.state.name}`,
      },
    }));

    await this.cacheService.set(cacheKey, result, 24 * 60 * 60 * 1000);
    return result;
  }

  /**
   * Spatial Radius Query: Retrieves places within a specific radial distance from target coordinates.
   */
  async getNearbyPlaces(dto: NearbyPlacesDto): Promise<PlaceEntity[]> {
    const radiusKm = dto.radiusKm ?? 50;
    const limit = dto.limit ?? 20;

    const where: Record<string, unknown> = { deletedAt: null };
    if (dto.category) {
      const resolvedCatId = await this.resolveCategoryId(dto.category);
      if (resolvedCatId) {
        where.categoryIds = { has: resolvedCatId };
      }
    }

    const places = await prisma.place.findMany({
      where,
      include: {
        landmark3D: true,
        taluka: {
          include: {
            district: {
              include: { state: true },
            },
          },
        },
      },
    });

    const center = { latitude: dto.latitude, longitude: dto.longitude };

    const nearby = places
      .map(p => {
        const coords = this.extractCoords(p);
        const dist = calculateHaversineDistanceKm(center, coords);
        return {
          place: p,
          coords,
          dist,
        };
      })
      .filter(item => item.dist <= radiusKm)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, limit)
      .map(item => {
        const formatted = this.formatPlaceEntity(
          item.place,
          item.place.taluka?.name,
          item.place.taluka?.district?.name,
          item.place.taluka?.district?.state?.name,
        );
        formatted.coordinates = item.coords;
        formatted.distanceKm = Number(item.dist.toFixed(2));
        return formatted;
      });

    return nearby;
  }

  /**
   * Spatial Bounding Box Query: Retrieves places situated within a map bounding box.
   */
  async getPlacesWithinBounds(dto: BoundingBoxDto): Promise<PlaceEntity[]> {
    const limit = dto.limit ?? 50;
    const bbox = {
      minLat: dto.minLat,
      minLng: dto.minLng,
      maxLat: dto.maxLat,
      maxLng: dto.maxLng,
    };

    const where: Record<string, unknown> = { deletedAt: null };
    if (dto.category) {
      const resolvedCatId = await this.resolveCategoryId(dto.category);
      if (resolvedCatId) {
        where.categoryIds = { has: resolvedCatId };
      }
    }

    const places = await prisma.place.findMany({
      where,
      include: {
        landmark3D: true,
        taluka: {
          include: {
            district: {
              include: { state: true },
            },
          },
        },
      },
    });

    const filtered = places
      .map(p => {
        const coords = this.extractCoords(p);
        return { place: p, coords };
      })
      .filter(
        item =>
          filterPointsWithinBoundingBox(
            [
              {
                id: item.place.id,
                latitude: item.coords.latitude,
                longitude: item.coords.longitude,
              },
            ],
            bbox,
          ).length > 0,
      )
      .slice(0, limit)
      .map(item => {
        const formatted = this.formatPlaceEntity(
          item.place,
          item.place.taluka?.name,
          item.place.taluka?.district?.name,
          item.place.taluka?.district?.state?.name,
        );
        formatted.coordinates = item.coords;
        return formatted;
      });

    return filtered;
  }

  /**
   * Section 1 Isolated Spatial Search:
   * Queries ONLY sovereign geographic entities (States, Districts, Talukas, Places).
   * HARD FIREWALL: Zero village records, zero booking packages, zero social feed posts.
   */
  async searchDiscovery(dto: SearchDiscoveryDto): Promise<SpatialSearchResponse> {
    const query = dto.q?.trim() || '';
    if (query.length < 2) {
      return { query, totalMatches: 0, results: [] };
    }

    const level = dto.level || DiscoverySearchLevel.ALL;
    const cacheKey = this.cacheService.getSearchKey(query, level, dto.category || 'all');
    const cached = await this.cacheService.get<SpatialSearchResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const searchStates = level === DiscoverySearchLevel.ALL || level === DiscoverySearchLevel.STATE;
    const searchDistricts =
      level === DiscoverySearchLevel.ALL || level === DiscoverySearchLevel.DISTRICT;
    const searchTalukas =
      level === DiscoverySearchLevel.ALL || level === DiscoverySearchLevel.TALUKA;
    const searchPlaces = level === DiscoverySearchLevel.ALL || level === DiscoverySearchLevel.PLACE;

    let resolvedCategoryId: string | undefined;
    if (dto.category) {
      resolvedCategoryId = await this.resolveCategoryId(dto.category);
    }

    const placesWhere: Record<string, unknown> = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
        { historicalOverview: { contains: query, mode: 'insensitive' } },
      ],
      deletedAt: null,
    };
    if (resolvedCategoryId) {
      placesWhere.categoryIds = { has: resolvedCategoryId };
    }

    const [states, districts, talukas, places] = await Promise.all([
      searchStates
        ? prisma.state.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { isoCode: { contains: query, mode: 'insensitive' } },
                { capital: { contains: query, mode: 'insensitive' } },
              ],
              deletedAt: null,
            },
            take: 5,
          })
        : [],
      searchDistricts
        ? prisma.district.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { headquarters: { contains: query, mode: 'insensitive' } },
              ],
              deletedAt: null,
            },
            include: { state: true },
            take: 10,
          })
        : [],
      searchTalukas
        ? prisma.taluka.findMany({
            where: {
              name: { contains: query, mode: 'insensitive' },
              deletedAt: null,
            },
            include: {
              district: {
                include: { state: true },
              },
            },
            take: 10,
          })
        : [],
      searchPlaces
        ? prisma.place.findMany({
            where: placesWhere,
            include: {
              landmark3D: true,
              taluka: {
                include: {
                  district: {
                    include: { state: true },
                  },
                },
              },
            },
            take: 50,
          })
        : [],
    ]);

    const results: SpatialSearchResult[] = [];

    // Map States
    for (const s of states) {
      const sim = calculateTrigramSimilarity(query, s.name);
      const territory = OFFICIAL_BHARAT_TERRITORIES.find(
        t =>
          t.isoCode.toUpperCase() === s.isoCode.toUpperCase() ||
          t.name.toLowerCase() === s.name.toLowerCase(),
      );
      results.push({
        id: s.id,
        name: s.name,
        type: 'state',
        coordinates: territory?.approxCentroid,
        locationHierarchy: {
          state: s.name,
          isoCode: s.isoCode,
        },
        score: calculateSpatialRelevanceScore({ textSimilarity: sim }),
      });
    }

    // Map Districts
    for (const d of districts) {
      const sim = calculateTrigramSimilarity(query, d.name);
      results.push({
        id: d.id,
        name: d.name,
        type: 'district',
        locationHierarchy: {
          district: d.name,
          state: d.state.name,
          isoCode: d.state.isoCode,
        },
        score: calculateSpatialRelevanceScore({ textSimilarity: sim }),
      });
    }

    // Map Talukas
    for (const t of talukas) {
      const sim = calculateTrigramSimilarity(query, t.name);
      results.push({
        id: t.id,
        name: t.name,
        type: 'taluka',
        locationHierarchy: {
          taluka: t.name,
          district: t.district.name,
          state: t.district.state.name,
        },
        score: calculateSpatialRelevanceScore({ textSimilarity: sim }),
      });
    }

    // Parse Bounding Box if provided in query
    let searchBBox: { minLng: number; minLat: number; maxLng: number; maxLat: number } | null =
      null;
    if (dto.bbox) {
      const parts = dto.bbox.split(',').map(Number);
      if (parts.length === 4 && parts.every(p => !isNaN(p))) {
        const [minLng, minLat, maxLng, maxLat] = parts;
        if (
          minLng !== undefined &&
          minLat !== undefined &&
          maxLng !== undefined &&
          maxLat !== undefined
        ) {
          searchBBox = { minLng, minLat, maxLng, maxLat };
        }
      }
    }

    // Map Places with proximity boosting if coordinates provided
    for (const p of places) {
      const coords = this.extractCoords(p);

      // Apply bbox filter if specified
      if (searchBBox) {
        const inBBox =
          coords.latitude >= searchBBox.minLat &&
          coords.latitude <= searchBBox.maxLat &&
          coords.longitude >= searchBBox.minLng &&
          coords.longitude <= searchBBox.maxLng;
        if (!inBBox) continue;
      }

      const sim = Math.max(
        calculateTrigramSimilarity(query, p.name),
        calculateTrigramSimilarity(query, p.slug),
      );

      let dist: number | undefined;
      if (dto.latitude !== undefined && dto.longitude !== undefined) {
        dist = calculateHaversineDistanceKm(
          { latitude: dto.latitude, longitude: dto.longitude },
          coords,
        );
        if (dto.radiusKm && dist > dto.radiusKm) {
          continue;
        }
      }

      const score = calculateSpatialRelevanceScore({
        textSimilarity: sim,
        distanceKm: dist,
        maxRadiusKm: dto.radiusKm ?? 500,
      });

      results.push({
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: 'place',
        coordinates: coords,
        isBookingEnabled: p.isBookingEnabled,
        locationHierarchy: {
          taluka: p.taluka?.name,
          district: p.taluka?.district?.name,
          state: p.taluka?.district?.state?.name,
        },
        score,
        distanceKm: dist ? Number(dist.toFixed(2)) : undefined,
      });
    }

    // Sort by relevance score descending
    results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const offset = dto.offset ?? 0;
    const limit = dto.limit ?? 20;

    const response: SpatialSearchResponse = {
      query,
      totalMatches: results.length,
      level,
      results: results.slice(offset, offset + limit),
    };

    await this.cacheService.set(cacheKey, response, 60 * 60 * 1000);
    return response;
  }

  /**
   * Generates Survey of India Compliant GeoJSON Feature Collection for States & UTs.
   */
  async getStatesGeoJson(): Promise<GeoJsonFeatureCollection> {
    const states = await this.getStates();

    const features = states.map(s => ({
      type: 'Feature' as const,
      id: s.id,
      geometry: {
        type: 'Point' as const,
        coordinates: [s.centroid?.longitude ?? 78.9629, s.centroid?.latitude ?? 20.5937],
      },
      properties: {
        id: s.id,
        name: s.name,
        isoCode: s.isoCode,
        capital: s.capital,
        officialLanguages: s.officialLanguages,
        districtsCount: s.districtsCount,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * Generates GeoJSON Feature Collection for Places.
   */
  async getPlacesGeoJson(query: PlaceQueryDto = {}): Promise<GeoJsonFeatureCollection> {
    const placesResponse = await this.getPlaces({ ...query, limit: query.limit ?? 100 });

    const features = placesResponse.items.map(p => ({
      type: 'Feature' as const,
      id: p.id,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.coordinates.longitude, p.coordinates.latitude],
      },
      properties: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        elevationMeters: p.elevationMeters,
        averageRating: p.averageRating,
        reviewCount: p.reviewCount,
        isBookingEnabled: p.isBookingEnabled,
        location: [p.talukaName, p.districtName, p.stateName].filter(Boolean).join(', '),
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * Helpers
   */
  private extractCoords(place: {
    name?: string;
    elevationMeters?: number | null;
    latitude?: number;
    longitude?: number;
    coordinates?: { latitude: number; longitude: number };
  }): { latitude: number; longitude: number; elevationMeters?: number } {
    if (typeof place.latitude === 'number' && typeof place.longitude === 'number') {
      return {
        latitude: place.latitude,
        longitude: place.longitude,
        elevationMeters: place.elevationMeters ?? undefined,
      };
    }
    if (
      place.coordinates &&
      typeof place.coordinates.latitude === 'number' &&
      typeof place.coordinates.longitude === 'number'
    ) {
      return {
        latitude: place.coordinates.latitude,
        longitude: place.coordinates.longitude,
        elevationMeters: place.elevationMeters ?? undefined,
      };
    }
    return {
      latitude: 18.5204,
      longitude: 73.8567,
      elevationMeters: place.elevationMeters ?? undefined,
    };
  }

  private formatPlaceEntity(
    raw: {
      id: string;
      talukaId: string;
      name: string;
      slug: string;
      categoryIds: string[];
      elevationMeters: number | null;
      historicalOverview: string;
      architectureNotes: string | null;
      operatingHours: unknown;
      entryTariffs: unknown;
      isBookingEnabled: boolean;
      linkedExperienceId: string | null;
      averageRating: { toNumber?: () => number } | number;
      reviewCount: number;
      landmark3D?: {
        id: string;
        placeId: string;
        name: string;
        modelAssetUri: string;
        renderScale: { toNumber?: () => number } | number;
        boundingRadiusPx: number;
      } | null;
      createdAt: Date;
      updatedAt: Date;
    },
    talukaName?: string,
    districtName?: string,
    stateName?: string,
  ): PlaceEntity {
    const avgRating =
      typeof raw.averageRating === 'number'
        ? raw.averageRating
        : raw.averageRating?.toNumber
          ? raw.averageRating.toNumber()
          : Number(raw.averageRating) || 0;

    return {
      id: raw.id,
      talukaId: raw.talukaId,
      name: raw.name,
      slug: raw.slug,
      categoryIds: raw.categoryIds || [],
      coordinates: this.extractCoords(raw),
      elevationMeters: raw.elevationMeters,
      historicalOverview: raw.historicalOverview,
      architectureNotes: raw.architectureNotes,
      operatingHours: raw.operatingHours as Record<string, string> | null,
      entryTariffs: raw.entryTariffs as Record<string, number> | null,
      isBookingEnabled: raw.isBookingEnabled,
      linkedExperienceId: raw.linkedExperienceId,
      averageRating: avgRating,
      reviewCount: raw.reviewCount,
      landmark3D: raw.landmark3D
        ? {
            id: raw.landmark3D.id,
            placeId: raw.landmark3D.placeId,
            name: raw.landmark3D.name,
            modelAssetUri: raw.landmark3D.modelAssetUri,
            renderScale:
              typeof raw.landmark3D.renderScale === 'number'
                ? raw.landmark3D.renderScale
                : raw.landmark3D.renderScale?.toNumber
                  ? raw.landmark3D.renderScale.toNumber()
                  : Number(raw.landmark3D.renderScale) || 1.0,
            boundingRadiusPx: raw.landmark3D.boundingRadiusPx,
          }
        : null,
      talukaName,
      districtName,
      stateName,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    };
  }
}
