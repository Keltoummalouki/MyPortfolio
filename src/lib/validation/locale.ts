import { z } from 'zod'

// Supported locales (default is French). Single source of truth for validation.
// Mirrors i18n.ts; keep in sync until locale routing unifies them in M4.
export const LOCALES = ['fr', 'en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

/** Zod schema accepting only `fr` | `en` | `ar`. */
export const localeSchema = z.enum(LOCALES)
