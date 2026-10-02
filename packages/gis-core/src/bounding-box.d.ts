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
export declare function calculateBoundingBox(points: readonly LatLngPoint[]): BoundingBoxCoordinates;
/**
 * Checks whether a given geographic coordinate lies within a bounding box.
 */
export declare function isPointInBoundingBox(point: LatLngPoint, bbox: BoundingBoxCoordinates): boolean;
/**
 * Determines whether a coordinate lies within a closed polygon using the Ray-Casting Algorithm.
 */
export declare function isPointInPolygon(point: LatLngPoint, polygon: readonly LatLngPoint[]): boolean;
//# sourceMappingURL=bounding-box.d.ts.map