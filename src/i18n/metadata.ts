import { routing } from './routing'

/**
 * Build a `hreflang` alternates map for the locales, given a function that
 * produces the localized pathname for each locale.
 *
 * Example: `localizedAlternates((l) => `/${l}/blog`)`
 *   -> { fr: '/fr/blog', en: '/en/blog', ar: '/ar/blog' }
 *
 * Paths are resolved against `metadataBase` (set in the root layout metadata).
 */
export function localizedAlternates(build: (locale: string) => string): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const locale of routing.locales) {
    languages[locale] = build(locale)
  }
  return languages
}
