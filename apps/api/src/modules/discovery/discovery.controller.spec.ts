// Explore Bharat Safar — Discovery Controller Unit Test Suite
// Reference: EBS-DOC-24-TESTING, EBS-DOC-09-API
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DiscoveryController } from './discovery.controller';
import type { DiscoveryService } from './discovery.service';
import { DiscoverySearchLevel } from './dto/search-discovery.dto';

describe('DiscoveryController — API Layer', () => {
  let controller: DiscoveryController;
  let mockDiscoveryService: Partial<DiscoveryService>;

  beforeEach(() => {
    mockDiscoveryService = {
      getStates: async () => [
        {
          id: 'state-mh',
          name: 'Maharashtra',
          isoCode: 'IN-MH',
          capital: 'Mumbai',
          officialLanguages: ['Marathi'],
        },
      ],
      getStateById: async (id: string) => ({
        id,
        name: 'Maharashtra',
        isoCode: 'IN-MH',
        capital: 'Mumbai',
        officialLanguages: ['Marathi'],
        districts: [],
      }),
      getDistrictById: async (id: string) => ({
        id,
        stateId: 'state-1',
        stateName: 'Maharashtra',
        name: 'Pune',
        headquarters: 'Pune',
        talukas: [],
      }),
      getTalukaById: async (id: string) => ({
        id,
        districtId: 'dist-1',
        name: 'Haveli',
        places: [],
      }),
      getCategories: async () => [
        { id: 'c1', slug: 'fort', name: 'Fort & Citadel', iconToken: 'fort' },
      ],
      getLandmarks3D: async () => [],
      getPlaces: async () => ({
        items: [],
        pagination: {
          page: 1,
          limit: 20,
          totalRecords: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }),
      getPlaceById: async (id: string) => ({
        id,
        talukaId: 't1',
        name: 'Raigad Fort',
        slug: 'raigad-fort',
        categoryIds: [],
        coordinates: { latitude: 18.234, longitude: 73.442 },
        historicalOverview: 'Historic fort',
        isBookingEnabled: false,
        averageRating: 4.9,
        reviewCount: 120,
      }),
      searchDiscovery: async (dto: { q: string }) => ({
        query: dto.q,
        totalMatches: 1,
        results: [
          {
            id: 'p1',
            name: 'Raigad Fort',
            type: 'place' as const,
            locationHierarchy: { state: 'Maharashtra' },
          },
        ],
      }),
      getStatesGeoJson: async () => ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [78.96, 20.59] },
            properties: { id: 's1', name: 'Maharashtra' },
          },
        ],
      }),
      getPlacesGeoJson: async () => ({
        type: 'FeatureCollection',
        features: [],
      }),
    };

    controller = new DiscoveryController(mockDiscoveryService as DiscoveryService);
  });

  it('should delegate getStates to service', async () => {
    const states = await controller.getStates();
    assert.equal(states.length, 1);
    const firstState = states[0];
    assert.ok(firstState);
    assert.equal(firstState.name, 'Maharashtra');
  });

  it('should delegate getStateById to service', async () => {
    const state = await controller.getStateById('IN-MH');
    assert.equal(state.name, 'Maharashtra');
  });

  it('should delegate search to service', async () => {
    const searchRes = await controller.search({
      q: 'Raigad',
      level: DiscoverySearchLevel.ALL,
    });
    assert.equal(searchRes.query, 'Raigad');
    assert.equal(searchRes.results.length, 1);
  });

  it('should return GeoJSON FeatureCollection for states', async () => {
    const geojson = await controller.getStatesGeoJson();
    assert.equal(geojson.type, 'FeatureCollection');
    assert.equal(geojson.features.length, 1);
  });

  it('should serve vector tile endpoint', async () => {
    const tile = await controller.getTile('5', '12', '14');
    assert.equal(tile.type, 'FeatureCollection');
  });
});
