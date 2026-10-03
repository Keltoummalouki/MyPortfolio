import { ExternalLink, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ProjectLinkLabels {
  viewCode: string
  viewCodeAria: string
  liveDemo: string
  liveDemoAria: string
}

/** Repository / live-demo buttons for a project (external, new tab). */
export default function ProjectLinks({
  github,
  demo,
  labels,
  size = 'default',
  className,
}: {
  github: string | null
  demo: string | null
  labels: ProjectLinkLabels
  size?: 'sm' | 'default'
  className?: string
}) {
  if (!github && !demo) return null
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {github && (
        <Button asChild variant="outline" size={size}>
          <a href={github} target="_blank" rel="noopener noreferrer" aria-label={labels.viewCodeAria}>
            <Github aria-hidden />
            {labels.viewCode}
          </a>
        </Button>
      )}
      {demo && (
        <Button asChild size={size}>
          <a href={demo} target="_blank" rel="noopener noreferrer" aria-label={labels.liveDemoAria}>
            <ExternalLink aria-hidden />
            {labels.liveDemo}
          </a>
        </Button>
      )}
    </div>
  )
}
