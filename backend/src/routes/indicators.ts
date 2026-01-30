import { Router } from 'express'
import { DEFAULT_INDICATORS, BLS_SERIES_MAPPING } from '../types/index.js'
import type { ApiResponse, GetIndicatorsResponse, EconomicIndicator, SeriesData, DataPoint } from '../types/index.js'
import { createBLSApiClient } from '../services/blsApiClient.js'
import { CacheManager } from '../services/cacheManager.js'
import { logger } from '../utils/logger.js'

const router = Router()
const blsClient = createBLSApiClient()

// Initialize cache with 1 hour TTL for BLS data (data updates monthly)
const cacheManager = new CacheManager({
  stdTTL: 3600, // 1 hour default
  maxKeys: 500,
})

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  SERIES_DATA: 3600,      // 1 hour for series data
  LATEST_DATA: 1800,      // 30 minutes for latest data point
  INDICATORS_LIST: 86400, // 24 hours for indicators list (rarely changes)
}

// Generate cache key for series data
function getSeriesCacheKey(seriesId: string, options?: any): string {
  const optionsStr = options ? JSON.stringify(options) : ''
  return `series:${seriesId}:${optionsStr}`
}

// Generate cache key for latest data
function getLatestCacheKey(seriesId: string): string {
  return `latest:${seriesId}`
}

// Get all available economic indicators
router.get('/', (req, res) => {
  // For now, return the default indicators with generated IDs and timestamps
  const indicators: EconomicIndicator[] = DEFAULT_INDICATORS.map((indicator, index) => ({
    ...indicator,
    id: `indicator-${index + 1}`,
    lastUpdated: new Date(),
  }))

  const response: ApiResponse<GetIndicatorsResponse> = {
    success: true,
    data: { indicators },
    timestamp: new Date(),
  }

  res.json(response)
})

// Get specific indicator by ID
router.get('/:id', (req, res) => {
  const { id } = req.params
  
  // Find indicator by ID
  const indicatorIndex = parseInt(id.replace('indicator-', '')) - 1
  const defaultIndicator = DEFAULT_INDICATORS[indicatorIndex]
  
  if (!defaultIndicator) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'INDICATOR_NOT_FOUND',
        message: `Indicator with ID ${id} not found`,
        timestamp: new Date(),
      },
    })
  }

  const indicator: EconomicIndicator = {
    ...defaultIndicator,
    id,
    lastUpdated: new Date(),
  }

  const response: ApiResponse<{ indicator: EconomicIndicator }> = {
    success: true,
    data: { indicator },
    timestamp: new Date(),
  }

  res.json(response)
})

// Get series data for an indicator (with cache-first strategy)
router.get('/:id/data', async (req, res) => {
  const { id } = req.params
  const { startYear, endYear, catalog, calculations, refresh } = req.query
  
  try {
    // Find indicator by ID
    const indicatorIndex = parseInt(id.replace('indicator-', '')) - 1
    const defaultIndicator = DEFAULT_INDICATORS[indicatorIndex]
    
    if (!defaultIndicator) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INDICATOR_NOT_FOUND',
          message: `Indicator with ID ${id} not found`,
          timestamp: new Date(),
        },
      })
    }

    // Prepare fetch options
    const fetchOptions: any = {}
    if (startYear) fetchOptions.startYear = parseInt(startYear as string)
    if (endYear) fetchOptions.endYear = parseInt(endYear as string)
    if (catalog === 'true') fetchOptions.catalog = true
    if (calculations === 'true') fetchOptions.calculations = true

    // Generate cache key
    const cacheKey = getSeriesCacheKey(defaultIndicator.seriesId, fetchOptions)
    
    // Check cache first (unless refresh is requested)
    if (refresh !== 'true') {
      const cachedData = await cacheManager.get(cacheKey)
      if (cachedData) {
        logger.info(`Cache hit for series data: ${cacheKey}`)
        const response: ApiResponse<{ series: SeriesData; cached: boolean; cachedAt: Date }> = {
          success: true,
          data: { 
            series: cachedData.data as SeriesData,
            cached: true,
            cachedAt: cachedData.timestamp,
          },
          timestamp: new Date(),
        }
        return res.json(response)
      }
    }

    // Fetch data from BLS API
    logger.info(`Fetching series data for indicator ${id} (${defaultIndicator.seriesId})`)
    const seriesData = await blsClient.fetchSeries([defaultIndicator.seriesId], fetchOptions)

    if (!seriesData || seriesData.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DATA_NOT_FOUND',
          message: `No data found for indicator ${id}`,
          timestamp: new Date(),
        },
      })
    }

    // Store in cache
    await cacheManager.set(cacheKey, seriesData[0], CACHE_TTL.SERIES_DATA)
    logger.info(`Cached series data: ${cacheKey}`)

    const response: ApiResponse<{ series: SeriesData; cached: boolean }> = {
      success: true,
      data: { series: seriesData[0], cached: false },
      timestamp: new Date(),
    }

    res.json(response)
  } catch (error) {
    logger.error(`Error fetching series data for indicator ${id}:`, error)
    
    // Try to serve stale cache on error
    const indicatorIndex = parseInt(id.replace('indicator-', '')) - 1
    const defaultIndicator = DEFAULT_INDICATORS[indicatorIndex]
    if (defaultIndicator) {
      const fetchOptions: any = {}
      if (startYear) fetchOptions.startYear = parseInt(startYear as string)
      if (endYear) fetchOptions.endYear = parseInt(endYear as string)
      const cacheKey = getSeriesCacheKey(defaultIndicator.seriesId, fetchOptions)
      const staleData = await cacheManager.get(cacheKey)
      
      if (staleData) {
        logger.warn(`Serving stale cache for ${cacheKey} due to API error`)
        const response: ApiResponse<{ series: SeriesData; cached: boolean; stale: boolean; cachedAt: Date }> = {
          success: true,
          data: { 
            series: staleData.data as SeriesData,
            cached: true,
            stale: true,
            cachedAt: staleData.timestamp,
          },
          timestamp: new Date(),
        }
        return res.json(response)
      }
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch series data',
        timestamp: new Date(),
      },
    })
  }
})

