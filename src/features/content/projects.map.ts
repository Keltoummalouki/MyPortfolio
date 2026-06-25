import { pickTranslation, type Translated } from './translations'
import type { Locale } from '@/lib/validation/locale'

// Pure mapping from DB project rows to the localized view model consumed by the
// public ProjectsSection. No I/O — unit-testable without Supabase.

export interface ProjectCardData {
  id: string
  title: string
  description: string | null
  image: string | null
  github: string | null
  demo: string | null
  featured: boolean
  stack: string[]
  dateLabel: string | null
}

interface TranslationInput {
  locale: string
  title: string
  description: string | null
}

export interface ProjectInput {
  id: string
  cover_image_url: string | null
  repo_url: string | null
  demo_url: string | null
  featured: boolean
  tech_stack: string[]
  started_at?: string | null
  project_translations: TranslationInput[]
}

function formatDate(startedAt: string | null | undefined, locale: Locale): string | null {
  if (!startedAt) return null
  const date = new Date(startedAt)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date)
}

export function toProjectCard(project: ProjectInput, locale: Locale): ProjectCardData {
  const translations = project.project_translations.filter(
    (t): t is TranslationInput & Translated =>
      t.locale === 'fr' || t.locale === 'en' || t.locale === 'ar',
  )
  const tr = pickTranslation(translations, locale)

  return {
    id: project.id,
    title: tr?.title ?? '',
    description: tr?.description ?? null,
    image: project.cover_image_url,
    github: project.repo_url,
    demo: project.demo_url,
    featured: project.featured,
    stack: project.tech_stack,
    dateLabel: formatDate(project.started_at, locale),
  }
}
