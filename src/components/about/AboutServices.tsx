import { Code2, MonitorSmartphone, Server, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import ProfileSection, { cardClass } from './ProfileSection'

export type AboutServiceKey = 'fullStack' | 'backend' | 'frontend'

const SERVICE_ICONS: Record<AboutServiceKey, LucideIcon> = {
  fullStack: Code2,
  backend: Server,
  frontend: MonitorSmartphone,
}

export default function AboutServices({
  title,
  lead,
  items,
}: {
  title: string
  lead: string
  items: { key: AboutServiceKey; title: string; description: string }[]
}) {
  return (
    <ProfileSection id="what-i-do" title={title} lead={lead}>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {items.map((item) => {
          const Icon = SERVICE_ICONS[item.key]
          return (
            <li key={item.key} className={cn(cardClass, 'p-6')}>
              <div className="inline-flex rounded-xl bg-secondary p-2.5 text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </li>
          )
        })}
      </ul>
    </ProfileSection>
  )
}
