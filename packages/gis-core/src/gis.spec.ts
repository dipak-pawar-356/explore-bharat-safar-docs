// Explore Bharat Safar — Geospatial Math & Algorithms Test Suite
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHaversineDistanceKm,
  calculateBearing,
  calculateBoundingBox,
  isPointInBoundingBox,
  isPointInPolygon,
  simplifyDouglasPeucker,
  wgs84ToWebMercator,
  webMercatorToWgs84,
  filterPointsWithinRadius,
  filterPointsWithinBoundingBox,
  sortByProximity,
  calculateSpatialRelevanceScore,
  calculateTrigramSimilarity,
  clusterPoints,
  calculateSpiralExpansionOffsets,
  getClusterRadiusForZoom,
  isWithinSovereignBharatBounds,
  verifyAllTerritoriesPresent,
  OFFICIAL_BHARAT_TERRITORIES,
  BHARAT_SOVEREIGN_BOUNDING_BOX,
} from './index';

describe('Haversine Distance & Bearing', () => {
  // Mumbai coordinates
  const mumbai = { latitude: 18.922, longitude: 72.8346 };
  // Pune coordinates
  const pune = { latitude: 18.5204, longitude: 73.8567 };

  it('should calculate great circle distance between Mumbai and Pune accurately (~120km)', () => {
    const distanceKm = calculateHaversineDistanceKm(mumbai, pune);
    assert.ok(
      distanceKm > 110 && distanceKm < 130,
      `Distance ${distanceKm}km is in expected range`,
    );
  });

  it('should return 0 distance for identical coordinates', () => {
    const distanceKm = calculateHaversineDistanceKm(mumbai, mumbai);
    assert.equal(distanceKm, 0);
  });

  it('should calculate compass bearing in 0-360 range', () => {
    const bearing = calculateBearing(mumbai, pune);
    assert.ok(bearing >= 0 && bearing <= 360, `Bearing ${bearing}° is in valid range`);
  });
});

describe('Bounding Box & Point-in-Polygon', () => {
  const points = [
    { latitude: 18.0, longitude: 72.0 },
    { latitude: 19.5, longitude: 74.0 },
    { latitude: 17.5, longitude: 73.5 },
  ];

  it('should calculate exact bounding box', () => {
    const bbox = calculateBoundingBox(points);
    assert.equal(bbox.minLat, 17.5);
    assert.equal(bbox.maxLat, 19.5);
    assert.equal(bbox.minLng, 72.0);
    assert.equal(bbox.maxLng, 74.0);
  });

  it('should correctly test point within bounding box', () => {
    const bbox = calculateBoundingBox(points);
    assert.equal(isPointInBoundingBox({ latitude: 18.5, longitude: 73.0 }, bbox), true);
    assert.equal(isPointInBoundingBox({ latitude: 20.0, longitude: 73.0 }, bbox), false);
  });

  it('should accurately test point-in-polygon using ray-casting', () => {
    const squarePolygon = [
      { latitude: 10.0, longitude: 10.0 },
      { latitude: 10.0, longitude: 20.0 },
      { latitude: 20.0, longitude: 20.0 },
      { latitude: 20.0, longitude: 10.0 },
    ];

    assert.equal(isPointInPolygon({ latitude: 15.0, longitude: 15.0 }, squarePolygon), true);
    assert.equal(isPointInPolygon({ latitude: 25.0, longitude: 25.0 }, squarePolygon), false);
  });
});

describe('Douglas-Peucker Simplification', () => {
  it('should preserve endpoints and reduce intermediate collinear points', () => {
    const line = [
      { latitude: 18.0, longitude: 72.0 },
      { latitude: 18.0001, longitude: 72.0001 },
      { latitude: 18.0002, longitude: 72.0002 },
      { latitude: 19.0, longitude: 73.0 },
    ];

    const simplified = simplifyDouglasPeucker(line, 1.0); // 1km tolerance
    assert.ok(simplified.length <= line.length);
    assert.equal(simplified[0]!.latitude, line[0]!.latitude);
    assert.equal(simplified[simplified.length - 1]!.latitude, line[line.length - 1]!.latitude);
  });
});

describe('WGS84 <-> Web Mercator Projections', () => {
  it('should convert WGS84 coordinates to Mercator and back within micro-precision', () => {
    const lat = 18.922;
    const lng = 72.8346;

    const [x, y] = wgs84ToWebMercator(lat, lng);
    assert.ok(typeof x === 'number' && typeof y === 'number');

    const [convertedLat, convertedLng] = webMercatorToWgs84(x, y);
    assert.ok(Math.abs(convertedLat - lat) < 0.00001, 'Latitude roundtrip matches');
    assert.ok(Math.abs(convertedLng - lng) < 0.00001, 'Longitude roundtrip matches');
  });
});

