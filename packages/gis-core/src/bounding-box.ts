// Explore Bharat Safar — Bounding Box & Polygon Geometry Calculations
// Reference: EBS-DOC-16-MAP & EBS-BLU-41-DISCOVERY

import type { LatLngPoint } from './haversine';

export interface BoundingBoxCoordinates {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

/**
 * Calculates the bounding box that encompasses a set of geographic points.
 */
export function calculateBoundingBox(points: readonly LatLngPoint[]): BoundingBoxCoordinates {
  if (points.length === 0) {
    throw new Error('Cannot calculate bounding box for empty array of points');
  }

  const first = points[0]!;
  let minLat = first.latitude;
  let maxLat = first.latitude;
  let minLng = first.longitude;
  let maxLng = first.longitude;

  for (let i = 1; i < points.length; i++) {
    const pt = points[i]!;
    if (pt.latitude < minLat) minLat = pt.latitude;
    if (pt.latitude > maxLat) maxLat = pt.latitude;
    if (pt.longitude < minLng) minLng = pt.longitude;
    if (pt.longitude > maxLng) maxLng = pt.longitude;
  }

  return { minLat, minLng, maxLat, maxLng };
}

/**
 * Checks whether a given geographic coordinate lies within a bounding box.
 */
export function isPointInBoundingBox(point: LatLngPoint, bbox: BoundingBoxCoordinates): boolean {
  return (
    point.latitude >= bbox.minLat &&
    point.latitude <= bbox.maxLat &&
    point.longitude >= bbox.minLng &&
    point.longitude <= bbox.maxLng
  );
}

/**
 * Determines whether a coordinate lies within a closed polygon using the Ray-Casting Algorithm.
 */
export function isPointInPolygon(point: LatLngPoint, polygon: readonly LatLngPoint[]): boolean {
  if (polygon.length < 3) {
    return false;
  }

  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i]!.longitude;
    const yi = polygon[i]!.latitude;
    const xj = polygon[j]!.longitude;
    const yj = polygon[j]!.latitude;

    const intersect =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
