// Explore Bharat Safar — Discovery Engine Service Unit Test Suite
// Reference: EBS-DOC-24-TESTING, EBS-BLU-41-BDE, EBS-DOC-09-API
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DiscoveryService } from './discovery.service';
import { DiscoveryCacheService } from './discovery-cache.service';
import { prisma } from '@ebs/database';
import { NotFoundException } from '@nestjs/common';
import { DiscoverySearchLevel } from './dto/search-discovery.dto';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/explore_bharat_safar?schema=public';
}

describe('DiscoveryService — Bharat Discovery Engine', () => {
  let service: DiscoveryService;
  let cacheService: DiscoveryCacheService;

  beforeEach(() => {
    cacheService = new DiscoveryCacheService();
    service = new DiscoveryService(cacheService);
  });

  describe('States Directory & Hierarchical Dossiers', () => {
    it('should retrieve all states with district counts and cache the result', async () => {
      const originalFindMany = prisma.state.findMany;
      prisma.state.findMany = (async () => [
        {
          id: 'state-mh-1',
          name: 'Maharashtra',
          isoCode: 'IN-MH',
          capital: 'Mumbai',
          officialLanguages: ['Marathi'],
          overviewDossier: { tagline: 'Gateway to the Sahyadris' },
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          deletedAt: null,
          _count: { districts: 36 },
        },
        {
          id: 'state-rj-1',
          name: 'Rajasthan',
          isoCode: 'IN-RJ',
          capital: 'Jaipur',
          officialLanguages: ['Hindi', 'Rajasthani'],
          overviewDossier: { tagline: 'Land of Kings' },
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          deletedAt: null,
          _count: { districts: 50 },
        },
      ]) as unknown as typeof prisma.state.findMany;

      try {
        const states = await service.getStates();
        assert.equal(states.length, 2);
        const firstState = states[0];
        assert.ok(firstState);
        assert.equal(firstState.isoCode, 'IN-MH');
        assert.equal(firstState.districtsCount, 36);

        // Verify it was cached
        const cached = await cacheService.get(cacheService.getStatesKey());
        assert.ok(cached);
      } finally {
        prisma.state.findMany = originalFindMany;
      }
    });

    it('should retrieve state by ID or ISO code with constituent districts', async () => {
      const originalFindFirst = prisma.state.findFirst;
      prisma.state.findFirst = (async () => ({
        id: 'state-mh-1',
        name: 'Maharashtra',
        isoCode: 'IN-MH',
        capital: 'Mumbai',
        officialLanguages: ['Marathi'],
        overviewDossier: { climate: 'Tropical Monsoon' },
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        districts: [
          {
            id: 'dist-pune-1',
            name: 'Pune',
            headquarters: 'Pune',
            emergencyDirectory: { police: '112' },
            _count: { talukas: 14 },
          },
          {
            id: 'dist-raigad-1',
            name: 'Raigad',
            headquarters: 'Alibag',
            emergencyDirectory: { police: '112' },
            _count: { talukas: 15 },
          },
        ],
      })) as unknown as typeof prisma.state.findFirst;

      try {
        const state = await service.getStateById('IN-MH');
        assert.equal(state.name, 'Maharashtra');
        assert.equal(state.districts.length, 2);
        const firstDist = state.districts[0];
        assert.ok(firstDist);
        assert.equal(firstDist.name, 'Pune');
        assert.equal(firstDist.talukasCount, 14);
      } finally {
        prisma.state.findFirst = originalFindFirst;
      }
    });

    it('should throw NotFoundException when state does not exist', async () => {
      const originalFindFirst = prisma.state.findFirst;
      prisma.state.findFirst = (async () => null) as unknown as typeof prisma.state.findFirst;

      try {
        await assert.rejects(
          async () => {
            await service.getStateById('NON_EXISTENT_STATE');
          },
          (err: unknown) => err instanceof NotFoundException,
        );
      } finally {
        prisma.state.findFirst = originalFindFirst;
      }
    });
  });

  describe('District & Taluka Hierarchical Navigation', () => {
    it('should retrieve district with talukas and emergency directory', async () => {
      const originalFindFirst = prisma.district.findFirst;
      prisma.district.findFirst = (async () => ({
        id: 'dist-raigad-1',
        stateId: 'state-mh-1',
        name: 'Raigad',
        headquarters: 'Alibag',
        emergencyDirectory: { disasterManagement: '+912141222001' },
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        deletedAt: null,
        state: { id: 'state-mh-1', name: 'Maharashtra', isoCode: 'IN-MH', capital: 'Mumbai' },
        talukas: [
          { id: 'tal-mahad-1', name: 'Mahad', _count: { places: 12 } },
          { id: 'tal-alibag-1', name: 'Alibag', _count: { places: 8 } },
        ],
      })) as unknown as typeof prisma.district.findFirst;

      try {
        const district = await service.getDistrictById('dist-raigad-1');
        assert.equal(district.name, 'Raigad');
        assert.equal(district.stateName, 'Maharashtra');
        assert.equal(district.talukas.length, 2);
        const firstTaluka = district.talukas[0];
        assert.ok(firstTaluka);
        assert.equal(firstTaluka.placesCount, 12);
      } finally {
        prisma.district.findFirst = originalFindFirst;
      }
    });

    it('should retrieve taluka with constituent places and 3D landmarks', async () => {
      const originalFindFirst = prisma.taluka.findFirst;
      prisma.taluka.findFirst = (async () => ({
        id: 'tal-mahad-1',
        districtId: 'dist-raigad-1',
        name: 'Mahad',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        deletedAt: null,
        district: {
          name: 'Raigad',
          state: { name: 'Maharashtra' },
        },
        places: [
          {
            id: 'place-raigad-1',
            talukaId: 'tal-mahad-1',
            name: 'Raigad Fort',
            slug: 'raigad-fort',
            categoryIds: ['cat-fort-1'],
            elevationMeters: 820,
            historicalOverview: 'Capital of the Maratha Empire under Chhatrapati Shivaji Maharaj.',
            architectureNotes: 'Hill bastion with Maha Darwaja, Nagarkhana, and Rajsabha.',
            operatingHours: { open: '06:00', close: '18:00' },
            entryTariffs: { adult: 25 },
            isBookingEnabled: true,
            linkedExperienceId: 'exp-raigad-trek-1',
            averageRating: 4.95,
            reviewCount: 3420,
            landmark3D: {
              id: 'lm-raigad-1',
              placeId: 'place-raigad-1',
              name: 'Raigad Fort Bastion',
              modelAssetUri: 'https://cdn.explorebharatsafar.in/models/raigad.glb',
              renderScale: 1.25,
              boundingRadiusPx: 64,
            },
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
          },
        ],
      })) as unknown as typeof prisma.taluka.findFirst;

      try {
        const taluka = await service.getTalukaById('tal-mahad-1');
        assert.equal(taluka.name, 'Mahad');
        assert.equal(taluka.districtName, 'Raigad');
        assert.equal(taluka.places.length, 1);
        const firstPlace = taluka.places[0];
        assert.ok(firstPlace);
        assert.equal(firstPlace.name, 'Raigad Fort');
        assert.equal(firstPlace.isBookingEnabled, true);
        assert.equal(firstPlace.landmark3D?.renderScale, 1.25);
      } finally {
        prisma.taluka.findFirst = originalFindFirst;
      }
    });
  });

  describe('Place Dossier & Booking CTA Governance', () => {
    it('should retrieve place monograph with complete metadata', async () => {
      const originalFindFirst = prisma.place.findFirst;
      prisma.place.findFirst = (async () => ({
        id: 'place-kailasa-1',
        talukaId: 'tal-khuldabad-1',
        name: 'Kailasa Temple',
        slug: 'kailasa-temple-ellora',
        categoryIds: ['cat-temple-1', 'cat-unesco-1'],
        elevationMeters: 600,
        historicalOverview:
          'Monolithic rock-cut temple carved from top to bottom by Rashtrakuta Dynasty.',
        architectureNotes: 'Dravidian monolithic architecture (Cave 16).',
        operatingHours: { open: '09:00', close: '17:30' },
        entryTariffs: { adult: 40 },
        isBookingEnabled: false, // Booking CTA disabled
        linkedExperienceId: null,
        averageRating: 4.98,
        reviewCount: 5200,
        landmark3D: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        taluka: {
          name: 'Khuldabad',
          district: {
            name: 'Chhatrapati Sambhajinagar',
            state: { name: 'Maharashtra' },
          },
        },
      })) as unknown as typeof prisma.place.findFirst;

      try {
        const place = await service.getPlaceById('kailasa-temple-ellora');
        assert.equal(place.name, 'Kailasa Temple');
        assert.equal(place.isBookingEnabled, false);
        assert.equal(place.talukaName, 'Khuldabad');
        assert.equal(place.districtName, 'Chhatrapati Sambhajinagar');
        assert.equal(place.stateName, 'Maharashtra');
      } finally {
        prisma.place.findFirst = originalFindFirst;
      }
    });
  });

  describe('Isolated Section 1 Spatial Search (Domain Quarantine)', () => {
    it('should match states, districts, and places while preserving Section 1 boundaries', async () => {
      const originalFindManyStates = prisma.state.findMany;
      const originalFindManyDistricts = prisma.district.findMany;
      const originalFindManyTalukas = prisma.taluka.findMany;
      const originalFindManyPlaces = prisma.place.findMany;

      prisma.state.findMany = (async () => [
        {
          id: 'state-mh-1',
          name: 'Maharashtra',
          isoCode: 'IN-MH',
          capital: 'Mumbai',
        },
      ]) as unknown as typeof prisma.state.findMany;

      prisma.district.findMany = (async () => [
        {
          id: 'dist-raigad-1',
          name: 'Raigad',
          headquarters: 'Alibag',
          state: { name: 'Maharashtra', isoCode: 'IN-MH' },
        },
      ]) as unknown as typeof prisma.district.findMany;

      prisma.taluka.findMany = (async () => []) as unknown as typeof prisma.taluka.findMany;

      prisma.place.findMany = (async () => [
        {
          id: 'place-raigad-1',
          talukaId: 'tal-mahad-1',
          name: 'Raigad Fort',
          slug: 'raigad-fort',
          categoryIds: [],
          historicalOverview: 'Maratha capital fort',
          isBookingEnabled: true,
          taluka: {
            name: 'Mahad',
            district: {
              name: 'Raigad',
              state: { name: 'Maharashtra' },
            },
          },
        },
      ]) as unknown as typeof prisma.place.findMany;

      try {
        const response = await service.searchDiscovery({
          q: 'Raigad',
          level: DiscoverySearchLevel.ALL,
        });

        assert.ok(response.results.length >= 2);
        const districtResult = response.results.find(r => r.type === 'district');
        const placeResult = response.results.find(r => r.type === 'place');

        assert.ok(districtResult, 'District must be in search results');
        assert.ok(placeResult, 'Place must be in search results');
        assert.equal(placeResult?.name, 'Raigad Fort');
      } finally {
        prisma.state.findMany = originalFindManyStates;
        prisma.district.findMany = originalFindManyDistricts;
        prisma.taluka.findMany = originalFindManyTalukas;
        prisma.place.findMany = originalFindManyPlaces;
      }
    });

    it('should return empty matches for empty or 1-char query', async () => {
      const response = await service.searchDiscovery({
        q: 'a',
      });
      assert.equal(response.totalMatches, 0);
      assert.equal(response.results.length, 0);
    });
  });

  describe('Categories & 3D Landmark Catalog', () => {
    it('should list categories and cache', async () => {
      const originalFindMany = prisma.category.findMany;
      prisma.category.findMany = (async () => [
        { id: 'cat-1', slug: 'fort', name: 'Fort & Citadel', iconToken: 'shield' },
        { id: 'cat-2', slug: 'temple', name: 'Sacred Temple', iconToken: 'landmark' },
      ]) as unknown as typeof prisma.category.findMany;

      try {
        const cats = await service.getCategories();
        assert.equal(cats.length, 2);
        const firstCat = cats[0];
        assert.ok(firstCat);
        assert.equal(firstCat.slug, 'fort');
      } finally {
        prisma.category.findMany = originalFindMany;
      }
    });

    it('should list 3D landmark models with spatial metadata', async () => {
      const originalFindMany = prisma.landmark3D.findMany;
      prisma.landmark3D.findMany = (async () => [
        {
          id: 'lm-1',
          placeId: 'place-1',
          name: 'Hampi Stone Chariot',
          modelAssetUri: 'https://cdn.explorebharatsafar.in/models/hampi.glb',
          renderScale: 1.0,
          boundingRadiusPx: 48,
          place: {
            id: 'place-1',
            name: 'Stone Chariot',
            slug: 'stone-chariot-hampi',
            isBookingEnabled: false,
            taluka: {
              name: 'Hospet',
              district: {
                name: 'Vijayanagara',
                state: { name: 'Karnataka' },
              },
            },
          },
        },
      ]) as unknown as typeof prisma.landmark3D.findMany;

      try {
        const landmarks = await service.getLandmarks3D();
        assert.equal(landmarks.length, 1);
        const firstLm = landmarks[0];
        assert.ok(firstLm);
        assert.equal(firstLm.name, 'Hampi Stone Chariot');
        assert.equal(firstLm.place.name, 'Stone Chariot');
      } finally {
        prisma.landmark3D.findMany = originalFindMany;
      }
    });
  });

  describe('Spatial Queries & GeoJSON Feature Collections', () => {
    it('should query nearby places with Haversine distance and category filter', async () => {
      const originalFindMany = prisma.place.findMany;
      const originalFindUniqueCat = prisma.category.findUnique;

      prisma.category.findUnique = (async () => ({
        id: 'cat-fort-1',
        slug: 'fort',
        name: 'Fort',
        iconToken: 'fort',
        parentId: null,
      })) as unknown as typeof prisma.category.findUnique;

      prisma.place.findMany = (async () => [
        {
          id: 'p-sinhagad',
          talukaId: 't1',
          name: 'Sinhagad Fort',
          slug: 'sinhagad-fort',
          categoryIds: ['cat-fort-1'],
          latitude: 18.3663,
          longitude: 73.7558,
          historicalOverview: 'Historic fort',
          isBookingEnabled: false,
          averageRating: 4.8,
          reviewCount: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
          taluka: { name: 'Haveli', district: { name: 'Pune', state: { name: 'Maharashtra' } } },
        },
        {
          id: 'p-delhi',
          talukaId: 't2',
          name: 'Red Fort',
          slug: 'red-fort',
          categoryIds: ['cat-fort-1'],
          latitude: 28.6562,
          longitude: 77.241,
          historicalOverview: 'Delhi fort',
          isBookingEnabled: false,
          averageRating: 4.7,
          reviewCount: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
          taluka: { name: 'Old Delhi', district: { name: 'Delhi', state: { name: 'Delhi' } } },
        },
      ]) as unknown as typeof prisma.place.findMany;

      try {
        const nearby = await service.getNearbyPlaces({
          latitude: 18.5204,
          longitude: 73.8567,
          radiusKm: 50,
          category: 'fort',
        });

        assert.equal(nearby.length, 1);
        const firstNearby = nearby[0];
        assert.ok(firstNearby);
        assert.equal(firstNearby.name, 'Sinhagad Fort');
        const distanceKm = firstNearby.distanceKm ?? 0;
        assert.ok(distanceKm < 30);
      } finally {
        prisma.place.findMany = originalFindMany;
        prisma.category.findUnique = originalFindUniqueCat;
      }
    });

    it('should query places within bounding box', async () => {
      const originalFindMany = prisma.place.findMany;
      prisma.place.findMany = (async () => [
        {
          id: 'p-raigad',
          talukaId: 't1',
          name: 'Raigad Fort',
          slug: 'raigad-fort',
          categoryIds: [],
          latitude: 18.2345,
          longitude: 73.4421,
          historicalOverview: 'Fort',
          isBookingEnabled: true,
          averageRating: 4.9,
          reviewCount: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
          taluka: { name: 'Mahad', district: { name: 'Raigad', state: { name: 'Maharashtra' } } },
        },
      ]) as unknown as typeof prisma.place.findMany;

      try {
        const inBounds = await service.getPlacesWithinBounds({
          minLat: 18.0,
          minLng: 73.0,
          maxLat: 19.0,
          maxLng: 74.0,
        });

        assert.equal(inBounds.length, 1);
        const firstInBounds = inBounds[0];
        assert.ok(firstInBounds);
        assert.equal(firstInBounds.name, 'Raigad Fort');
      } finally {
        prisma.place.findMany = originalFindMany;
      }
    });

    it('should generate Survey of India GeoJSON Feature Collection for States', async () => {
      const originalFindMany = prisma.state.findMany;
      prisma.state.findMany = (async () => [
        {
          id: 'state-mh-1',
          name: 'Maharashtra',
          isoCode: 'IN-MH',
          capital: 'Mumbai',
          officialLanguages: ['Marathi'],
          overviewDossier: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { districts: 36 },
        },
      ]) as unknown as typeof prisma.state.findMany;

      try {
        const geojson = await service.getStatesGeoJson();
        assert.equal(geojson.type, 'FeatureCollection');
        assert.equal(geojson.features.length, 1);
        const firstFeature = geojson.features[0];
        assert.ok(firstFeature);
        assert.equal(firstFeature.properties.name, 'Maharashtra');
        assert.equal(firstFeature.geometry.type, 'Point');
      } finally {
        prisma.state.findMany = originalFindMany;
      }
    });
  });
});