describe('Spatial Search & Proximity Filtering', () => {
  const places = [
    { id: 'raigad', latitude: 18.2345, longitude: 73.4421, name: 'Raigad Fort' },
    { id: 'pratapgad', latitude: 17.9333, longitude: 73.5833, name: 'Pratapgad Fort' },
    { id: 'sinhagad', latitude: 18.3663, longitude: 73.7558, name: 'Sinhagad Fort' },
    { id: 'kailasa', latitude: 20.0238, longitude: 75.1793, name: 'Kailasa Temple' },
  ];

  it('should filter points within radial distance sorted by nearest first', () => {
    // Reference: Pune coordinates (18.5204, 73.8567)
    const pune = { latitude: 18.5204, longitude: 73.8567 };
    const nearby = filterPointsWithinRadius(places, pune, 70); // 70km radius

    assert.ok(nearby.length >= 2, 'Should find Sinhagad and Raigad/Pratapgad within 70km');
    assert.equal(nearby[0]!.item.id, 'sinhagad', 'Sinhagad should be closest to Pune (~20km)');
    assert.ok(nearby[0]!.distanceKm < 30);
  });

  it('should filter points within bounding box', () => {
    const bbox = {
      minLat: 17.5,
      minLng: 73.0,
      maxLat: 18.5,
      maxLng: 74.0,
    };

    const contained = filterPointsWithinBoundingBox(places, bbox);
    const ids = contained.map(p => p.id);
    assert.ok(ids.includes('raigad'));
    assert.ok(ids.includes('pratapgad'));
    assert.ok(ids.includes('sinhagad'));
    assert.ok(!ids.includes('kailasa')); // Kailasa is at lat 20.02
  });

  it('should sort items by proximity to anchor', () => {
    const anchor = { latitude: 18.2345, longitude: 73.4421 }; // Raigad
    const sorted = sortByProximity(places, anchor);
    assert.equal(sorted[0]!.item.id, 'raigad');
    assert.equal(sorted[0]!.distanceKm, 0);
  });

  it('should calculate spatial relevance score based on trigram and proximity weighting', () => {
    const scoreClose = calculateSpatialRelevanceScore({
      textSimilarity: 0.9,
      fullTextRank: 0.8,
      distanceKm: 10,
      maxRadiusKm: 100,
    });

    const scoreFar = calculateSpatialRelevanceScore({
      textSimilarity: 0.9,
      fullTextRank: 0.8,
      distanceKm: 90,
      maxRadiusKm: 100,
    });

    assert.ok(scoreClose > scoreFar, 'Closer entity should have higher relevance score');
  });

  it('should calculate string trigram similarity correctly', () => {
    const simExact = calculateTrigramSimilarity('Raigad Fort', 'Raigad Fort');
    assert.equal(simExact, 1.0);

    const simTypo = calculateTrigramSimilarity('Harishchandragad', 'Hrishchandragad');
    assert.ok(simTypo > 0.7, 'Single typo should maintain high trigram similarity');

    const simDifferent = calculateTrigramSimilarity('Taj Mahal', 'Kailasa Temple');
    assert.ok(simDifferent < 0.2, 'Completely different strings should have low similarity');
  });

  it('should handle empty strings and zero trigrams without NaN or throw', () => {
    assert.equal(calculateTrigramSimilarity('', ''), 0.0);
    assert.equal(calculateTrigramSimilarity('a', ''), 0.0);
  });
});

