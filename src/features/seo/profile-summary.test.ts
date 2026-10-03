import { describe, expect, it } from 'vitest'
import {
  composeProfileSummary,
  englishArticle,
  enrichPersonInput,
  formatLanguages,
  isPlaceholderHeadline,
  pickCoreStack,
  resolveProfileFacts,
  resolveRole,
  withUsableHeadline,
  type ProfileFacts,
  type ProfileFactsFallbacks,
  type ProfileTranslate,
} from './profile-summary'
import type { PublicCmsContent } from '@/features/cms/queries'

// Minimal ICU subset (plain `{arg}` + the `a`/`an` select used by the English
// messages) so composition can be tested without a DOM or next-intl runtime.
const EN_TEMPLATES: Record<string, string> = {
  identity: '{name} is {roleArticle, select, an {an} other {a}} {role} based in Casablanca, Morocco.',
  identityCurrent:
    '{name} is {roleArticle, select, an {an} other {a}} {role} based in Casablanca, Morocco, currently working as {currentArticle, select, an {an} other {a}} {currentRole} at {company}.',
  craftSchool: 'Trained at {school}, Keltoum builds complete web applications.',
  craft: 'Keltoum builds complete web applications.',
  'openness.available': 'Keltoum is open to freelance projects and full-time opportunities, including relocation.',
  'openness.limited': 'Keltoum currently has limited availability.',
  'openness.unavailable': 'Keltoum is not taking on new projects at the moment.',
  'facts.role': 'Role',
  'facts.basedIn': 'Based in',
  'facts.current': 'Currently',
  'facts.education': 'Education',
  'facts.stack': 'Core stack',
  'facts.languages': 'Languages',
  'facts.openTo': 'Open to',
  'values.location': 'Casablanca, Morocco',
  'values.current': '{role} at {company}',
  'values.education': '{degree}, {school}',
  'values.openTo.available': 'Freelance projects, full-time roles and relocation',
  'values.openTo.limited': 'Selected freelance projects (limited availability)',
}

const t: ProfileTranslate = (key, values = {}) => {
  const template = EN_TEMPLATES[key]
  if (template === undefined) throw new Error(`missing message ${key}`)
  return template
    .replace(/\{(\w+), select, an \{an\} other \{a\}\}/g, (_, arg: string) => (values[arg] === 'an' ? 'an' : 'a'))
    .replace(/\{(\w+)\}/g, (_, arg: string) => {
      if (typeof values[arg] !== 'string') throw new Error(`missing value ${arg} for ${key}`)
      return values[arg]
    })
}

const FALLBACKS: ProfileFactsFallbacks = {
  name: 'Keltoum Malouki',
  role: 'Full Stack Web Developer',
  current: { role: 'Full Stack Developer', company: 'DabaDoc' },
  education: { school: 'YouCode (UM6P)', degree: 'Full Stack Development Program' },
  languages: [
    { name: 'Arabic', level: 'Native' },
    { name: 'French', level: 'B1' },
    { name: 'English', level: 'A2' },
  ],
}

type Cms = Pick<PublicCmsContent, 'about' | 'experiences' | 'education' | 'skillCategories' | 'languages'>

const EMPTY_CMS: Cms = { about: undefined, experiences: [], education: [], skillCategories: [], languages: [] }

function about(overrides: Partial<NonNullable<Cms['about']>> = {}): NonNullable<Cms['about']> {
  return {
    fullName: 'Keltoum Malouki',
    avatarUrl: '',
    headline: 'Full Stack Web Developer',
    bio: '',
    cvUrl: '',
    availabilityStatus: 'available',
    location: 'Casablanca',
    ...overrides,
  }
}

function experience(overrides: Partial<Cms['experiences'][number]> = {}): Cms['experiences'][number] {
  return {
    id: 'x',
    company: 'DabaDoc',
    location: 'Casablanca, Morocco',
    date: '2026 — Present',
    role: 'Full Stack Developer',
    description: '',
    url: '',
    imageUrl: '',
    technologies: [],
    isCurrent: true,
    ...overrides,
  }
}

function skills(...names: string[]): Cms['skillCategories'] {
  return [
    {
      id: 'c',
      name: 'All',
      skills: names.map((name, index) => ({ id: String(index), name, icon: '', imageUrl: '', level: null })),
    },
  ]
}

