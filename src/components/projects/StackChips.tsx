import SkillIcon from '@/components/ui/SkillIcon'
import type { ProjectStackItem } from '@/features/content/projects.map'
import { cn } from '@/lib/utils'

/** Tech-stack chips (same look as the home ProjectsSection). */
export default function StackChips({
  items,
  label,
  max,
  className,
}: {
  items: ProjectStackItem[]
  /** Accessible name of the list, e.g. "Tech stack". */
  label: string
  max?: number
  className?: string
}) {
  const shown = max ? items.slice(0, max) : items
  if (shown.length === 0) return null
  return (
    <ul aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {shown.map((tech) => (
        <li key={tech.name}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <SkillIcon name={tech.name} icon={tech.icon} imageUrl={tech.imageUrl} className="text-primary" size={13} />
            {tech.name}
          </span>
        </li>
      ))}
    </ul>
  )
}
