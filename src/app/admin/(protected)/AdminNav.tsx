'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Inbox, FileText, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

// Only Dashboard is routable in M3. The remaining sections are shown as
// placeholders to convey the dashboard structure; they are built in M5–M9.
const items = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, ready: true },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban, ready: true },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox, ready: true },
  { href: '/admin/blog', label: 'Blog', icon: FileText, ready: false },
  { href: '/admin/leads', label: 'Leads', icon: Briefcase, ready: false },
] as const

const base =
  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors'

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map(({ href, label, icon: Icon, ready }) => {
        if (!ready) {
          return (
            <span
              key={href}
              aria-disabled="true"
              title="Coming soon"
              className={cn(base, 'cursor-not-allowed text-muted-foreground/60')}
            >
              <Icon size={16} />
              <span>{label}</span>
              <span className="ml-auto hidden text-[10px] uppercase tracking-wide lg:inline">soon</span>
            </span>
          )
        }

        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              base,
              active
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
          >
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
