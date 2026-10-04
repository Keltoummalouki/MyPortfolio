import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Read-only stars. Supports fractional values (e.g. a 4.3 average) by clipping
 * a filled row over an empty one. Exposed to assistive tech as one image with a
 * spoken label ("Rated 4.3 out of 5"); the individual stars are decorative.
 */
export default function StarRating({
  value,
  label,
  size = 16,
  className,
}: {
  value: number
  label: string
  size?: number
  className?: string
}) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100))
  const row = (filled: boolean) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        aria-hidden="true"
        width={size}
        height={size}
        className={cn('shrink-0', filled ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/40')}
      />
    ))

  return (
    // w-fit + self-start: never stretch inside a flex column, or the % fill overshoots.
    <span role="img" aria-label={label} className={cn('relative inline-flex w-fit shrink-0 self-start', className)}>
      <span className="flex gap-0.5">{row(false)}</span>
      {/* inset-inline-start keeps the fill growing from the reading start (RTL-safe). */}
      <span className="absolute inset-y-0 start-0 flex gap-0.5 overflow-hidden" style={{ width: `${percent}%` }}>
        {row(true)}
      </span>
    </span>
  )
}
