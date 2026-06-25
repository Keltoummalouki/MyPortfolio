'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/features/auth/session'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { contactMessageSchema, messageStatusSchema, type ContactSubmitResult } from './schema'
import { verifyTurnstileToken } from './turnstile'

export interface ContactSubmitInput {
  name: string
  email: string
  message: string
  subject?: string
  turnstileToken?: string | null
}

/**
 * Public contact submission. Validates with Zod, optionally verifies Turnstile,
 * and inserts as the anonymous role (RLS permits INSERT only). The insert does
 * NOT use `.select()`, so no row is returned — anon has no SELECT privilege and
 * the browser must never read stored messages. Errors are returned as coarse,
 * non-leaking codes.
 */
export async function submitContactMessage(input: ContactSubmitInput): Promise<ContactSubmitResult> {
  const parsed = contactMessageSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }

  const isHuman = await verifyTurnstileToken(input.turnstileToken)
  if (!isHuman) return { ok: false, error: 'captcha' }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('contact_messages').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  })
  if (error) {
    // Log server-side without the message body; never surface raw errors.
    console.error('contact_messages insert failed:', error.message)
    return { ok: false, error: 'server' }
  }

  return { ok: true }
}

/** Admin: change a message's workflow status. */
export async function updateMessageStatusAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const id = String(formData.get('id') ?? '')
  const statusParse = messageStatusSchema.safeParse(formData.get('status'))
  if (!id || !statusParse.success) redirect('/admin/inbox')

  const supabase = await createServerSupabaseClient()
  await supabase.from('contact_messages').update({ status: statusParse.data }).eq('id', id)

  revalidatePath('/admin/inbox')
  revalidatePath(`/admin/inbox/${id}`)
  redirect(`/admin/inbox/${id}`)
}
