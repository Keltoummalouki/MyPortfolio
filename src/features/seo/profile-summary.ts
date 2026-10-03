import type { PublicCmsContent } from '@/features/cms/queries'
import type { PersonSchemaInput } from './jsonld'

// Pure composition logic for the homepage "Who is Keltoum Malouki?" section.
// It turns published CMS content (with message fallbacks) into one explicit,
// self-contained definitional paragraph plus a "Key facts" list, the kind of
// text search engines and AI answer engines can quote out of context. No I/O and
// no next-intl import: the caller passes a translator scoped to `home.profile`.

/** Translator scoped to the `home.profile` messages namespace. */
export type ProfileTranslate = (key: string, values?: Record<string, string>) => string

export type ProfileAvailability = 'available' | 'limited' | 'unavailable'

export interface ProfileFacts {
  name: string
  role: string
  availability: ProfileAvailability
  current: { role: string; company: string } | null
  education: { school: string; degree: string } | null
  /** Core technical stack, most representative first. */
  stack: string[]
  languages: { name: string; level: string }[]
}

export interface ProfileFactsFallbacks {
  name: string
  role: string
  /** Used only when the CMS has no published experiences at all. */
  current: { role: string; company: string } | null
  /** Used only when the CMS has no published education at all. */
  education: { school: string; degree: string } | null
  /** Used only when the CMS has no published languages. */
  languages: { name: string; level: string }[]
}

export type ProfileFactId = 'role' | 'basedIn' | 'current' | 'education' | 'stack' | 'languages' | 'openTo'

export interface ProfileFactRow {
  id: ProfileFactId
  label: string
  value: string
  /** Present for list-like facts (core stack) so the UI can render chips. */
  items?: string[]
}

export interface ProfileSummary {
  paragraph: string
  facts: ProfileFactRow[]
}

// ---------------------------------------------------------------------------
// Role / headline
// ---------------------------------------------------------------------------

/**
 * Headlines that are known NOT to be a job title. The CMS seed historically put
 * the About section's eyebrow ("Get to know me") into `about_profile.headline`,
 * which would otherwise surface as the role in the hero, this summary and the
 * Person JSON-LD `jobTitle`.
 */
const PLACEHOLDER_HEADLINES = new Set(
  ['Apprenez à me connaître', 'Get to know me', 'تعرف علي أكثر'].map(normalizeText),
)

function normalizeText(value: string): string {
  return value.normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase()
}

export function isPlaceholderHeadline(value: string | null | undefined): boolean {
  return PLACEHOLDER_HEADLINES.has(normalizeText(value ?? ''))
}

/** CMS headline when it is a usable job title, otherwise the message fallback. */
export function resolveRole(headline: string | null | undefined, fallback: string): string {
  const clean = (headline ?? '').replace(/\s+/g, ' ').trim()
  return clean && !isPlaceholderHeadline(clean) ? clean : fallback
}

/** Copy of the CMS about block whose headline is blanked when it is a placeholder. */
export function withUsableHeadline<T extends { headline: string }>(about: T | undefined): T | undefined {
  if (!about || !isPlaceholderHeadline(about.headline)) return about
  return { ...about, headline: '' }
}

export function normalizeAvailability(status: string | null | undefined): ProfileAvailability {
  return status === 'limited' || status === 'unavailable' ? status : 'available'
}

// ---------------------------------------------------------------------------
// Core stack
// ---------------------------------------------------------------------------

/**
 * Technologies that best describe the full-stack profile, in display order.
 * CMS skills are ranked by this list; anything else follows in CMS order.
 */
const CORE_STACK_PRIORITY = [
  'TypeScript',
  'React',
  'Next.js',
  'Angular',
  'NestJS',
  'Laravel',
  'Ruby on Rails',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Node.js',
  'JavaScript',
  'PHP',
  'MySQL',
  'Tailwind CSS',
  'GraphQL',
] as const

export const CORE_STACK_LIMIT = 10

