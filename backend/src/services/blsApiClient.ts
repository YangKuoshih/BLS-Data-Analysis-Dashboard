import axios, { AxiosInstance, AxiosResponse } from 'axios'
import {
  BLSApiClient,
  BLSApiResponse,
  SeriesData,
  DataPoint,
  FetchOptions,
  DataSource,
  EconomicIndicator,
  SeriesMetadata,
  Footnote,
  DEFAULT_INDICATORS,
  BLS_SERIES_MAPPING,
} from '../types/index'
import { logger } from '../utils/logger'

export interface BLSApiClientConfig {
  apiKey?: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
  retryDelayMs?: number
}

export class BLSApiClientImpl implements BLSApiClient {
  private readonly apiKey?: string
  private readonly baseUrlV1: string
  private readonly baseUrlV2: string
  private readonly timeout: number
  private readonly maxRetries: number
  private readonly retryDelayMs: number
  private readonly axiosInstance: AxiosInstance

  // Rate limiting properties
  private requestCount = 0
  private requestWindow = Date.now()
  private readonly maxRequestsPerMinute = 25 // BLS API v1.0 limit
  private readonly maxRequestsPerDayV1 = 500 // BLS API v1.0 daily limit
  private readonly maxRequestsPerDayV2 = 500 // BLS API v2.0 daily limit (with key)
  private dailyRequestCount = 0
  private dailyWindow = Date.now()

  constructor(config: BLSApiClientConfig = {}) {
    this.apiKey = config.apiKey || process.env.BLS_API_KEY
    this.baseUrlV1 = config.baseUrl || 'https://api.bls.gov/publicAPI/v1'
    this.baseUrlV2 = config.baseUrl?.replace('/v1', '/v2') || 'https://api.bls.gov/publicAPI/v2'
    this.timeout = config.timeout || 30000
    this.maxRetries = config.maxRetries || 3
    this.retryDelayMs = config.retryDelayMs || 1000

    this.axiosInstance = axios.create({
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Fed-Economic-Dashboard/1.0',
      },
    })

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.info(`BLS API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        logger.error('BLS API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.info(`BLS API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        logger.error('BLS API Response Error:', error.response?.status, error.message)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Validates connection to BLS API by making a test request
   */
  async validateConnection(): Promise<boolean> {
    try {
      // Test with a simple request for unemployment rate (single data point)
      const testSeriesId = BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE
      const currentYear = new Date().getFullYear()
      
      await this.fetchSeries([testSeriesId], {
        startYear: currentYear,
        endYear: currentYear,
      })
      
      logger.info('BLS API connection validated successfully')
      return true
    } catch (error) {
      logger.error('BLS API connection validation failed:', error)
      return false
    }
  }

  /**
   * Fetches series data from BLS API with automatic fallback from v2.0 to v1.0
   */
  async fetchSeries(seriesIds: string[], options: FetchOptions = {}): Promise<SeriesData[]> {
    // Validate input
    if (!seriesIds || seriesIds.length === 0) {
      throw new Error('Series IDs are required')
    }

    if (seriesIds.length > 50) {
      throw new Error('Maximum 50 series IDs allowed per request')
    }

    // Check rate limits
    await this.checkRateLimit()

    let response: BLSApiResponse
    let dataSource: DataSource = DataSource.BLS_V1 // Default to v1.0

    try {
      // Try v2.0 first if API key is available
      if (this.apiKey) {
        logger.info(`Attempting BLS API v2.0 request for ${seriesIds.length} series`)
        response = await this.makeApiRequest(this.baseUrlV2, seriesIds, options, true)
        dataSource = DataSource.BLS_V2
      } else {
        throw new Error('No API key available, falling back to v1.0')
      }
    } catch (error) {
      logger.warn('BLS API v2.0 request failed, falling back to v1.0:', error)
      
      // Fallback to v1.0
      logger.info(`Attempting BLS API v1.0 request for ${seriesIds.length} series`)
      response = await this.makeApiRequest(this.baseUrlV1, seriesIds, options, false)
      dataSource = DataSource.BLS_V1
    }

    // Validate response
    if (!response || response.status !== 'REQUEST_SUCCEEDED') {
      const errorMessage = response?.message?.join(', ') || 'Unknown API error'
      throw new Error(`BLS API request failed: ${errorMessage}`)
    }

    // Transform response to our data model
    return this.transformApiResponse(response, dataSource)
  }

  /**
   * Gets the latest data point for a specific series
   */
  async getLatestData(seriesId: string): Promise<DataPoint> {
    const seriesData = await this.fetchSeries([seriesId])
    
    if (seriesData.length === 0) {
      throw new Error(`No data found for series ${seriesId}`)
    }

    const series = seriesData[0]
    const latestPoint = series.dataPoints.find(point => point.isLatest)
    
    if (!latestPoint) {
      // If no point is marked as latest, return the most recent one
      const sortedPoints = series.dataPoints.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.period.localeCompare(a.period)
      })
      
      if (sortedPoints.length === 0) {
        throw new Error(`No data points found for series ${seriesId}`)
      }
      
      return sortedPoints[0]
    }

