import type { Json } from '@/lib/supabase/database.types'
import { EMPTY_I18N, type I18nText } from './schema'

function toRecord(value: Json | null | undefined): Record<string, Json> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, Json>
  }
  return {}
}

function textValue(value: Json | undefined): string {
  return typeof value === 'string' ? value : ''
}

export function i18nFromJson(value: Json | null | undefined): I18nText {
  const record = toRecord(value)
  return {
    ...EMPTY_I18N,
    fr: textValue(record.fr),
    en: textValue(record.en),
    ar: textValue(record.ar),
  }
}

export function readSiteProfile(profile: Json | null | undefined) {
  const raw = toRecord(profile)
  const cvUrls = toRecord(raw.cvUrls)

  return {
    raw,
    location: i18nFromJson(raw.location),
    cvUrlFr: textValue(cvUrls.fr),
    cvUrlEn: textValue(cvUrls.en),
  }
}
