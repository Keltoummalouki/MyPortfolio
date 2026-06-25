import 'server-only'

// Privileged Supabase client using SUPABASE_SERVICE_ROLE_KEY. BYPASSES RLS.
// Implemented in M3-T1 and used only where strictly necessary.
//
// Boundary: the `server-only` import guarantees this can never be bundled into
// client code. The service-role key must never reach the browser.

export function createAdminSupabaseClient(): never {
  throw new Error('Supabase admin (service-role) client not implemented yet (see M3-T1).')
}
