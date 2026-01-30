// Core data models for Economic Indicators Dashboard Backend

export enum IndicatorCategory {
  INFLATION = 'inflation',
  EMPLOYMENT = 'employment',
  WAGES = 'wages',
  LABOR_FORCE = 'labor_force',
}

export enum DataFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
}

export enum DataSource {
  BLS_V1 = 'bls_v1',
  BLS_V2 = 'bls_v2',
}

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'xlsx',
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Core Economic Indicator Interface
export interface EconomicIndicator {
  id: string // Internal identifier
  seriesId: string // BLS series ID
  name: string // Display name (e.g., "Consumer Price Index")
  description: string // Detailed description
  category: IndicatorCategory // CPI, PPI, Employment, etc.
  unit: string // Measurement unit
  frequency: DataFrequency // Monthly, Quarterly, Annual
  lastUpdated: Date // Last data update timestamp
  source: DataSource // BLS API version used
}

// Data Point Interface
export interface DataPoint {
  year: number
  period: string // M01-M12 for monthly, Q01-Q04 for quarterly
  periodName: string // "January", "1st Quarter", etc.
  value: number
  footnotes: Footnote[]
  isLatest: boolean
  isPreliminary: boolean
}

// Footnote Interface
export interface Footnote {
  code: string
  text: string
}

// Series Metadata Interface
export interface SeriesMetadata {
  title: string
  seasonality: string // "Seasonally Adjusted", "Not Seasonally Adjusted"
  surveyName: string
  measureDataType: string
  lastModified: Date
}

// Series Data Interface
export interface SeriesData {
  seriesId: string
  indicator: EconomicIndicator
  dataPoints: DataPoint[]
  metadata: SeriesMetadata
}

// Export Configuration Interfaces
export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface ExportConfig {
  format: ExportFormat
  indicators: string[] // Indicator IDs to include
  dateRange: DateRange
  includeMetadata: boolean
  filename: string
}

export interface ExportResult {
  jobId: string
  status: ExportStatus
  downloadUrl?: string
  createdAt: Date
  expiresAt: Date
}

// BLS API Integration Models
export interface BLSApiResponse {
  status: string
  responseTime: number
  message: string[]
  Results: BLSResults
}

export interface BLSResults {
  series: BLSSeries[]
}

export interface BLSSeries {
  seriesID: string
  data: BLSDataPoint[]
  catalog?: BLSCatalog
}

export interface BLSDataPoint {
  year: string
  period: string
  periodName: string
  value: string
  footnotes: BLSFootnote[]
  latest?: string
}

export interface BLSFootnote {
  code: string
  text: string
}

export interface BLSCatalog {
  series_title: string
  seasonality: string
  survey_name: string
  measure_data_type: string
}

// API Client Interfaces
export interface FetchOptions {
  startYear?: number
  endYear?: number
  catalog?: boolean
  calculations?: boolean
  annualaverage?: boolean
}

export interface BLSApiClient {
  fetchSeries(seriesIds: string[], options?: FetchOptions): Promise<SeriesData[]>
  getLatestData(seriesId: string): Promise<DataPoint>
  validateConnection(): Promise<boolean>
}

export interface CacheManager {
  get(key: string): Promise<CachedData | null>
  set(key: string, data: any, ttl: number): Promise<void>
  invalidate(pattern: string): Promise<void>
}

export interface CachedData {
  data: any
  timestamp: Date
  ttl: number
}

export interface UpdateScheduler {
  scheduleUpdate(seriesId: string, schedule: string): void
  triggerManualUpdate(seriesIds: string[]): Promise<UpdateResult>
  getLastUpdateTime(seriesId: string): Date
}

export interface UpdateResult {
  success: boolean
  seriesId: string
  timestamp: Date
  error?: string
}

// API Response Interfaces
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  timestamp: Date
}

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Request/Response Types
export interface GetIndicatorsResponse {
  indicators: EconomicIndicator[]
}

export interface GetSeriesDataResponse {
  seriesData: SeriesData
}

export interface GetLatestDataResponse {
  dataPoint: DataPoint
}

export interface CreateExportRequest {
  config: ExportConfig
}

export interface CreateExportResponse {
  exportJob: ExportResult
}

