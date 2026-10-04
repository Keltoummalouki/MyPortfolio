import { describe, expect, it } from 'vitest'
import en from '../../../messages/en.json'
import fr from '../../../messages/fr.json'
import ar from '../../../messages/ar.json'
import {
  FALLBACK_PROJECTS,
  fallbackProjectCards,
  fallbackProjectDetail,
  findFallbackProject,
  shouldUseFallback,
  type ProjectsTranslator,
} from './projects.fallback'

/** Minimal `t` over the real `projects` namespace (like next-intl's). */
function translator(messages: { projects: unknown }): ProjectsTranslator {
  return (key) => {
    const value = key.split('.').reduce<unknown>(
      (node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined),
      messages.projects,
    )
    if (typeof value !== 'string') throw new Error(`missing message projects.${key}`)
    return value
  }
}

describe('FALLBACK_PROJECTS', () => {
  it('uses the seeded slugs (case-study URLs are stable)', () => {
    expect(FALLBACK_PROJECTS.map((p) => p.slug)).toEqual(['event-booking-app', 'reservez-moi'])
  })

  it('has unique, well-formed slugs and local cover images', () => {
    const slugs = FALLBACK_PROJECTS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const project of FALLBACK_PROJECTS) {
      expect(project.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(project.image.startsWith('/images/')).toBe(true)
      expect(project.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})

describe('findFallbackProject', () => {
  it('finds known slugs only', () => {
    expect(findFallbackProject('reservez-moi')?.messageKey).toBe('reservezmoi')
    expect(findFallbackProject('unknown')).toBeUndefined()
  })
})

describe('fallbackProjectCards', () => {
  it.each([
    ['en', en],
    ['fr', fr],
    ['ar', ar],
  ] as const)('builds complete cards from the %s messages', (_locale, messages) => {
    const cards = fallbackProjectCards(translator(messages))
    expect(cards).toHaveLength(2)
    for (const card of cards) {
      expect(card.title).not.toBe('')
      expect(card.description).toBeTruthy()
      expect(card.dateLabel).toBeTruthy()
      expect(card.stack.length).toBeGreaterThan(3)
      // Arabic lists use "،": every stack entry must be a single technology.
      for (const name of card.stack) expect(name).not.toMatch(/[,،]/)
    }
  })

  it('maps the English event booking card', () => {
    const [card] = fallbackProjectCards(translator(en))
    expect(card).toMatchObject({
      id: 'event-booking-app',
      slug: 'event-booking-app',
      title: 'Event Booking App',
      github: 'https://github.com/Keltoummalouki/event-booking-app',
      demo: null,
      featured: true,
      dateLabel: 'Dec 2025',
    })
    expect(card.stack[0]).toBe('NestJS')
    expect(card.stackItems[0]).toEqual({ name: 'NestJS', icon: null, imageUrl: null })
  })
})

describe('fallbackProjectDetail', () => {
  it('returns a description-based detail for fallback slugs', () => {
    const detail = fallbackProjectDetail('reservez-moi', translator(fr), 'fr')
    expect(detail).not.toBeNull()
    expect(detail?.title).toBe('Réservez-Moi')
    expect(detail?.bodyMarkdown).toBeNull()
    expect(detail?.startedAt).toBe('2025-04-01')
    expect(detail?.contentLocale).toBe('fr')
    expect(detail?.availableLocales).toEqual(['fr', 'en', 'ar'])
  })

  it('returns null for unknown slugs', () => {
    expect(fallbackProjectDetail('nope', translator(en), 'en')).toBeNull()
  })
})

describe('shouldUseFallback', () => {
  it('serves fallback slugs only when the database lists no published project', () => {
    expect(shouldUseFallback('event-booking-app', 0)).toBe(true)
    expect(shouldUseFallback('event-booking-app', 3)).toBe(false) // unpublished in the DB -> 404
    expect(shouldUseFallback('unknown-project', 0)).toBe(false)
  })
})