describe('headline sanitizing', () => {
  it('detects the seeded About eyebrow placeholders in every locale', () => {
    expect(isPlaceholderHeadline('Get to know me')).toBe(true)
    expect(isPlaceholderHeadline('  apprenez à me   connaître ')).toBe(true)
    expect(isPlaceholderHeadline('تعرف علي أكثر')).toBe(true)
    expect(isPlaceholderHeadline('Full Stack Web Developer')).toBe(false)
    expect(isPlaceholderHeadline(undefined)).toBe(false)
  })

  it('falls back to the message role for empty or placeholder headlines', () => {
    expect(resolveRole('Get to know me', 'Full Stack Web Developer')).toBe('Full Stack Web Developer')
    expect(resolveRole('   ', 'Full Stack Web Developer')).toBe('Full Stack Web Developer')
    expect(resolveRole(' Backend  Engineer ', 'Full Stack Web Developer')).toBe('Backend Engineer')
  })

  it('blanks only a placeholder headline and keeps the rest of the about block', () => {
    const blanked = withUsableHeadline(about({ headline: 'Get to know me', bio: 'Bio' }))
    expect(blanked).toMatchObject({ headline: '', bio: 'Bio', fullName: 'Keltoum Malouki' })
    const kept = about()
    expect(withUsableHeadline(kept)).toBe(kept)
    expect(withUsableHeadline(undefined)).toBeUndefined()
  })
})

describe('pickCoreStack', () => {
  it('ranks representative technologies first, keeps CMS spelling and dedupes', () => {
    const stack = pickCoreStack(['C', 'HTML5', 'GitLab', 'React.js', 'Next.js', 'Laravel', 'gitlab', 'TypeScript', 'Figma'])
    expect(stack.slice(0, 4)).toEqual(['TypeScript', 'React.js', 'Next.js', 'Laravel'])
    expect(stack.filter((name) => name.toLowerCase() === 'gitlab')).toHaveLength(1)
    expect(stack).toContain('C')
  })

  it('caps the list and falls back to a default stack when the CMS has none', () => {
    expect(pickCoreStack(Array.from({ length: 30 }, (_, i) => `Tool ${i}`))).toHaveLength(10)
    const fallback = pickCoreStack([])
    expect(fallback.length).toBeGreaterThan(0)
    expect(fallback).toContain('Next.js')
  })
})

describe('formatting helpers', () => {
  it('formats languages with levels and the locale list separator', () => {
    expect(formatLanguages(FALLBACKS.languages, 'en')).toBe('Arabic (Native), French (B1), English (A2)')
    expect(formatLanguages([{ name: 'العربية', level: 'اللغة الأم' }, { name: 'الفرنسية', level: 'B1' }], 'ar')).toBe(
      'العربية (اللغة الأم)، الفرنسية (B1)',
    )
    // Names that already carry a level (message fallbacks) are not doubled.
    expect(formatLanguages([{ name: 'Arabe (Maternelle)', level: '' }, { name: ' ', level: 'B1' }], 'fr')).toBe(
      'Arabe (Maternelle)',
    )
  })

  it('picks the English indefinite article', () => {
    expect(englishArticle('Full Stack Developer')).toBe('a')
    expect(englishArticle('Engineer')).toBe('an')
    expect(englishArticle('UX Designer')).toBe('a')
  })
})

describe('resolveProfileFacts', () => {
  it('uses message fallbacks when the CMS is empty', () => {
    const facts = resolveProfileFacts(EMPTY_CMS, FALLBACKS)
    expect(facts).toMatchObject({
      name: 'Keltoum Malouki',
      role: 'Full Stack Web Developer',
      availability: 'available',
      current: FALLBACKS.current,
      education: FALLBACKS.education,
      languages: FALLBACKS.languages,
    })
    expect(facts.stack.length).toBeGreaterThan(0)
  })

  it('treats published CMS collections as authoritative (no current job means none)', () => {
    const facts = resolveProfileFacts(
      {
        about: about({ headline: 'Get to know me', availabilityStatus: 'limited' }),
        experiences: [experience({ isCurrent: false })],
        education: [
          { id: 'e', institution: ' YouCode - UM6P ', location: '', date: '', degree: 'Full Stack Program', field: '', description: '', imageUrl: '' },
        ],
        skillCategories: skills('PHP', 'Angular'),
        languages: [{ id: 'l', name: 'Arabic', level: 'Native', icon: '' }],
      },
      FALLBACKS,
    )
    expect(facts.role).toBe('Full Stack Web Developer')
    expect(facts.availability).toBe('limited')
    expect(facts.current).toBeNull()
    expect(facts.education).toEqual({ school: 'YouCode - UM6P', degree: 'Full Stack Program' })
    expect(facts.stack).toEqual(['Angular', 'PHP'])
    expect(facts.languages).toEqual([{ name: 'Arabic', level: 'Native' }])
  })

  it('takes the current CMS position and ignores incomplete rows', () => {
    const facts = resolveProfileFacts(
      { ...EMPTY_CMS, experiences: [experience({ company: '' }), experience({ company: 'Acme', role: 'Developer' })] },
      FALLBACKS,
    )
    expect(facts.current).toEqual({ role: 'Developer', company: 'Acme' })
  })
})

