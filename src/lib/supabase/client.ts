// Browser Supabase client (public anon key only).
// Implemented in M3-T1 (Create Supabase client utilities).
//
// Boundary: safe to import from Client Components. It must use ONLY
// NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY — never a
// service-role key.

export function createBrowserSupabaseClient(): never {
  throw new Error('Supabase browser client not implemented yet (see M3-T1).')
}
