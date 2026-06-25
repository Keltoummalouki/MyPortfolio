import Link from 'next/link'
import { listLeads, getLeadStatusCounts } from '@/features/freelance/queries'
import {
  BUDGET_RANGE_LABELS,
  LEAD_STATUSES,
  PROJECT_TYPE_LABELS,
  leadStatusSchema,
  type LeadStatus,
} from '@/features/freelance/schema'
import { cn } from '@/lib/utils'

const statusStyles: Record<LeadStatus, string> = {
  new: 'bg-primary/15 text-primary',
  qualified: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  meeting: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  proposal: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  won: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  lost: 'bg-muted text-muted-foreground',
  spam: 'bg-destructive/15 text-destructive',
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const parsedStatus = leadStatusSchema.safeParse(status)
  const activeStatus = parsedStatus.success ? parsedStatus.data : undefined

  const [leads, counts] = await Promise.all([listLeads(activeStatus), getLeadStatusCounts()])
  const total = LEAD_STATUSES.reduce((sum, s) => sum + counts[s], 0)

  const tabs: { key: LeadStatus | 'all'; label: string; count: number; href: string }[] = [
    { key: 'all', label: 'All', count: total, href: '/admin/leads' },
    ...LEAD_STATUSES.map((s) => ({ key: s, label: s, count: counts[s], href: `/admin/leads?status=${s}` })),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground">Freelance project inquiries.</p>
      </div>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = tab.key === 'all' ? !activeStatus : tab.key === activeStatus
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60',
              )}
            >
              {tab.label}
              <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{tab.count}</span>
            </Link>
          )
        })}
      </nav>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No leads{activeStatus ? ` with status “${activeStatus}”` : ' yet'}.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="block">
                      <div className={cn('font-medium text-foreground', lead.status === 'new' && 'font-semibold')}>
                        {lead.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lead.company ? `${lead.company} · ` : ''}{lead.email}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.project_type ? (PROJECT_TYPE_LABELS[lead.project_type] ?? lead.project_type) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.budget_range ? (BUDGET_RANGE_LABELS[lead.budget_range] ?? lead.budget_range) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusStyles[lead.status])}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <time className="text-xs text-muted-foreground" dateTime={lead.created_at}>
                      {formatDate(lead.created_at)}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
