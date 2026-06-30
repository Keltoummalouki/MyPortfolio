import { pickTranslation, type Translated } from './translations'
import type { Locale } from '@/lib/validation/locale'

// Pure mapping from DB project rows to the localized view model consumed by the
// public ProjectsSection. No I/O — unit-testable without Supabase.

export interface ProjectStackItem {
  name: string
  icon: string | null
  imageUrl: string | null
}

export interface ProjectCardData {
  id: string
  title: string
  description: string | null
  image: string | null
  github: string | null
  demo: string | null
  featured: boolean
  // Stack names only (kept for backward compatibility / simple consumers).
  stack: string[]
  // Stack with optional icon metadata (linked skills carry an icon/image).
  stackItems: ProjectStackItem[]
  dateLabel: string | null
}

interface TranslationInput {
  locale: string
  title: string
  description: string | null
}

interface LinkedSkillInput {
  sort_order: number
  skills: {
    id: string
    name: string
    icon: string | null
    image_url: string | null
  } | null
}

export interface ProjectInput {
  id: string
  cover_image_url: string | null
  repo_url: string | null
  demo_url: string | null
  featured: boolean
  // Legacy free-text stack; used as a fallback when no skills are linked.
  tech_stack: string[]
  // Many-to-many linked technical skills (the preferred source of the stack).
  project_skills?: LinkedSkillInput[]
  started_at?: string | null
  project_translations: TranslationInput[]
}

function formatDate(startedAt: string | null | undefined, locale: Locale): string | null {
  if (!startedAt) return null
  const date = new Date(startedAt)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date)
}

function resolveStack(project: ProjectInput): ProjectStackItem[] {
  // Prefer linked technical skills (ordered by sort_order); fall back to the
  // legacy free-text tech_stack only when no skills are linked.
  const linked = (project.project_skills ?? [])
    .filter((link): link is LinkedSkillInput & { skills: NonNullable<LinkedSkillInput['skills']> } =>
      Boolean(link.skills),
    )
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => ({
      name: link.skills.name,
      icon: link.skills.icon,
      imageUrl: link.skills.image_url,
    }))

  if (linked.length > 0) return linked
  return project.tech_stack.map((name) => ({ name, icon: null, imageUrl: null }))
}

export function toProjectCard(project: ProjectInput, locale: Locale): ProjectCardData {
  const translations = project.project_translations.filter(
    (t): t is TranslationInput & Translated =>
      t.locale === 'fr' || t.locale === 'en' || t.locale === 'ar',
  )
  const tr = pickTranslation(translations, locale)
  const stackItems = resolveStack(project)

  return {
    id: project.id,
    title: tr?.title ?? '',
    description: tr?.description ?? null,
    image: project.cover_image_url,
    github: project.repo_url,
    demo: project.demo_url,
    featured: project.featured,
    stack: stackItems.map((item) => item.name),
    stackItems,
    dateLabel: formatDate(project.started_at, locale),
  }
}
