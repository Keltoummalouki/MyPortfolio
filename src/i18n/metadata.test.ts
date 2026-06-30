import { describe, it, expect } from 'vitest'
import { localizedAlternates } from './metadata'
import { routing } from './routing'

describe('routing config', () => {
  it('uses the agreed locales with French as default and always-prefixed URLs', () => {
    expect(routing.locales).toEqual(['fr', 'en', 'ar'])
    expect(routing.defaultLocale).toBe('fr')
    expect(routing.localePrefix).toBe('always')
  })
})

describe('localizedAlternates', () => {
  it('builds a hreflang map for every locale', () => {
    expect(localizedAlternates((l) => `/${l}/blog`)).toEqual({
      fr: '/fr/blog',
      en: '/en/blog',
      ar: '/ar/blog',
    })
  })

  it('supports the home path', () => {
    expect(localizedAlternates((l) => `/${l}`)).toEqual({ fr: '/fr', en: '/en', ar: '/ar' })
  })
})
