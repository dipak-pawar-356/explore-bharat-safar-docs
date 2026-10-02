// Explore Bharat Safar — Enterprise Search & Observability Contracts
// Reference: EBS-DOC-18-SEARCH, EBS-BLU-41-BDE, EBS-TDR-51-TECHSTACK
// Sprint 11: Search, SEO, Performance, Accessibility & Observability

export enum SearchContext {
  DISCOVERY = 'discovery', // Section 1: Places, Forts, Peaks, Waterfalls, Territories
  VILLAGES = 'villages', // Section 2: Rural Villages, Gram Panchayats, PIN Codes, LGD
  BOOKINGS = 'bookings', // Section 3: Adventures, Trek Batches, Expeditions
  SOCIAL = 'social', // Section 4: Explorers, Guilds, Hashtags
  ADMIN = 'admin', // Administration: Audit Logs, Users, Moderation Records
  GLOBAL = 'global', // Unified entry routed to appropriate domain
}

export interface ISearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  context: SearchContext;
  category?: string;
  slug?: string;
  url: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    elevationMeters?: number;
  };
  score: number;
  distanceKm?: number;
  highlightSnippet?: string;
  badges?: string[];
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ISearchFacetOption {
  value: string;
  label: string;
  count: number;
  selected?: boolean;
}

export interface ISearchFacet {
  field: string;
  label: string;
  options: ISearchFacetOption[];
}

export interface ISearchResponse<T = ISearchResultItem> {
  query: string;
  context: SearchContext;
  correctedQuery?: string;
  suggestions: string[];
  totalHits: number;
  executionTimeMs: number;
  cached: boolean;
  facets?: ISearchFacet[];
  cursor?: {
    next?: string | null;
    prev?: string | null;
    hasMore: boolean;
  };
  results: T[];
}

export interface IAutocompleteItem {
  id: string;
  text: string;
  type: string;
  context: SearchContext;
  category?: string;
  url: string;
  iconName?: string;
  matchIndices?: [number, number][];
}

export interface ISynonymEntry {
  canonical: string;
  synonyms: string[];
  context?: SearchContext;
}

export interface ISearchAnalyticsEvent {
  query: string;
  context: SearchContext;
  hitsCount: number;
  executionTimeMs: number;
  clickedId?: string;
  clickedPosition?: number;
  timestamp: string;
  userId?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface ICursorPaginationOptions {
  cursor?: string;
  take?: number;
  direction?: 'forward' | 'backward';
}

export interface ISubsystemHealthStatus {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  responseTimeMs: number;
  details?: Record<string, unknown>;
}

export interface ISystemHealthReport {
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  subsystems: {
    database: ISubsystemHealthStatus;
    postgis: ISubsystemHealthStatus;
    redis: ISubsystemHealthStatus;
    workers: ISubsystemHealthStatus;
    memory: {
      heapUsedMb: number;
      heapTotalMb: number;
      rssMb: number;
      status: 'NORMAL' | 'HIGH' | 'CRITICAL';
    };
  };
}
