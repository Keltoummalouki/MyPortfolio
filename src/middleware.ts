import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/i18n/routing'

// Public routes: next-intl handles locale-prefixed routing (/, /blog, … ->
// /fr/…) and locale negotiation. Admin routes stay UNPREFIXED and only get a
// Supabase auth-token refresh. RLS + the server guard remain the real security
// boundary; this middleware just improves navigation.

const handleI18nRouting = createMiddleware(routing)

async function refreshAdminSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

  await supabase.auth.getUser()
  return response
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return refreshAdminSession(request)
  }
  return handleI18nRouting(request)
}

export const config = {
  // Run on everything except API, Next internals, and files with an extension.
  // This covers public routes (locale routing) and /admin (session refresh).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
