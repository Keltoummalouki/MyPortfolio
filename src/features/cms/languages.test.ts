import { describe, expect, it } from 'vitest'
import { getFallbackLanguages, mapPublicLanguages, resolveLanguages, type LanguageRow } from './languages'

function language(overrides: Partial<LanguageRow> = {}): LanguageRow {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    name: { fr: 'Français', en: 'French', ar: 'الفرنسية' },
    level: { fr: 'B1', en: 'B1', ar: 'B1' },
    icon: 'globe',
    sort_order: 1,
    status: 'published',
    created_at: '2026-06-29T00:00:00.000Z',
    updated_at: '2026-06-29T00:00:00.000Z',
    ...overrides,
  }
}

describe('language CMS mapper', () => {
  it('maps localized language rows', () => {
    expect(mapPublicLanguages([language()], 'en')).toEqual([
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'French',
        level: 'B1',
        icon: 'globe',
      },
    ])
  })

  it('falls back to French values when a locale is missing', () => {
    expect(
      mapPublicLanguages([
        language({
          name: { fr: 'Arabe' },
          level: { fr: 'Maternelle' },
        }),
      ], 'ar'),
    ).toEqual([
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Arabe',
        level: 'Maternelle',
        icon: 'globe',
      },
    ])
  })

  it('uses the safe static fallback when no published rows are available', () => {
    expect(resolveLanguages([], 'en')).toEqual(getFallbackLanguages('en'))
    expect(resolveLanguages([], 'en').map((item) => `${item.name} (${item.level})`)).toEqual([
      'Arabic (Native)',
      'French (B1)',
      'English (A2)',
    ])
  })
})
