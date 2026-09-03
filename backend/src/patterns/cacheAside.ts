/**
 * Pattern 13: Cache-Aside Strategy
 * Application-managed caching layer: check cache on read -> if miss, fetch from database and populate cache with TTL.
 */

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRatioPercentage: number;
}

export class CacheAsideManager<T = any> {
  private cache = new Map<string, { value: T; expiresAt: number }>();
  private hits = 0;
  private misses = 0;

  public async getOrSet(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (entry && entry.expiresAt > now) {
      this.hits++;
      return entry.value;
    }

    this.misses++;
    const freshValue = await fetcher();
    this.cache.set(key, { value: freshValue, expiresAt: now + ttlSeconds * 1000 });
    return freshValue;
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRatioPercentage: total > 0 ? Math.round((this.hits / total) * 100) : 0
    };
  }
}

export const cacheAsideManager = new CacheAsideManager();
