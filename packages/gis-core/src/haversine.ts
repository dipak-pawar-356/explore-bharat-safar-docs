// Explore Bharat Safar — Haversine Distance & Bearing Calculations
// Reference: EBS-DOC-16-MAP & EBS-BLU-41-DISCOVERY

export interface LatLngPoint {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371.0;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * @returns Distance in kilometers
 */
export function calculateHaversineDistanceKm(from: LatLngPoint, to: LatLngPoint): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);

  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Calculates the initial compass bearing from start point to destination point.
 * @returns Bearing in degrees (0° to 360°)
 */
export function calculateBearing(start: LatLngPoint, end: LatLngPoint): number {
  const startLat = toRadians(start.latitude);
  const startLng = toRadians(start.longitude);
  const endLat = toRadians(end.latitude);
  const endLng = toRadians(end.longitude);

  const dLng = endLng - startLng;

  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  const bearingRad = Math.atan2(y, x);
  return (toDegrees(bearingRad) + 360) % 360;
}
