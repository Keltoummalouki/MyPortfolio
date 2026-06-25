import 'server-only'

// Cookie-aware Supabase server client (per-request auth).
// Implemented in M3-T1 (Create Supabase client utilities).
//
// Boundary: the `server-only` import makes importing this module from a Client
// Component a build error. Use it from Server Components, Server Actions, and
// Route Handlers.

export function createServerSupabaseClient(): never {
  throw new Error('Supabase server client not implemented yet (see M3-T1).')
}
