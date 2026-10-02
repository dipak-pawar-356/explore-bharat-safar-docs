// Explore Bharat Safar — Discovery Engine Spatial & Hierarchical Cache Service
// Reference: EBS-DOC-10-DATA, EBS-BLU-41-BDE Section 2.2, EBS-DOC-16-MAP Section 4
import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class DiscoveryCacheService {
  private memoryCache = new Map<string, CacheEntry<unknown>>();

  // Default TTLs in milliseconds
  private readonly TTL_STATES_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly TTL_DOSSIER_MS = 6 * 60 * 60 * 1000; // 6 hours
  private readonly TTL_SEARCH_MS = 60 * 60 * 1000; // 1 hour
  private readonly TTL_SPATIAL_MS = 30 * 60 * 1000; // 30 minutes

  /**
   * Retrieves an item from cache if present and not expired.
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Stores an item in cache with a specified TTL in milliseconds.
   */
  async set<T>(key: string, data: T, ttlMs = this.TTL_DOSSIER_MS): Promise<void> {
    this.memoryCache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Generates standard cache keys for discovery queries.
   */
  getStatesKey(): string {
    return 'discovery:states:all';
  }

  getStateKey(idOrSlug: string): string {
    return `discovery:state:${idOrSlug.toLowerCase()}`;
  }

  getDistrictKey(id: string): string {
    return `discovery:district:${id}`;
  }

  getTalukaKey(id: string): string {
    return `discovery:taluka:${id}`;
  }

  getPlaceKey(idOrSlug: string): string {
    return `discovery:place:${idOrSlug.toLowerCase()}`;
  }

  getCategoriesKey(): string {
    return 'discovery:categories:all';
  }

  getLandmarks3DKey(): string {
    return 'discovery:landmarks_3d:all';
  }

  getSearchKey(query: string, level = 'all', category = 'all'): string {
    return `discovery:search:${query.toLowerCase().trim()}:${level}:${category}`;
  }

  getNearbyKey(lat: number, lng: number, radiusKm: number, category = 'all'): string {
    return `discovery:nearby:${lat.toFixed(3)}:${lng.toFixed(3)}:${radiusKm}:${category}`;
  }

  getBBoxKey(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number,
    category = 'all',
  ): string {
    return `discovery:bbox:${minLat.toFixed(2)}:${minLng.toFixed(2)}:${maxLat.toFixed(2)}:${maxLng.toFixed(2)}:${category}`;
  }

  /**
   * Invalidates all cache entries matching a given prefix.
   */
  async invalidatePrefix(prefix: string): Promise<number> {
    let count = 0;
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clears entire discovery cache.
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
  }
}