/** Matching key: case/punctuation-insensitive, `React.js` == `React`, `NestJS` == `Nest`. */
function skillKey(name: string): string {
  const key = name.toLowerCase().replace(/[^a-z0-9+#]/g, '')
  return key.length > 2 && key.endsWith('js') ? key.slice(0, -2) : key
}

export function pickCoreStack(names: readonly string[], limit = CORE_STACK_LIMIT): string[] {
  const byKey = new Map<string, string>()
  for (const raw of names) {
    const name = raw.replace(/\s+/g, ' ').trim()
    const key = skillKey(name)
    if (key && !byKey.has(key)) byKey.set(key, name)
  }
  if (byKey.size === 0) return CORE_STACK_PRIORITY.slice(0, limit)

  const ranked: string[] = []
  for (const preferred of CORE_STACK_PRIORITY) {
    const key = skillKey(preferred)
    const name = byKey.get(key)
    if (name) {
      ranked.push(name)
      byKey.delete(key)
    }
  }
  return [...ranked, ...byKey.values()].slice(0, limit)
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Plain list separator (no "and"), using the Arabic comma for Arabic. */
export function listSeparator(locale: string): string {
  return locale === 'ar' ? '، ' : ', '
}

/** `Arabic (Native), French (B1)`; names that already carry a level are kept as-is. */
export function formatLanguages(languages: readonly { name: string; level: string }[], locale: string): string {
  return languages
    .map(({ name, level }) => {
      const cleanName = name.replace(/\s+/g, ' ').trim()
      const cleanLevel = level.replace(/\s+/g, ' ').trim()
      if (!cleanName) return ''
      if (!cleanLevel || /[([（]/.test(cleanName)) return cleanName
      return `${cleanName} (${cleanLevel})`
    })
    .filter(Boolean)
    .join(listSeparator(locale))
}

/** English indefinite article for a job title (consumed by an ICU `select`). */
export function englishArticle(phrase: string): 'a' | 'an' {
  return /^\s*(?:[aeio]|hour|honest|honou?r|heir)/i.test(phrase) ? 'an' : 'a'
}

// ---------------------------------------------------------------------------
// CMS -> facts
// ---------------------------------------------------------------------------

type ProfileCmsInput = Pick<PublicCmsContent, 'about' | 'experiences' | 'education' | 'skillCategories' | 'languages'>

function clean(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

/**
 * Resolve the facts shown on the homepage. The CMS is authoritative whenever it
 * has published rows for a field (so "no current position" stays empty rather
 * than falling back); messages are used only when a whole collection is empty.
 */
export function resolveProfileFacts(cms: ProfileCmsInput, fallbacks: ProfileFactsFallbacks): ProfileFacts {
  const experiences = cms.experiences ?? []
  const education = cms.education ?? []
  const languages = cms.languages ?? []

  let current: ProfileFacts['current'] = fallbacks.current
  if (experiences.length > 0) {
    const item = experiences.find((experience) => experience.isCurrent && clean(experience.role) && clean(experience.company))
    current = item ? { role: clean(item.role), company: clean(item.company) } : null
  }

  let school: ProfileFacts['education'] = fallbacks.education
  if (education.length > 0) {
    const item = education.find((entry) => clean(entry.institution))
    school = item ? { school: clean(item.institution), degree: clean(item.degree) } : null
  }

  const skillNames = (cms.skillCategories ?? []).flatMap((category) => category.skills.map((skill) => skill.name))
  const resolvedLanguages = (languages.length > 0 ? languages : fallbacks.languages)
    .map((language) => ({ name: clean(language.name), level: clean(language.level) }))
    .filter((language) => language.name)

  return {
    name: clean(cms.about?.fullName) || fallbacks.name,
    role: resolveRole(cms.about?.headline, fallbacks.role),
    availability: normalizeAvailability(cms.about?.availabilityStatus),
    current,
    education: school,
    stack: pickCoreStack(skillNames),
    languages: resolvedLanguages,
  }
}

// ---------------------------------------------------------------------------
// Facts -> visible copy
// ---------------------------------------------------------------------------

/**
 * Compose the definitional paragraph (one sentence per available fact, so a
 * missing fact never leaves a dangling comma) and the "Key facts" rows.
 */
export function composeProfileSummary(facts: ProfileFacts, t: ProfileTranslate, locale: string): ProfileSummary {
  const sentences = [
    facts.current
      ? t('identityCurrent', {
          name: facts.name,
          role: facts.role,
          roleArticle: englishArticle(facts.role),
          currentRole: facts.current.role,
          currentArticle: englishArticle(facts.current.role),
          company: facts.current.company,
        })
      : t('identity', { name: facts.name, role: facts.role, roleArticle: englishArticle(facts.role) }),
    facts.education ? t('craftSchool', { school: facts.education.school }) : t('craft'),
    t(`openness.${facts.availability}`),
  ]

  const rows: ProfileFactRow[] = [
    { id: 'role', label: t('facts.role'), value: facts.role },
    { id: 'basedIn', label: t('facts.basedIn'), value: t('values.location') },
  ]
  if (facts.current) {
    rows.push({
      id: 'current',
      label: t('facts.current'),
      value: t('values.current', { role: facts.current.role, company: facts.current.company }),
    })
  }
  if (facts.education) {
    rows.push({
      id: 'education',
      label: t('facts.education'),
      value: facts.education.degree
        ? t('values.education', { degree: facts.education.degree, school: facts.education.school })
        : facts.education.school,
    })
  }
  if (facts.stack.length > 0) {
    rows.push({
      id: 'stack',
      label: t('facts.stack'),
      value: facts.stack.join(listSeparator(locale)),
      items: facts.stack,
    })
  }
  const languages = formatLanguages(facts.languages, locale)
  if (languages) rows.push({ id: 'languages', label: t('facts.languages'), value: languages })
  if (facts.availability !== 'unavailable') {
    rows.push({ id: 'openTo', label: t('facts.openTo'), value: t(`values.openTo.${facts.availability}`) })
  }

  return {
    paragraph: sentences.map((sentence) => sentence.trim()).filter(Boolean).join(' '),
    facts: rows,
  }
}

// ---------------------------------------------------------------------------
// JSON-LD consistency
// ---------------------------------------------------------------------------

/**
 * Fill Person schema gaps from the resolved facts so the structured data never
 * says less than the visible page (e.g. when the CMS is empty or unreachable).
 */
export function enrichPersonInput(input: PersonSchemaInput, facts: ProfileFacts): PersonSchemaInput {
  return {
    ...input,
    worksFor: input.worksFor ?? (facts.current ? { name: facts.current.company } : null),
    alumniOf: input.alumniOf?.length
      ? input.alumniOf
      : facts.education
        ? [{ name: facts.education.school }]
        : [],
    knowsAbout: input.knowsAbout?.length ? input.knowsAbout : facts.stack,
    knowsLanguage: input.knowsLanguage?.length
      ? input.knowsLanguage
      : facts.languages.map((language) => language.name),
  }
}
