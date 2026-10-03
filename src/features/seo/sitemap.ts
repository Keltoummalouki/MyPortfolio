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
  /**
   * `lastModified` for pages without their own content date (home, about,
   * freelance — CMS-driven) and fallback for items without one. Defaults to now.
   */
  now?: Date
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

/** One entry per locale for a route whose path is the same in every language. */
function everyLocale(path: string, route: RouteConfig, lastModified: Date): MetadataRoute.Sitemap {
  const languages = absoluteAlternates(path)
  return LOCALES.map((locale) => ({
    url: absoluteUrl(localePath(locale, path)),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: { languages },
  }))
}

export function buildSitemap({ projects = [], articles = [], now = new Date() }: BuildSitemapInput = {}): MetadataRoute.Sitemap {
  const publishedProjects = projects.filter((project) => isPublished(project.status) && project.slug?.trim())
  const publishedArticles = articles.filter((article) => isPublished(article.status))

  const latestProject = latestDate(...publishedProjects.map((project) => project.updatedAt))
  const latestArticle = latestDate(
    ...publishedArticles.flatMap((article) => [article.updatedAt, ...article.translations.map((t) => t.updatedAt)]),
  )

  const entries: MetadataRoute.Sitemap = [
    ...everyLocale('/', SITEMAP_ROUTES.home, now),
    ...everyLocale('/about', SITEMAP_ROUTES.about, now),
    ...everyLocale('/projects', SITEMAP_ROUTES.projects, latestProject ?? now),
  ]

  const seenProjects = new Set<string>()
  for (const project of publishedProjects) {
    const slug = slugSegment(project.slug)
    if (seenProjects.has(slug)) continue
    seenProjects.add(slug)
    entries.push(...everyLocale(`/projects/${slug}`, SITEMAP_ROUTES.project, latestDate(project.updatedAt) ?? now))
  }

  entries.push(...everyLocale('/blog', SITEMAP_ROUTES.blog, latestArticle ?? now))

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
      entries.push({
        url: absoluteUrl(localePath(locale, localizedPaths[locale])),
        lastModified: latestDate(article.updatedAt, translation.updatedAt) ?? now,
        changeFrequency: SITEMAP_ROUTES.post.changeFrequency,
        priority: SITEMAP_ROUTES.post.priority,
        alternates: { languages },
      })
    }
  }

  entries.push(...everyLocale('/freelance', SITEMAP_ROUTES.freelance, now))

  return entries
}
