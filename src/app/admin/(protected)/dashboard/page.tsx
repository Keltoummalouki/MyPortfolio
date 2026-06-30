import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FolderKanban,
  Inbox,
  MessageSquare,
  PenLine,
  Palette,
  Plus,
  Target,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { requireAdmin } from '@/features/auth/session'
import { listAdminProjects } from '@/features/content/projects.queries'
import { listAdminArticles } from '@/features/articles/queries'
import { listMessages } from '@/features/inbox/queries'
import { listLeads } from '@/features/freelance/queries'
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from '@/components/admin/ui'
import { cn } from '@/lib/utils'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function pickTitle(translations: { locale: string; title: string | null }[]): string {
  const fr = translations.find((t) => t.locale === 'fr')?.title
  return fr || translations.find((t) => t.title)?.title || ''
}

async function getDashboardData() {
  const [projects, articles, messages, leads] = await Promise.all([
    listAdminProjects(),
    listAdminArticles(),
    listMessages(),
    listLeads(),
  ])

  const byCreatedDesc = <T extends { created_at: string }>(a: T, b: T) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

  return {
    projects: {
      total: projects.length,
      published: projects.filter((p) => p.status === 'published').length,
      drafts: projects.filter((p) => p.status === 'draft').length,
      recent: [...projects].sort(byCreatedDesc).slice(0, 5),
    },
    articles: {
      total: articles.length,
      published: articles.filter((a) => a.status === 'published').length,
      drafts: articles.filter((a) => a.status === 'draft').length,
      recent: [...articles].sort(byCreatedDesc).slice(0, 5),
    },
    messages: {
      total: messages.length,
      new: messages.filter((m) => m.status === 'new').length,
      recent: messages.slice(0, 5),
    },
    leads: {
      total: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      recent: leads.slice(0, 5),
    },
  }
}

interface AttentionItem {
  icon: LucideIcon
  label: string
  count: number
  href: string
}

function AttentionRow({ item }: { item: AttentionItem }) {
  const { icon: Icon, label, count, href } = item
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{label}</span>
      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
        {count}
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  )
}

function QuickAction({
  icon: Icon,
  label,
  description,
  href,
}: {
  icon: LucideIcon
  label: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-primary transition-colors group-hover:border-primary/40 group-hover:bg-primary/10">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </Link>
  )
}

function RecentRow({
  href,
  primary,
  secondary,
  status,
  date,
  emphasize,
}: {
  href: string
  primary: string
  secondary?: string
  status: string
  date: string
  emphasize?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
    >
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm text-foreground', emphasize && 'font-semibold')}>
          {primary || <span className="text-muted-foreground">(untitled)</span>}
        </p>
        {secondary && <p className="truncate text-xs text-muted-foreground">{secondary}</p>}
      </div>
      <StatusBadge status={status} />
      <time className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{date}</time>
    </Link>
  )
}

