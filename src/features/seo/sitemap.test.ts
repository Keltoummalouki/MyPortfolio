import { describe, expect, it } from 'vitest'
import { SITEMAP_ROUTES, buildSitemap, latestDate } from './sitemap'

const ORIGIN = 'https://www.keltoummalouki.com'
const NOW = new Date('2026-10-01T00:00:00.000Z')

const urls = (entries: ReturnType<typeof buildSitemap>) => entries.map((entry) => entry.url)
const find = (entries: ReturnType<typeof buildSitemap>, url: string) => entries.find((entry) => entry.url === url)

describe('latestDate', () => {
  it('returns the most recent valid date and ignores empty/invalid values', () => {
    expect(latestDate('2026-01-01', null, undefined, 'not-a-date', new Date('2026-03-01'))?.toISOString()).toBe(
      '2026-03-01T00:00:00.000Z',
    )
  })

  it('returns undefined when nothing is valid', () => {
    expect(latestDate(null, undefined, '')).toBeUndefined()
  })
})

describe('buildSitemap', () => {
  it('lists every static route once per locale, with absolute URLs', () => {
    const entries = buildSitemap({ now: NOW })
    expect(urls(entries)).toEqual([
      `${ORIGIN}/fr`,
      `${ORIGIN}/en`,
      `${ORIGIN}/ar`,
      `${ORIGIN}/fr/about`,
      `${ORIGIN}/en/about`,
      `${ORIGIN}/ar/about`,
      `${ORIGIN}/fr/projects`,
      `${ORIGIN}/en/projects`,
      `${ORIGIN}/ar/projects`,
      `${ORIGIN}/fr/blog`,
      `${ORIGIN}/en/blog`,
      `${ORIGIN}/ar/blog`,
      `${ORIGIN}/fr/freelance`,
      `${ORIGIN}/en/freelance`,
      `${ORIGIN}/ar/freelance`,
    ])
    for (const entry of entries) {
      expect(entry.lastModified).toEqual(NOW)
      expect(entry.changeFrequency).toBeDefined()
      expect(entry.priority).toBeGreaterThan(0)
    }
  })

  it('applies the priority ladder', () => {
    const entries = buildSitemap({
      now: NOW,
      projects: [{ slug: 'event-booking-app' }],
      articles: [{ translations: [{ locale: 'en', slug: 'hello' }] }],
    })
    expect(find(entries, `${ORIGIN}/fr`)?.priority).toBe(1)
    expect(find(entries, `${ORIGIN}/en/about`)?.priority).toBe(0.9)
    expect(find(entries, `${ORIGIN}/ar/projects`)?.priority).toBe(0.8)
    expect(find(entries, `${ORIGIN}/en/projects/event-booking-app`)?.priority).toBe(0.7)
    expect(find(entries, `${ORIGIN}/fr/freelance`)?.priority).toBe(0.7)
    expect(find(entries, `${ORIGIN}/fr/blog`)?.priority).toBe(0.6)
    expect(find(entries, `${ORIGIN}/en/blog/hello`)?.priority).toBe(SITEMAP_ROUTES.post.priority)
  })

  it('emits absolute hreflang alternates including x-default on static routes', () => {
    const about = find(buildSitemap({ now: NOW }), `${ORIGIN}/ar/about`)
    expect(about?.alternates?.languages).toEqual({
      fr: `${ORIGIN}/fr/about`,
      en: `${ORIGIN}/en/about`,
      ar: `${ORIGIN}/ar/about`,
      'x-default': `${ORIGIN}/fr/about`,
    })
    const home = find(buildSitemap({ now: NOW }), `${ORIGIN}/en`)
    expect(home?.alternates?.languages).toMatchObject({ fr: `${ORIGIN}/fr`, 'x-default': `${ORIGIN}/fr` })
  })

  it('lists each published project in every locale with its own lastModified', () => {
    const entries = buildSitemap({
      now: NOW,
      projects: [
        { slug: 'event-booking-app', updatedAt: '2026-02-01T10:00:00Z' },
        { slug: 'reservez-moi', updatedAt: '2025-04-15T10:00:00Z' },
      ],
    })
    const projectUrls = urls(entries).filter((url) => url.includes('/projects/'))
    expect(projectUrls).toEqual([
      `${ORIGIN}/fr/projects/event-booking-app`,
      `${ORIGIN}/en/projects/event-booking-app`,
      `${ORIGIN}/ar/projects/event-booking-app`,
      `${ORIGIN}/fr/projects/reservez-moi`,
      `${ORIGIN}/en/projects/reservez-moi`,
      `${ORIGIN}/ar/projects/reservez-moi`,
    ])
    expect(find(entries, `${ORIGIN}/en/projects/reservez-moi`)?.lastModified).toEqual(
      new Date('2025-04-15T10:00:00Z'),
    )
    // The projects index reflects the most recently updated project.
    expect(find(entries, `${ORIGIN}/fr/projects`)?.lastModified).toEqual(new Date('2026-02-01T10:00:00Z'))
    expect(find(entries, `${ORIGIN}/fr/projects/event-booking-app`)?.alternates?.languages).toEqual({
      fr: `${ORIGIN}/fr/projects/event-booking-app`,
      en: `${ORIGIN}/en/projects/event-booking-app`,
      ar: `${ORIGIN}/ar/projects/event-booking-app`,
      'x-default': `${ORIGIN}/fr/projects/event-booking-app`,
    })
  })

  it('never lists drafts, empty slugs or duplicate projects', () => {
    const entries = buildSitemap({
      now: NOW,
      projects: [
        { slug: 'draft-project', status: 'draft' },
        { slug: '   ' },
        { slug: 'event-booking-app', status: 'published' },
        { slug: 'event-booking-app' },
      ],
      articles: [{ status: 'draft', translations: [{ locale: 'en', slug: 'secret' }] }],
    })
    const all = urls(entries).join('\n')
    expect(all).not.toContain('draft-project')
    expect(all).not.toContain('secret')
    expect(urls(entries).filter((url) => url.endsWith('/event-booking-app'))).toHaveLength(3)
  })

  it('lists each article translation at its own localized slug with per-article alternates', () => {
    const entries = buildSitemap({
      now: NOW,
      articles: [
        {
          updatedAt: '2026-05-01T00:00:00Z',
          translations: [
            { locale: 'en', slug: 'docker-basics', updatedAt: '2026-06-01T00:00:00Z' },
            { locale: 'fr', slug: 'bases-de-docker' },
          ],
        },
      ],
    })
    const posts = entries.filter((entry) => entry.url.includes('/blog/'))
    // Site locale order (fr, en, ar); no Arabic translation -> no Arabic URL.
    expect(urls(posts)).toEqual([`${ORIGIN}/fr/blog/bases-de-docker`, `${ORIGIN}/en/blog/docker-basics`])
    for (const post of posts) {
      expect(post.alternates?.languages).toEqual({
        fr: `${ORIGIN}/fr/blog/bases-de-docker`,
        en: `${ORIGIN}/en/blog/docker-basics`,
        'x-default': `${ORIGIN}/fr/blog/bases-de-docker`,
      })
    }
    expect(posts[0].lastModified).toEqual(new Date('2026-05-01T00:00:00Z'))
    expect(posts[1].lastModified).toEqual(new Date('2026-06-01T00:00:00Z'))
    // The blog index reflects the most recent article change.
    expect(find(entries, `${ORIGIN}/ar/blog`)?.lastModified).toEqual(new Date('2026-06-01T00:00:00Z'))
  })

  it('falls back to the first available translation for x-default', () => {
    const entries = buildSitemap({
      now: NOW,
      articles: [{ translations: [{ locale: 'ar', slug: 'docker' }] }],
    })
    expect(find(entries, `${ORIGIN}/ar/blog/docker`)?.alternates?.languages).toEqual({
      ar: `${ORIGIN}/ar/blog/docker`,
      'x-default': `${ORIGIN}/ar/blog/docker`,
    })
  })

  it('ignores unsupported locales and percent-encodes non-ASCII slugs', () => {
    const entries = buildSitemap({
      now: NOW,
      articles: [
        {
          translations: [
            { locale: 'de', slug: 'hallo' },
            { locale: 'ar', slug: 'مرحبا' },
          ],
        },
      ],
    })
    const posts = urls(entries).filter((url) => url.includes('/blog/'))
    expect(posts).toEqual([`${ORIGIN}/ar/blog/${encodeURIComponent('مرحبا')}`])
    expect(urls(entries).join('\n')).not.toContain('hallo')
  })

  it('skips articles with no usable translation', () => {
    const entries = buildSitemap({ now: NOW, articles: [{ translations: [] }] })
    expect(urls(entries).some((url) => url.includes('/blog/'))).toBe(false)
  })
})
