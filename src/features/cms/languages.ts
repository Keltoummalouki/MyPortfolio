import type { Tables } from '@/lib/supabase/database.types'
import type { Locale } from '@/lib/validation/locale'
import { pickI18n, type I18nMap } from '@/features/content/i18n-json'
import type { I18nText } from './schema'

// Pure, client-safe language mapping + fallback. No `server-only` and no message
// JSON imports so it can be used in both server queries and client components and
// is unit-testable on its own.

export type LanguageRow = Tables<'languages'>

export interface PublicLanguage {
  id: string
  name: string
  level: string
  icon: string
}

interface LanguageFallback {
  id: string
  name: I18nText
  level: I18nText
}

/**
 * Safe static fallback mirroring the historical hardcoded About card:
 * Arabic (Native), French (B1), English (A2). Used when the DB has no published
 * languages or is unreachable.
 */
export const LANGUAGES_FALLBACK: readonly LanguageFallback[] = [
  {
    id: 'arabic',
    name: { fr: 'Arabe', en: 'Arabic', ar: 'العربية' },
    level: { fr: 'Maternelle', en: 'Native', ar: 'اللغة الأم' },
  },
  {
    id: 'french',
    name: { fr: 'Français', en: 'French', ar: 'الفرنسية' },
    level: { fr: 'B1', en: 'B1', ar: 'B1' },
  },
  {
    id: 'english',
    name: { fr: 'Anglais', en: 'English', ar: 'الإنجليزية' },
    level: { fr: 'A2', en: 'A2', ar: 'A2' },
  },
] as const

export function getFallbackLanguages(locale: Locale): PublicLanguage[] {
  return LANGUAGES_FALLBACK.map((language) => ({
    id: language.id,
    name: language.name[locale] || language.name.fr,
    level: language.level[locale] || language.level.fr,
    icon: '',
  }))
}

export function mapPublicLanguages(rows: readonly LanguageRow[], locale: Locale): PublicLanguage[] {
  return rows
    .map((row) => ({
      id: row.id,
      name: pickI18n(row.name as I18nMap, locale),
      level: pickI18n(row.level as I18nMap, locale),
      icon: row.icon ?? '',
    }))
    .filter((language) => language.name.length > 0)
}

/**
 * Map published language rows for a locale, falling back to the safe static list
 * when there is nothing publishable.
 */
export function resolveLanguages(rows: readonly LanguageRow[], locale: Locale): PublicLanguage[] {
  const mapped = mapPublicLanguages(rows, locale)
  return mapped.length > 0 ? mapped : getFallbackLanguages(locale)
}
