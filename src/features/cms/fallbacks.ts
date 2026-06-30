import fr from '../../../messages/fr.json'
import en from '../../../messages/en.json'
import ar from '../../../messages/ar.json'
import type { I18nText } from './schema'

export const ABOUT_FALLBACK = {
  fullName: fr.hero.name,
  avatarUrl: '/images/keltoum.png',
  cvUrl: '/cv.pdf',
  availabilityStatus: 'available',
  location: {
    fr: fr.hero.location,
    en: en.hero.location,
    ar: ar.hero.location,
  } satisfies I18nText,
  headline: {
    fr: fr.hero.role,
    en: en.hero.role,
    ar: ar.hero.role,
  } satisfies I18nText,
  bio: {
    fr: fr.about.description,
    en: en.about.description,
    ar: ar.about.description,
  } satisfies I18nText,
} as const
