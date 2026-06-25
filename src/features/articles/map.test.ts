import { describe, it, expect } from 'vitest'
import { toArticleCard, type ArticleInput } from './map'

const base: ArticleInput = {
  id: 'a1',
  cover_image_url: '/images/cover.png',
  author_name: 'Keltoum',
  published_at: '2026-01-01T00:00:00Z',
  article_translations: [
    { locale: 'fr', slug: 'bonjour', title: 'Bonjour', excerpt: 'Résumé', body_markdown: 'corps' },
    { locale: 'en', slug: 'hello', title: 'Hello', excerpt: 'Summary', body_markdown: 'body' },
  ],
}

describe('toArticleCard', () => {
  it('uses the requested locale and its localized slug', () => {
    const card = toArticleCard(base, 'en')
    expect(card?.title).toBe('Hello')
    expect(card?.slug).toBe('hello')
  })

  it('falls back to the default locale (fr) when missing', () => {
    const card = toArticleCard(base, 'ar')
    expect(card?.slug).toBe('bonjour')
  })

  it('returns null when there are no translations', () => {
    expect(toArticleCard({ ...base, article_translations: [] }, 'fr')).toBeNull()
  })
})
