import { describe, it, expect } from 'vitest'
import { localeSchema, LOCALES, DEFAULT_LOCALE } from './locale'

describe('localeSchema', () => {
  it('accepts every supported locale', () => {
    for (const locale of LOCALES) {
      expect(localeSchema.parse(locale)).toBe(locale)
    }
  })

  it('rejects unsupported or malformed locales', () => {
    expect(localeSchema.safeParse('de').success).toBe(false)
    expect(localeSchema.safeParse('FR').success).toBe(false)
    expect(localeSchema.safeParse('').success).toBe(false)
    expect(localeSchema.safeParse(null).success).toBe(false)
  })

  it('uses French as the default locale', () => {
    expect(DEFAULT_LOCALE).toBe('fr')
    expect(localeSchema.safeParse(DEFAULT_LOCALE).success).toBe(true)
  })
})
