import logger from '../config/logger.js';

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

/**
 * Lightweight In-Memory Cache implementation.
 * Perfect for single-node deployments to reduce SQLite reads for static data like Roles, Departments, and Holidays.
 */
class InMemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  /**
   * Retrieves an item from the cache.
   */
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Stores an item in the cache.
   * @param key Cache key
   * @param value Value to store
   * @param ttlSeconds Time-to-live in seconds (default 1 hour)
   */
  public set<T>(key: string, value: T, ttlSeconds: number = 3600): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Deletes a specific key.
   */
  public del(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Flushes the entire cache.
   */
  public flush(): void {
    this.cache.clear();
  }

  /**
   * Helper implementation of the Cache-Aside pattern.
   * 1. Checks cache for data.
   * 2. If hit, returns data.
   * 3. If miss, calls the fetcher function, stores result in cache, and returns data.
   */
  public async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      logger.info('cache.hit', `Cache hit for key: ${key}`);
      return cached;
    }

    logger.info('cache.miss', `Cache miss for key: ${key}. Executing fetcher.`);
    const freshData = await fetcher();
    this.set(key, freshData, ttlSeconds);
    return freshData;
  }
}

export const cacheService = new InMemoryCache();
