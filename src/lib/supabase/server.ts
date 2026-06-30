import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'
import { getSupabaseAnonKey, getSupabaseUrl } from './env'

// Cookie-aware Supabase server client (per-request auth). Uses the public anon
// key + the request's auth cookies, so every query runs under the signed-in
// user's RLS context. Use from Server Components, Server Actions, and Route
// Handlers.
//
// `server-only` makes importing this from a Client Component a build error.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // `setAll` was called from a Server Component, where mutating cookies
          // is not allowed. Safe to ignore: the middleware refreshes the session
          // and writes refreshed cookies on every /admin request.
        }
      },
    },
  })
}