// Configuration Interfaces
export interface ServerConfig {
  port: number
  nodeEnv: string
  blsApiKey?: string
  blsApiBaseUrl: string
  blsApiVersion: string
  cacheTtlMinutes: number
  cacheMaxSize: number
  rateLimitWindowMs: number
  rateLimitMaxRequests: number
  logLevel: string
  logFile: string
}

// BLS Series Mapping Constants
export const BLS_SERIES_MAPPING = {
  CPI_ALL_ITEMS: 'CUUR0000SA0', // CPI-U All Items
  CPI_CORE: 'CUUR0000SA0L1E', // CPI-U All Items Less Food & Energy
  PPI_FINAL_DEMAND: 'WPUFD49207', // PPI Final Demand
  UNEMPLOYMENT_RATE: 'LNS14000000', // Unemployment Rate
  EMPLOYMENT_TOTAL: 'CES0000000001', // Total Nonfarm Employment
  LABOR_FORCE_PARTICIPATION: 'LNS11300000', // Labor Force Participation Rate
  AVERAGE_HOURLY_EARNINGS: 'CES0500000003', // Average Hourly Earnings
} as const

// Type for BLS Series IDs
export type BLSSeriesId = typeof BLS_SERIES_MAPPING[keyof typeof BLS_SERIES_MAPPING]

// Default Economic Indicators Configuration
export const DEFAULT_INDICATORS: Omit<EconomicIndicator, 'id' | 'lastUpdated'>[] = [
  {
    seriesId: BLS_SERIES_MAPPING.CPI_ALL_ITEMS,
    name: 'Consumer Price Index (All Items)',
    description: 'Consumer Price Index for All Urban Consumers: All Items in U.S. City Average',
    category: IndicatorCategory.INFLATION,
    unit: 'Index 1982-84=100',
    frequency: DataFrequency.MONTHLY,
    source: DataSource.BLS_V2,
  },
  {
    seriesId: BLS_SERIES_MAPPING.CPI_CORE,
    name: 'Core Consumer Price Index',
    description: 'Consumer Price Index for All Urban Consumers: All Items Less Food and Energy',
    category: IndicatorCategory.INFLATION,
    unit: 'Index 1982-84=100',
    frequency: DataFrequency.MONTHLY,
    source: DataSource.BLS_V2,
  },
  {
    seriesId: BLS_SERIES_MAPPING.PPI_FINAL_DEMAND,
    name: 'Producer Price Index (Final Demand)',
    description: 'Producer Price Index by Commodity: Final Demand',
    category: IndicatorCategory.INFLATION,
    unit: 'Index Nov 2009=100',
    frequency: DataFrequency.MONTHLY,
    source: DataSource.BLS_V2,
  },
  {
    seriesId: BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE,
    name: 'Unemployment Rate',
    description: 'Unemployment Rate - 16 years and over',
    category: IndicatorCategory.EMPLOYMENT,
    unit: 'Percent',
    frequency: DataFrequency.MONTHLY,
    source: DataSource.BLS_V2,
  },
  {
    seriesId: BLS_SERIES_MAPPING.EMPLOYMENT_TOTAL,
    name: 'Total Nonfarm Employment',
    description: 'All Employees, Total Nonfarm',
    category: IndicatorCategory.EMPLOYMENT,
    unit: 'Thousands of Persons',
    frequency: DataFrequency.MONTHLY,
    source: DataSource.BLS_V2,
  },
  {
    seriesId: BLS_SERIES_MAPPING.LABOR_FORCE_PARTICIPATION,
    name: 'Labor Force Participation Rate',
    description: 'Labor Force Participation Rate - 16 years and over',
    category: IndicatorCategory.LABOR_FORCE,
    unit: 'Percent',
    frequency: DataFrequency.MONTHLY,
    source: DataSource.BLS_V2,
  },
  {
    seriesId: BLS_SERIES_MAPPING.AVERAGE_HOURLY_EARNINGS,
    name: 'Average Hourly Earnings',
    description: 'Average Hourly Earnings of All Employees, Total Private',
    category: IndicatorCategory.WAGES,
    unit: 'Dollars per Hour',
    frequency: DataFrequency.MONTHLY,
    source: DataSource.BLS_V2,
  },
]