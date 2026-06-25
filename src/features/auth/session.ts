import 'server-only'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Server-side admin session helpers. Authorization is decided by the
// database (`public.is_admin()` over the server-controlled `admin_profiles`
// table), never by user-editable auth metadata.

export interface AdminSession {
  user: User | null
  isAdmin: boolean
}

/**
 * Resolve the current request's user and whether they are an administrator.
 * `getUser()` revalidates the token against Supabase Auth (not just cookies).
 */
export async function getAdminSession(): Promise<AdminSession> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { user: null, isAdmin: false }

  const { data, error } = await supabase.rpc('is_admin')
  return { user, isAdmin: !error && data === true }
}

/**
 * Hard guard for Server Actions / pages: redirect anonymous users to login and
 * non-admin users to login with an unauthorized marker. Returns the admin user.
 */
export async function requireAdmin(): Promise<User> {
  const { user, isAdmin } = await getAdminSession()
  if (!user) redirect('/admin/login')
  if (!isAdmin) redirect('/admin/login?error=unauthorized')
  return user
}