describe('composeProfileSummary', () => {
  const full: ProfileFacts = {
    name: 'Keltoum Malouki',
    role: 'Full Stack Web Developer',
    availability: 'available',
    current: { role: 'Full Stack Developer', company: 'DabaDoc' },
    education: { school: 'YouCode (UM6P)', degree: 'Full Stack Development Program' },
    stack: ['TypeScript', 'React', 'Next.js'],
    languages: FALLBACKS.languages,
  }

  it('composes a self-contained definitional paragraph and all key facts', () => {
    const summary = composeProfileSummary(full, t, 'en')
    expect(summary.paragraph).toBe(
      'Keltoum Malouki is a Full Stack Web Developer based in Casablanca, Morocco, currently working as a Full Stack Developer at DabaDoc. ' +
        'Trained at YouCode (UM6P), Keltoum builds complete web applications. ' +
        'Keltoum is open to freelance projects and full-time opportunities, including relocation.',
    )
    expect(summary.facts.map((fact) => fact.id)).toEqual(['role', 'basedIn', 'current', 'education', 'stack', 'languages', 'openTo'])
    expect(summary.facts.find((fact) => fact.id === 'current')?.value).toBe('Full Stack Developer at DabaDoc')
    expect(summary.facts.find((fact) => fact.id === 'education')?.value).toBe('Full Stack Development Program, YouCode (UM6P)')
    expect(summary.facts.find((fact) => fact.id === 'stack')).toMatchObject({
      value: 'TypeScript, React, Next.js',
      items: ['TypeScript', 'React', 'Next.js'],
    })
    expect(summary.facts.find((fact) => fact.id === 'languages')?.value).toBe('Arabic (Native), French (B1), English (A2)')
  })

  it('degrades gracefully when facts are missing (no "undefined", no empty clauses)', () => {
    const sparse: ProfileFacts = {
      ...full,
      role: 'Engineer',
      availability: 'unavailable',
      current: null,
      education: { school: 'YouCode', degree: '' },
      stack: [],
      languages: [],
    }
    const summary = composeProfileSummary(sparse, t, 'en')
    expect(summary.paragraph).toBe(
      'Keltoum Malouki is an Engineer based in Casablanca, Morocco. ' +
        'Trained at YouCode, Keltoum builds complete web applications. ' +
        'Keltoum is not taking on new projects at the moment.',
    )
    expect(summary.facts.map((fact) => fact.id)).toEqual(['role', 'basedIn', 'education'])
    expect(summary.facts.find((fact) => fact.id === 'education')?.value).toBe('YouCode')

    const noSchool = composeProfileSummary({ ...sparse, education: null, availability: 'limited' }, t, 'en')
    expect(noSchool.paragraph).toContain('Keltoum builds complete web applications.')
    expect(noSchool.facts.find((fact) => fact.id === 'openTo')?.value).toBe('Selected freelance projects (limited availability)')
    for (const text of [summary.paragraph, noSchool.paragraph, ...noSchool.facts.map((fact) => fact.value)]) {
      expect(text).not.toMatch(/undefined|null|\{|\}|,\s*[,.]|\s{2,}/)
    }
  })

  it('uses the Arabic list separator for list values', () => {
    const summary = composeProfileSummary(full, t, 'ar')
    expect(summary.facts.find((fact) => fact.id === 'stack')?.value).toBe('TypeScript، React، Next.js')
  })
})

describe('enrichPersonInput', () => {
  it('fills empty Person schema fields from the visible facts', () => {
    const facts = resolveProfileFacts(EMPTY_CMS, FALLBACKS)
    const input = enrichPersonInput({ worksFor: null, alumniOf: [], knowsAbout: [], knowsLanguage: [] }, facts)
    expect(input.worksFor).toEqual({ name: 'DabaDoc' })
    expect(input.alumniOf).toEqual([{ name: 'YouCode (UM6P)' }])
    expect(input.knowsAbout).toEqual(facts.stack)
    expect(input.knowsLanguage).toEqual(['Arabic', 'French', 'English'])
  })

  it('never overrides data the CMS already provides', () => {
    const facts = resolveProfileFacts(EMPTY_CMS, FALLBACKS)
    const input = enrichPersonInput(
      { worksFor: { name: 'Acme' }, alumniOf: [{ name: 'School' }], knowsAbout: ['Go'], knowsLanguage: ['Arabic'] },
      facts,
    )
    expect(input).toMatchObject({
      worksFor: { name: 'Acme' },
      alumniOf: [{ name: 'School' }],
      knowsAbout: ['Go'],
      knowsLanguage: ['Arabic'],
    })
  })

  it('leaves worksFor empty when the CMS says there is no current position', () => {
    const facts = resolveProfileFacts({ ...EMPTY_CMS, experiences: [experience({ isCurrent: false })] }, FALLBACKS)
    expect(enrichPersonInput({ worksFor: null }, facts).worksFor).toBeNull()
  })
})
