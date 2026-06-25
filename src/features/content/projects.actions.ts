'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { PostgrestError } from '@supabase/supabase-js'
import { requireAdmin } from '@/features/auth/session'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  PROJECT_LOCALES,
  projectFormSchema,
  type ProjectFormState,
  type ProjectFormValues,
} from './projects.schema'

function rawForm(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? '')
  return {
    slug: text('slug'),
    status: text('status'),
    featured: formData.get('featured') === 'on',
    sortOrder: text('sortOrder'),
    techStack: text('techStack'),
    repoUrl: text('repoUrl'),
    demoUrl: text('demoUrl'),
    coverImageUrl: text('coverImageUrl'),
    startedAt: text('startedAt'),
    translations: {
      fr: { title: text('fr.title'), description: text('fr.description') },
      en: { title: text('en.title'), description: text('en.description') },
      ar: { title: text('ar.title'), description: text('ar.description') },
    },
  }
}

function fieldErrorState(error: z.ZodError): ProjectFormState {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (key && !(key in errors)) errors[key] = issue.message
  }
  return { ok: false, message: 'Please fix the highlighted fields.', errors }
}

function friendlyDbMessage(error: PostgrestError | null): string {
  if (error?.code === '23505') return 'A project with this slug already exists.'
  return 'Could not save the project. Please try again.'
}

function translationRows(projectId: string, translations: ProjectFormValues['translations']) {
  const rows: { project_id: string; locale: string; title: string; description: string | null }[] = []
  for (const locale of PROJECT_LOCALES) {
    const tr = translations[locale]
    if (tr.title) {
      rows.push({ project_id: projectId, locale, title: tr.title, description: tr.description })
    }
  }
  return rows
}

function revalidateProjects() {
  revalidatePath('/') // public home (ProjectsSection)
  revalidatePath('/admin/projects')
}

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin()

  const parsed = projectFormSchema.safeParse(rawForm(formData))
  if (!parsed.success) return fieldErrorState(parsed.error)
  const v = parsed.data

  const supabase = await createServerSupabaseClient()
  const { data: created, error } = await supabase
    .from('projects')
    .insert({
      slug: v.slug,
      status: v.status,
      featured: v.featured,
      sort_order: v.sortOrder,
      tech_stack: v.techStack,
      repo_url: v.repoUrl,
      demo_url: v.demoUrl,
      cover_image_url: v.coverImageUrl,
      started_at: v.startedAt,
    })
    .select('id')
    .single()
  if (error || !created) return { ok: false, message: friendlyDbMessage(error) }

  const rows = translationRows(created.id, v.translations)
  if (rows.length > 0) {
    const { error: trError } = await supabase.from('project_translations').insert(rows)
    if (trError) {
      // Don't leave a project with no translations behind.
      await supabase.from('projects').delete().eq('id', created.id)
      return { ok: false, message: friendlyDbMessage(trError) }
    }
  }

  revalidateProjects()
  redirect('/admin/projects')
}

export async function updateProjectAction(
  id: string,
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin()

  const parsed = projectFormSchema.safeParse(rawForm(formData))
  if (!parsed.success) return fieldErrorState(parsed.error)
  const v = parsed.data

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('projects')
    .update({
      slug: v.slug,
      status: v.status,
      featured: v.featured,
      sort_order: v.sortOrder,
      tech_stack: v.techStack,
      repo_url: v.repoUrl,
      demo_url: v.demoUrl,
      cover_image_url: v.coverImageUrl,
      started_at: v.startedAt,
    })
    .eq('id', id)
  if (error) return { ok: false, message: friendlyDbMessage(error) }

  // Sync translations: upsert locales with a title, remove locales left blank.
  for (const locale of PROJECT_LOCALES) {
    const tr = v.translations[locale]
    if (tr.title) {
      const { error: upError } = await supabase
        .from('project_translations')
        .upsert(
          { project_id: id, locale, title: tr.title, description: tr.description },
          { onConflict: 'project_id,locale' },
        )
      if (upError) return { ok: false, message: friendlyDbMessage(upError) }
    } else {
      const { error: delError } = await supabase
        .from('project_translations')
        .delete()
        .eq('project_id', id)
        .eq('locale', locale)
      if (delError) return { ok: false, message: friendlyDbMessage(delError) }
    }
  }

  revalidateProjects()
  redirect('/admin/projects')
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const id = String(formData.get('id') ?? '')
  if (!id) redirect('/admin/projects')

  const supabase = await createServerSupabaseClient()
  // ON DELETE CASCADE removes the project_translations rows.
  await supabase.from('projects').delete().eq('id', id)

  revalidateProjects()
  redirect('/admin/projects')
}
