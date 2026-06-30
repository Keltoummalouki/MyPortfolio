import { describe, it, expect } from 'vitest'
import { pickI18n } from './i18n-json'

const map = { fr: 'Bonjour', en: 'Hello' }

describe('pickI18n', () => {
  it('returns the requested locale value', () => {
    expect(pickI18n(map, 'en')).toBe('Hello')
  })

  it('falls back to the default locale (fr)', () => {
    expect(pickI18n(map, 'ar')).toBe('Bonjour')
  })

  it('falls back to the first value when neither requested nor default exists', () => {
    expect(pickI18n({ en: 'Hello' }, 'ar', 'fr')).toBe('Hello')
  })

  it('returns an empty string for null/empty maps', () => {
    expect(pickI18n(null, 'fr')).toBe('')
    expect(pickI18n({}, 'fr')).toBe('')
  })
})
