import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { isValidProjectSlug, type ProjectSkillOption } from './projects.schema'

type ProjectRow = Database['public']['Tables']['projects']['Row']
type ProjectTranslationRow = Database['public']['Tables']['project_translations']['Row']
/** Translation columns returned by list reads (no case-study body). */
export type ProjectTranslationSummary = Omit<ProjectTranslationRow, 'body_markdown'>

export type AdminProject = ProjectRow & {
  project_translations: ProjectTranslationRow[]
}

/** Linked technical skill (with display metadata) for public project cards. */
export interface ProjectSkillLink {
  sort_order: number
  skills: {
    id: string
    name: string
    icon: string | null
    image_url: string | null
  } | null
}

/** A published project as listed publicly (cards, sitemap): no case-study body. */
export type PublicProject = ProjectRow & {
  project_translations: ProjectTranslationSummary[]
  project_skills: ProjectSkillLink[]
}

/** A published project with full translations (case study included). */
export type PublicProjectDetail = ProjectRow & {
  project_translations: ProjectTranslationRow[]
  project_skills: ProjectSkillLink[]
}

export type AdminProjectDetail = AdminProject & {
  project_skills: { skill_id: string; sort_order: number }[]
}

const LIST_SELECT = '*, project_translations(*)'
const PUBLIC_SKILLS_SELECT = 'project_skills(sort_order, skills(id, name, icon, image_url))'
// Lists never need the (potentially long) case-study Markdown.
const PUBLIC_LIST_SELECT = `*, project_translations(id, project_id, locale, title, description, created_at, updated_at), ${PUBLIC_SKILLS_SELECT}`
const PUBLIC_DETAIL_SELECT = `*, project_translations(*), ${PUBLIC_SKILLS_SELECT}`
const DETAIL_SELECT = '*, project_translations(*), project_skills(skill_id, sort_order)'

/**
 * Public read: only PUBLISHED projects, ordered for display. The explicit
 * status filter (on top of RLS) guarantees the public section never shows
 * drafts even when an administrator is the one viewing the page. Returns an
 * empty array on failure so the public page can fall back to static content.
 */
export async function getPublishedProjects(): Promise<PublicProject[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('projects')
      .select(PUBLIC_LIST_SELECT)
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: true })
    if (error) throw error
    return (data ?? []) as unknown as PublicProject[]
  } catch (err) {
    console.error('getPublishedProjects failed; falling back to static content:', err)
    return []
  }
}

/**
 * Public read of one PUBLISHED project by slug, with every translation (case
 * study included) and its linked skills — for /[locale]/projects/[slug].
 * Returns null when the slug is malformed, the project is missing or not
 * published, or the database is unreachable (the page then decides between the
 * static fallback and a 404).
 */
export async function getPublishedProjectBySlug(slug: string): Promise<PublicProjectDetail | null> {
  if (!isValidProjectSlug(slug)) return null
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('projects')
      .select(PUBLIC_DETAIL_SELECT)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    if (error) throw error
    return (data as unknown as PublicProjectDetail | null) ?? null
  } catch (err) {
    console.error('getPublishedProjectBySlug failed:', err)
    return null
  }
}

/** Admin read: every project (RLS restricts this to administrators). */
export async function listAdminProjects(): Promise<AdminProject[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('projects')
    .select(LIST_SELECT)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Admin read of a single project (with all translations and linked skill ids). */
export async function getAdminProject(id: string): Promise<AdminProjectDetail | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('projects')
    .select(DETAIL_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as unknown as AdminProjectDetail | null) ?? null
}

/**
 * Technical skills offered by the project tech-stack picker. Returns every
 * technical skill (any status) so the admin can attach drafts too; RLS still
 * restricts what is publicly readable. Ordered for a stable picker list.
 */
export async function listTechnicalSkillOptions(): Promise<ProjectSkillOption[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('skills')
    .select('id, name, icon, image_url')
    .eq('skill_type', 'technical')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return (data ?? []).map((skill) => ({
    id: skill.id,
    name: skill.name,
    icon: skill.icon,
    imageUrl: skill.image_url,
  }))
}
