import { ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export interface BreadcrumbItem {
  name: string
  /** Unprefixed, locale-aware href ("/projects"). Omit for the current page. */
  href?: string
}

/**
 * Visible breadcrumb trail (mirrors the BreadcrumbList JSON-LD). The last item
 * is the current page. Chevrons flip in RTL.
 */
export default function Breadcrumbs({ label, items }: { label: string; items: BreadcrumbItem[] }) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${index}-${item.name}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && <ChevronRight size={14} aria-hidden className="shrink-0 rtl:rotate-180" />}
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.name}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className="truncate text-foreground">
                  {item.name}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