function RecentPanel({
  title,
  href,
  children,
  isEmpty,
  emptyIcon,
  emptyTitle,
}: {
  title: string
  href: string
  children: React.ReactNode
  isEmpty: boolean
  emptyIcon: LucideIcon
  emptyTitle: string
}) {
  return (
    <SectionCard
      title={title}
      action={
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
      contentClassName="p-0"
    >
      {isEmpty ? (
        <div className="p-4">
          <EmptyState icon={emptyIcon} title={emptyTitle} />
        </div>
      ) : (
        <ul className="divide-y divide-border">{children}</ul>
      )}
    </SectionCard>
  )
}

export default async function DashboardPage() {
  await requireAdmin()
  const data = await getDashboardData()

  const attention: AttentionItem[] = [
    { icon: MessageSquare, label: 'New messages to review', count: data.messages.new, href: '/admin/inbox?status=new' },
    { icon: Target, label: 'New freelance leads', count: data.leads.new, href: '/admin/leads?status=new' },
    { icon: FolderKanban, label: 'Projects still in draft', count: data.projects.drafts, href: '/admin/projects' },
    { icon: FileText, label: 'Articles still in draft', count: data.articles.drafts, href: '/admin/blog' },
  ].filter((item) => item.count > 0)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="An overview of your content, incoming messages, and freelance leads."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={data.projects.total}
          hint={`${data.projects.published} published`}
          href="/admin/projects"
        />
        <StatCard
          icon={FileText}
          label="Articles"
          value={data.articles.total}
          hint={`${data.articles.published} published`}
          href="/admin/blog"
        />
        <StatCard
          icon={Inbox}
          label="Messages"
          value={data.messages.total}
          hint={`${data.messages.new} new`}
          href="/admin/inbox"
        />
        <StatCard
          icon={Target}
          label="Leads"
          value={data.leads.total}
          hint={`${data.leads.new} new`}
          href="/admin/leads"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Needs attention */}
        <SectionCard title="Needs attention" description="Items waiting on you right now.">
          {attention.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="You're all caught up"
              description="No new messages, leads, or drafts need your attention."
            />
          ) : (
            <div className="space-y-2">
              {attention.map((item) => (
                <AttentionRow key={item.href} item={item} />
              ))}
            </div>
          )}
        </SectionCard>

        {/* Quick actions */}
        <SectionCard title="Quick actions">
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={Plus} label="New project" description="Add a portfolio project" href="/admin/projects/new" />
            <QuickAction icon={PenLine} label="Write article" description="Draft a blog post" href="/admin/blog/new" />
            <QuickAction icon={UserRound} label="Edit profile" description="Update your About page" href="/admin/about" />
            <QuickAction icon={Palette} label="Theme & design" description="Adjust the public look" href="/admin/theme" />
          </div>
        </SectionCard>
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentPanel
          title="Recent messages"
          href="/admin/inbox"
          isEmpty={data.messages.recent.length === 0}
          emptyIcon={Inbox}
          emptyTitle="No messages yet"
        >
          {data.messages.recent.map((m) => (
            <li key={m.id}>
              <RecentRow
                href={`/admin/inbox/${m.id}`}
                primary={m.name}
                secondary={m.subject || m.email}
                status={m.status}
                date={formatDate(m.created_at)}
                emphasize={m.status === 'new'}
              />
            </li>
          ))}
        </RecentPanel>

        <RecentPanel
          title="Recent leads"
          href="/admin/leads"
          isEmpty={data.leads.recent.length === 0}
          emptyIcon={Target}
          emptyTitle="No leads yet"
        >
          {data.leads.recent.map((l) => (
            <li key={l.id}>
              <RecentRow
                href={`/admin/leads/${l.id}`}
                primary={l.name}
                secondary={l.company || l.email}
                status={l.status}
                date={formatDate(l.created_at)}
                emphasize={l.status === 'new'}
              />
            </li>
          ))}
        </RecentPanel>

        <RecentPanel
          title="Recent projects"
          href="/admin/projects"
          isEmpty={data.projects.recent.length === 0}
          emptyIcon={FolderKanban}
          emptyTitle="No projects yet"
        >
          {data.projects.recent.map((p) => (
            <li key={p.id}>
              <RecentRow
                href={`/admin/projects/${p.id}`}
                primary={pickTitle(p.project_translations)}
                secondary={p.slug}
                status={p.status}
                date={formatDate(p.created_at)}
              />
            </li>
          ))}
        </RecentPanel>

        <RecentPanel
          title="Recent articles"
          href="/admin/blog"
          isEmpty={data.articles.recent.length === 0}
          emptyIcon={FileText}
          emptyTitle="No articles yet"
        >
          {data.articles.recent.map((a) => (
            <li key={a.id}>
              <RecentRow
                href={`/admin/blog/${a.id}`}
                primary={pickTitle(a.article_translations)}
                status={a.status}
                date={formatDate(a.created_at)}
              />
            </li>
          ))}
        </RecentPanel>
      </div>
    </div>
  )
}
