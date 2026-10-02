// Explore Bharat Safar — Common TypeScript Contracts

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  data: T;
  meta: {
    timestamp: string;
    correlationId: string;
    pagination?: PaginationMeta;
  };
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  error: {
    errorCode: string; // e.g. EBS_AUTH_001, EBS_GEO_404
    message: string;
    details?: unknown[];
  };
  meta: {
    timestamp: string;
    correlationId: string;
    path: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  elevationMeters?: number;
}

export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export type DomainSearchContext = 'discovery' | 'villages' | 'bookings' | 'social';
