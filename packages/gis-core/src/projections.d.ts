/**
 * Converts WGS84 Latitude and Longitude (EPSG:4326) to Web Mercator (EPSG:3857) X and Y meters.
 */
export declare function wgs84ToWebMercator(latitude: number, longitude: number): [number, number];
/**
 * Converts Web Mercator (EPSG:3857) X and Y meters back to WGS84 Latitude and Longitude (EPSG:4326).
 */
export declare function webMercatorToWgs84(x: number, y: number): [number, number];
//# sourceMappingURL=projections.d.ts.map