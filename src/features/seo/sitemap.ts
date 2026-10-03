import type { MetadataRoute } from 'next'
import { buildLanguageAlternates } from './metadata'
import { LOCALES, absoluteUrl, localePath } from './site'

// Pure sitemap builder: published content in, `MetadataRoute.Sitemap` out. All
// I/O (Supabase) lives in `app/sitemap.ts`, so this stays unit-testable. Every
// public route is listed once per locale, and each entry carries the full
// hreflang set (+ x-default) as absolute URLs, as Google expects in sitemaps.

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

export interface SitemapProjectInput {
  slug: string
  /** Latest modification (ISO string or Date). */
  updatedAt?: string | Date | null
  /** Defensive: anything other than `published` is skipped when provided. */
  status?: string | null
  /**
   * Locales with a real translation. The case-study page canonicalizes an
   * untranslated locale to a translated one, so only these are listed.
   * Omitted/empty = every locale (static fallback projects).
   */
  locales?: string[]
}

export interface SitemapArticleTranslationInput {
  locale: string
  slug: string
  updatedAt?: string | Date | null
}

export interface SitemapArticleInput {
  translations: SitemapArticleTranslationInput[]
  updatedAt?: string | Date | null
  /** Defensive: anything other than `published` is skipped when provided. */
  status?: string | null
}

export interface BuildSitemapInput {
  projects?: SitemapProjectInput[]
  articles?: SitemapArticleInput[]
}

interface RouteConfig {
  changeFrequency: ChangeFrequency
  priority: number
}

/** Crawl hints per route kind (relative importance within this site only). */
export const SITEMAP_ROUTES = {
  home: { changeFrequency: 'weekly', priority: 1.0 },
  about: { changeFrequency: 'monthly', priority: 0.9 },
  projects: { changeFrequency: 'weekly', priority: 0.8 },
  project: { changeFrequency: 'monthly', priority: 0.7 },
  freelance: { changeFrequency: 'monthly', priority: 0.7 },
  blog: { changeFrequency: 'weekly', priority: 0.6 },
  post: { changeFrequency: 'monthly', priority: 0.6 },
} as const satisfies Record<string, RouteConfig>

const isLocale = (value: string): boolean => (LOCALES as readonly string[]).includes(value)

const isPublished = (status: string | null | undefined): boolean =>
  status === undefined || status === null || status === 'published'

/** URL-safe slug segment (also keeps the XML well-formed: Next does not escape `<loc>`). */
const slugSegment = (slug: string): string => encodeURIComponent(slug.trim())

function toTime(value: string | Date | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const time = (value instanceof Date ? value : new Date(value)).getTime()
  return Number.isNaN(time) ? undefined : time
}

/** Most recent of the given dates, or undefined when none is valid. */
export function latestDate(...values: (string | Date | null | undefined)[]): Date | undefined {
  const times = values.map(toTime).filter((time): time is number => time !== undefined)
  return times.length ? new Date(Math.max(...times)) : undefined
}

/** hreflang map (+ x-default) with absolute URLs for a locale-less path. */
function absoluteAlternates(
  path: string,
  localizedPaths?: Partial<Record<string, string>>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(buildLanguageAlternates(path, localizedPaths)).map(([lang, href]) => [lang, absoluteUrl(href)]),
  )
}

/**
 * One entry per locale for a route whose path is the same in every language
 * (restricted to `locales` when given). `lastModified` is omitted when unknown:
 * a fake "now" on every fetch teaches crawlers to ignore the field.
 */
function everyLocale(
  path: string,
  route: RouteConfig,
  lastModified: Date | undefined,
  locales: readonly string[] = LOCALES,
): MetadataRoute.Sitemap {
  const localizedPaths =
    locales.length === LOCALES.length ? undefined : Object.fromEntries(locales.map((locale) => [locale, path]))
  const languages = absoluteAlternates(path, localizedPaths)
  return LOCALES.filter((locale) => locales.includes(locale)).map((locale) => ({
    url: absoluteUrl(localePath(locale, path)),
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: { languages },
  }))
}

export function buildSitemap({ projects = [], articles = [] }: BuildSitemapInput = {}): MetadataRoute.Sitemap {
  const publishedProjects = projects.filter((project) => isPublished(project.status) && project.slug?.trim())
  const publishedArticles = articles.filter((article) => isPublished(article.status))

  const latestProject = latestDate(...publishedProjects.map((project) => project.updatedAt))
  const latestArticle = latestDate(
    ...publishedArticles.flatMap((article) => [article.updatedAt, ...article.translations.map((t) => t.updatedAt)]),
  )

  const entries: MetadataRoute.Sitemap = [
    ...everyLocale('/', SITEMAP_ROUTES.home, undefined),
    ...everyLocale('/about', SITEMAP_ROUTES.about, undefined),
    ...everyLocale('/projects', SITEMAP_ROUTES.projects, latestProject),
  ]

  const seenProjects = new Set<string>()
  for (const project of publishedProjects) {
    const slug = slugSegment(project.slug)
    if (seenProjects.has(slug)) continue
    seenProjects.add(slug)
    const locales = [...new Set((project.locales ?? []).filter(isLocale))]
    entries.push(
      ...everyLocale(
        `/projects/${slug}`,
        SITEMAP_ROUTES.project,
        latestDate(project.updatedAt),
        locales.length ? locales : LOCALES,
      ),
    )
  }

  entries.push(...everyLocale('/blog', SITEMAP_ROUTES.blog, latestArticle))

  for (const article of publishedArticles) {
    // One translation per supported locale (first wins), non-empty slugs only.
    const byLocale = new Map<string, SitemapArticleTranslationInput>()
    for (const translation of article.translations) {
      if (!isLocale(translation.locale) || !translation.slug?.trim()) continue
      if (!byLocale.has(translation.locale)) byLocale.set(translation.locale, translation)
    }
    if (byLocale.size === 0) continue

    const localizedPaths = Object.fromEntries(
      [...byLocale].map(([locale, translation]) => [locale, `/blog/${slugSegment(translation.slug)}`]),
    )
    const [firstPath] = Object.values(localizedPaths)
    const languages = absoluteAlternates(firstPath, localizedPaths)

    // Keep the site's locale order (fr, en, ar) for stable output.
    for (const locale of LOCALES) {
      const translation = byLocale.get(locale)
      if (!translation) continue
      const lastModified = latestDate(article.updatedAt, translation.updatedAt)
      entries.push({
        url: absoluteUrl(localePath(locale, localizedPaths[locale])),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: SITEMAP_ROUTES.post.changeFrequency,
        priority: SITEMAP_ROUTES.post.priority,
        alternates: { languages },
      })
    }
  }

  entries.push(...everyLocale('/freelance', SITEMAP_ROUTES.freelance, undefined))

  return entries
}
