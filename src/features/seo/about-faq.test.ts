import fs from 'node:fs'
import path from 'node:path'
import { createTranslator } from 'next-intl'
import { describe, expect, it } from 'vitest'
import type { PublicCmsContent } from '@/features/cms/queries'
import {
  aboutPersonInput,
  buildAboutFacts,
  buildAboutFaq,
  composeAboutIntro,
  displayUrl,
  joinList,
  localizeDateRange,
  resolveAboutProfile,
  resolveDisplayName,
  splitNameAndPlace,
  splitTechnologies,
  type AboutProfileFallbacks,
  type AboutTranslate,
} from './about-faq'

// Real ICU formatting (next-intl's translator) over a minimal English message
// set mirroring the `aboutPage` shape, so composition is tested end to end.
const EN_ABOUT = {
  intro: {
    identity: '{fullName} is {roleArticle, select, an {an} other {a}} {role} based in Casablanca, Morocco.',
    current: '{givenName} currently works as {currentArticle, select, an {an} other {a}} {currentRole} at {company}.',
    craft: '{givenName} builds complete web applications.',
  },
  glance: {
    labels: {
      role: 'Role',
      location: 'Based in',
      current: 'Current position',
      education: 'Education',
      languages: 'Languages',
      openTo: 'Open to',
      email: 'Email',
    },
    values: {
      location: 'Casablanca, Morocco',
      current: '{role} at {company}',
      education: '{degree}, {institution}',
      openTo: { available: 'Freelance projects and relocation', limited: 'Selected freelance projects' },
    },
  },
  faq: {
    who: { question: 'Who is {name}?', answer: '{fullName} is {roleArticle, select, an {an} other {a}} {role}. {name} builds web apps.' },
    location: { question: 'Where is {name} based?', answer: '{name} is based in Casablanca, Morocco.' },
    current: {
      question: 'What does {name} do today?',
      answer: '{name} currently works as {currentArticle, select, an {an} other {a}} {currentRole} at {company}.',
      answerWithPlace:
        '{name} currently works as {currentArticle, select, an {an} other {a}} {currentRole} at {company} ({place}).',
      stack: 'In this role, {name} works with {technologies}.',
      previous: 'Previously, {name} worked as {previousArticle, select, an {an} other {a}} {previousRole} at {previousCompany}.',
      none: '{name} works as {roleArticle, select, an {an} other {a}} {role}.',
    },
    technologies: {
      question: 'Which technologies does {name} use?',
      answer: '{name} works mainly with {technologies}.',
      more: '{name} also uses {technologies}.',
    },
    education: { question: 'Where did {name} study?', answer: '{name}’s education includes: {items}.' },
    availability: {
      question: 'Is {name} available?',
      answer: {
        available: 'Yes. {name} is open to projects. See {freelanceUrl}.',
        limited: '{name} has limited availability. See {freelanceUrl}.',
        unavailable: '{name} is not taking on new projects but can be reached at {email}.',
      },
    },
    contact: {
      question: 'How can I contact {name}?',
      answer: 'You can contact {name} by email at {email}.',
      answerWithLinkedin: 'You can contact {name} by email at {email} or on LinkedIn ({linkedin}).',
    },
  },
}

function translatorFor(locale: string, messages: Record<string, unknown>): AboutTranslate {
  const translate = createTranslator({ locale, messages: { aboutPage: messages } as never, namespace: 'aboutPage' as never })
  return (key, values) => (translate as unknown as (k: string, v?: Record<string, string>) => string)(key, values)
}

const tEn = translatorFor('en', EN_ABOUT)

type Cms = Pick<
  PublicCmsContent,
  'about' | 'socialLinks' | 'experiences' | 'education' | 'skillCategories' | 'languages'
>

const EMPTY_CMS: Cms = {
  about: undefined,
  socialLinks: [],
  experiences: [],
  education: [],
  skillCategories: [],
  languages: [],
}

