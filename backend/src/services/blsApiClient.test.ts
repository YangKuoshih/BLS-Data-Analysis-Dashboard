import axios from 'axios'
import * as fc from 'fast-check'
import { BLSApiClientImpl, createBLSApiClient } from './blsApiClient'
import { BLS_SERIES_MAPPING, DataSource, DEFAULT_INDICATORS } from '../types/index'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock axios.isAxiosError
mockedAxios.isAxiosError = jest.fn()

// Mock logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

// Set up axios mock before any tests run
const mockAxiosInstance = {
  post: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}

mockedAxios.create.mockReturnValue(mockAxiosInstance)

describe('BLSApiClient', () => {
  let client: BLSApiClientImpl

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    mockAxiosInstance.post.mockClear()
  })

  beforeAll(() => {
    // Create client instance after mocks are set up
    client = new BLSApiClientImpl({
      apiKey: 'test-api-key',
      timeout: 5000,
      maxRetries: 2,
      retryDelayMs: 100,
    })
  })

  describe('constructor', () => {
    it('should create client with default configuration', () => {
      const defaultClient = createBLSApiClient()
      expect(defaultClient).toBeDefined()
      expect(mockedAxios.create).toHaveBeenCalledWith({
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Fed-Economic-Dashboard/1.0',
        },
      })
    })

    it('should create client with custom configuration', () => {
      const config = {
        apiKey: 'custom-key',
        timeout: 10000,
        maxRetries: 5,
      }
      
      const customClient = new BLSApiClientImpl(config)
      expect(customClient).toBeDefined()
    })
  })

  describe('validateConnection', () => {
    it('should return true when connection is successful', async () => {
      const mockResponse = {
        data: {
          status: 'REQUEST_SUCCEEDED',
          Results: {
            series: [{
              seriesID: BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE,
              data: [{
                year: '2024',
                period: 'M01',
                periodName: 'January',
                value: '3.7',
                footnotes: [],
              }],
            }],
          },
        },
      }
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse)
      
      const result = await client.validateConnection()
      expect(result).toBe(true)
    })

    it('should return false when connection fails', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'))
      
      const result = await client.validateConnection()
      expect(result).toBe(false)
    })
  })

  describe('fetchSeries', () => {
    const mockSuccessResponse = {
      data: {
        status: 'REQUEST_SUCCEEDED',
        responseTime: 100,
        message: [],
        Results: {
          series: [{
            seriesID: BLS_SERIES_MAPPING.CPI_ALL_ITEMS,
            data: [
              {
                year: '2024',
                period: 'M01',
                periodName: 'January',
                value: '310.326',
                footnotes: [],
                latest: 'true',
              },
              {
                year: '2023',
                period: 'M12',
                periodName: 'December',
                value: '310.077',
                footnotes: [],
              },
            ],
            catalog: {
              series_title: 'Consumer Price Index for All Urban Consumers: All Items in U.S. City Average',
              seasonality: 'Seasonally Adjusted',
              survey_name: 'Consumer Price Index',
              measure_data_type: 'Index',
            },
          }],
        },
      },
    }

    it('should fetch series data successfully with v2.0 API', async () => {
      mockAxiosInstance.post.mockResolvedValue(mockSuccessResponse)
      
      const result = await client.fetchSeries([BLS_SERIES_MAPPING.CPI_ALL_ITEMS])
      
      expect(result).toHaveLength(1)
      expect(result[0].seriesId).toBe(BLS_SERIES_MAPPING.CPI_ALL_ITEMS)
      expect(result[0].dataPoints).toHaveLength(2)
      expect(result[0].dataPoints[0].isLatest).toBe(true)
      expect(result[0].indicator.source).toBe(DataSource.BLS_V2)
      
      // Verify API call was made to v2.0 endpoint
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        'https://api.bls.gov/publicAPI/v2/timeseries/data/',
        expect.objectContaining({
          seriesid: [BLS_SERIES_MAPPING.CPI_ALL_ITEMS],
          registrationkey: 'test-api-key',
        })
      )
    })

    it('should fallback to v1.0 API when v2.0 fails', async () => {
      // Create a fresh client for this test
      const testClient = new BLSApiClientImpl({
        apiKey: 'test-api-key',
        timeout: 5000,
        maxRetries: 2,
        retryDelayMs: 100,
      })

      // Create a v1.0 response (without catalog data)
      const v1Response = {
        data: {
          status: 'REQUEST_SUCCEEDED',
          responseTime: 100,
          message: [],
          Results: {
            series: [{
              seriesID: BLS_SERIES_MAPPING.CPI_ALL_ITEMS,
              data: [
                {
                  year: '2024',
                  period: 'M01',
                  periodName: 'January',
                  value: '310.326',
                  footnotes: [],
                  latest: 'true',
                },
              ],
              // No catalog data for v1.0
            }],
          },
        },
      }

      // Clear any previous mock calls
      mockAxiosInstance.post.mockClear()

      // First call (v2.0) fails with retries, then v1.0 succeeds
      // The client has maxRetries: 2, so v2.0 will be tried 2 times, then fallback to v1.0
      mockAxiosInstance.post
        .mockRejectedValueOnce(new Error('API key invalid'))  // v2.0 attempt 1
        .mockRejectedValueOnce(new Error('API key invalid'))  // v2.0 attempt 2
        .mockResolvedValueOnce(v1Response)                    // v1.0 attempt 1
      
      const result = await testClient.fetchSeries([BLS_SERIES_MAPPING.CPI_ALL_ITEMS])
      
      expect(result).toHaveLength(1)
      expect(result[0].indicator.source).toBe(DataSource.BLS_V1)
      
      // Verify all API calls were made (2 retries for v2.0, then 1 success for v1.0)
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(3)
    })

    it('should handle API request with options', async () => {
      mockAxiosInstance.post.mockResolvedValue(mockSuccessResponse)
      
      const options = {
        startYear: 2020,
        endYear: 2024,
        catalog: true,
        calculations: true,
      }
      
      await client.fetchSeries([BLS_SERIES_MAPPING.CPI_ALL_ITEMS], options)
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        'https://api.bls.gov/publicAPI/v2/timeseries/data/',
        expect.objectContaining({
          seriesid: [BLS_SERIES_MAPPING.CPI_ALL_ITEMS],
          startyear: '2020',
          endyear: '2024',
          catalog: true,
          calculations: true,
          registrationkey: 'test-api-key',
        })
      )
    })

    it('should validate input parameters', async () => {
      // Empty series IDs
      await expect(client.fetchSeries([])).rejects.toThrow('Series IDs are required')
      
      // Too many series IDs
      const tooManySeries = Array(51).fill('TEST_SERIES')
      await expect(client.fetchSeries(tooManySeries)).rejects.toThrow('Maximum 50 series IDs allowed')
    })

    it('should handle API error responses', async () => {
      const errorResponse = {
        data: {
          status: 'REQUEST_FAILED',
          message: ['Invalid series ID'],
          Results: { series: [] },
        },
      }
      
      mockAxiosInstance.post.mockResolvedValue(errorResponse)
      
      await expect(client.fetchSeries([BLS_SERIES_MAPPING.CPI_ALL_ITEMS]))
        .rejects.toThrow('BLS API request failed: Invalid series ID')
    })

    it('should retry on server errors', async () => {
      const serverError = {
        response: { status: 500 },
        message: 'Internal Server Error',
      }
      
      mockAxiosInstance.post
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce(mockSuccessResponse)
      
      const result = await client.fetchSeries([BLS_SERIES_MAPPING.CPI_ALL_ITEMS])
      
      expect(result).toHaveLength(1)
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(3) // 2 retries + 1 success
    })

    it('should not retry on client errors', async () => {
      const clientError = {
        response: { status: 400 },
        message: 'Bad Request',
        isAxiosError: true,
      }
      
      // Mock axios.isAxiosError to return true for our error
      mockedAxios.isAxiosError.mockReturnValue(true)
      
      mockAxiosInstance.post.mockRejectedValue(clientError)
      
      await expect(client.fetchSeries([BLS_SERIES_MAPPING.CPI_ALL_ITEMS]))
        .rejects.toMatchObject({ response: { status: 400 } })
      
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2) // v2.0 fails, then v1.0 fails
    })
  })

  describe('getLatestData', () => {
    it('should return the latest data point', async () => {
      const mockResponse = {
        data: {
          status: 'REQUEST_SUCCEEDED',
          Results: {
            series: [{
              seriesID: BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE,
              data: [
                {
                  year: '2024',
                  period: 'M02',
                  periodName: 'February',
                  value: '3.9',
                  footnotes: [],
                },
                {
                  year: '2024',
                  period: 'M01',
                  periodName: 'January',
                  value: '3.7',
                  footnotes: [],
                  latest: 'true',
                },
              ],
            }],
          },
        },
      }
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse)
      
      const result = await client.getLatestData(BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE)
      
      expect(result.value).toBe(3.7)
      expect(result.periodName).toBe('January')
      expect(result.isLatest).toBe(true)
    })

    it('should return most recent data point when no latest flag', async () => {
      const mockResponse = {
        data: {
          status: 'REQUEST_SUCCEEDED',
          Results: {
            series: [{
              seriesID: BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE,
              data: [
                {
                  year: '2023',
                  period: 'M12',
                  periodName: 'December',
                  value: '3.5',
                  footnotes: [],
                },
                {
                  year: '2024',
                  period: 'M01',
                  periodName: 'January',
                  value: '3.7',
                  footnotes: [],
                },
              ],
            }],
          },
        },
      }
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse)
      
      const result = await client.getLatestData(BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE)
      
      expect(result.value).toBe(3.7)
      expect(result.year).toBe(2024)
    })

    it('should throw error when no data found', async () => {
      const mockResponse = {
        data: {
          status: 'REQUEST_SUCCEEDED',
          Results: { series: [] },
        },
      }
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse)
      
      await expect(client.getLatestData('INVALID_SERIES'))
        .rejects.toThrow('No data found for series INVALID_SERIES')
    })
  })

  describe('rate limiting', () => {
    it('should enforce rate limits', async () => {
      // Create a new client with very low rate limits for testing
      const testClient = new BLSApiClientImpl({
        apiKey: 'test-key',
        maxRetries: 1,
        retryDelayMs: 10,
      })
      
      // Mock a successful response
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          status: 'REQUEST_SUCCEEDED',
          Results: { series: [] },
        },
      })

      // Make multiple requests quickly to trigger rate limiting
      const promises = []
      for (let i = 0; i < 3; i++) {
        promises.push(testClient.fetchSeries([BLS_SERIES_MAPPING.CPI_ALL_ITEMS]))
      }
      
      await Promise.all(promises)
      
      // All requests should have been made (rate limiting is internal)
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(3)
    }, 10000) // Increase timeout for this test
  })

  describe('client without API key', () => {
    let clientWithoutKey: BLSApiClientImpl

    beforeEach(() => {
      clientWithoutKey = new BLSApiClientImpl({ apiKey: undefined })
    })

    it('should use v1.0 API when no API key provided', async () => {
      const mockResponse = {
        data: {
          status: 'REQUEST_SUCCEEDED',
          Results: {
            series: [{
              seriesID: BLS_SERIES_MAPPING.CPI_ALL_ITEMS,
              data: [{
                year: '2024',
                period: 'M01',
                periodName: 'January',
                value: '310.326',
                footnotes: [],
              }],
            }],
          },
        },
      }
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse)
      
      const result = await clientWithoutKey.fetchSeries([BLS_SERIES_MAPPING.CPI_ALL_ITEMS])
      
      expect(result[0].indicator.source).toBe(DataSource.BLS_V1)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        'https://api.bls.gov/publicAPI/v1/timeseries/data/',
        expect.not.objectContaining({ registrationkey: expect.anything() })
      )
    })
  })

  // Property-Based Tests
  describe('Property Tests', () => {
    describe('Property 15: API Fallback Mechanism', () => {
      /**
       * **Validates: Requirements 7.2**
       * 
       * For any BLS API v2.0 unavailability scenario, the system should automatically 
       * fall back to BLS API v1.0 and continue providing basic functionality.
       */
      it('should automatically fallback to v1.0 API when v2.0 is unavailable and continue providing basic functionality', async () => {
        await fc.assert(
          fc.asyncProperty(
            // Generator for API unavailability scenarios
            fc.record({
              // Different types of v2.0 failures
              v2FailureType: fc.constantFrom(
                'network_error',
                'timeout',
                'server_error',
                'authentication_error',
                'rate_limit_error',
                'invalid_response'
              ),
              // Series to test with (subset of key indicators)
              seriesIds: fc.shuffledSubarray(
                [
                  BLS_SERIES_MAPPING.CPI_ALL_ITEMS,
                  BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE,
                  BLS_SERIES_MAPPING.EMPLOYMENT_TOTAL,
                  BLS_SERIES_MAPPING.PPI_FINAL_DEMAND,
                ],
                { minLength: 1, maxLength: 4 }
              ),
              // Client configuration
              clientConfig: fc.record({
                apiKey: fc.string({ minLength: 10, maxLength: 50 }),
                timeout: fc.integer({ min: 1000, max: 10000 }),
                maxRetries: fc.integer({ min: 1, max: 3 }),
                retryDelayMs: fc.integer({ min: 50, max: 500 }),
              }),
              // Fetch options
              fetchOptions: fc.record({
                startYear: fc.option(fc.integer({ min: 2020, max: 2024 })),
                endYear: fc.option(fc.integer({ min: 2020, max: 2024 })),
                catalog: fc.boolean(),
              }),
              // Data characteristics for v1.0 response
              dataCharacteristics: fc.record({
                hasMultipleDataPoints: fc.boolean(),
                hasLatestFlag: fc.boolean(),
                includeFootnotes: fc.boolean(),
              }),
            }),
            async (scenario) => {
              // Clear previous mocks and reset
              mockAxiosInstance.post.mockClear()
              mockAxiosInstance.post.mockReset()

              // Create client with API key (to trigger v2.0 attempt)
              const testClient = new BLSApiClientImpl(scenario.clientConfig)

              // Generate v2.0 failure based on failure type
              let v2Error: any
              switch (scenario.v2FailureType) {
                case 'network_error':
                  v2Error = new Error('Network Error: ECONNREFUSED')
                  break
                case 'timeout':
                  v2Error = { code: 'ECONNABORTED', message: 'timeout of 5000ms exceeded' }
                  break
                case 'server_error':
                  v2Error = { response: { status: 500 }, message: 'Internal Server Error' }
                  break
                case 'authentication_error':
                  v2Error = { response: { status: 401 }, message: 'Unauthorized' }
                  break
                case 'rate_limit_error':
                  v2Error = { response: { status: 429 }, message: 'Too Many Requests' }
                  break
                case 'invalid_response':
                  v2Error = new Error('Invalid JSON response')
                  break
              }

              // Generate successful v1.0 response
              const v1Response = {
                data: {
                  status: 'REQUEST_SUCCEEDED',
                  responseTime: Math.floor(Math.random() * 1000) + 100,
                  message: [],
                  Results: {
                    series: scenario.seriesIds.map(seriesId => {
                      const indicator = DEFAULT_INDICATORS.find(ind => ind.seriesId === seriesId)
                      const dataPoints = []
                      
                      // Generate data points based on characteristics
                      if (scenario.dataCharacteristics.hasMultipleDataPoints) {
                        dataPoints.push(
                          {
                            year: '2023',
                            period: 'M12',
                            periodName: 'December',
                            value: (Math.random() * 900 + 100).toFixed(3),
                            footnotes: scenario.dataCharacteristics.includeFootnotes ? 
                              [{ code: 'U', text: 'Data unavailable' }] : [],
                          }
                        )
                      }
                      
                      dataPoints.push({
                        year: '2024',
                        period: 'M01',
                        periodName: 'January',
                        value: (Math.random() * 900 + 100).toFixed(3),
                        footnotes: scenario.dataCharacteristics.includeFootnotes ? 
                          [{ code: 'P', text: 'Preliminary' }] : [],
                        latest: scenario.dataCharacteristics.hasLatestFlag ? 'true' : undefined,
                      })

                      return {
                        seriesID: seriesId,
                        data: dataPoints,
                        // v1.0 API doesn't include catalog data
                      }
                    }),
                  },
                },
              }

              // Set up mock sequence: v2.0 fails (with retries), v1.0 succeeds
              const totalV2Attempts = scenario.clientConfig.maxRetries
              
              // Create a new mock implementation for this test
              const mockCalls: any[] = []
              
              // Mock all v2.0 attempts to fail
              for (let i = 0; i < totalV2Attempts; i++) {
                mockCalls.push(Promise.reject(v2Error))
              }
              
              // Mock v1.0 to succeed
              mockCalls.push(Promise.resolve(v1Response))

              // Set up the mock to return the appropriate response for each call
              let callIndex = 0
              mockAxiosInstance.post.mockImplementation(() => {
                const result = mockCalls[callIndex]
                callIndex++
                return result
              })

              // Execute the property: attempt to fetch series data
              const result = await testClient.fetchSeries(scenario.seriesIds, scenario.fetchOptions)

              // Property assertions: System should fallback and provide basic functionality

              // 1. Should return data for all requested series
              expect(result).toHaveLength(scenario.seriesIds.length)
              
              // 2. All returned series should use v1.0 data source (indicating fallback occurred)
              result.forEach(series => {
                expect(series.indicator.source).toBe(DataSource.BLS_V1)
              })

              // 3. Should contain all requested series IDs
              const resultSeriesIds = result.map(series => series.seriesId)
              scenario.seriesIds.forEach(requestedId => {
                expect(resultSeriesIds).toContain(requestedId)
              })

              // 4. Each series should have basic functionality (valid data structure)
              result.forEach(series => {
                // Valid series identification
                expect(series.seriesId).toBeTruthy()
                expect(typeof series.seriesId).toBe('string')

                // Valid indicator metadata (basic functionality)
                expect(series.indicator).toBeDefined()
                expect(series.indicator.id).toBeTruthy()
                expect(series.indicator.name).toBeTruthy()
                expect(series.indicator.category).toBeTruthy()
                expect(series.indicator.source).toBe(DataSource.BLS_V1)

                // Valid data points (core functionality)
                expect(series.dataPoints).toBeDefined()
                expect(series.dataPoints.length).toBeGreaterThan(0)

                // All data points should have valid structure
                series.dataPoints.forEach(point => {
                  expect(typeof point.year).toBe('number')
                  expect(point.year).toBeGreaterThan(2000)
                  expect(typeof point.period).toBe('string')
                  expect(typeof point.periodName).toBe('string')
                  expect(typeof point.value).toBe('number')
                  expect(point.value).toBeGreaterThan(0)
                  expect(Array.isArray(point.footnotes)).toBe(true)
                  expect(typeof point.isLatest).toBe('boolean')
                  expect(typeof point.isPreliminary).toBe('boolean')
                })

                // Valid metadata (basic functionality)
                expect(series.metadata).toBeDefined()
                expect(series.metadata.title).toBeTruthy()
                expect(series.metadata.lastModified).toBeInstanceOf(Date)
              })

              // 5. Verify API call sequence: v2.0 attempts followed by v1.0 success
              const totalExpectedCalls = totalV2Attempts + 1 // v2.0 retries + v1.0 success
              expect(mockAxiosInstance.post).toHaveBeenCalledTimes(totalExpectedCalls)
            }
          ),
          { 
            numRuns: 50, // Reduced runs for stability
            timeout: 20000, // 20 second timeout for property test
          }
        )
      }, 25000) // Increase Jest timeout for this property test

      it('should handle edge case where both v2.0 and v1.0 fail', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.record({
              seriesIds: fc.shuffledSubarray(
                [BLS_SERIES_MAPPING.CPI_ALL_ITEMS, BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE],
                { minLength: 1, maxLength: 2 }
              ),
              clientConfig: fc.record({
                apiKey: fc.string({ minLength: 10, maxLength: 50 }),
                maxRetries: fc.integer({ min: 1, max: 2 }),
                retryDelayMs: fc.integer({ min: 10, max: 50 }), // Faster retries for test
              }),
            }),
            async (scenario) => {
              mockAxiosInstance.post.mockClear()

              const testClient = new BLSApiClientImpl(scenario.clientConfig)

              // Mock both v2.0 and v1.0 to fail
              const error = new Error('Service Unavailable')
              mockAxiosInstance.post.mockRejectedValue(error)

              // Should throw error when both APIs fail
              await expect(testClient.fetchSeries(scenario.seriesIds))
                .rejects.toThrow()

              // Should have attempted both v2.0 and v1.0
              const totalExpectedCalls = scenario.clientConfig.maxRetries * 2 // v2.0 retries + v1.0 retries
              expect(mockAxiosInstance.post).toHaveBeenCalledTimes(totalExpectedCalls)
            }
          ),
          { numRuns: 20, timeout: 10000 } // Reduced runs and timeout
        )
      }, 15000)
    })

    describe('Property 1: Complete Economic Data Loading', () => {
      /**
       * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
       * 
       * For any dashboard startup, all six key economic indicators (CPI, PPI, unemployment rate, 
       * employment statistics, labor force participation rate, and average hourly earnings) 
       * should be successfully retrieved and available for display.
       */
      it('should successfully load all six key economic indicators for any dashboard startup scenario', async () => {
        await fc.assert(
          fc.asyncProperty(
            // Generator for dashboard startup scenarios
            fc.record({
              apiKey: fc.option(fc.string({ minLength: 10, maxLength: 50 }), { freq: 70 }),
              timeout: fc.integer({ min: 1000, max: 30000 }),
              maxRetries: fc.integer({ min: 1, max: 5 }),
              retryDelayMs: fc.integer({ min: 50, max: 2000 }),
              startYear: fc.option(fc.integer({ min: 2020, max: 2024 })),
              endYear: fc.option(fc.integer({ min: 2020, max: 2024 })),
              includeMetadata: fc.boolean(),
            }),
            async (scenario) => {
              // Clear previous mocks
              mockAxiosInstance.post.mockClear()

              // Create client with generated configuration
              const testClient = new BLSApiClientImpl({
                apiKey: scenario.apiKey || undefined,
                timeout: scenario.timeout,
                maxRetries: scenario.maxRetries,
                retryDelayMs: scenario.retryDelayMs,
              })

              // All six key economic indicators that must be loaded
              const requiredSeriesIds = [
                BLS_SERIES_MAPPING.CPI_ALL_ITEMS,           // Consumer Price Index
                BLS_SERIES_MAPPING.PPI_FINAL_DEMAND,        // Producer Price Index
                BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE,       // Unemployment Rate
                BLS_SERIES_MAPPING.EMPLOYMENT_TOTAL,        // Employment Statistics
                BLS_SERIES_MAPPING.LABOR_FORCE_PARTICIPATION, // Labor Force Participation Rate
                BLS_SERIES_MAPPING.AVERAGE_HOURLY_EARNINGS,  // Average Hourly Earnings
              ]

              // Generate mock response for all six indicators
              const mockResponse = {
                data: {
                  status: 'REQUEST_SUCCEEDED',
                  responseTime: Math.floor(Math.random() * 1950) + 50,
                  message: [],
                  Results: {
                    series: requiredSeriesIds.map(seriesId => {
                      const indicator = DEFAULT_INDICATORS.find(ind => ind.seriesId === seriesId)
                      return {
                        seriesID: seriesId,
                        data: [
                          {
                            year: '2024',
                            period: 'M01',
                            periodName: 'January',
                            value: (Math.random() * 900 + 100).toFixed(3),
                            footnotes: [],
                            latest: 'true',
                          },
                          {
                            year: '2023',
                            period: 'M12',
                            periodName: 'December',
                            value: (Math.random() * 900 + 100).toFixed(3),
                            footnotes: [],
                          },
                        ],
                        catalog: scenario.includeMetadata ? {
                          series_title: indicator?.name || `Series ${seriesId}`,
                          seasonality: 'Seasonally Adjusted',
                          survey_name: indicator?.category || 'Economic Survey',
                          measure_data_type: indicator?.unit || 'Index',
                        } : undefined,
                      }
                    }),
                  },
                },
              }

              // Mock successful API response
              mockAxiosInstance.post.mockResolvedValue(mockResponse)

              // Prepare fetch options
              const fetchOptions: any = {}
              if (scenario.startYear) fetchOptions.startYear = scenario.startYear
              if (scenario.endYear) fetchOptions.endYear = scenario.endYear
              if (scenario.includeMetadata) fetchOptions.catalog = true

              // Execute the property: fetch all six key economic indicators
              const result = await testClient.fetchSeries(requiredSeriesIds, fetchOptions)

              // Property assertions: All six indicators must be successfully loaded
              expect(result).toHaveLength(6)

              // Verify each required indicator is present and has valid data
              const resultSeriesIds = result.map(series => series.seriesId)
              requiredSeriesIds.forEach(requiredId => {
                expect(resultSeriesIds).toContain(requiredId)
              })

              // Verify each series has valid data structure
              result.forEach(series => {
                // Must have valid series ID
                expect(series.seriesId).toBeTruthy()
                expect(typeof series.seriesId).toBe('string')

                // Must have indicator metadata
                expect(series.indicator).toBeDefined()
                expect(series.indicator.id).toBeTruthy()
                expect(series.indicator.name).toBeTruthy()
                expect(series.indicator.category).toBeTruthy()

                // Must have at least one data point
                expect(series.dataPoints).toBeDefined()
                expect(series.dataPoints.length).toBeGreaterThan(0)

                // Must have at least one latest data point
                const hasLatestPoint = series.dataPoints.some(point => point.isLatest)
                expect(hasLatestPoint).toBe(true)

                // All data points must have valid structure
                series.dataPoints.forEach(point => {
                  expect(typeof point.year).toBe('number')
                  expect(point.year).toBeGreaterThan(2000)
                  expect(typeof point.period).toBe('string')
                  expect(typeof point.periodName).toBe('string')
                  expect(typeof point.value).toBe('number')
                  expect(point.value).toBeGreaterThan(0)
                  expect(Array.isArray(point.footnotes)).toBe(true)
                  expect(typeof point.isLatest).toBe('boolean')
                  expect(typeof point.isPreliminary).toBe('boolean')
                })

                // Must have valid metadata
                expect(series.metadata).toBeDefined()
                expect(series.metadata.title).toBeTruthy()
                expect(series.metadata.lastModified).toBeInstanceOf(Date)
              })

              // Verify API was called appropriately
              expect(mockAxiosInstance.post).toHaveBeenCalled()
              
              // Verify the correct API endpoint was used based on API key availability
              const expectedEndpoint = scenario.apiKey 
                ? 'https://api.bls.gov/publicAPI/v2/timeseries/data/'
                : 'https://api.bls.gov/publicAPI/v1/timeseries/data/'
              
              expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                expectedEndpoint,
                expect.objectContaining({
                  seriesid: requiredSeriesIds,
                })
              )
            }
          ),
          { 
            numRuns: 100, // Run 100 different scenarios
            timeout: 30000, // 30 second timeout for property test
          }
        )
      }, 35000) // Increase Jest timeout for this property test
    })

    describe('Property 17: Error Handling and Logging', () => {
      /**
       * **Validates: Requirements 7.4**
       * 
       * For any API error condition, the system should log the error details and display 
       * user-friendly error messages without exposing technical details.
       */
      it('should log error details and display user-friendly messages for any API error condition', async () => {
        await fc.assert(
          fc.asyncProperty(
            // Generator for various API error scenarios
            fc.record({
              // Different types of API errors
              errorType: fc.constantFrom(
                'network_timeout',
                'connection_refused',
                'server_error_500',
                'server_error_502',
                'server_error_503',
                'client_error_400',
                'client_error_401',
                'client_error_403',
                'client_error_404',
                'client_error_429',
                'invalid_json_response',
                'empty_response',
                'malformed_response',
                'dns_resolution_error',
                'ssl_certificate_error'
              ),
              // Series to test with
              seriesIds: fc.shuffledSubarray(
                [
                  BLS_SERIES_MAPPING.CPI_ALL_ITEMS,
                  BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE,
                  BLS_SERIES_MAPPING.EMPLOYMENT_TOTAL,
                ],
                { minLength: 1, maxLength: 3 }
              ),
              // Client configuration
              clientConfig: fc.record({
                apiKey: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
                timeout: fc.integer({ min: 1000, max: 5000 }),
                maxRetries: fc.integer({ min: 1, max: 3 }),
                retryDelayMs: fc.integer({ min: 10, max: 100 }), // Fast retries for testing
              }),
              // Additional error details
              errorDetails: fc.record({
                statusCode: fc.option(fc.integer({ min: 400, max: 599 })),
                errorMessage: fc.option(fc.string({ minLength: 5, maxLength: 100 })),
                includeStack: fc.boolean(),
                includeHeaders: fc.boolean(),
              }),
            }),
            async (scenario) => {
              // Clear previous mocks and reset logger
              mockAxiosInstance.post.mockClear()
              const { logger } = require('../utils/logger')
              logger.error.mockClear()
              logger.warn.mockClear()
              logger.info.mockClear()
              logger.debug.mockClear()

              // Create client with generated configuration
              const testClient = new BLSApiClientImpl(scenario.clientConfig)

              // Generate specific error based on error type
              let mockError: any
              let expectedUserFriendlyMessage: string
              let shouldLogTechnicalDetails = true

              switch (scenario.errorType) {
                case 'network_timeout':
                  mockError = {
                    code: 'ECONNABORTED',
                    message: 'timeout of 5000ms exceeded',
                    config: { url: 'https://api.bls.gov/publicAPI/v2/timeseries/data/' },
                  }
                  expectedUserFriendlyMessage = 'timeout'
                  break

                case 'connection_refused':
                  mockError = {
                    code: 'ECONNREFUSED',
                    message: 'connect ECONNREFUSED 127.0.0.1:443',
                    errno: -61,
                  }
                  expectedUserFriendlyMessage = 'connection'
                  break

                case 'server_error_500':
                  mockError = {
                    response: { 
                      status: 500,
                      statusText: 'Internal Server Error',
                      data: { error: 'Database connection failed' },
                    },
                    message: 'Request failed with status code 500',
                    isAxiosError: true,
                  }
                  expectedUserFriendlyMessage = 'server error'
                  break

                case 'server_error_502':
                  mockError = {
                    response: { 
                      status: 502,
                      statusText: 'Bad Gateway',
                      data: '<html><body>502 Bad Gateway</body></html>',
                    },
                    message: 'Request failed with status code 502',
                    isAxiosError: true,
                  }
                  expectedUserFriendlyMessage = 'server error'
                  break

                case 'server_error_503':
                  mockError = {
                    response: { 
                      status: 503,
                      statusText: 'Service Unavailable',
                      data: { message: 'Service temporarily unavailable' },
                    },
                    message: 'Request failed with status code 503',
                    isAxiosError: true,
                  }
                  expectedUserFriendlyMessage = 'service unavailable'
                  break

                case 'client_error_400':
                  mockError = {
                    response: { 
                      status: 400,
                      statusText: 'Bad Request',
                      data: { error: 'Invalid series ID format' },
                    },
                    message: 'Request failed with status code 400',
                    isAxiosError: true,
                  }
                  expectedUserFriendlyMessage = 'bad request'
                  break

                case 'client_error_401':
                  mockError = {
                    response: { 
                      status: 401,
                      statusText: 'Unauthorized',
                      data: { error: 'Invalid API key' },
                    },
                    message: 'Request failed with status code 401',
                    isAxiosError: true,
                  }
                  expectedUserFriendlyMessage = 'unauthorized'
                  break

                case 'client_error_403':
                  mockError = {
                    response: { 
                      status: 403,
                      statusText: 'Forbidden',
                      data: { error: 'Access denied to this resource' },
                    },
                    message: 'Request failed with status code 403',
                    isAxiosError: true,
                  }
                  expectedUserFriendlyMessage = 'forbidden'
                  break

                case 'client_error_404':
                  mockError = {
                    response: { 
                      status: 404,
                      statusText: 'Not Found',
                      data: { error: 'Endpoint not found' },
                    },
                    message: 'Request failed with status code 404',
                    isAxiosError: true,
                  }
                  expectedUserFriendlyMessage = 'not found'
                  break

                case 'client_error_429':
                  mockError = {
                    response: { 
                      status: 429,
                      statusText: 'Too Many Requests',
                      data: { error: 'Rate limit exceeded' },
                    },
                    message: 'Request failed with status code 429',
                    isAxiosError: true,
                  }
                  expectedUserFriendlyMessage = 'rate limit'
                  break

                case 'invalid_json_response':
                  mockError = new SyntaxError('Unexpected token < in JSON at position 0')
                  expectedUserFriendlyMessage = 'invalid response'
                  break

                case 'empty_response':
                  mockError = {
                    response: { 
                      status: 200,
                      data: null,
                    },
                    message: 'Empty response received',
                  }
                  expectedUserFriendlyMessage = 'empty response'
                  break

                case 'malformed_response':
                  mockError = {
                    response: { 
                      status: 200,
                      data: { status: 'INVALID_STATUS', message: 'Malformed response structure' },
                    },
                    message: 'Malformed API response',
                  }
                  expectedUserFriendlyMessage = 'malformed response'
                  break

                case 'dns_resolution_error':
                  mockError = {
                    code: 'ENOTFOUND',
                    message: 'getaddrinfo ENOTFOUND api.bls.gov',
                    hostname: 'api.bls.gov',
                  }
                  expectedUserFriendlyMessage = 'dns'
                  break

                case 'ssl_certificate_error':
                  mockError = {
                    code: 'CERT_UNTRUSTED',
                    message: 'certificate verify failed: self signed certificate',
                  }
                  expectedUserFriendlyMessage = 'certificate'
                  break

                default:
                  mockError = new Error('Unknown error')
                  expectedUserFriendlyMessage = 'unknown error'
              }

              // Mock axios.isAxiosError for axios errors
              if (mockError.isAxiosError) {
                mockedAxios.isAxiosError.mockReturnValue(true)
              } else {
                mockedAxios.isAxiosError.mockReturnValue(false)
              }

              // Set up mock to always fail with the generated error
              mockAxiosInstance.post.mockRejectedValue(mockError)

              // Execute the property: attempt to fetch series data (should fail)
              let thrownError: Error | null = null
              try {
                await testClient.fetchSeries(scenario.seriesIds)
              } catch (error) {
                thrownError = error as Error
              }

              // Property assertions: Error handling and logging requirements

              // 1. System should throw an error (not crash silently)
              expect(thrownError).toBeTruthy()
              expect(thrownError).toBeInstanceOf(Error)

              // 2. Error message should be user-friendly (not expose technical details)
              const errorMessage = thrownError!.message.toLowerCase()
              
              // Should not expose sensitive technical details
              expect(errorMessage).not.toMatch(/stack trace/i)
              expect(errorMessage).not.toMatch(/internal server error details/i)
              expect(errorMessage).not.toMatch(/database/i)
              expect(errorMessage).not.toMatch(/sql/i)
              expect(errorMessage).not.toMatch(/connection string/i)
              expect(errorMessage).not.toMatch(/api key/i) // Should not expose actual API key
              expect(errorMessage).not.toMatch(/password/i)
              expect(errorMessage).not.toMatch(/secret/i)
              expect(errorMessage).not.toMatch(/token/i)

              // Should contain user-friendly information
              const containsUserFriendlyInfo = 
                errorMessage.includes('bls api') ||
                errorMessage.includes('request failed') ||
                errorMessage.includes('service') ||
                errorMessage.includes('unavailable') ||
                errorMessage.includes('error') ||
                errorMessage.includes('failed')
              
              expect(containsUserFriendlyInfo).toBe(true)

              // 3. System should log error details (technical details go to logs, not user)
              expect(logger.error).toHaveBeenCalled()
              
              // Verify error logging calls contain technical details
              const errorLogCalls = logger.error.mock.calls
              const hasErrorLogging = errorLogCalls.some((call: any[]) => {
                const logMessage = call.join(' ').toLowerCase()
                return logMessage.includes('error') || logMessage.includes('failed')
              })
              expect(hasErrorLogging).toBe(true)

              // 4. System should log warning messages during retry attempts
              if (scenario.clientConfig.maxRetries > 1) {
                expect(logger.warn).toHaveBeenCalled()
                
                const warnLogCalls = logger.warn.mock.calls
                const hasRetryWarning = warnLogCalls.some((call: any[]) => {
                  const logMessage = call.join(' ').toLowerCase()
                  return logMessage.includes('attempt') || logMessage.includes('failed') || logMessage.includes('retry')
                })
                expect(hasRetryWarning).toBe(true)
              }

              // 5. System should log informational messages about API attempts
              expect(logger.info).toHaveBeenCalled()
              
              const infoLogCalls = logger.info.mock.calls
              const hasApiAttemptLogging = infoLogCalls.some((call: any[]) => {
                const logMessage = call.join(' ').toLowerCase()
                return logMessage.includes('attempting') || logMessage.includes('api') || logMessage.includes('request')
              })
              expect(hasApiAttemptLogging).toBe(true)

              // 6. System should maintain stability (not crash the process)
              // This is implicitly tested by the fact that we can make assertions after the error

              // 7. Verify appropriate number of retry attempts were made
              const expectedAttempts = scenario.clientConfig.apiKey ? 
                scenario.clientConfig.maxRetries * 2 : // v2.0 retries + v1.0 retries
                scenario.clientConfig.maxRetries      // only v1.0 retries

              expect(mockAxiosInstance.post).toHaveBeenCalledTimes(expectedAttempts)

              // 8. Verify logging doesn't expose sensitive information
              const allLogCalls = [
                ...logger.error.mock.calls,
                ...logger.warn.mock.calls,
                ...logger.info.mock.calls,
                ...logger.debug.mock.calls,
              ]
              
              allLogCalls.forEach((call: any[]) => {
                const logContent = call.join(' ').toLowerCase()
                // Logs can contain technical details, but not sensitive data
                expect(logContent).not.toMatch(/password/i)
                expect(logContent).not.toMatch(/secret/i)
                expect(logContent).not.toMatch(/private.*key/i)
                // API key logging is acceptable in debug/error logs for troubleshooting
              })
            }
          ),
          { 
            numRuns: 75, // Test many different error scenarios
            timeout: 25000, // 25 second timeout for property test
          }
        )
      }, 30000) // Increase Jest timeout for this property test

      it('should handle edge case where logging itself fails', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.record({
              seriesIds: fc.shuffledSubarray(
                [BLS_SERIES_MAPPING.CPI_ALL_ITEMS, BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE],
                { minLength: 1, maxLength: 2 }
              ),
              clientConfig: fc.record({
                apiKey: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
                maxRetries: fc.integer({ min: 1, max: 2 }),
                retryDelayMs: fc.integer({ min: 10, max: 50 }),
              }),
            }),
            async (scenario) => {
              mockAxiosInstance.post.mockClear()
              const { logger } = require('../utils/logger')
              
              // Make logger methods throw errors
              logger.error.mockImplementation(() => { throw new Error('Logging failed') })
              logger.warn.mockImplementation(() => { throw new Error('Logging failed') })
              logger.info.mockImplementation(() => { throw new Error('Logging failed') })

              const testClient = new BLSApiClientImpl(scenario.clientConfig)

              // Mock API to fail
              const apiError = new Error('API request failed')
              mockAxiosInstance.post.mockRejectedValue(apiError)

              // Should still throw the original API error, not the logging error
              let thrownError: Error | null = null
              try {
                await testClient.fetchSeries(scenario.seriesIds)
              } catch (error) {
                thrownError = error as Error
              }

              // Should throw the API error, not crash due to logging failure
              expect(thrownError).toBeTruthy()
              expect(thrownError!.message).toContain('API') // Should be API-related error
              expect(thrownError!.message).not.toContain('Logging failed') // Should not be logging error
            }
          ),
          { numRuns: 20, timeout: 10000 }
        )
      }, 15000)
    })
  })
})