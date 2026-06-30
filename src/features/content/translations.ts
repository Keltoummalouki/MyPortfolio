import { DEFAULT_LOCALE, type Locale } from '@/lib/validation/locale'

/** A translation row tagged with its locale. */
export interface Translated {
  locale: Locale
}

/**
 * Project-wide missing-translation policy: return the translation for `locale`,
 * else fall back to the default locale, else the first available translation.
 * Returns `undefined` only when there are no translations at all.
 *
 * Pure function — no I/O — so it is unit-testable without Supabase.
 */
export function pickTranslation<T extends Translated>(
  translations: readonly T[],
  locale: Locale,
  defaultLocale: Locale = DEFAULT_LOCALE,
): T | undefined {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === defaultLocale) ??
    translations[0]
  )
}
