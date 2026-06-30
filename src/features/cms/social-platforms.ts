export const SOCIAL_PLATFORM_OPTIONS = [
  {
    key: 'email',
    label: 'Email',
    defaultLabel: 'Contact me by email',
    placeholder: 'mailto:keltoummalouki@gmail.com',
    action: 'Contact',
  },
  {
    key: 'github',
    label: 'GitHub',
    defaultLabel: 'Follow me on GitHub',
    placeholder: 'https://github.com/keltoummalouki',
    action: 'Follow',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    defaultLabel: 'Contact me on WhatsApp',
    placeholder: 'https://wa.me/212606232697',
    action: 'Contact',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    defaultLabel: 'Follow me on Instagram',
    placeholder: 'https://instagram.com/username',
    action: 'Follow',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    defaultLabel: 'Follow me on LinkedIn',
    placeholder: 'https://www.linkedin.com/in/keltoummalouki',
    action: 'Follow',
  },
  {
    key: 'telegram',
    label: 'Telegram',
    defaultLabel: 'Contact me on Telegram',
    placeholder: 'https://t.me/username',
    action: 'Contact',
  },
  {
    key: 'x',
    label: 'X',
    defaultLabel: 'Follow me on X',
    placeholder: 'https://x.com/username',
    action: 'Follow',
  },
  {
    key: 'discord',
    label: 'Discord',
    defaultLabel: 'Contact me on Discord',
    placeholder: 'https://discord.com/users/user-id',
    action: 'Contact',
  },
  {
    key: 'reddit',
    label: 'Reddit',
    defaultLabel: 'Follow me on Reddit',
    placeholder: 'https://www.reddit.com/user/username',
    action: 'Follow',
  },
  {
    key: 'medium',
    label: 'Medium',
    defaultLabel: 'Follow me on Medium',
    placeholder: 'https://medium.com/@username',
    action: 'Follow',
  },
] as const

export type SocialPlatformKey = (typeof SOCIAL_PLATFORM_OPTIONS)[number]['key']

const SOCIAL_PLATFORM_ALIASES: Record<string, SocialPlatformKey> = {
  mail: 'email',
  e_mail: 'email',
  gmail: 'email',
  insta: 'instagram',
  ig: 'instagram',
  twitter: 'x',
  xcom: 'x',
  medium: 'medium',
  meduim: 'medium',
  linked_in: 'linkedin',
}

export function normalizeSocialPlatform(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

  return SOCIAL_PLATFORM_ALIASES[normalized] ?? normalized
}

export function getSocialPlatformOption(platform: string) {
  const normalized = normalizeSocialPlatform(platform)
  return SOCIAL_PLATFORM_OPTIONS.find((option) => option.key === normalized)
}

export function displaySocialPlatform(platform: string) {
  const option = getSocialPlatformOption(platform)
  if (option) return option.label

  return normalizeSocialPlatform(platform)
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function defaultSocialLabel(platform: string) {
  return getSocialPlatformOption(platform)?.defaultLabel ?? `Follow me on ${displaySocialPlatform(platform)}`
}
