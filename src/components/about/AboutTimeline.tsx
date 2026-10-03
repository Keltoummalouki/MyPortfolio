import type { ReactNode } from 'react'
import { Briefcase, Calendar, GraduationCap, MapPin, type LucideIcon } from 'lucide-react'
import SkillIcon from '@/components/ui/SkillIcon'
import type { AboutEducationItem, AboutExperienceItem } from '@/features/seo/about-faq'
import ProfileSection, { chipClass } from './ProfileSection'

// Experience and education as vertical timelines. Logical properties
// (border-s / ps / -start) keep the rail on the reading-start side in RTL.

function TimelineEntry({
  icon: Icon,
  title,
  subtitle,
  place,
  date,
  badge,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  place: string
  date: string
  badge?: string
  description: string
  children?: ReactNode
}) {
  return (
    <li className="relative ps-10 md:ps-12">
      <span
        aria-hidden="true"
        className="absolute -start-4 top-5 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground"
      >
        <Icon size={15} />
      </span>
      <article className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-bold tracking-tight text-foreground md:text-xl">{title}</h3>
          {badge && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{badge}</span>
          )}
        </div>
        {subtitle && <p className="mt-1 font-medium text-primary">{subtitle}</p>}
        {(place || date) && (
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {place && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" size={14} />
                {place}
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar aria-hidden="true" size={14} />
                {date}
              </span>
            )}
          </p>
        )}
        {description && <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">{description}</p>}
        {children}
      </article>
    </li>
  )
}

export function AboutExperience({
  title,
  currentLabel,
  technologiesLabel,
  items,
}: {
  title: string
  currentLabel: string
  technologiesLabel: string
  items: AboutExperienceItem[]
}) {
  if (items.length === 0) return null
  return (
    <ProfileSection id="experience" title={title}>
      <ol className="ms-4 space-y-8 border-s-2 border-border">
        {items.map((item) => (
          <TimelineEntry
            key={item.id}
            icon={Briefcase}
            title={item.role}
            subtitle={item.company}
            place={item.place}
            date={item.date}
            badge={item.isCurrent ? currentLabel : undefined}
            description={item.description}
          >
            {item.technologies.length > 0 && (
              <ul aria-label={technologiesLabel} className="mt-4 flex flex-wrap gap-2">
                {item.technologies.map((tech) => (
                  <li key={tech} className={chipClass}>
                    {/* Decorative: some tech icons carry an SVG <title> that would repeat the label. */}
                    <span aria-hidden="true" className="inline-flex">
                      <SkillIcon name={tech} className="text-primary" size={14} />
                    </span>
                    {tech}
                  </li>
                ))}
              </ul>
            )}
          </TimelineEntry>
        ))}
      </ol>
    </ProfileSection>
  )
}

export function AboutEducation({ title, items }: { title: string; items: AboutEducationItem[] }) {
  if (items.length === 0) return null
  return (
    <ProfileSection id="education" title={title}>
      <ol className="ms-4 space-y-8 border-s-2 border-border">
        {items.map((item) => (
          <TimelineEntry
            key={item.id}
            icon={GraduationCap}
            title={item.degree || item.institution}
            subtitle={item.degree ? item.institution : ''}
            place={item.place}
            date={item.date}
            description={item.description}
          />
        ))}
      </ol>
    </ProfileSection>
  )
}