const FALLBACKS: AboutProfileFallbacks = {
  name: 'Keltoum Malouki',
  role: 'Full Stack Web Developer',
  experiences: [
    {
      id: 'dabadoc',
      role: 'Full Stack Developer',
      company: 'DabaDoc',
      place: 'Casablanca, Morocco',
      date: 'Feb 2026 – Present',
      description: 'Develop and maintain features.',
      technologies: ['Ruby on Rails', 'Angular', 'MongoDB'],
      isCurrent: true,
    },
    {
      id: 'caisseManager',
      role: 'Web Developer Intern',
      company: 'Caisse Manager',
      place: 'Rabat, Morocco',
      date: 'Jun – Aug 2025',
      description: 'Built a showcase site.',
      technologies: ['Next.js', 'React'],
      isCurrent: false,
    },
  ],
  education: [
    {
      id: 'youcode',
      degree: 'Full Stack Development Program',
      institution: 'YouCode / UM6P',
      place: 'Youssoufia Campus, Morocco',
      date: '2024 – 2026',
      description: '',
    },
    {
      id: 'bac',
      degree: 'Baccalauréat in Physical Sciences & Chemistry',
      institution: 'Lycée Okba Bnou Nafiaa',
      place: 'Casablanca, Morocco',
      date: '2023 – 2024',
      description: '',
    },
  ],
  skills: ['TypeScript', 'React', 'Next.js', 'NestJS', 'Laravel', 'PHP', 'Figma'],
  languages: [
    { name: 'Arabic', level: 'Native' },
    { name: 'French', level: 'B1' },
    { name: 'English', level: 'A2' },
  ],
}

function cmsWith(overrides: Partial<Cms>): Cms {
  return { ...EMPTY_CMS, ...overrides }
}

describe('text helpers', () => {
  it('splits "Company — Place" strings', () => {
    expect(splitNameAndPlace('DabaDoc — Casablanca, Morocco')).toEqual({ name: 'DabaDoc', place: 'Casablanca, Morocco' })
    expect(splitNameAndPlace('YouCode / UM6P — Youssoufia Campus, Morocco')).toEqual({
      name: 'YouCode / UM6P',
      place: 'Youssoufia Campus, Morocco',
    })
    expect(splitNameAndPlace('DabaDoc')).toEqual({ name: 'DabaDoc', place: '' })
  })

  it('splits technology lists on Latin and Arabic commas', () => {
    expect(splitTechnologies('Ruby on Rails, Angular , MongoDB')).toEqual(['Ruby on Rails', 'Angular', 'MongoDB'])
    expect(splitTechnologies('Next.js، React.js،  GSAP')).toEqual(['Next.js', 'React.js', 'GSAP'])
  })

  it('localizes the CMS "Present" date suffix only', () => {
    expect(localizeDateRange('2026 — Present', 'Présent')).toBe('2026 — Présent')
    expect(localizeDateRange('2025 — 2025', 'Présent')).toBe('2025 — 2025')
    expect(localizeDateRange('2026 — Present', '')).toBe('2026 — Present')
  })

  it('joins lists with the locale conjunction', () => {
    expect(joinList(['A', 'B', 'C'], 'en')).toBe('A, B, and C')
    expect(joinList(['A', 'B', 'C'], 'fr')).toBe('A, B et C')
    expect(joinList(['A', 'B'], 'ar')).toBe('A وB')
    expect(joinList([' ', 'A'], 'en')).toBe('A')
    expect(joinList([], 'en')).toBe('')
  })

  it('displays URLs without protocol, www or trailing slash', () => {
    expect(displayUrl('https://www.linkedin.com/in/keltoummalouki/')).toBe('linkedin.com/in/keltoummalouki')
  })

  it('pairs the Arabic-script name with the Latin spelling on first mention', () => {
    expect(resolveDisplayName('Keltoum Malouki', 'كلثوم ملوكي')).toEqual({
      name: 'كلثوم ملوكي',
      fullName: 'كلثوم ملوكي (Keltoum Malouki)',
      givenName: 'كلثوم',
    })
    expect(resolveDisplayName('Keltoum Malouki', 'Keltoum Malouki')).toEqual({
      name: 'Keltoum Malouki',
      fullName: 'Keltoum Malouki',
      givenName: 'Keltoum',
    })
    expect(resolveDisplayName('', 'Keltoum Malouki').name).toBe('Keltoum Malouki')
  })
})