describe('Marker Clustering Algorithm (Supercluster)', () => {
  const points = [
    { id: 'p1', latitude: 18.52, longitude: 73.85 },
    { id: 'p2', latitude: 18.53, longitude: 73.86 },
    { id: 'p3', latitude: 18.54, longitude: 73.84 },
    { id: 'p4', latitude: 28.61, longitude: 77.2 }, // Delhi (far away)
  ];

  it('should group nearby points into cluster and leave isolated points unclustered', () => {
    const clusters = clusterPoints(points, { clusterRadiusKm: 10 });
    assert.equal(
      clusters.length,
      2,
      'Should create 1 cluster for Pune and 1 single point for Delhi',
    );

    const puneCluster = clusters.find(c => c.isCluster);
    assert.ok(puneCluster && puneCluster.isCluster);
    if (puneCluster && puneCluster.isCluster) {
      assert.equal(puneCluster.count, 3);
      assert.ok(puneCluster.boundingBox);
    }

    const delhiPoint = clusters.find(c => !c.isCluster);
    assert.ok(delhiPoint && !delhiPoint.isCluster);
    if (delhiPoint && !delhiPoint.isCluster) {
      assert.equal(delhiPoint.point.id, 'p4');
    }
  });

  it('should dynamically derive cluster radius based on zoom level', () => {
    assert.equal(getClusterRadiusForZoom(4), 250);
    assert.equal(getClusterRadiusForZoom(8), 40);
    assert.equal(getClusterRadiusForZoom(12), 4);
  });

  it('should calculate radial spiral expansion coordinates for cluster click', () => {
    const center = { latitude: 18.52, longitude: 73.85 };
    const expanded = calculateSpiralExpansionOffsets(center, 4, 1.0);
    assert.equal(expanded.length, 4);
    for (const pt of expanded) {
      assert.ok(typeof pt.latitude === 'number' && !isNaN(pt.latitude));
      assert.ok(typeof pt.longitude === 'number' && !isNaN(pt.longitude));
    }
  });

  it('should handle polar coordinates in spiral expansion without division by zero', () => {
    const northPole = { latitude: 90, longitude: 0 };
    const expanded = calculateSpiralExpansionOffsets(northPole, 4, 1.0);
    assert.equal(expanded.length, 4);
    for (const pt of expanded) {
      assert.ok(!isNaN(pt.latitude));
      assert.ok(!isNaN(pt.longitude));
    }
  });
});

describe('Survey of India (SOI) Sovereign Cartographic Compliance', () => {
  it('should contain all 28 States and 8 Union Territories in official catalog', () => {
    assert.equal(OFFICIAL_BHARAT_TERRITORIES.length, 36);

    const states = OFFICIAL_BHARAT_TERRITORIES.filter(t => t.type === 'STATE');
    const uts = OFFICIAL_BHARAT_TERRITORIES.filter(t => t.type === 'UNION_TERRITORY');

    assert.equal(states.length, 28, 'Must include exactly 28 states');
    assert.equal(uts.length, 8, 'Must include exactly 8 Union Territories');
  });

  it('should include J&K, Ladakh, Arunachal Pradesh, Andaman & Nicobar, and Lakshadweep', () => {
    const isoCodes = OFFICIAL_BHARAT_TERRITORIES.map(t => t.isoCode);
    assert.ok(isoCodes.includes('IN-JK'), 'Jammu and Kashmir must be present');
    assert.ok(isoCodes.includes('IN-LA'), 'Ladakh must be present');
    assert.ok(isoCodes.includes('IN-AR'), 'Arunachal Pradesh must be present');
    assert.ok(isoCodes.includes('IN-AN'), 'Andaman and Nicobar must be present');
    assert.ok(isoCodes.includes('IN-LD'), 'Lakshadweep must be present');
  });

  it('should validate coordinates within sovereign Bharat extents', () => {
    // Siachen Glacier (Ladakh)
    assert.equal(isWithinSovereignBharatBounds({ latitude: 35.42, longitude: 77.1 }), true);
    // Indira Point (Great Nicobar)
    assert.equal(isWithinSovereignBharatBounds({ latitude: 6.75, longitude: 93.8 }), true);
    // Kibithu (Arunachal Pradesh)
    assert.equal(isWithinSovereignBharatBounds({ latitude: 28.29, longitude: 97.01 }), true);
    // Guhar Moti (Gujarat)
    assert.equal(isWithinSovereignBharatBounds({ latitude: 23.71, longitude: 68.56 }), true);

    // Coordinate outside Bharat (London)
    assert.equal(isWithinSovereignBharatBounds({ latitude: 51.5, longitude: -0.12 }), false);
  });

  it('should verify dataset completeness against official 36 territories', () => {
    const allCodes = OFFICIAL_BHARAT_TERRITORIES.map(t => t.isoCode);
    const verification = verifyAllTerritoriesPresent(allCodes);
    assert.equal(verification.isComplete, true);
    assert.equal(verification.totalFound, 36);

    const incomplete = verifyAllTerritoriesPresent(['IN-MH', 'IN-RJ', 'IN-KA']);
    assert.equal(incomplete.isComplete, false);
    assert.equal(incomplete.totalFound, 3);
    assert.equal(incomplete.missingCodes.length, 33);
  });
});
