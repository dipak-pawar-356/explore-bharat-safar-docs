// Explore Bharat Safar — Geospatial Coordinate Projections (WGS84 <-> Web Mercator)
// Reference: EBS-DOC-16-MAP & EBS-BLU-41-DISCOVERY

const SEMI_MAJOR_AXIS = 6378137.0; // WGS84 Earth radius in meters

/**
 * Converts WGS84 Latitude and Longitude (EPSG:4326) to Web Mercator (EPSG:3857) X and Y meters.
 */
export function wgs84ToWebMercator(latitude: number, longitude: number): [number, number] {
  const x = (longitude * Math.PI * SEMI_MAJOR_AXIS) / 180.0;
  const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, latitude));
  const rad = (clampedLat * Math.PI) / 180.0;
  const y = SEMI_MAJOR_AXIS * Math.log(Math.tan(Math.PI / 4.0 + rad / 2.0));

  return [x, y];
}

/**
 * Converts Web Mercator (EPSG:3857) X and Y meters back to WGS84 Latitude and Longitude (EPSG:4326).
 */
export function webMercatorToWgs84(x: number, y: number): [number, number] {
  const longitude = (x / (Math.PI * SEMI_MAJOR_AXIS)) * 180.0;
  const latitude =
    ((2.0 * Math.atan(Math.exp(y / SEMI_MAJOR_AXIS)) - Math.PI / 2.0) * 180.0) / Math.PI;

  return [latitude, longitude];
}