describe('resolveAboutProfile', () => {
  it('falls back to messages when the CMS is empty', () => {
    const profile = resolveAboutProfile(EMPTY_CMS, FALLBACKS)
    expect(profile.name).toBe('Keltoum Malouki')
    expect(profile.role).toBe('Full Stack Web Developer')
    expect(profile.availability).toBe('available')
    expect(profile.current?.company).toBe('DabaDoc')
    expect(profile.previous?.company).toBe('Caisse Manager')
    expect(profile.education).toHaveLength(2)
    expect(profile.stack.slice(0, 3)).toEqual(['TypeScript', 'React', 'Next.js'])
    expect(profile.languages).toHaveLength(3)
    expect(profile.email).toBe('keltoummalouki@gmail.com')
    expect(profile.linkedinUrl).toBe('https://www.linkedin.com/in/keltoummalouki')
    expect(profile.githubUrl).toBe('https://github.com/keltoummalouki')
  })

  it('uses CMS rows when published and localizes "Present"', () => {
    const profile = resolveAboutProfile(
      cmsWith({
        about: {
          fullName: 'Keltoum Malouki',
          avatarUrl: '',
          headline: 'Développeuse Web Full Stack',
          bio: 'Bio',
          cvUrl: '',
          availabilityStatus: 'limited',
          location: '',
        },
        experiences: [
          {
            id: 'x',
            company: 'Acme',
            location: '',
            date: '2026 — Present',
            role: 'Engineer',
            description: '',
            url: '',
            imageUrl: '',
            technologies: ['Docker', 'Docker', 'Go'],
            isCurrent: true,
          },
        ],
        skillCategories: [
          { id: 'c', name: 'Back', skills: [{ id: 's', name: 'Ruby on Rails', icon: '', imageUrl: '', level: null }] },
        ],
      }),
      FALLBACKS,
      { presentLabel: 'Présent' },
    )
    expect(profile.role).toBe('Développeuse Web Full Stack')
    expect(profile.availability).toBe('limited')
    expect(profile.experiences).toHaveLength(1)
    expect(profile.current).toMatchObject({ company: 'Acme', date: '2026 — Présent', technologies: ['Docker', 'Go'] })
    expect(profile.previous).toBeNull()
    expect(profile.skills).toEqual(['Ruby on Rails'])
    // Education table still empty in the CMS -> message fallback.
    expect(profile.education.map((item) => item.id)).toEqual(['youcode', 'bac'])
  })

  it('ignores a placeholder CMS headline', () => {
    const profile = resolveAboutProfile(
      cmsWith({
        about: {
          fullName: 'Keltoum Malouki',
          avatarUrl: '',
          headline: 'Get to know me',
          bio: '',
          cvUrl: '',
          availabilityStatus: 'available',
          location: '',
        },
      }),
      FALLBACKS,
    )
    expect(profile.role).toBe('Full Stack Web Developer')
  })

  it('has no current position when CMS experiences exist but none is current', () => {
    const profile = resolveAboutProfile(
      cmsWith({
        experiences: [
          {
            id: 'old',
            company: 'Caisse Manager',
            location: 'Rabat, Morocco',
            date: '2025 — 2025',
            role: 'Web Developer Intern',
            description: '',
            url: '',
            imageUrl: '',
            technologies: [],
            isCurrent: false,
          },
        ],
      }),
      FALLBACKS,
    )
    expect(profile.current).toBeNull()
    expect(profile.previous?.company).toBe('Caisse Manager')
  })

  it('reads email and profiles from CMS social links (no LinkedIn fallback when CMS has links)', () => {
    const profile = resolveAboutProfile(
      cmsWith({
        socialLinks: [
          { id: '1', platform: 'email', label: 'Email', url: 'mailto:hello@example.com?subject=Hi', icon: 'email' },
          { id: '2', platform: 'github', label: 'GitHub', url: 'https://github.com/someone', icon: 'github' },
        ],
      }),
      FALLBACKS,
    )
    expect(profile.email).toBe('hello@example.com')
    expect(profile.githubUrl).toBe('https://github.com/someone')
    expect(profile.linkedinUrl).toBe('')
  })
})

describe('composeAboutIntro', () => {
  it('writes a self-contained definitional paragraph', () => {
    const intro = composeAboutIntro(resolveAboutProfile(EMPTY_CMS, FALLBACKS), tEn)
    expect(intro).toBe(
      'Keltoum Malouki is a Full Stack Web Developer based in Casablanca, Morocco. ' +
        'Keltoum currently works as a Full Stack Developer at DabaDoc. ' +
        'Keltoum builds complete web applications.',
    )
  })

  it('omits the current-position sentence when there is none', () => {
    const profile = { ...resolveAboutProfile(EMPTY_CMS, FALLBACKS), current: null }
    expect(composeAboutIntro(profile, tEn)).not.toContain('currently')
  })

  it('uses "an" before vowel-initial roles', () => {
    const profile = { ...resolveAboutProfile(EMPTY_CMS, FALLBACKS), role: 'Engineer' }
    expect(composeAboutIntro(profile, tEn)).toContain('is an Engineer')
  })
})

