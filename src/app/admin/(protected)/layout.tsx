import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { getAdminSession } from '@/features/auth/session'
import { signOutAction } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import AdminNav from './AdminNav'

// Protected dashboard shell. The server-side guard here (plus RLS in the
// database) is the security boundary; middleware only keeps tokens fresh.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin } = await getAdminSession()

  // Anonymous -> login.
  if (!user) redirect('/admin/login')

  // Authenticated but not an administrator -> explicit unauthorized state.
  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          <h1 className="mb-2 text-xl font-bold text-foreground">Not authorized</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            You are signed in as <span className="font-medium">{user.email}</span>, but this
            account is not an administrator.
          </p>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full">
              <LogOut size={16} />
              Sign out
            </Button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border px-4">
        <span className="font-bold text-foreground">Portfolio CMS</span>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
          <ThemeToggle />
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[220px_1fr]">
        <aside className="border-b border-border p-3 lg:min-h-[calc(100vh-3.5rem)] lg:border-b-0 lg:border-r">
          <AdminNav />
        </aside>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
