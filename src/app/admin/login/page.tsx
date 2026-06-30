import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/features/auth/session'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // An already-authenticated admin never needs the login page.
  const { user, isAdmin } = await getAdminSession()
  if (user && isAdmin) redirect('/admin/dashboard')

  const { error } = await searchParams
  const unauthorized = error === 'unauthorized'

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-bold text-foreground">Admin sign in</h1>
          <p className="text-sm text-muted-foreground">
            Restricted area — administrators only.
          </p>
        </div>

        {unauthorized && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            This account is not authorized to access the dashboard.
          </p>
        )}

        <LoginForm />
      </div>
    </main>
  )
}
