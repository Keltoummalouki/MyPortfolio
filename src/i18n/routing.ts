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
  // hreflang comes from page metadata (src/features/seo/metadata.ts) and the
  // sitemap. The middleware's own `Link` header would point x-default at the
  // unprefixed `/` and list every locale even for untranslated content,
  // contradicting the HTML tags.
  alternateLinks: false,
})

export type AppLocale = (typeof routing.locales)[number]
