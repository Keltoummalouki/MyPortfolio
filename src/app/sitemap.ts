import type { MetadataRoute } from 'next'
import { getPublishedArticles } from '@/features/articles/queries'
import { getPublishedProjects } from '@/features/content/projects.queries'
import { FALLBACK_PROJECTS } from '@/features/content/projects.fallback'
import {
  buildSitemap,
  latestDate,
  type SitemapArticleInput,
  type SitemapProjectInput,
} from '@/features/seo/sitemap'

// /sitemap.xml — every public page in every locale, with hreflang alternates.
// Rendered per request so newly published projects/articles appear without a
// rebuild. Must never 500: any data failure degrades to the static routes.
export const dynamic = 'force-dynamic'

// getPublishedProjects() returns [] when the DB is unreachable; the case-study
// pages then render the static fallback projects, so list those instead.
const FALLBACK_SITEMAP_PROJECTS: SitemapProjectInput[] = FALLBACK_PROJECTS.map((project) => ({
  slug: project.slug,
  status: 'published',
  updatedAt: null,
}))

async function loadProjects(): Promise<SitemapProjectInput[]> {
  try {
    const rows = await getPublishedProjects()
    if (rows.length === 0) return FALLBACK_SITEMAP_PROJECTS
    return rows.map((row) => ({
      slug: row.slug,
      status: row.status,
      // Same rule as the case-study page: a locale counts once it has a title.
      locales: (row.project_translations ?? []).filter((t) => t.title?.trim()).map((t) => t.locale),
      updatedAt: latestDate(row.updated_at, ...(row.project_translations ?? []).map((t) => t.updated_at)),
    }))
  } catch (err) {
    console.error('sitemap: loading projects failed; listing fallback projects:', err)
    return FALLBACK_SITEMAP_PROJECTS
  }
}

async function loadArticles(): Promise<SitemapArticleInput[]> {
  try {
    const rows = await getPublishedArticles()
    return rows.map((row) => ({
      status: row.status,
      updatedAt: row.updated_at,
      translations: (row.article_translations ?? []).map((t) => ({
        locale: t.locale,
        slug: t.slug,
        updatedAt: t.updated_at,
      })),
    }))
  } catch (err) {
    console.error('sitemap: loading articles failed; listing static routes only:', err)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, articles] = await Promise.all([loadProjects(), loadArticles()])
  return buildSitemap({ projects, articles })
}
