import { type LatLngPoint } from './haversine';
/**
 * Simplifies a sequence of geographic points using the Douglas-Peucker algorithm.
 * @param points Array of coordinates
 * @param toleranceKm Maximum allowable perpendicular deviation in kilometers
 */
export declare function simplifyDouglasPeucker(points: readonly LatLngPoint[], toleranceKm: number): LatLngPoint[];
//# sourceMappingURL=simplification.d.ts.map