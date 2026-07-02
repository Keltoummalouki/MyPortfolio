'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/features/auth/session'
import { reservePublicSubmission } from '@/features/submissions/rate-limit'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
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
 * reserves an IP-based submission slot, and inserts with the server-only
 * service role. The browser never reads stored messages, and errors are
 * returned as coarse, non-leaking codes.
 */
export async function submitContactMessage(input: ContactSubmitInput): Promise<ContactSubmitResult> {
  const parsed = contactMessageSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }

  const isHuman = await verifyTurnstileToken(input.turnstileToken)
  if (!isHuman) return { ok: false, error: 'captcha' }

  const submissionGate = await reservePublicSubmission('contact_message')
  if (!submissionGate.ok) return { ok: false, error: submissionGate.error }

  try {
    const supabase = createAdminSupabaseClient()
    const { error } = await supabase.from('contact_messages').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      status: submissionGate.shouldMarkSpam ? 'spam' : 'new',
      ip_hash: submissionGate.ipHash,
      spam_reason: submissionGate.shouldMarkSpam ? 'ip_submission_threshold' : null,
    })
    if (error) {
      // Log server-side without the message body; never surface raw errors.
      console.error('contact_messages insert failed:', error.message)
      return { ok: false, error: 'server' }
    }
  } catch (error) {
    console.error(
      'contact_messages insert failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
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
