import { describe, expect, it } from 'vitest'
import { FAQ_FALLBACK_KEYS, fallbackFaq, mapPublicFaq, type FaqItemRow } from './faq'

const row = (overrides: Partial<FaqItemRow>): FaqItemRow => ({
  id: 'id',
  question: { fr: 'Question ?' },
  answer: { fr: 'Réponse.' },
  sort_order: 0,
  status: 'published',
  created_at: '2026-10-04T00:00:00Z',
  updated_at: '2026-10-04T00:00:00Z',
  ...overrides,
})

describe('mapPublicFaq', () => {
  it('localizes, falls back to French and keeps sort order', () => {
    const items = mapPublicFaq(
      [
        row({ id: 'b', sort_order: 2, question: { fr: 'Q2 fr', en: 'Q2 en' }, answer: { fr: 'A2 fr' } }),
        row({ id: 'a', sort_order: 1, question: { fr: 'Q1 fr', en: 'Q1 en' }, answer: { fr: 'A1', en: 'A1 en' } }),
      ],
      'en',
    )
    expect(items).toEqual([
      { id: 'a', question: 'Q1 en', answer: 'A1 en' },
      { id: 'b', question: 'Q2 en', answer: 'A2 fr' },
    ])
  })

  it('drops items without a question or an answer', () => {
    expect(mapPublicFaq([row({ answer: {} }), row({ id: 'x', question: { fr: '  ' } })], 'fr')).toEqual([])
  })
})

describe('fallbackFaq', () => {
  it('builds one item per default key from translations', () => {
    const items = fallbackFaq((key) => `t:${key}`)
    expect(items).toHaveLength(FAQ_FALLBACK_KEYS.length)
    expect(items[0]).toEqual({
      id: 'projects',
      question: 't:items.projects.question',
      answer: 't:items.projects.answer',
    })
  })
})
