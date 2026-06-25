import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type ProjectRow = Database['public']['Tables']['projects']['Row']
type ProjectTranslationRow = Database['public']['Tables']['project_translations']['Row']

export type AdminProject = ProjectRow & {
  project_translations: ProjectTranslationRow[]
}

const SELECT = '*, project_translations(*)'

/**
 * Public read: only PUBLISHED projects, ordered for display. The explicit
 * status filter (on top of RLS) guarantees the public section never shows
 * drafts even when an administrator is the one viewing the page. Returns an
 * empty array on failure so the public page can fall back to static content.
 */
export async function getPublishedProjects(): Promise<AdminProject[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('projects')
      .select(SELECT)
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data ?? []
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
    .select(SELECT)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Admin read of a single project (with all translations). */
export async function getAdminProject(id: string): Promise<AdminProject | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('projects')
    .select(SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}
