import fc from 'fast-check'
import { IndicatorCategory, DataFrequency, DataSource, BLS_SERIES_MAPPING } from './index'

describe('Property-Based Tests for Core Types', () => {
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
      { numRuns: 50 }
    )
  })

  test('Indicator categories are always valid enum values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(IndicatorCategory)),
        (category) => {
          // Property: All indicator categories should be valid enum values
          expect(Object.values(IndicatorCategory)).toContain(category)
          expect(typeof category).toBe('string')
          expect(category.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Data frequencies are always valid enum values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(DataFrequency)),
        (frequency) => {
          // Property: All data frequencies should be valid enum values
          expect(Object.values(DataFrequency)).toContain(frequency)
          expect(typeof frequency).toBe('string')
          expect(['monthly', 'quarterly', 'annual']).toContain(frequency)
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Data sources are always valid enum values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(DataSource)),
        (source) => {
          // Property: All data sources should be valid enum values
          expect(Object.values(DataSource)).toContain(source)
          expect(typeof source).toBe('string')
          expect(['bls_v1', 'bls_v2']).toContain(source)
        }
      ),
      { numRuns: 50 }
    )
  })

  test('BLS series mapping maintains consistency', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(BLS_SERIES_MAPPING)),
        (key) => {
          // Property: All keys in BLS_SERIES_MAPPING should have corresponding valid series IDs
          const seriesId = BLS_SERIES_MAPPING[key as keyof typeof BLS_SERIES_MAPPING]
          expect(typeof seriesId).toBe('string')
          expect(seriesId.length).toBeGreaterThan(0)
          expect(seriesId).toMatch(/^[A-Z0-9]+$/)
        }
      ),
      { numRuns: 50 }
    )
  })
})