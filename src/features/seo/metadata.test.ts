import { describe, expect, it } from 'vitest'
import { buildLanguageAlternates, buildPageMetadata, truncateDescription } from './metadata'

describe('buildLanguageAlternates', () => {
  it('maps every locale and adds x-default -> default locale', () => {
    expect(buildLanguageAlternates('/about')).toEqual({
      fr: '/fr/about',
      en: '/en/about',
      ar: '/ar/about',
      'x-default': '/fr/about',
    })
  })

  it('handles the home path without a trailing slash', () => {
    expect(buildLanguageAlternates('/')).toMatchObject({ fr: '/fr', en: '/en', 'x-default': '/fr' })
  })

  it('only emits locales present in localizedPaths (per-locale slugs)', () => {
    expect(buildLanguageAlternates('/blog/x', { en: '/blog/hello', ar: '/blog/marhaba' })).toEqual({
      en: '/en/blog/hello',
      ar: '/ar/blog/marhaba',
      'x-default': '/en/blog/hello',
    })
  })
})

describe('buildPageMetadata', () => {
  const base = { locale: 'en', path: '/about', title: 'About', description: 'Desc' }

  it('emits canonical, hreflang, full Open Graph and Twitter tags', () => {
    const meta = buildPageMetadata(base)
    expect(meta.alternates?.canonical).toBe('/en/about')
    expect(meta.openGraph).toMatchObject({
      title: 'About',
      url: '/en/about',
      siteName: 'Keltoum Malouki',
      locale: 'en_US',
      type: 'website',
    })
    expect((meta.openGraph as { alternateLocale: string[] }).alternateLocale).toEqual(['fr_FR', 'ar_MA'])
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image', title: 'About' })
    expect(meta.robots).toBeUndefined()
  })

  it('supports absolute titles, article type and noindex', () => {
    const meta = buildPageMetadata({
      ...base,
      absoluteTitle: true,
      type: 'article',
      publishedTime: '2026-01-01',
      noindex: true,
      images: [{ url: '/images/x.png' }],
    })
    expect(meta.title).toEqual({ absolute: 'About' })
    expect(meta.openGraph).toMatchObject({ type: 'article', publishedTime: '2026-01-01' })
    expect((meta.openGraph as { images: { url: string }[] }).images[0].url).toBe(
      'https://www.keltoummalouki.com/images/x.png',
    )
    expect(meta.robots).toEqual({ index: false, follow: true })
  })
})

describe('truncateDescription', () => {
  it('keeps short text and collapses whitespace', () => {
    expect(truncateDescription('  a   b ')).toBe('a b')
  })

  it('cuts long text on a word boundary with an ellipsis', () => {
    const out = truncateDescription('word '.repeat(60), 50)
    expect(out.length).toBeLessThanOrEqual(50)
    expect(out.endsWith('…')).toBe(true)
  })
})
