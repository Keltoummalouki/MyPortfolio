import { describe, it, expect } from 'vitest'
import { pickTranslation, type Translated } from './translations'

interface Row extends Translated {
  title: string
}

const rows: Row[] = [
  { locale: 'fr', title: 'Bonjour' },
  { locale: 'en', title: 'Hello' },
]

describe('pickTranslation', () => {
  it('returns the exact locale match', () => {
    expect(pickTranslation(rows, 'en')?.title).toBe('Hello')
  })

  it('falls back to the default locale (fr) when the requested locale is missing', () => {
    expect(pickTranslation(rows, 'ar')?.title).toBe('Bonjour')
  })

  it('falls back to the first translation when neither requested nor default exists', () => {
    const only: Row[] = [{ locale: 'en', title: 'Hello' }]
    expect(pickTranslation(only, 'ar', 'fr')?.title).toBe('Hello')
  })

  it('returns undefined when there are no translations', () => {
    expect(pickTranslation([] as Row[], 'fr')).toBeUndefined()
  })
})
