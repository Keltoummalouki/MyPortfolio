import { LOCALES, type Locale } from '@/lib/validation/locale'
import { parseStackList, type ProjectCardData, type ProjectDetailData } from './projects.map'

// Static projects shown when the database has no published projects or is
// unreachable — the ONE place this data lives. Used by the home ProjectsSection,
// the /projects index and the /projects/[slug] case-study page, so all three
// agree on slugs, images and links. Localized text comes from the `projects`
// namespace of messages/<locale>.json (`projects.items.<messageKey>.*`).
// Pure (no server imports): safe in Client Components and unit tests.

export interface FallbackProject {
  /** Same slug as the seeded DB row, so case-study URLs never change. */
  slug: string
  /** Key under `projects.items` in the message files. */
  messageKey: 'eventBooking' | 'reservezmoi'
  image: string
  github: string | null
  demo: string | null
  featured: boolean
  /** `YYYY-MM-DD`, mirrors the seeded `started_at`. */
  startedAt: string
}

export const FALLBACK_PROJECTS: readonly FallbackProject[] = [
  {
    slug: 'event-booking-app',
    messageKey: 'eventBooking',
    image: '/images/event-booking-app.png',
    github: 'https://github.com/Keltoummalouki/event-booking-app',
    demo: null,
    featured: true,
    startedAt: '2025-12-01',
  },
  {
    slug: 'reservez-moi',
    messageKey: 'reservezmoi',
    image: '/images/reservezmoi.png',
    github: 'https://github.com/keltoummalouki/Reservez-Moi',
    demo: null,
    featured: true,
    startedAt: '2025-04-01',
  },
]

/** Translator scoped to the `projects` message namespace (`t('items.x.title')`). */
export type ProjectsTranslator = (key: string) => string

export function findFallbackProject(slug: string): FallbackProject | undefined {
  return FALLBACK_PROJECTS.find((project) => project.slug === slug)
}

export function fallbackProjectCard(project: FallbackProject, t: ProjectsTranslator): ProjectCardData {
  const key = `items.${project.messageKey}`
  const stack = parseStackList(t(`${key}.stack`))
  return {
    id: project.slug,
    slug: project.slug,
    title: t(`${key}.title`),
    description: t(`${key}.description`),
    image: project.image,
    github: project.github,
    demo: project.demo,
    featured: project.featured,
    stack,
    stackItems: stack.map((name) => ({ name, icon: null, imageUrl: null })),
    dateLabel: t(`${key}.date`),
  }
}

export function fallbackProjectCards(t: ProjectsTranslator): ProjectCardData[] {
  return FALLBACK_PROJECTS.map((project) => fallbackProjectCard(project, t))
}

/**
 * Case-study view model for a fallback project (no Markdown body: the page
 * renders its structured overview). Null for slugs that are not fallbacks.
 */
export function fallbackProjectDetail(
  slug: string,
  t: ProjectsTranslator,
  locale: Locale,
): ProjectDetailData | null {
  const project = findFallbackProject(slug)
  if (!project) return null
  return {
    ...fallbackProjectCard(project, t),
    bodyMarkdown: null,
    startedAt: project.startedAt,
    updatedAt: null,
    contentLocale: locale,
    // The message files translate every fallback project in every locale.
    availableLocales: [...LOCALES],
  }
}

/**
 * Whether `slug` should be served from the static fallback: only when the
 * database lists no published project at all (unreachable or empty) — the same
 * rule the home section and the /projects index apply. When the database does
 * answer, an unpublished or deleted project must 404, even with a fallback slug.
 */
export function shouldUseFallback(slug: string, publishedProjectCount: number): boolean {
  return publishedProjectCount === 0 && findFallbackProject(slug) !== undefined
}
