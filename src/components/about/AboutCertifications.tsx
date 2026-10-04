import { Award, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import ProfileSection, { cardClass } from './ProfileSection'

export interface AboutCertificationItem {
  id: string
  name: string
  issuer: string
  date: string
  description: string
  credentialUrl: string
}

/** `2025-03-14` -> `2025`; free text (e.g. `2025`) is kept as-is. */
function displayYear(value: string): string {
  const match = value.match(/^(\d{4})-\d{2}(-\d{2})?/)
  return match ? match[1] : value
}

export default function AboutCertifications({
  title,
  viewLabel,
  items,
}: {
  title: string
  viewLabel: string
  items: AboutCertificationItem[]
}) {
  if (items.length === 0) return null
  return (
    <ProfileSection id="certifications" title={title}>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {items.map((item) => {
          const meta = [item.issuer, displayYear(item.date)].filter(Boolean).join(' · ')
          return (
            <li key={item.id} className={cn(cardClass, 'flex gap-4 p-5 md:p-6')}>
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Award aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold leading-snug text-foreground">{item.name}</h3>
                {meta && <p className="mt-1 text-sm text-primary">{meta}</p>}
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                )}
                {item.credentialUrl && (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {viewLabel}
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </ProfileSection>
  )
}
