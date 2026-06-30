'use client'

import {
  CheckCircle2,
  Clock,
  Handshake,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TechIcon, hasTechIcon, type TechName } from '@/components/ui/TechIcon'
import { cn } from '@/lib/utils'

const softIconMap: Record<string, LucideIcon> = {
  adaptability: RotateCcw,
  adaptable: RotateCcw,
  clock: Clock,
  creative: Sparkles,
  creativity: Sparkles,
  dedicated: Target,
  dedication: Target,
  flexibility: RotateCcw,
  idea: Lightbulb,
  lightbulb: Lightbulb,
  problem: Lightbulb,
  problem_solver: Lightbulb,
  rotate: RotateCcw,
  teamwork: Handshake,
  team: Users,
  team_player: Users,
  time: Clock,
  time_management: Clock,
}

function normalizeIconKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export default function SkillIcon({
  name,
  icon,
  imageUrl,
  className,
  imageClassName,
  size = 16,
}: {
  name: string
  icon?: string | null
  imageUrl?: string | null
  className?: string
  imageClassName?: string
  size?: number
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className={cn('rounded-sm object-contain', className, imageClassName)}
        style={{ width: size, height: size }}
      />
    )
  }

  const iconName = icon || name
  if (hasTechIcon(iconName)) {
    return <TechIcon name={iconName as TechName} size={size} showColor className={className} />
  }

  const SoftIcon = softIconMap[normalizeIconKey(iconName)] ?? CheckCircle2
  return <SoftIcon aria-hidden="true" className={className} size={size} />
}
