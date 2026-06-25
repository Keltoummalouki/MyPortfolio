import Link from 'next/link'
import { listMessages, getStatusCounts } from '@/features/inbox/queries'
import { MESSAGE_STATUSES, messageStatusSchema, type MessageStatus } from '@/features/inbox/schema'
import { cn } from '@/lib/utils'

const statusStyles: Record<MessageStatus, string> = {
  new: 'bg-primary/15 text-primary',
  read: 'bg-muted text-muted-foreground',
  replied: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  archived: 'bg-muted text-muted-foreground',
  spam: 'bg-destructive/15 text-destructive',
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function snippet(text: string, max = 120): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const parsedStatus = messageStatusSchema.safeParse(status)
  const activeStatus = parsedStatus.success ? parsedStatus.data : undefined

  const [messages, counts] = await Promise.all([listMessages(activeStatus), getStatusCounts()])
  const total = MESSAGE_STATUSES.reduce((sum, s) => sum + counts[s], 0)

  const tabs: { key: MessageStatus | 'all'; label: string; count: number; href: string }[] = [
    { key: 'all', label: 'All', count: total, href: '/admin/inbox' },
    ...MESSAGE_STATUSES.map((s) => ({
      key: s,
      label: s,
      count: counts[s],
      href: `/admin/inbox?status=${s}`,
    })),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
        <p className="text-sm text-muted-foreground">Messages submitted through the contact form.</p>
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

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No messages{activeStatus ? ` with status “${activeStatus}”` : ' yet'}.
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {messages.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/inbox/${m.id}`}
                className="flex flex-col gap-1 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-foreground', m.status === 'new' && 'font-semibold')}>
                      {m.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{m.email}</span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {m.subject ? <span className="text-foreground">{m.subject} — </span> : null}
                    {snippet(m.message)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      statusStyles[m.status],
                    )}
                  >
                    {m.status}
                  </span>
                  <time className="text-xs text-muted-foreground" dateTime={m.created_at}>
                    {formatDate(m.created_at)}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
