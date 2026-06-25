import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Auth-token refresh middleware. Keeps the Supabase session fresh by reading
// cookies on each request and writing back any rotated tokens. This improves
// navigation only — RLS and the server-side admin guard remain the real
// security boundary.
//
// Scoped to /admin (see `config.matcher`) so the public site is untouched.
// Locale routing/middleware is introduced later in M4.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // If the environment is not configured, skip silently rather than crash every
  // /admin request; the pages themselves surface a clear setup error.
  if (!url || !anonKey) return response

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // Refresh the session (rotates tokens when needed). Do not gate routing here.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
