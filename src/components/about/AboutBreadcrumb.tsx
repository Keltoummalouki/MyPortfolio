import { ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'

/** Visible Home / About trail; mirrors the BreadcrumbList JSON-LD. */
export default function AboutBreadcrumb({
  label,
  homeLabel,
  currentLabel,
}: {
  label: string
  homeLabel: string
  currentLabel: string
}) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link
            href="/"
            className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {homeLabel}
          </Link>
        </li>
        <li aria-hidden="true" className="flex items-center">
          <ChevronRight size={14} className="rtl:rotate-180" />
        </li>
        <li aria-current="page" className="text-foreground">
          {currentLabel}
        </li>
      </ol>
    </nav>
  )
}
