// Public Supabase environment values (safe for the browser bundle).
//
// These are the ONLY Supabase values that may appear in client code:
//   - NEXT_PUBLIC_SUPABASE_URL
//   - NEXT_PUBLIC_SUPABASE_ANON_KEY
// The service-role key is read exclusively in `admin.ts` (a `server-only`
// module) and must never be referenced here.
//
// `process.env.NEXT_PUBLIC_*` tokens are statically inlined by Next.js at build
// time, so these getters work in both server and client contexts.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env.local and set it.`,
    )
  }
  return value
}

export function getSupabaseUrl(): string {
  return required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
}

export function getSupabaseAnonKey(): string {
  return required('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