    return latestPoint
  }

  /**
   * Makes the actual HTTP request to BLS API with retry logic
   */
  private async makeApiRequest(
    baseUrl: string,
    seriesIds: string[],
    options: FetchOptions,
    useApiKey: boolean
  ): Promise<BLSApiResponse> {
    const url = `${baseUrl}/timeseries/data/`
    
    // Build request payload
    const payload: any = {
      seriesid: seriesIds,
    }

    // Add optional parameters
    if (options.startYear) payload.startyear = options.startYear.toString()
    if (options.endYear) payload.endyear = options.endYear.toString()
    if (options.catalog && useApiKey) payload.catalog = options.catalog
    if (options.calculations && useApiKey) payload.calculations = options.calculations
    if (options.annualaverage && useApiKey) payload.annualaverage = options.annualaverage

    // Add API key for v2.0 requests
    if (useApiKey && this.apiKey) {
      payload.registrationkey = this.apiKey
    }

    let lastError: Error | null = null

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.debug(`BLS API request attempt ${attempt}/${this.maxRetries}`)
        
        const response: AxiosResponse<BLSApiResponse> = await this.axiosInstance.post(url, payload)
        
        // Update rate limiting counters
        this.updateRateLimitCounters()
        
        return response.data
      } catch (error) {
        lastError = error as Error
        logger.warn(`BLS API request attempt ${attempt} failed:`, error)

        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
          throw error
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt - 1)
          logger.info(`Retrying in ${delay}ms...`)
          await this.sleep(delay)
        }
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }

  /**
   * Transforms BLS API response to our internal data model
   */
  private transformApiResponse(response: BLSApiResponse, dataSource: DataSource): SeriesData[] {
    if (!response.Results?.series) {
      return []
    }

    return response.Results.series.map(series => {
      // Find matching indicator configuration
      const indicator = this.findIndicatorBySeriesId(series.seriesID, dataSource)
      
      // Transform data points
      const dataPoints: DataPoint[] = series.data.map(point => ({
        year: parseInt(point.year),
        period: point.period,
        periodName: point.periodName,
        value: parseFloat(point.value),
        footnotes: point.footnotes.map(fn => ({
          code: fn.code,
          text: fn.text,
        } as Footnote)),
        isLatest: point.latest === 'true',
        isPreliminary: point.footnotes.some(fn => fn.code === 'P'),
      }))

      // Create metadata
      const metadata: SeriesMetadata = {
        title: series.catalog?.series_title || indicator.name,
        seasonality: series.catalog?.seasonality || 'Unknown',
        surveyName: series.catalog?.survey_name || 'Unknown',
        measureDataType: series.catalog?.measure_data_type || 'Unknown',
        lastModified: new Date(),
      }

      return {
        seriesId: series.seriesID,
        indicator,
        dataPoints,
        metadata,
      }
    })
  }

  /**
   * Finds indicator configuration by series ID
   */
  private findIndicatorBySeriesId(seriesId: string, dataSource: DataSource): EconomicIndicator {
    const defaultIndicator = DEFAULT_INDICATORS.find(ind => ind.seriesId === seriesId)
    
    if (defaultIndicator) {
      return {
        ...defaultIndicator,
        id: this.generateIndicatorId(seriesId),
        lastUpdated: new Date(),
        source: dataSource,
      }
    }

    // Fallback for unknown series
    return {
      id: this.generateIndicatorId(seriesId),
      seriesId,
      name: `Series ${seriesId}`,
      description: `Economic indicator series ${seriesId}`,
      category: this.guessCategory(seriesId),
      unit: 'Unknown',
      frequency: this.guessFrequency(seriesId),
      lastUpdated: new Date(),
      source: dataSource,
    }
  }

  /**
   * Generates a consistent indicator ID from series ID
   */
  private generateIndicatorId(seriesId: string): string {
    return seriesId.toLowerCase().replace(/[^a-z0-9]/g, '-')
  }

  /**
   * Guesses indicator category from series ID patterns
   */
  private guessCategory(seriesId: string) {
    if (seriesId.startsWith('CU') || seriesId.startsWith('WP')) {
      return 'inflation' as any
    }
    if (seriesId.startsWith('LN') || seriesId.startsWith('CE')) {
      return 'employment' as any
    }
    return 'employment' as any // Default fallback
  }

  /**
   * Guesses data frequency from series ID patterns
   */
  private guessFrequency(_seriesId: string) {
    // Most BLS series are monthly
    return 'monthly' as any
  }

  /**
   * Checks and enforces rate limits
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now()
    
    // Reset counters if windows have expired
    if (now - this.requestWindow > 60000) { // 1 minute window
      this.requestCount = 0
      this.requestWindow = now
    }
    
    if (now - this.dailyWindow > 86400000) { // 24 hour window
      this.dailyRequestCount = 0
      this.dailyWindow = now
    }

    // Check rate limits
    const maxDaily = this.apiKey ? this.maxRequestsPerDayV2 : this.maxRequestsPerDayV1
    
    if (this.requestCount >= this.maxRequestsPerMinute) {
      const waitTime = 60000 - (now - this.requestWindow)
      logger.warn(`Rate limit reached, waiting ${waitTime}ms`)
      await this.sleep(waitTime)
      this.requestCount = 0
      this.requestWindow = Date.now()
    }
    
    if (this.dailyRequestCount >= maxDaily) {
      throw new Error(`Daily rate limit of ${maxDaily} requests exceeded`)
    }
  }

  /**
   * Updates rate limiting counters
   */
  private updateRateLimitCounters(): void {
    this.requestCount++
    this.dailyRequestCount++
  }

  /**
   * Sleep utility for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export a factory function for creating client instances
export function createBLSApiClient(config?: BLSApiClientConfig): BLSApiClient {
  return new BLSApiClientImpl(config)
}