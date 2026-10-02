// Explore Bharat Safar — Spatial Search & Proximity Filtering Algorithms
// Reference: EBS-BLU-41-BDE Section 7.1, EBS-DOC-16-MAP, EBS-DOC-18-SEARCH
import { calculateHaversineDistanceKm, LatLngPoint } from './haversine';
import { isPointInBoundingBox, BoundingBoxCoordinates } from './bounding-box';

export interface SpatialItem<T = unknown> {
  id: string;
  latitude: number;
  longitude: number;
  data?: T;
}

export interface SpatialSearchResultItem<T = unknown> {
  item: SpatialItem<T>;
  distanceKm: number;
  relevanceScore?: number;
}

/**
 * Filters a collection of spatial items to those situated within a specific radial distance (km)
 * from a target reference coordinate.
 */
export function filterPointsWithinRadius<T = unknown>(
  items: readonly SpatialItem<T>[],
  center: LatLngPoint,
  radiusKm: number,
): SpatialSearchResultItem<T>[] {
  if (radiusKm <= 0) {
    return [];
  }

  const results: SpatialSearchResultItem<T>[] = [];

  for (const item of items) {
    const distanceKm = calculateHaversineDistanceKm(center, {
      latitude: item.latitude,
      longitude: item.longitude,
    });

    if (distanceKm <= radiusKm) {
      results.push({ item, distanceKm });
    }
  }

  // Sort ascending by distance (nearest first)
  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Filters spatial items situated within a defined bounding box.
 */
export function filterPointsWithinBoundingBox<T = unknown>(
  items: readonly SpatialItem<T>[],
  bbox: BoundingBoxCoordinates,
): SpatialItem<T>[] {
  return items.filter(item =>
    isPointInBoundingBox(
      {
        latitude: item.latitude,
        longitude: item.longitude,
      },
      bbox,
    ),
  );
}

/**
 * Sorts items by geographic proximity to an anchor point.
 */
export function sortByProximity<T = unknown>(
  items: readonly SpatialItem<T>[],
  anchor: LatLngPoint,
): SpatialSearchResultItem<T>[] {
  return items
    .map(item => ({
      item,
      distanceKm: calculateHaversineDistanceKm(anchor, {
        latitude: item.latitude,
        longitude: item.longitude,
      }),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Calculates unified spatial relevance score according to EBS-BLU-41-BDE Section 7.1:
 * Score = alpha * textSimilarity + beta * descriptionRank + gamma * (1 - (distance / maxDistance))
 */
export function calculateSpatialRelevanceScore(options: {
  textSimilarity: number; // 0.0 - 1.0 (trigram match)
  fullTextRank?: number; // 0.0 - 1.0 (tsvector rank)
  distanceKm?: number;
  maxRadiusKm?: number;
  alpha?: number; // default 0.50
  beta?: number; // default 0.25
  gamma?: number; // default 0.25
}): number {
  const alpha = options.alpha ?? 0.5;
  const beta = options.beta ?? 0.25;
  const gamma = options.gamma ?? 0.25;

  const sim = Math.max(0, Math.min(1, options.textSimilarity));
  const rank = Math.max(0, Math.min(1, options.fullTextRank ?? 0.5));

  let proximityFactor = 0.5;
  if (
    typeof options.distanceKm === 'number' &&
    typeof options.maxRadiusKm === 'number' &&
    options.maxRadiusKm > 0
  ) {
    const normDist = Math.min(1, options.distanceKm / options.maxRadiusKm);
    proximityFactor = 1 - normDist;
  }

  const score = alpha * sim + beta * rank + gamma * proximityFactor;
  return Number(score.toFixed(4));
}

/**
 * Calculates string trigram similarity (Sørensen–Dice coefficient over character 3-grams)
 * to mirror PostgreSQL pg_trgm in TypeScript.
 */
export function calculateTrigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const s1 = `  ${a.toLowerCase()} `;
  const s2 = `  ${b.toLowerCase()} `;

  if (s1 === s2) return 1.0;
  if (s1.length < 3 || s2.length < 3) return 0.0;

  const trigrams1 = new Set<string>();
  for (let i = 0; i <= s1.length - 3; i++) {
    trigrams1.add(s1.substring(i, i + 3));
  }

  const trigrams2 = new Set<string>();
  for (let i = 0; i <= s2.length - 3; i++) {
    trigrams2.add(s2.substring(i, i + 3));
  }

  let intersection = 0;
  for (const t of trigrams1) {
    if (trigrams2.has(t)) {
      intersection++;
    }
  }

  const totalTrigrams = trigrams1.size + trigrams2.size;
  if (totalTrigrams === 0) return 0.0;

  return (2.0 * intersection) / totalTrigrams;
}
