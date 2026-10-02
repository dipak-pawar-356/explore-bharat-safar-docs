// Explore Bharat Safar — Supercluster-Style Geospatial Point Clustering Algorithm
// Reference: EBS-DOC-16-MAP Section 5, EBS-BLU-41-BDE Section 4.5
import { calculateHaversineDistanceKm, LatLngPoint } from './haversine';
import { calculateBoundingBox, BoundingBoxCoordinates } from './bounding-box';

export interface ClusterPoint<T = unknown> {
  id: string;
  latitude: number;
  longitude: number;
  data?: T;
}

export interface PointCluster<T = unknown> {
  id: string;
  isCluster: true;
  count: number;
  latitude: number;
  longitude: number;
  boundingBox: BoundingBoxCoordinates;
  points: ClusterPoint<T>[];
}

export interface SinglePointCluster<T = unknown> {
  id: string;
  isCluster: false;
  latitude: number;
  longitude: number;
  point: ClusterPoint<T>;
}

export type ClusterResult<T = unknown> = PointCluster<T> | SinglePointCluster<T>;

export interface ClusteringOptions {
  /**
   * Distance threshold in kilometers for grouping points into a cluster.
   * At zoom 4 (National), ~200km; zoom 8 (State), ~40km; zoom 12 (District), ~5km; zoom 15 (Taluka), ~0.5km.
   */
  clusterRadiusKm?: number;
  /**
   * Zoom level (1-20). If specified, clusterRadiusKm will be dynamically derived.
   */
  zoom?: number;
}

/**
 * Calculates effective cluster radius based on standard Web Mercator zoom level.
 */
export function getClusterRadiusForZoom(zoom: number): number {
  if (zoom <= 5) return 250; // National scale (India)
  if (zoom <= 7) return 100;
  if (zoom <= 9) return 40; // State scale
  if (zoom <= 11) return 15;
  if (zoom <= 13) return 4; // District scale
  if (zoom <= 15) return 1; // Taluka scale
  return 0.2; // Local place scale
}

/**
 * Clusters geographic points into grouped cluster nodes using greedy spatial proximity agglomeration.
 */
export function clusterPoints<T = unknown>(
  points: readonly ClusterPoint<T>[],
  options: ClusteringOptions = {},
): ClusterResult<T>[] {
  if (!points || points.length === 0) {
    return [];
  }

  const radiusKm =
    options.clusterRadiusKm ??
    (options.zoom !== undefined ? getClusterRadiusForZoom(options.zoom) : 25);

  const unassigned = new Set<number>(points.map((_, i) => i));
  const results: ClusterResult<T>[] = [];

  for (let i = 0; i < points.length; i++) {
    if (!unassigned.has(i)) continue;
    unassigned.delete(i);

    const rootPoint = points[i]!;
    const clusterPointsList: ClusterPoint<T>[] = [rootPoint];

    for (const otherIdx of Array.from(unassigned)) {
      const candidate = points[otherIdx]!;
      const dist = calculateHaversineDistanceKm(
        { latitude: rootPoint.latitude, longitude: rootPoint.longitude },
        { latitude: candidate.latitude, longitude: candidate.longitude },
      );

      if (dist <= radiusKm) {
        clusterPointsList.push(candidate);
        unassigned.delete(otherIdx);
      }
    }

    if (clusterPointsList.length > 1) {
      // Aggregate centroid
      const totalLat = clusterPointsList.reduce((sum, p) => sum + p.latitude, 0);
      const totalLng = clusterPointsList.reduce((sum, p) => sum + p.longitude, 0);
      const avgLat = Number((totalLat / clusterPointsList.length).toFixed(6));
      const avgLng = Number((totalLng / clusterPointsList.length).toFixed(6));

      const bbox = calculateBoundingBox(
        clusterPointsList.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
      );

      results.push({
        id: `cluster-${rootPoint.id}-${clusterPointsList.length}`,
        isCluster: true,
        count: clusterPointsList.length,
        latitude: avgLat,
        longitude: avgLng,
        boundingBox: bbox,
        points: clusterPointsList,
      });
    } else {
      results.push({
        id: rootPoint.id,
        isCluster: false,
        latitude: rootPoint.latitude,
        longitude: rootPoint.longitude,
        point: rootPoint,
      });
    }
  }

  return results;
}

/**
 * Calculates radial spiral expansion offsets for points when a user clicks on a cluster node.
 */
export function calculateSpiralExpansionOffsets(
  center: LatLngPoint,
  count: number,
  radiusKm = 0.5,
): LatLngPoint[] {
  if (count <= 1) return [center];

  const offsets: LatLngPoint[] = [];
  const angleStep = (2 * Math.PI) / count;

  // 1 degree latitude ~= 111 km, 1 degree longitude ~= 111 * cos(lat) km
  const latKmPerDegree = 111.0;
  const rawLngKm = 111.0 * Math.cos((center.latitude * Math.PI) / 180);
  const lngKmPerDegree = Math.abs(rawLngKm) < 0.001 ? 111.0 : rawLngKm;

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    const dLat = (radiusKm * Math.sin(angle)) / latKmPerDegree;
    const dLng = (radiusKm * Math.cos(angle)) / lngKmPerDegree;

    offsets.push({
      latitude: Number((center.latitude + dLat).toFixed(6)),
      longitude: Number((center.longitude + dLng).toFixed(6)),
    });
  }

  return offsets;
}
