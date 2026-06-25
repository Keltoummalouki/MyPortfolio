import { requireAdmin } from '@/features/auth/session'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Overview counts. Reads run under the admin's RLS context (admins see all
// rows); requireAdmin is defense-in-depth on top of the layout guard.
async function getOverviewCounts() {
  const supabase = await createServerSupabaseClient()

  const [projects, publishedProjects, articles, newMessages, newLeads] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('freelance_leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
  ])

  return {
    projects: projects.count ?? 0,
    publishedProjects: publishedProjects.count ?? 0,
    articles: articles.count ?? 0,
    newMessages: newMessages.count ?? 0,
    newLeads: newLeads.count ?? 0,
  }
}

export default async function DashboardPage() {
  await requireAdmin()
  const counts = await getOverviewCounts()

  const stats = [
    { label: 'Projects', value: counts.projects, hint: `${counts.publishedProjects} published` },
    { label: 'Articles', value: counts.articles, hint: 'total' },
    { label: 'New messages', value: counts.newMessages, hint: 'unread' },
    { label: 'New leads', value: counts.newLeads, hint: 'unqualified' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your portfolio content and inbox.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
