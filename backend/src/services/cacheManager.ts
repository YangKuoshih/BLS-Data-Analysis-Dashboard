import NodeCache from 'node-cache'
import { logger } from '../utils/logger.js'
import { CachedData } from '../types/index.js'

export interface CacheOptions {
  stdTTL?: number // Default TTL in seconds (default: 1 hour)
  checkperiod?: number // Period in seconds for automatic delete check (default: 120)
  maxKeys?: number // Maximum number of keys in cache (default: 1000)
  useClones?: boolean // Whether to clone values on get/set (default: true)
}

export interface CacheStats {
  hits: number
  misses: number
  keys: number
  ksize: number
  vsize: number
  hitRate: number // Percentage of cache hits
}

export interface CacheEntry {
  data: any
  timestamp: Date
  ttl: number
}

const DEFAULT_OPTIONS: CacheOptions = {
  stdTTL: 3600, // 1 hour default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  maxKeys: 1000,
  useClones: true,
}

/**
 * CacheManager provides a centralized caching service for the application.
 * Uses node-cache for in-memory caching with TTL support.
 * 
 * Implements the CacheManager interface from design.md:
 * - get(key: string): Promise<CachedData | null>
 * - set(key: string, data: any, ttl: number): Promise<void>
 * - invalidate(pattern: string): Promise<void>
 * 
 * Requirements:
 * - 5.1: Automatic data refresh (cache invalidation support)
 * - 7.5: Caching recent data for offline access
 */
export class CacheManager {
  private cache: NodeCache
  private maxKeys: number
  private hits: number = 0
  private misses: number = 0

  constructor(options: CacheOptions = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
    this.maxKeys = mergedOptions.maxKeys || 1000

    this.cache = new NodeCache({
      stdTTL: mergedOptions.stdTTL,
      checkperiod: mergedOptions.checkperiod,
      useClones: mergedOptions.useClones,
    })

    // Log cache events
    this.cache.on('expired', (key: string) => {
      logger.debug(`Cache key expired: ${key}`)
    })

    this.cache.on('del', (key: string) => {
      logger.debug(`Cache key deleted: ${key}`)
    })

    logger.info('CacheManager initialized', { options: mergedOptions })
  }

  /**
   * Retrieve cached data by key.
   * Returns null if the key doesn't exist or has expired.
   * 
   * @param key - The cache key to retrieve
   * @returns Promise<CachedData | null> - The cached data or null if not found
   */
  async get(key: string): Promise<CachedData | null> {
    try {
      const entry = this.cache.get<CacheEntry>(key)
      
      if (entry === undefined) {
        this.misses++
        logger.debug(`Cache miss for key: ${key}`)
        return null
      }

      this.hits++
      logger.debug(`Cache hit for key: ${key}`)
      
      return {
        data: entry.data,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
      }
    } catch (error) {
      logger.error(`Error retrieving cache key: ${key}`, { error })
      this.misses++
      return null
    }
  }

  /**
   * Store data in the cache with a specified TTL.
   * If the cache is at max capacity, the oldest entry will be evicted.
   * 
   * @param key - The cache key
   * @param data - The data to cache
   * @param ttl - Time to live in seconds
   */
  async set(key: string, data: any, ttl: number): Promise<void> {
    try {
      // Check if we need to evict entries to make room
      await this.ensureCapacity()

      const entry: CacheEntry = {
        data,
        timestamp: new Date(),
        ttl,
      }

      const success = this.cache.set(key, entry, ttl)
      
      if (success) {
        logger.debug(`Cache set for key: ${key}`, { ttl })
      } else {
        logger.warn(`Failed to set cache for key: ${key}`)
      }
    } catch (error) {
      logger.error(`Error setting cache key: ${key}`, { error })
      throw error
    }
  }

  /**
   * Invalidate cache entries matching a pattern.
   * Supports glob-style patterns with * wildcard.
   * 
   * @param pattern - The pattern to match keys against (supports * wildcard)
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = this.cache.keys()
      const regex = this.patternToRegex(pattern)
      const matchingKeys = keys.filter(key => regex.test(key))

      if (matchingKeys.length > 0) {
        this.cache.del(matchingKeys)
        logger.info(`Invalidated ${matchingKeys.length} cache entries matching pattern: ${pattern}`)
      } else {
        logger.debug(`No cache entries found matching pattern: ${pattern}`)
      }
    } catch (error) {
      logger.error(`Error invalidating cache pattern: ${pattern}`, { error })
      throw error
    }
  }

  /**
   * Get cache statistics for monitoring.
   * 
   * @returns CacheStats - Current cache statistics
   */
  getStats(): CacheStats {
    const stats = this.cache.getStats()
    const totalRequests = this.hits + this.misses
    
    return {
      hits: this.hits,
      misses: this.misses,
      keys: stats.keys,
      ksize: stats.ksize,
      vsize: stats.vsize,
      hitRate: totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0,
    }
  }

  /**
   * Get all cache keys.
   * 
   * @returns string[] - Array of all cache keys
   */
  getKeys(): string[] {
    return this.cache.keys()
  }

  /**
   * Check if a key exists in the cache.
   * 
   * @param key - The cache key to check
   * @returns boolean - True if the key exists
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * Get the TTL remaining for a key in seconds.
   * 
   * @param key - The cache key
   * @returns number - TTL in seconds, 0 if expired or not found
   */
  getTtl(key: string): number {
    const ttl = this.cache.getTtl(key)
    if (ttl === undefined || ttl === 0) {
      return 0
    }
    // Convert from timestamp to remaining seconds
    return Math.max(0, Math.floor((ttl - Date.now()) / 1000))
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.cache.flushAll()
    this.hits = 0
    this.misses = 0
    logger.info('Cache cleared')
  }

  /**
   * Reset cache statistics.
   */
  resetStats(): void {
    this.hits = 0
    this.misses = 0
    logger.debug('Cache statistics reset')
  }

  /**
   * Close the cache and clean up resources.
   */
  close(): void {
    this.cache.close()
    logger.info('CacheManager closed')
  }

  /**
   * Ensure the cache has capacity for new entries.
   * Evicts oldest entries if at max capacity.
   */
  private async ensureCapacity(): Promise<void> {
    const currentKeys = this.cache.keys().length
    
    if (currentKeys >= this.maxKeys) {
      // Evict oldest entries (10% of max to avoid frequent evictions)
      const keysToEvict = Math.ceil(this.maxKeys * 0.1)
      const allKeys = this.cache.keys()
      
      // Sort keys by their TTL (entries closer to expiration first)
      const keysWithTtl = allKeys.map(key => ({
        key,
        ttl: this.cache.getTtl(key) || 0,
      }))
      
      keysWithTtl.sort((a, b) => a.ttl - b.ttl)
      
      const keysToDelete = keysWithTtl.slice(0, keysToEvict).map(item => item.key)
      this.cache.del(keysToDelete)
      
      logger.info(`Evicted ${keysToDelete.length} cache entries to maintain capacity`, {
        maxKeys: this.maxKeys,
        evicted: keysToDelete.length,
      })
    }
  }

  /**
   * Convert a glob-style pattern to a regular expression.
   * Supports * as a wildcard for any characters.
   * 
   * @param pattern - The glob pattern
   * @returns RegExp - The compiled regular expression
   */
  private patternToRegex(pattern: string): RegExp {
    // Escape special regex characters except *
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    // Convert * to regex wildcard
    const regexPattern = escaped.replace(/\*/g, '.*')
    return new RegExp(`^${regexPattern}$`)
  }
}
