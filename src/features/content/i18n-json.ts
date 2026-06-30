import { DEFAULT_LOCALE, type Locale } from '@/lib/validation/locale'

// Helper for `{fr,en,ar}` JSONB i18n columns (about_profile, design_settings,
// site_settings, services, skill_categories, media_assets.alt). Pure + testable.

export type I18nMap = Record<string, string> | null | undefined

/**
 * Pick a localized string from a JSONB i18n map: requested locale, else the
 * default locale, else the first available value, else an empty string.
 */
export function pickI18n(
  map: I18nMap,
  locale: Locale,
  defaultLocale: Locale = DEFAULT_LOCALE,
): string {
  if (!map) return ''
  return map[locale] ?? map[defaultLocale] ?? Object.values(map)[0] ?? ''
}
