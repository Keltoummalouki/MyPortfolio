import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'
import { getSupabaseAnonKey, getSupabaseUrl } from './env'

// Browser Supabase client (public anon key only). Safe to import from Client
// Components. Row Level Security — not this key — is the authorization boundary.
//
// Auth is driven server-side (Server Actions + cookie-aware server client +
// middleware refresh), so this client is for future client-side reads/realtime.
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey())
}
