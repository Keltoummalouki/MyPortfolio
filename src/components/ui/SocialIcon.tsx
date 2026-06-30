import { Globe, Mail } from 'lucide-react'
import type { ComponentType } from 'react'
import {
  SiDiscord,
  SiGithub,
  SiInstagram,
  SiLinkedin,
  SiMedium,
  SiReddit,
  SiTelegram,
  SiWhatsapp,
  SiX,
} from 'react-icons/si'
import { normalizeSocialPlatform } from '@/features/cms/social-platforms'
import { cn } from '@/lib/utils'

const iconMap: Record<string, ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  discord: SiDiscord,
  email: Mail,
  github: SiGithub,
  instagram: SiInstagram,
  linkedin: SiLinkedin,
  medium: SiMedium,
  reddit: SiReddit,
  telegram: SiTelegram,
  whatsapp: SiWhatsapp,
  x: SiX,
}

function isImageIcon(value: string) {
  return value.startsWith('/') || /^https?:\/\//i.test(value)
}

export default function SocialIcon({
  platform,
  icon,
  className,
  imageClassName,
}: {
  platform: string
  icon?: string | null
  className?: string
  imageClassName?: string
}) {
  const iconValue = icon?.trim() || ''

  if (iconValue && isImageIcon(iconValue)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconValue}
        alt=""
        aria-hidden="true"
        className={cn('size-4 rounded-sm object-contain', className, imageClassName)}
      />
    )
  }

  const key = normalizeSocialPlatform(iconValue || platform)
  const Icon = iconMap[key] ?? Globe

  return <Icon className={cn('size-4', className)} aria-hidden />
}
