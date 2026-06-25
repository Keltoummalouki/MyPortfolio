'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { toSafeAuthMessage } from './errors'

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export interface SignInState {
  error?: string
}

/**
 * Sign in with email + password (server-side, sets httpOnly auth cookies), then
 * enforce that the account is an administrator before granting dashboard access.
 * Returns a generic error message on failure; redirects on success.
 */
export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: toSafeAuthMessage('invalid_credentials') }
  }

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    return { error: toSafeAuthMessage('invalid_credentials') }
  }

  // Only administrators may proceed. Tear down any non-admin session so it is
  // not left established.
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (isAdmin !== true) {
    await supabase.auth.signOut()
    return { error: toSafeAuthMessage('not_authorized') }
  }

  redirect('/admin/dashboard')
}

/** Sign the current administrator out and return to the login page. */
export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
