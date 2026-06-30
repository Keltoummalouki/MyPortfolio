import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import type { ProjectSkillOption } from './projects.schema'

type ProjectRow = Database['public']['Tables']['projects']['Row']
type ProjectTranslationRow = Database['public']['Tables']['project_translations']['Row']

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

export type PublicProject = AdminProject & {
  project_skills: ProjectSkillLink[]
}

export type AdminProjectDetail = AdminProject & {
  project_skills: { skill_id: string; sort_order: number }[]
}

const LIST_SELECT = '*, project_translations(*)'
const PUBLIC_SELECT =
  '*, project_translations(*), project_skills(sort_order, skills(id, name, icon, image_url))'
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
      .select(PUBLIC_SELECT)
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
