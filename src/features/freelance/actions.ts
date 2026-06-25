'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/features/auth/session'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyTurnstileToken } from '@/features/inbox/turnstile'
import { leadFormSchema, leadStatusSchema, type LeadSubmitState } from './schema'

function rawForm(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? '')
  return {
    name: text('name'),
    email: text('email'),
    company: text('company'),
    projectType: text('projectType'),
    budget: text('budget'),
    timeline: text('timeline'),
    contactPreference: text('contactPreference'),
    details: text('details'),
  }
}

function fieldErrorState(error: z.ZodError): LeadSubmitState {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (key && !(key in errors)) errors[key] = issue.message
  }
  return { ok: false, error: 'invalid', errors }
}

/**
 * Public freelance inquiry. Validates with Zod, optionally verifies Turnstile,
 * and inserts as the anonymous role (RLS permits INSERT only). No `.select()` /
 * RETURNING — anon has no SELECT privilege, so leads are never browser-readable.
 */
export async function submitFreelanceLeadAction(
  _prev: LeadSubmitState,
  formData: FormData,
): Promise<LeadSubmitState> {
  const parsed = leadFormSchema.safeParse(rawForm(formData))
  if (!parsed.success) return fieldErrorState(parsed.error)

  const isHuman = await verifyTurnstileToken(String(formData.get('turnstileToken') ?? ''))
  if (!isHuman) return { ok: false, error: 'captcha' }

  const v = parsed.data
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('freelance_leads').insert({
    name: v.name,
    email: v.email,
    company: v.company,
    project_type: v.projectType,
    budget_range: v.budget,
    timeline: v.timeline,
    contact_preference: v.contactPreference,
    details: v.details,
  })
  if (error) {
    console.error('freelance_leads insert failed:', error.message)
    return { ok: false, error: 'server' }
  }

  return { ok: true }
}

/** Admin: move a lead along the pipeline. */
export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const id = String(formData.get('id') ?? '')
  const statusParse = leadStatusSchema.safeParse(formData.get('status'))
  if (!id || !statusParse.success) redirect('/admin/leads')

  const supabase = await createServerSupabaseClient()
  await supabase.from('freelance_leads').update({ status: statusParse.data }).eq('id', id)

  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${id}`)
  redirect(`/admin/leads/${id}`)
}
