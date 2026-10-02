// Explore Bharat Safar — Douglas-Peucker Polyline Simplification
// Reference: EBS-DOC-16-MAP & EBS-BLU-41-DISCOVERY

import { calculateHaversineDistanceKm, type LatLngPoint } from './haversine';

/**
 * Calculates perpendicular distance from point P to line segment AB.
 */
function perpendicularDistance(
  point: LatLngPoint,
  lineStart: LatLngPoint,
  lineEnd: LatLngPoint,
): number {
  const lineLength = calculateHaversineDistanceKm(lineStart, lineEnd);
  if (lineLength === 0) {
    return calculateHaversineDistanceKm(point, lineStart);
  }

  // Cross-track distance formula approximation
  const d13 = calculateHaversineDistanceKm(lineStart, point);
  const d23 = calculateHaversineDistanceKm(lineEnd, point);

  // Semiperimeter
  const s = (lineLength + d13 + d23) / 2;
  const area = Math.sqrt(Math.max(0, s * (s - lineLength) * (s - d13) * (s - d23)));

  return (2 * area) / lineLength;
}

/**
 * Simplifies a sequence of geographic points using the Douglas-Peucker algorithm.
 * @param points Array of coordinates
 * @param toleranceKm Maximum allowable perpendicular deviation in kilometers
 */
export function simplifyDouglasPeucker(
  points: readonly LatLngPoint[],
  toleranceKm: number,
): LatLngPoint[] {
  if (points.length <= 2) {
    return [...points];
  }

  let maxDistance = 0;
  let maxIndex = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i]!, points[0]!, points[end]!);
    if (d > maxDistance) {
      maxDistance = d;
      maxIndex = i;
    }
  }

  if (maxDistance > toleranceKm) {
    const left = simplifyDouglasPeucker(points.slice(0, maxIndex + 1), toleranceKm);
    const right = simplifyDouglasPeucker(points.slice(maxIndex), toleranceKm);

    return left.slice(0, left.length - 1).concat(right);
  }

  return [points[0]!, points[end]!];
}
