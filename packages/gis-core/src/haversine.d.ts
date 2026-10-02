export interface LatLngPoint {
    latitude: number;
    longitude: number;
}
/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * @returns Distance in kilometers
 */
export declare function calculateHaversineDistanceKm(from: LatLngPoint, to: LatLngPoint): number;
/**
 * Calculates the initial compass bearing from start point to destination point.
 * @returns Bearing in degrees (0° to 360°)
 */
export declare function calculateBearing(start: LatLngPoint, end: LatLngPoint): number;
//# sourceMappingURL=haversine.d.ts.map