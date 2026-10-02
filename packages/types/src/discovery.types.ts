// Explore Bharat Safar — Section 1: Bharat Discovery Engine Contracts
// Reference: EBS-BLU-41-BDE, EBS-DOC-09-API, EBS-DOC-10-DATA, EBS-DOC-16-MAP, EBS-DOC-18-SEARCH
import { GeoPoint, BoundingBox } from './common.types';

export enum DiscoveryHierarchyLevel {
  NATIONAL = 'NATIONAL',
  STATE = 'STATE',
  DISTRICT = 'DISTRICT',
  TALUKA = 'TALUKA',
  PLACE = 'PLACE',
}

export enum StandardCategorySlug {
  FORT = 'fort',
  TEMPLE = 'temple',
  UNESCO_SITE = 'unesco-site',
  WATERFALL = 'waterfall',
  CAVE = 'cave',
  WILDLIFE = 'wildlife',
  BIRD_SANCTUARY = 'bird-sanctuary',
  LAKE = 'lake',
  RIVER_GHAT = 'river-ghat',
  BEACH = 'beach',
  MOUNTAIN_PASS = 'mountain-pass',
  TREKKING = 'trekking',
  CAMPING = 'camping',
  MUSEUM = 'museum',
  CUISINE = 'cuisine',
  HIDDEN_GEM = 'hidden-gem',
}

export interface StateEntity {
  id: string;
  name: string;
  isoCode: string; // e.g. IN-MH, IN-RJ
  capital: string;
  officialLanguages: string[];
  centroid?: GeoPoint;
  boundingBox?: BoundingBox;
  overviewDossier?: Record<string, unknown>;
  districtsCount?: number;
  placesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DistrictEntity {
  id: string;
  stateId: string;
  name: string;
  headquarters: string;
  centroid?: GeoPoint;
  boundingBox?: BoundingBox;
  emergencyDirectory?: Record<string, string>;
  overviewDossier?: Record<string, unknown>;
  talukasCount?: number;
  placesCount?: number;
  stateName?: string;
  stateIsoCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TalukaEntity {
  id: string;
  districtId: string;
  name: string;
  centroid?: GeoPoint;
  overviewDossier?: Record<string, unknown>;
  placesCount?: number;
  places?: PlaceEntity[];
  districtName?: string;
  stateName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaceCategory {
  id: string;
  slug: string;
  name: string;
  iconToken: string;
  parentId?: string | null;
  children?: PlaceCategory[];
  isActive?: boolean;
}

export interface Landmark3DEntity {
  id: string;
  placeId: string;
  name: string;
  modelAssetUri: string; // Draco compressed glTF/GLB
  coordinates?: GeoPoint;
  renderScale: number;
  boundingRadiusPx?: number;
  polyCount?: number;
  hoverTooltipText?: string;
}

export interface PlaceEntity {
  id: string;
  talukaId: string;
  name: string;
  slug: string;
  categoryIds: string[];
  categories?: PlaceCategory[];
  coordinates: GeoPoint;
  elevationMeters?: number | null;
  historicalOverview: string;
  architectureNotes?: string | null;
  operatingHours?: Record<string, string> | null;
  entryTariffs?: Record<string, number> | null;
  isBookingEnabled: boolean; // Super Admin controlled CTA toggle
  linkedExperienceId?: string | null;
  averageRating: number;
  reviewCount: number;
  heroImageUrl?: string;
  galleryImageUrls?: string[];
  panoramic360Urls?: string[];
  landmark3D?: Landmark3DEntity | null;
  talukaName?: string;
  districtName?: string;
  stateName?: string;
  distanceKm?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpatialSearchResult {
  id: string;
  name: string;
  slug?: string;
  type: 'state' | 'district' | 'taluka' | 'place';
  category?: string;
  categorySlug?: string;
  locationHierarchy: {
    taluka?: string;
    district?: string;
    state?: string;
    isoCode?: string;
  };
  coordinates?: GeoPoint;
  heroImageUrl?: string;
  isBookingEnabled?: boolean;
  score?: number;
  distanceKm?: number;
}

export interface SpatialSearchResponse {
  query: string;
  totalMatches: number;
  level?: string;
  results: SpatialSearchResult[];
  states?: StateEntity[];
  districts?: DistrictEntity[];
  talukas?: TalukaEntity[];
  places?: PlaceEntity[];
}

export interface SpatialSearchQuery {
  q: string;
  level?: 'state' | 'district' | 'taluka' | 'place' | 'all';
  category?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  bbox?: string; // minLng,minLat,maxLng,maxLat
  limit?: number;
  offset?: number;
}

export interface NearbyPlacesQuery {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  category?: string;
  limit?: number;
}

export interface BoundingBoxQuery {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  category?: string;
  limit?: number;
}

export interface DiscoveryFilterOptions {
  categorySlug?: string;
  stateId?: string;
  districtId?: string;
  talukaId?: string;
  minRating?: number;
  has3DLandmark?: boolean;
  bookingEnabledOnly?: boolean;
  maxElevation?: number;
  minElevation?: number;
}

export interface GeoJsonGeometry {
  type: 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon';
  coordinates: unknown;
}

export interface GeoJsonFeature<T = Record<string, unknown>> {
  type: 'Feature';
  id?: string | number;
  geometry: GeoJsonGeometry;
  properties: T;
}

export interface GeoJsonFeatureCollection<T = Record<string, unknown>> {
  type: 'FeatureCollection';
  features: Array<GeoJsonFeature<T>>;
}
