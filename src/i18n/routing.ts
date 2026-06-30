import { defineRouting } from 'next-intl/routing'

// Locale-prefixed public routing. The URL is the source of truth for the active
// locale (`/fr`, `/en`, `/ar`); the cookie is only a preference used to
// negotiate the locale on unprefixed entry points (e.g. `/`).
export const routing = defineRouting({
  locales: ['fr', 'en', 'ar'],
  defaultLocale: 'fr',
  localePrefix: 'always',
  // Reuse the existing `locale` cookie name as the preference store.
  localeCookie: { name: 'locale' },
})

export type AppLocale = (typeof routing.locales)[number]