// Get latest data point for an indicator (with cache-first strategy)
router.get('/:id/latest', async (req, res) => {
  const { id } = req.params
  const { refresh } = req.query
  
  try {
    // Find indicator by ID
    const indicatorIndex = parseInt(id.replace('indicator-', '')) - 1
    const defaultIndicator = DEFAULT_INDICATORS[indicatorIndex]
    
    if (!defaultIndicator) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INDICATOR_NOT_FOUND',
          message: `Indicator with ID ${id} not found`,
          timestamp: new Date(),
        },
      })
    }

    // Generate cache key
    const cacheKey = getLatestCacheKey(defaultIndicator.seriesId)
    
    // Check cache first (unless refresh is requested)
    if (refresh !== 'true') {
      const cachedData = await cacheManager.get(cacheKey)
      if (cachedData) {
        logger.info(`Cache hit for latest data: ${cacheKey}`)
        const response: ApiResponse<{ dataPoint: DataPoint; cached: boolean; cachedAt: Date }> = {
          success: true,
          data: { 
            dataPoint: cachedData.data as DataPoint,
            cached: true,
            cachedAt: cachedData.timestamp,
          },
          timestamp: new Date(),
        }
        return res.json(response)
      }
    }

    // Fetch latest data from BLS API
    logger.info(`Fetching latest data for indicator ${id} (${defaultIndicator.seriesId})`)
    const latestData = await blsClient.getLatestData(defaultIndicator.seriesId)

    // Store in cache
    await cacheManager.set(cacheKey, latestData, CACHE_TTL.LATEST_DATA)
    logger.info(`Cached latest data: ${cacheKey}`)

    const response: ApiResponse<{ dataPoint: DataPoint; cached: boolean }> = {
      success: true,
      data: { dataPoint: latestData, cached: false },
      timestamp: new Date(),
    }

    res.json(response)
  } catch (error) {
    logger.error(`Error fetching latest data for indicator ${id}:`, error)
    
    // Try to serve stale cache on error
    const indicatorIndex = parseInt(id.replace('indicator-', '')) - 1
    const defaultIndicator = DEFAULT_INDICATORS[indicatorIndex]
    if (defaultIndicator) {
      const cacheKey = getLatestCacheKey(defaultIndicator.seriesId)
      const staleData = await cacheManager.get(cacheKey)
      
      if (staleData) {
        logger.warn(`Serving stale cache for ${cacheKey} due to API error`)
        const response: ApiResponse<{ dataPoint: DataPoint; cached: boolean; stale: boolean; cachedAt: Date }> = {
          success: true,
          data: { 
            dataPoint: staleData.data as DataPoint,
            cached: true,
            stale: true,
            cachedAt: staleData.timestamp,
          },
          timestamp: new Date(),
        }
        return res.json(response)
      }
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch latest data',
        timestamp: new Date(),
      },
    })
  }
})

// Invalidate cache for an indicator (for manual refresh)
router.post('/:id/invalidate', async (req, res) => {
  const { id } = req.params
  
  try {
    const indicatorIndex = parseInt(id.replace('indicator-', '')) - 1
    const defaultIndicator = DEFAULT_INDICATORS[indicatorIndex]
    
    if (!defaultIndicator) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INDICATOR_NOT_FOUND',
          message: `Indicator with ID ${id} not found`,
          timestamp: new Date(),
        },
      })
    }

    // Invalidate all cache entries for this series
    await cacheManager.invalidate(`series:${defaultIndicator.seriesId}:*`)
    await cacheManager.invalidate(`latest:${defaultIndicator.seriesId}`)
    
    logger.info(`Cache invalidated for indicator ${id} (${defaultIndicator.seriesId})`)

    const response: ApiResponse<{ invalidated: boolean; seriesId: string }> = {
      success: true,
      data: { invalidated: true, seriesId: defaultIndicator.seriesId },
      timestamp: new Date(),
    }

    res.json(response)
  } catch (error) {
    logger.error(`Error invalidating cache for indicator ${id}:`, error)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INVALIDATION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to invalidate cache',
        timestamp: new Date(),
      },
    })
  }
})

// Get cache statistics
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = cacheManager.getStats()
    
    const response: ApiResponse<{ stats: typeof stats }> = {
      success: true,
      data: { stats },
      timestamp: new Date(),
    }

    res.json(response)
  } catch (error) {
    logger.error('Error getting cache stats:', error)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get cache statistics',
        timestamp: new Date(),
      },
    })
  }
})

export default router