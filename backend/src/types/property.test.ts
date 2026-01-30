import fc from 'fast-check'
import { IndicatorCategory, DataFrequency, DataSource, BLS_SERIES_MAPPING, DEFAULT_INDICATORS } from './index'

describe('Property-Based Tests for Backend Core Types', () => {
  test('BLS series IDs are always valid strings', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(BLS_SERIES_MAPPING)),
        (seriesId) => {
          // Property: All BLS series IDs should be non-empty strings with valid format
          expect(typeof seriesId).toBe('string')
          expect(seriesId.length).toBeGreaterThan(0)
          expect(seriesId).toMatch(/^[A-Z0-9]+$/) // BLS series IDs are alphanumeric uppercase
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Default indicators have consistent structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DEFAULT_INDICATORS),
        (indicator) => {
          // Property: All default indicators should have valid structure and types
          expect(typeof indicator.seriesId).toBe('string')
          expect(indicator.seriesId.length).toBeGreaterThan(0)
          expect(typeof indicator.name).toBe('string')
          expect(indicator.name.length).toBeGreaterThan(0)
          expect(typeof indicator.description).toBe('string')
          expect(indicator.description.length).toBeGreaterThan(0)
          expect(typeof indicator.unit).toBe('string')
          expect(indicator.unit.length).toBeGreaterThan(0)
          expect(Object.values(IndicatorCategory)).toContain(indicator.category)
          expect(Object.values(DataFrequency)).toContain(indicator.frequency)
          expect(Object.values(DataSource)).toContain(indicator.source)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Indicator categories maintain valid relationships', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DEFAULT_INDICATORS),
        (indicator) => {
          // Property: Indicators should have logical category assignments
          if (indicator.name.toLowerCase().includes('price') || 
              indicator.name.toLowerCase().includes('cpi') || 
              indicator.name.toLowerCase().includes('ppi')) {
            expect(indicator.category).toBe(IndicatorCategory.INFLATION)
          }
          
          if (indicator.name.toLowerCase().includes('unemployment') || 
              indicator.name.toLowerCase().includes('employment')) {
            expect(indicator.category).toBe(IndicatorCategory.EMPLOYMENT)
          }
          
          if (indicator.name.toLowerCase().includes('earnings')) {
            expect(indicator.category).toBe(IndicatorCategory.WAGES)
          }
          
          if (indicator.name.toLowerCase().includes('labor force')) {
            expect(indicator.category).toBe(IndicatorCategory.LABOR_FORCE)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Series IDs in default indicators are valid BLS series', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DEFAULT_INDICATORS),
        (indicator) => {
          // Property: All series IDs in default indicators should be valid BLS series IDs
          expect(Object.values(BLS_SERIES_MAPPING)).toContain(indicator.seriesId)
          expect(indicator.seriesId).toMatch(/^[A-Z0-9]+$/)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Data frequency is appropriate for economic indicators', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DEFAULT_INDICATORS),
        (indicator) => {
          // Property: All economic indicators should have monthly frequency (BLS standard)
          expect(indicator.frequency).toBe(DataFrequency.MONTHLY)
        }
      ),
      { numRuns: 100 }
    )
  })
})