describe('buildAboutFacts', () => {
  it('lists role, location, current position, education, languages, availability and email', () => {
    const facts = buildAboutFacts(resolveAboutProfile(EMPTY_CMS, FALLBACKS), tEn, 'en')
    expect(facts.map((fact) => fact.id)).toEqual(['role', 'location', 'current', 'education', 'languages', 'openTo', 'email'])
    expect(facts.find((fact) => fact.id === 'current')?.value).toBe('Full Stack Developer at DabaDoc')
    expect(facts.find((fact) => fact.id === 'education')?.value).toBe('Full Stack Development Program, YouCode / UM6P')
    expect(facts.find((fact) => fact.id === 'languages')?.value).toBe('Arabic (Native), French (B1), English (A2)')
    expect(facts.find((fact) => fact.id === 'email')).toMatchObject({ href: 'mailto:keltoummalouki@gmail.com' })
  })

  it('drops "open to" when unavailable', () => {
    const profile = { ...resolveAboutProfile(EMPTY_CMS, FALLBACKS), availability: 'unavailable' as const }
    expect(buildAboutFacts(profile, tEn, 'en').some((fact) => fact.id === 'openTo')).toBe(false)
  })
})

describe('buildAboutFaq', () => {
  const profile = resolveAboutProfile(EMPTY_CMS, FALLBACKS)
  const faq = buildAboutFaq(profile, tEn, 'en')

  it('answers the seven entity questions, each naming the person', () => {
    expect(faq.map((item) => item.id)).toEqual([
      'who',
      'location',
      'current',
      'technologies',
      'education',
      'availability',
      'contact',
    ])
    for (const item of faq) {
      expect(item.question).toContain('Keltoum Malouki')
      expect(item.answer).toContain('Keltoum Malouki')
      expect(item.answer).not.toMatch(/[{}]/)
    }
  })

  it('composes the current role, its stack and the previous role', () => {
    expect(faq.find((item) => item.id === 'current')?.answer).toBe(
      'Keltoum Malouki currently works as a Full Stack Developer at DabaDoc (Casablanca, Morocco). ' +
        'In this role, Keltoum Malouki works with Ruby on Rails, Angular, and MongoDB. ' +
        'Previously, Keltoum Malouki worked as a Web Developer Intern at Caisse Manager.',
    )
  })

  it('lists the core stack, then extra technologies when there are more', () => {
    expect(faq.find((item) => item.id === 'technologies')?.answer).toBe(
      'Keltoum Malouki works mainly with TypeScript, React, Next.js, NestJS, Laravel, PHP, and Figma.',
    )

    const skills = ['C', 'HTML5', 'TypeScript', 'React', 'Next.js', 'Angular', 'NestJS', 'Laravel', 'Ruby on Rails',
      'PostgreSQL', 'MongoDB', 'Docker', 'Jira', 'Figma']
    const rich = resolveAboutProfile(EMPTY_CMS, { ...FALLBACKS, skills })
    const answer = buildAboutFaq(rich, tEn, 'en').find((item) => item.id === 'technologies')?.answer
    expect(answer).toBe(
      'Keltoum Malouki works mainly with TypeScript, React, Next.js, Angular, NestJS, Laravel, Ruby on Rails, ' +
        'PostgreSQL, MongoDB, and Docker. Keltoum Malouki also uses C, HTML5, Jira, and Figma.',
    )
  })

  it('lists every education entry with dates', () => {
    expect(faq.find((item) => item.id === 'education')?.answer).toBe(
      'Keltoum Malouki’s education includes: Full Stack Development Program — YouCode / UM6P (2024 – 2026); ' +
        'Baccalauréat in Physical Sciences & Chemistry — Lycée Okba Bnou Nafiaa (2023 – 2024).',
    )
  })

  it('points to the localized freelance page and LinkedIn', () => {
    expect(faq.find((item) => item.id === 'availability')?.answer).toContain('keltoummalouki.com/en/freelance')
    expect(faq.find((item) => item.id === 'contact')?.answer).toBe(
      'You can contact Keltoum Malouki by email at keltoummalouki@gmail.com or on LinkedIn (linkedin.com/in/keltoummalouki).',
    )
  })

  it('adapts to missing data and availability', () => {
    const sparse = buildAboutFaq(
      { ...profile, current: null, previous: null, education: [], linkedinUrl: '', availability: 'unavailable' },
      tEn,
      'en',
    )
    expect(sparse.map((item) => item.id)).not.toContain('education')
    expect(sparse.find((item) => item.id === 'current')?.answer).toBe(
      'Keltoum Malouki works as a Full Stack Web Developer.',
    )
    expect(sparse.find((item) => item.id === 'availability')?.answer).toContain('keltoummalouki@gmail.com')
    expect(sparse.find((item) => item.id === 'contact')?.answer).toBe(
      'You can contact Keltoum Malouki by email at keltoummalouki@gmail.com.',
    )
  })
})

