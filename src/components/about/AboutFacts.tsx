import {
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Handshake,
  Languages,
  Mail,
  MapPin,
  type LucideIcon,
} from 'lucide-react'
import type { AboutFactId, AboutFactRow } from '@/features/seo/about-faq'
import { cn } from '@/lib/utils'
import ProfileSection, { cardClass } from './ProfileSection'

const FACT_ICONS: Record<AboutFactId, LucideIcon> = {
  role: BriefcaseBusiness,
  location: MapPin,
  current: Building2,
  education: GraduationCap,
  languages: Languages,
  openTo: Handshake,
  email: Mail,
}

export default function AboutFacts({ title, facts }: { title: string; facts: AboutFactRow[] }) {
  return (
    <ProfileSection id="at-a-glance" title={title}>
      <dl className={cn(cardClass, 'grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:p-6')}>
        {facts.map((fact) => {
          const Icon = FACT_ICONS[fact.id]
          return (
            <div key={fact.id} className="rounded-xl border border-border bg-background/60 p-4">
              <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
                {fact.label}
              </dt>
              <dd className="mt-1.5 break-words text-base font-semibold leading-snug text-foreground">
                {fact.href ? (
                  <a
                    href={fact.href}
                    className="rounded-sm underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {fact.value}
                  </a>
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          )
        })}
      </dl>
    </ProfileSection>
  )
}
