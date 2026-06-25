import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { getSupabaseUrl } from './env'

// Privileged Supabase client using SUPABASE_SERVICE_ROLE_KEY. BYPASSES RLS.
//
// Boundary: the `server-only` import guarantees this can never be bundled into
// client code, and the service-role key is read here and nowhere else. Use only
// where strictly necessary (e.g. server-side writes that must skip RLS); prefer
// the cookie-aware server client for anything that should run as the user.
export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      'Missing environment variable: SUPABASE_SERVICE_ROLE_KEY. Set it in .env.local (server-only).',
    )
  }

  return createClient<Database>(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
