import {
  IndicatorCategory,
  DataFrequency,
  DataSource,
  BLS_SERIES_MAPPING,
  DEFAULT_INDICATORS,
} from './index'

describe('Backend Type Definitions', () => {
  test('IndicatorCategory enum has correct values', () => {
    expect(IndicatorCategory.INFLATION).toBe('inflation')
    expect(IndicatorCategory.EMPLOYMENT).toBe('employment')
    expect(IndicatorCategory.WAGES).toBe('wages')
    expect(IndicatorCategory.LABOR_FORCE).toBe('labor_force')
  })

  test('DataFrequency enum has correct values', () => {
    expect(DataFrequency.MONTHLY).toBe('monthly')
    expect(DataFrequency.QUARTERLY).toBe('quarterly')
    expect(DataFrequency.ANNUAL).toBe('annual')
  })

  test('DataSource enum has correct values', () => {
    expect(DataSource.BLS_V1).toBe('bls_v1')
    expect(DataSource.BLS_V2).toBe('bls_v2')
  })

  test('BLS_SERIES_MAPPING contains all required series', () => {
    expect(BLS_SERIES_MAPPING.CPI_ALL_ITEMS).toBe('CUUR0000SA0')
    expect(BLS_SERIES_MAPPING.CPI_CORE).toBe('CUUR0000SA0L1E')
    expect(BLS_SERIES_MAPPING.PPI_FINAL_DEMAND).toBe('WPUFD49207')
    expect(BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE).toBe('LNS14000000')
    expect(BLS_SERIES_MAPPING.EMPLOYMENT_TOTAL).toBe('CES0000000001')
    expect(BLS_SERIES_MAPPING.LABOR_FORCE_PARTICIPATION).toBe('LNS11300000')
    expect(BLS_SERIES_MAPPING.AVERAGE_HOURLY_EARNINGS).toBe('CES0500000003')
  })

  test('DEFAULT_INDICATORS contains all 7 required indicators', () => {
    expect(DEFAULT_INDICATORS).toHaveLength(7)
    
    const seriesIds = DEFAULT_INDICATORS.map(indicator => indicator.seriesId)
    expect(seriesIds).toContain(BLS_SERIES_MAPPING.CPI_ALL_ITEMS)
    expect(seriesIds).toContain(BLS_SERIES_MAPPING.CPI_CORE)
    expect(seriesIds).toContain(BLS_SERIES_MAPPING.PPI_FINAL_DEMAND)
    expect(seriesIds).toContain(BLS_SERIES_MAPPING.UNEMPLOYMENT_RATE)
    expect(seriesIds).toContain(BLS_SERIES_MAPPING.EMPLOYMENT_TOTAL)
    expect(seriesIds).toContain(BLS_SERIES_MAPPING.LABOR_FORCE_PARTICIPATION)
    expect(seriesIds).toContain(BLS_SERIES_MAPPING.AVERAGE_HOURLY_EARNINGS)
  })

  test('DEFAULT_INDICATORS have correct structure and data types', () => {
    DEFAULT_INDICATORS.forEach(indicator => {
      expect(indicator).toHaveProperty('seriesId')
      expect(indicator).toHaveProperty('name')
      expect(indicator).toHaveProperty('description')
      expect(indicator).toHaveProperty('category')
      expect(indicator).toHaveProperty('unit')
      expect(indicator).toHaveProperty('frequency')
      expect(indicator).toHaveProperty('source')
      
      expect(typeof indicator.seriesId).toBe('string')
      expect(typeof indicator.name).toBe('string')
      expect(typeof indicator.description).toBe('string')
      expect(typeof indicator.unit).toBe('string')
      expect(Object.values(IndicatorCategory)).toContain(indicator.category)
      expect(Object.values(DataFrequency)).toContain(indicator.frequency)
      expect(Object.values(DataSource)).toContain(indicator.source)
    })
  })
})