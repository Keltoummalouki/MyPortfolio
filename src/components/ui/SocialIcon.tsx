import { Globe, Mail } from 'lucide-react'
import Image from 'next/image'
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
import { isOptimizableImageSrc } from '@/lib/images'
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
    // `alt` names the platform for crawlers; the link itself carries the
    // accessible name, so the image stays aria-hidden.
    return (
      <Image
        src={iconValue}
        alt={platform}
        aria-hidden="true"
        width={16}
        height={16}
        unoptimized={!isOptimizableImageSrc(iconValue)}
        className={cn('size-4 rounded-sm object-contain', className, imageClassName)}
      />
    )
  }

  const key = normalizeSocialPlatform(iconValue || platform)
  const Icon = iconMap[key] ?? Globe

  return <Icon className={cn('size-4', className)} aria-hidden />
}