describe('aboutPersonInput', () => {
  it('fills Person gaps from the visible profile', () => {
    const profile = resolveAboutProfile(EMPTY_CMS, FALLBACKS)
    const input = aboutPersonInput({ worksFor: null, alumniOf: [], knowsAbout: [], knowsLanguage: [] }, profile)
    expect(input.worksFor).toEqual({ name: 'DabaDoc' })
    expect(input.alumniOf).toEqual([{ name: 'YouCode / UM6P' }, { name: 'Lycée Okba Bnou Nafiaa' }])
    expect(input.knowsAbout).toContain('NestJS')
    expect(input.knowsLanguage).toEqual(['Arabic', 'French', 'English'])
  })

  it('adds the visible credentials when the CMS has none', () => {
    const profile = resolveAboutProfile(EMPTY_CMS, FALLBACKS)
    const docker = { name: 'Docker Foundations Professional Certificate', issuer: 'LinkedIn / Docker, Inc.', date: '2025' }
    expect(aboutPersonInput({ credentials: [] }, profile, { credentials: [docker] }).credentials).toEqual([docker])
    expect(aboutPersonInput({ credentials: [{ name: 'CMS cert' }] }, profile, { credentials: [docker] }).credentials).toEqual([
      { name: 'CMS cert' },
    ])
  })

  it('keeps CMS-provided values', () => {
    const profile = resolveAboutProfile(EMPTY_CMS, FALLBACKS)
    const input = aboutPersonInput({ worksFor: { name: 'Acme' }, alumniOf: [{ name: 'School' }] }, profile)
    expect(input.worksFor).toEqual({ name: 'Acme' })
    expect(input.alumniOf).toEqual([{ name: 'School' }])
  })
})

// Once the `aboutPage` fragment is merged into messages/*.json, format the real
// messages in every locale (catches ICU syntax errors and missing keys).
// (`ABOUT_MESSAGES_DIR` lets a pre-merge check point at a merged copy.)
const MESSAGES_DIR = path.resolve(process.env.ABOUT_MESSAGES_DIR || path.join(process.cwd(), 'messages'))
const realMessages = ['fr', 'en', 'ar'].map((locale) => {
  const file = path.join(MESSAGES_DIR, `${locale}.json`)
  const json = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
  return { locale, json }
})
const merged = realMessages.every(({ json }) => json.aboutPage)

describe.skipIf(!merged)('real aboutPage messages', () => {
  it.each(realMessages)('formats intro, facts and FAQ in $locale', ({ locale, json }) => {
    const t = translatorFor(locale, json.aboutPage)
    const profile = resolveAboutProfile(EMPTY_CMS, { ...FALLBACKS, name: json.hero.name, role: json.hero.role })
    const faq = buildAboutFaq(profile, t, locale)
    expect(faq).toHaveLength(7)
    for (const item of faq) {
      expect(item.question).toContain(profile.name)
      expect(item.answer).toContain(profile.name)
      expect(`${item.question} ${item.answer}`).not.toMatch(/[{}]|aboutPage\./)
    }
    expect(faq[0].answer).toContain('Keltoum Malouki')
    const intro = composeAboutIntro(profile, t, locale)
    expect(intro).toContain('Keltoum Malouki')
    if (locale === 'fr') expect(intro).not.toMatch(/est Développeuse/)
    expect(intro).not.toMatch(/[{}]|aboutPage\./)
    for (const fact of buildAboutFacts(profile, t, locale)) {
      expect(fact.label).not.toMatch(/aboutPage\./)
      expect(fact.value).not.toMatch(/[{}]|aboutPage\./)
    }
  })
})
