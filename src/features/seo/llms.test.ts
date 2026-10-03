import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProjectInput } from '@/features/content/projects.map'
import {
  buildLlmsFullTxt,
  buildLlmsTxt,
  embedMarkdown,
  escapeLinkText,
  joinAnd,
  linkItem,
  llmsArticleFromRow,
  llmsProjectFromRow,
  llmsTextResponse,
  loadLlmsData,
  markdownUrl,
  redactPhoneNumbers,
  renderLlmsDocument,
  resolveLlmsData,
  staticLlmsData,
  LLMS_CACHE_CONTROL,
  type LlmsCmsInput,
  type LlmsData,
  type LlmsLoaders,
  type LlmsProject,
} from './llms'
import { PERSON, absoluteUrl, localePath } from './site'

// ---------------------------------------------------------------------------
// Fixtures & helpers
// ---------------------------------------------------------------------------

/** A spec-conformant llms.txt "file list" entry: `- [title](url): notes`. */
const LINK_ITEM = /^- \[((?:\\.|[^\]\\])+)\]\(((?:https?:\/\/|mailto:)[^\s()<>]+)\)(?:: (\S.*))?$/
const GENDERED = /\b(he|she|her|hers|his|him|himself|herself)\b/i
/** Fake numbers only — never the real one. */
const FAKE_PHONE = '+212 600-000000'

const en = (path = '/') => absoluteUrl(localePath('en', path))

function headingLines(markdown: string, level: number): string[] {
  const prefix = `${'#'.repeat(level)} `
  return markdown.split('\n').filter((line) => line.startsWith(prefix))
}

function h2Titles(markdown: string): string[] {
  return headingLines(markdown, 2).map((line) => line.slice(3))
}

/** Lines of one H2 section (without its heading). */
function sectionLines(markdown: string, title: string): string[] {
  const lines = markdown.split('\n')
  const start = lines.indexOf(`## ${title}`)
  if (start === -1) return []
  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '))
  return lines.slice(start + 1, end === -1 ? undefined : end).filter((line) => line.trim() !== '')
}

/** Asserts the llmstxt.org structure: H1, blockquote, details, H2 file lists. */
function expectLlmsTxtShape(markdown: string) {
  const lines = markdown.split('\n')
  expect(lines[0]).toBe('# Keltoum Malouki')
  expect(headingLines(markdown, 1)).toHaveLength(1)
  expect(markdown).not.toMatch(/^#{3,} /m)

  const firstContent = lines.slice(1).find((line) => line.trim() !== '')
  expect(firstContent?.startsWith('> ')).toBe(true)

  const firstH2 = lines.findIndex((line) => line.startsWith('## '))
  expect(firstH2).toBeGreaterThan(0)
  for (const line of lines.slice(firstH2)) {
    if (line.trim() === '' || line.startsWith('## ')) continue
    expect(line).toMatch(LINK_ITEM)
  }
  expect(markdown.endsWith('\n')).toBe(true)
  expect(markdown).not.toMatch(/\n{3,}/)
}

function projectRow(overrides: Partial<ProjectInput> = {}): ProjectInput {
  return {
    id: 'p1',
    slug: 'event-booking-app',
    cover_image_url: null,
    repo_url: 'https://github.com/Keltoummalouki/event-booking-app',
    demo_url: null,
    featured: true,
    tech_stack: ['NestJS', 'Next.js', 'PostgreSQL'],
    started_at: '2025-12-01',
    updated_at: '2026-01-01T00:00:00Z',
    project_translations: [
      { locale: 'en', title: 'Event Booking App', description: 'Event management application with booking system.' },
      { locale: 'fr', title: 'Event Booking App', description: 'Application de gestion d’événements.' },
    ],
    ...overrides,
  }
}

const CASE_STUDY = [
  '## Overview',
  '',
  'Event Booking App is a full-stack web application.',
  '',
  '## Links',
  '',
  '- More case studies: [All projects](/en/projects)',
].join('\n')

function cmsFixture(overrides: Partial<LlmsCmsInput> = {}): LlmsCmsInput {
  return {
    about: {
      fullName: 'Keltoum Malouki',
      avatarUrl: '',
      headline: 'Full Stack Web Developer',
      bio: "I'm Keltoum Malouki, a Full Stack Web Developer from Casablanca, Morocco.",
      cvUrl: '/cv.pdf',
      availabilityStatus: 'available',
      location: 'Casablanca (mobile / relocation)',
    },
    socialLinks: [
      { id: '1', platform: 'github', label: 'GitHub', url: 'https://github.com/keltoummalouki', icon: '' },
      { id: '2', platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/keltoummalouki', icon: '' },
      { id: '3', platform: 'email', label: 'Email', url: 'mailto:keltoummalouki@gmail.com', icon: '' },
    ],
    skillCategories: [],
    softSkills: [],
    experiences: [],
    education: [],
    certifications: [],
    languages: [],
    ...overrides,
  }
}

let errorSpy: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  errorSpy.mockRestore()
})

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

describe('text helpers', () => {
  it('escapes link text and keeps URLs parseable', () => {
    expect(escapeLinkText('A [draft]\n title')).toBe('A \\[draft\\] title')
    expect(markdownUrl('https://example.com/a b(c)<d>')).toBe('https://example.com/a%20b%28c%29%3Cd%3E')
    expect(linkItem('T [x]', 'https://example.com/(y)', 'line one\nline two')).toBe(
      '- [T \\[x\\]](https://example.com/%28y%29): line one line two',
    )
    expect(linkItem('T', 'https://example.com')).toBe('- [T](https://example.com)')
  })

  it('joins lists in English', () => {
    expect(joinAnd([])).toBe('')
    expect(joinAnd(['A'])).toBe('A')
    expect(joinAnd(['A', 'B'])).toBe('A and B')
    expect(joinAnd(['A', ' ', 'B', 'C'])).toBe('A, B and C')
  })
})

describe('redactPhoneNumbers', () => {
  it.each([
    FAKE_PHONE,
    '+212600000000',
    '+212 6 00 00 00 00',
    '00212600000000',
    '0600000000',
    '06 00 00 00 00',
    '06-00-00-00-00',
  ])('removes %s', (phone) => {
    const out = redactPhoneNumbers(`Call ${phone} today.`)
    expect(out).not.toContain(phone)
    expect(out).not.toMatch(/\d{2}[ .-]?\d{2}[ .-]?\d{2}[ .-]?\d{2}/)
  })

  it('unwraps tel: links and drops bare tel: URIs', () => {
    expect(redactPhoneNumbers('[Call me](tel:+212600000000) now')).toBe('Call me now')
    expect(redactPhoneNumbers('tel:+212600000000')).not.toMatch(/tel:|\d{6}/)
  })

  it.each([
    '2024 – 2026',
    '2024 - 2026',
    '2025-12-01',
    'Feb 2026 – Present',
    '50+ projects (+49 on the CV)',
    'https://github.com/x/1234567890123',
    'https://www.keltoummalouki.com/en/projects/event-booking-app',
  ])('keeps %s', (text) => {
    expect(redactPhoneNumbers(text)).toBe(text)
  })
})

describe('embedMarkdown', () => {
  it('shifts headings so the shallowest becomes the requested level', () => {
    const out = embedMarkdown('## A\n\ntext\n\n### B\n\n#### C', 4)
    expect(out).toBe('#### A\n\ntext\n\n##### B\n\n###### C')
  })

  it('caps headings at H6 and never emits H1/H2', () => {
    const out = embedMarkdown('# Top\n\n###### Deep', 4)
    expect(out.split('\n').filter((line) => line.startsWith('#'))).toEqual(['#### Top', '###### Deep'])
  })

  it('converts setext headings to ATX', () => {
    const out = embedMarkdown('Title\n=====\n\nSub **bold**\n---\n\ntext\n\n---\n\nend', 4)
    expect(out).toContain('#### Title')
    expect(out).toContain('##### Sub **bold**')
    expect(out).not.toMatch(/^=+$/m)
    // A thematic break after a blank line stays a break.
    expect(out).toContain('\n\n---\n\n')
  })

  it('leaves fenced code untouched', () => {
    const md = '## Code\n\n```bash\n# not a heading\n[x](/relative)\n```\n\n~~~\n## nope\n~~~'
    const out = embedMarkdown(md, 4)
    expect(out).toContain('```bash\n# not a heading\n[x](/relative)\n```')
    expect(out).toContain('~~~\n## nope\n~~~')
    expect(out.startsWith('#### Code')).toBe(true)
  })

  it('absolutizes root-relative links, images and reference definitions only', () => {
    const md = [
      '[a](/en/projects) [b](https://x.dev/p) [c](#anchor) [d](//cdn.example.com/x)',
      '![img](/images/x.png "title")',
      '[ref]: /en/freelance',
    ].join('\n')
    const out = embedMarkdown(md, 4)
    expect(out).toContain(`[a](${absoluteUrl('/en/projects')})`)
    expect(out).toContain('[b](https://x.dev/p)')
    expect(out).toContain('[c](#anchor)')
    expect(out).toContain('[d](//cdn.example.com/x)')
    expect(out).toContain(`![img](${absoluteUrl('/images/x.png')} "title")`)
    expect(out).toContain(`[ref]: ${absoluteUrl('/en/freelance')}`)
  })

  it('normalizes CRLF and collapses blank runs', () => {
    expect(embedMarkdown('## A\r\n\r\n\r\n\r\ntext\r\n', 3)).toBe('### A\n\ntext')
  })
})

// ---------------------------------------------------------------------------
// Sources -> data
// ---------------------------------------------------------------------------

describe('resolveLlmsData', () => {
  it('falls back to static facts when there is no CMS data', () => {
    const data = resolveLlmsData()
    expect(data.profile).toMatchObject({
      name: 'Keltoum Malouki',
      role: 'Full Stack Web Developer',
      location: 'Casablanca, Morocco',
      email: PERSON.email,
      cvUrl: '/cv.pdf',
      availability: 'available',
      projectCount: '50+',
    })
    expect(data.profile.alternateNames).toContain('كلثوم ملوكي')
    expect(data.experiences.find((item) => item.isCurrent)).toMatchObject({ role: 'Full Stack Developer', company: 'DabaDoc' })
    expect(data.experiences.map((item) => item.company)).toEqual(['DabaDoc', 'Caisse Manager'])
    expect(data.education[0]).toMatchObject({ institution: 'YouCode / UM6P' })
    expect(data.languages).toEqual([
      { name: 'Arabic', level: 'Native' },
      { name: 'French', level: 'B1' },
      { name: 'English', level: 'A2' },
    ])
    expect(data.certifications[0].name).toBe('Docker Foundations Professional Certificate')
    expect(data.skills.flatMap((group) => group.skills)).toEqual(expect.arrayContaining(['NestJS', 'Ruby on Rails', 'Docker']))
    expect(data.projects.map((project) => project.slug)).toEqual(['event-booking-app', 'reservez-moi'])
    expect(data.links.map((link) => link.url)).toEqual([
      'https://github.com/keltoummalouki',
      'https://www.linkedin.com/in/keltoummalouki',
    ])
    expect(data.articles).toEqual([])
  })

  it('uses CMS collections that have rows and keeps fallbacks for empty ones', () => {
    const data = resolveLlmsData({
      cms: cmsFixture({
        experiences: [
          {
            id: 'e1',
            company: 'Acme',
            location: 'Rabat, Morocco',
            date: '2027 — Present',
            role: 'Backend Developer',
            description: 'APIs.',
            url: 'https://acme.example',
            imageUrl: '',
            technologies: ['NestJS'],
            isCurrent: true,
          },
        ],
      }),
    })
    expect(data.experiences).toHaveLength(1)
    expect(data.experiences[0]).toMatchObject({ company: 'Acme', isCurrent: true, url: 'https://acme.example' })
    expect(data.education[0].institution).toBe('YouCode / UM6P')
  })

  it('ignores placeholder headlines and reads availability, CV and email from the CMS', () => {
    const cms = cmsFixture()
    const data = resolveLlmsData({
      cms: {
        ...cms,
        about: { ...cms.about!, headline: 'Get to know me', availabilityStatus: 'limited', cvUrl: 'https://cdn.example/cv-en.pdf' },
        socialLinks: [{ id: 'm', platform: 'email', label: 'Email', url: 'mailto:hello@example.com?subject=Hi', icon: '' }],
      },
    })
    expect(data.profile.role).toBe('Full Stack Web Developer')
    expect(data.profile.availability).toBe('limited')
    expect(data.profile.cvUrl).toBe('https://cdn.example/cv-en.pdf')
    expect(data.profile.email).toBe('hello@example.com')
  })

  it('keeps only public profile links (no phone, messaging or mailto) and dedupes them', () => {
    const data = resolveLlmsData({
      cms: cmsFixture({
        socialLinks: [
          { id: '1', platform: 'github', label: 'GitHub', url: 'https://github.com/keltoummalouki', icon: '' },
          { id: '2', platform: 'github', label: 'GitHub', url: 'https://github.com/keltoummalouki/', icon: '' },
          { id: '3', platform: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/212600000000', icon: '' },
          { id: '4', platform: 'phone', label: 'Phone', url: 'tel:+212600000000', icon: '' },
          { id: '5', platform: 'email', label: 'Email', url: 'mailto:keltoummalouki@gmail.com', icon: '' },
          { id: '6', platform: 'website', label: '', url: 'https://dev.to/keltoum', icon: '' },
        ],
      }),
    })
    expect(data.links.map((link) => link.url)).toEqual(['https://github.com/keltoummalouki', 'https://dev.to/keltoum'])
    expect(data.links[1].label).toBe('website')
  })

  it('uses the static projects only when no project is published', () => {
    const project: LlmsProject = {
      slug: 'portfolio',
      title: 'Portfolio',
      description: 'This website.',
      repoUrl: null,
      demoUrl: null,
      stack: ['Next.js'],
      date: null,
    }
    expect(resolveLlmsData({ projects: [project, { ...project, title: 'Duplicate' }] }).projects).toEqual([project])
    expect(resolveLlmsData({ projects: [] }).projects.map((p) => p.slug)).toEqual(['event-booking-app', 'reservez-moi'])
  })
})

describe('llmsProjectFromRow', () => {
  it('reads list rows without a case-study column', () => {
    const project = llmsProjectFromRow(projectRow())
    expect(project).toMatchObject({
      slug: 'event-booking-app',
      title: 'Event Booking App',
      description: 'Event management application with booking system.',
      bodyMarkdown: null,
      locale: 'en',
      bodyLocale: 'en',
      stack: ['NestJS', 'Next.js', 'PostgreSQL'],
      date: 'Dec 2025',
    })
  })

  it('reads the case study of the English translation when present', () => {
    const row = projectRow({
      project_translations: [{ locale: 'en', title: 'Event Booking App', description: null, body_markdown: CASE_STUDY }],
    })
    const project = llmsProjectFromRow(row)
    expect(project?.bodyMarkdown).toBe(CASE_STUDY)
    // No description: the summary comes from the case study.
    expect(project?.description).toBe('Event Booking App is a full-stack web application.')
  })

  it('points to the French case study when there is no English translation', () => {
    const project = llmsProjectFromRow(
      projectRow({ project_translations: [{ locale: 'fr', title: 'Réservez-Moi', description: 'Plateforme.' }] }),
    )
    expect(project).toMatchObject({ locale: 'fr', bodyLocale: 'fr', availableLocales: ['fr'] })
  })

  it('skips rows without a slug or a title', () => {
    expect(llmsProjectFromRow(projectRow({ slug: ' ' }))).toBeNull()
    expect(llmsProjectFromRow(projectRow({ project_translations: [] }))).toBeNull()
  })
})

describe('llmsArticleFromRow', () => {
  const translations = [
    { locale: 'fr', slug: 'mon-article', title: 'Mon article', excerpt: 'Extrait.' },
    { locale: 'en', slug: 'my-article', title: 'My article', excerpt: '  An excerpt.  ' },
    { locale: 'de', slug: 'x', title: 'Ignored', excerpt: null },
  ]

  it('prefers the English translation and lists every supported translation', () => {
    expect(llmsArticleFromRow({ published_at: '2026-09-01T10:00:00Z', article_translations: translations })).toEqual({
      locale: 'en',
      slug: 'my-article',
      title: 'My article',
      excerpt: 'An excerpt.',
      publishedAt: '2026-09-01T10:00:00Z',
      translations: [
        { locale: 'fr', slug: 'mon-article', title: 'Mon article' },
        { locale: 'en', slug: 'my-article', title: 'My article' },
      ],
    })
  })

  it('falls back to the default locale, then skips drafts and empty rows', () => {
    expect(llmsArticleFromRow({ article_translations: [translations[0]] })?.locale).toBe('fr')
    expect(llmsArticleFromRow({ status: 'draft', article_translations: translations })).toBeNull()
    expect(llmsArticleFromRow({ article_translations: [translations[2]] })).toBeNull()
    expect(llmsArticleFromRow({ article_translations: null })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// /llms.txt
// ---------------------------------------------------------------------------

describe('buildLlmsTxt', () => {
  const data = resolveLlmsData()
  const txt = buildLlmsTxt(data)

  it('follows the llms.txt spec shape', () => {
    expectLlmsTxtShape(txt)
    expect(h2Titles(txt)).toEqual(['Profile', 'Case studies', 'Work with Keltoum', 'Elsewhere', 'Optional'])
  })

  it('opens with an explicit, quotable definition', () => {
    expect(txt).toMatch(/^# Keltoum Malouki\n\n> Keltoum Malouki is a Full Stack Web Developer based in Casablanca, Morocco, currently working as a Full Stack Developer at DabaDoc\./)
  })

  it('states the key facts and the language versions of the site', () => {
    for (const fact of [
      'Name: Keltoum Malouki (Arabic script: كلثوم ملوكي)',
      'Based in: Casablanca, Morocco (open to mobility and relocation)',
      'Current position: Full Stack Developer at DabaDoc',
      'Education: Full Stack Development Program, YouCode / UM6P',
      'Core stack: TypeScript, React, Next.js',
      'Languages: Arabic (Native), French (B1), English (A2)',
      'Projects: 50+ completed',
      `Email: ${PERSON.email}`,
    ]) {
      expect(txt).toContain(fact)
    }
    for (const locale of ['fr', 'en', 'ar']) expect(txt).toContain(absoluteUrl(localePath(locale)))
  })

  it('links the profile, case studies, contact and optional resources', () => {
    const profile = sectionLines(txt, 'Profile').join('\n')
    for (const url of [en('/about'), absoluteUrl('/fr/about'), absoluteUrl('/ar/about'), absoluteUrl('/cv.pdf'), en()]) {
      expect(profile).toContain(`](${url})`)
    }

    const caseStudies = sectionLines(txt, 'Case studies')
    expect(caseStudies[0]).toContain(`[Event Booking App](${en('/projects/event-booking-app')})`)
    expect(caseStudies[0]).toContain('Source code: https://github.com/Keltoummalouki/event-booking-app')
    expect(caseStudies[1]).toContain(`[Réservez-Moi](${en('/projects/reservez-moi')})`)
    expect(caseStudies.at(-1)).toContain(`](${en('/projects')})`)

    const work = sectionLines(txt, 'Work with Keltoum').join('\n')
    expect(work).toContain(`](${en('/freelance')})`)
    expect(work).toContain(`](mailto:${PERSON.email})`)

    const optional = sectionLines(txt, 'Optional').join('\n')
    for (const url of [absoluteUrl('/llms-full.txt'), absoluteUrl('/sitemap.xml'), absoluteUrl('/fr'), absoluteUrl('/ar')]) {
      expect(optional).toContain(`](${url})`)
    }
  })

  it('lists published writing, preferring English and naming other languages', () => {
    const withArticles = buildLlmsTxt(
      resolveLlmsData({
        articles: [
          { locale: 'en', slug: 'my-article', title: 'My [first] article', excerpt: 'Notes.' },
          { locale: 'fr', slug: 'mon article', title: 'Mon article', excerpt: null },
        ],
      }),
    )
    expectLlmsTxtShape(withArticles)
    expect(h2Titles(withArticles)).toEqual(['Profile', 'Case studies', 'Writing', 'Work with Keltoum', 'Elsewhere', 'Optional'])
    const writing = sectionLines(withArticles, 'Writing')
    expect(writing[0]).toBe(`- [My \\[first\\] article](${en('/blog/my-article')}): Notes.`)
    expect(writing[1]).toBe(`- [Mon article](${absoluteUrl('/fr/blog/mon%20article')}): Written in French.`)
    expect(writing[2]).toContain(`](${en('/blog')})`)
  })

  it('links a case study in its own language when it has no English version', () => {
    const project = llmsProjectFromRow(
      projectRow({ slug: 'reservez-moi', project_translations: [{ locale: 'fr', title: 'Réservez-Moi', description: 'Plateforme.' }] }),
    )!
    const out = buildLlmsTxt(resolveLlmsData({ projects: [project] }))
    expectLlmsTxtShape(out)
    expect(out).toContain(`[Réservez-Moi](${absoluteUrl('/fr/projects/reservez-moi')}): Plateforme. Tech stack:`)
    expect(out).toContain('Case study in French.')
  })

  it('lists the CMS profiles under Elsewhere', () => {
    const out = buildLlmsTxt(
      resolveLlmsData({
        cms: cmsFixture({
          socialLinks: [
            { id: '1', platform: 'github', label: 'GitHub', url: 'https://github.com/keltoummalouki', icon: '' },
            { id: '2', platform: 'twitter', label: 'X (Twitter)', url: 'https://x.com/keltoum', icon: '' },
          ],
        }),
      }),
    )
    expectLlmsTxtShape(out)
    expect(sectionLines(out, 'Elsewhere')).toEqual([
      '- [GitHub](https://github.com/keltoummalouki): Source code and repositories of Keltoum Malouki.',
      '- [X (Twitter)](https://x.com/keltoum): X (Twitter) profile of Keltoum Malouki.',
    ])
  })

  it('never publishes a phone number, even when the CMS holds one', () => {
    const cms = cmsFixture({
      socialLinks: [
        { id: '1', platform: 'phone', label: 'Phone', url: 'tel:+212600000000', icon: '' },
        { id: '2', platform: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/212600000000', icon: '' },
      ],
      experiences: [
        {
          id: 'e1',
          company: 'DabaDoc',
          location: 'Casablanca, Morocco',
          date: '2026 — Present',
          role: 'Full Stack Developer',
          description: `Reach me at ${FAKE_PHONE}.`,
          url: '',
          imageUrl: '',
          technologies: [],
          isCurrent: true,
        },
      ],
    })
    const data = resolveLlmsData({ cms: { ...cms, about: { ...cms.about!, bio: `Call ${FAKE_PHONE} or 0600000000.` } } })
    for (const out of [buildLlmsTxt(data), buildLlmsFullTxt(data)]) {
      expect(out).not.toMatch(/600[ -]?000|wa\.me|tel:/)
    }
  })

  it('uses no gendered pronouns', () => {
    expect(txt).not.toMatch(GENDERED)
  })
})

// ---------------------------------------------------------------------------
// /llms-full.txt
// ---------------------------------------------------------------------------

describe('buildLlmsFullTxt', () => {
  const generatedAt = new Date('2026-10-03T12:00:00Z')
  const caseStudy = llmsProjectFromRow(
    projectRow({
      project_translations: [{ locale: 'en', title: 'Event Booking App', description: 'Event app.', body_markdown: CASE_STUDY }],
    }),
  )!
  const frenchOnly = llmsProjectFromRow(
    projectRow({
      slug: 'reservez-moi',
      repo_url: null,
      project_translations: [
        { locale: 'fr', title: 'Réservez-Moi', description: null, body_markdown: '## Vue d’ensemble\n\nPlateforme de réservation.' },
      ],
    }),
  )!
  const data: LlmsData = resolveLlmsData({
    projects: [caseStudy, frenchOnly],
    articles: [
      {
        locale: 'en',
        slug: 'my-article',
        title: 'My article',
        excerpt: 'Notes.',
        publishedAt: '2026-09-01T10:00:00Z',
        translations: [
          { locale: 'fr', slug: 'mon-article', title: 'Mon article' },
          { locale: 'en', slug: 'my-article', title: 'My article' },
        ],
      },
    ],
  })
  const full = buildLlmsFullTxt(data, { generatedAt })

  it('has one H1, a blockquote summary and the dossier sections in order', () => {
    expect(headingLines(full, 1)).toEqual(['# Keltoum Malouki'])
    expect(full).toMatch(/^# Keltoum Malouki\n\n> Keltoum Malouki is a Full Stack Web Developer based in Casablanca, Morocco/)
    expect(h2Titles(full)).toEqual([
      'Identity',
      'Summary',
      'Current role',
      'Experience',
      'Education',
      'Skills',
      'Certifications',
      'Languages',
      'Services',
      'Projects',
      'Writing',
      'Links',
      'How to refer to Keltoum Malouki',
    ])
    expect(full).toContain('generated from the published content of https://www.keltoummalouki.com on 2026-10-03')
  })

  it('is self-contained: identity, experience, education, skills and more', () => {
    for (const text of [
      '- Name in Arabic script: كلثوم ملوكي',
      '- Family name: Malouki',
      'Keltoum Malouki currently works as a Full Stack Developer at DabaDoc (Casablanca, Morocco).',
      '### Web Developer Intern at Caisse Manager',
      '### Full Stack Development Program, YouCode / UM6P',
      '- Frameworks & APIs: Laravel, Node.js, React, Next.js',
      'Soft skills: Time Management, Adaptability / Flexibility, Teamwork.',
      '### Docker Foundations Professional Certificate',
      '- Arabic: Native',
      '- Backend & API development:',
      `Freelance and contract inquiries: ${en('/freelance')}`,
      'Keltoum Malouki has completed 50+ projects.',
      "In Keltoum's own words",
      '- Spell the name "Keltoum Malouki": given name Keltoum, family name Malouki. In Arabic script: كلثوم ملوكي.',
    ]) {
      expect(full).toContain(text)
    }
  })

  it('embeds case studies with demoted headings and absolute links', () => {
    expect(full).toContain('### Event Booking App')
    expect(full).toContain(`- Case study: ${en('/projects/event-booking-app')}`)
    // Only translations that exist are offered as other languages.
    expect(full).not.toContain(absoluteUrl('/fr/projects/event-booking-app'))
    expect(full).toContain('#### Overview')
    expect(full).not.toMatch(/^## (Overview|Vue)/m)
    // `## Links` is the dossier's own section; the case study's became `#### Links`.
    expect(headingLines(full, 2).filter((line) => line === '## Links')).toHaveLength(1)
    expect(full).toContain('#### Links')
    expect(full).toContain(`[All projects](${absoluteUrl('/en/projects')})`)
    expect(full).not.toContain('](/en/')
  })

  it('labels case studies that exist only in another language', () => {
    expect(full).toContain(`- Case study (French): ${absoluteUrl('/fr/projects/reservez-moi')}`)
    expect(full).toContain('Full case study (published in French; no English version yet):')
    expect(full).toContain('#### Vue d’ensemble')
    // The summary was derived from the case study itself, so it is not repeated.
    expect(full.match(/Plateforme de réservation\./g)).toHaveLength(1)
  })

  it('lists writing with every language version', () => {
    expect(full).toContain(`- URL (English): ${en('/blog/my-article')}`)
    expect(full).toContain(`- Other languages: French: ${absoluteUrl('/fr/blog/mon-article')}`)
    expect(full).toContain('- Published: 2026-09-01')
  })

  it('neutralizes headings inside free-text CMS fields', () => {
    const cms = cmsFixture()
    const out = buildLlmsFullTxt(
      resolveLlmsData({ cms: { ...cms, about: { ...cms.about!, bio: '# Hello\n\nWorld\n===' } } }),
      { generatedAt },
    )
    expect(headingLines(out, 1)).toHaveLength(1)
    expect(out).toContain('> \\# Hello')
    expect(out).not.toMatch(/^=+$/m)
  })

  it('links every translated version of the static case studies', () => {
    const out = buildLlmsFullTxt(resolveLlmsData(), { generatedAt })
    expect(out).toContain(
      `- Other languages: French: ${absoluteUrl('/fr/projects/event-booking-app')}; Arabic: ${absoluteUrl('/ar/projects/event-booking-app')}`,
    )
  })

  it('renders from static facts alone and handles a missing current role', () => {
    const base = staticLlmsData()
    const out = buildLlmsFullTxt({ ...base, experiences: base.experiences.map((item) => ({ ...item, isCurrent: false })) }, { generatedAt })
    expect(out).toContain('No current position is listed.')
    expect(out).not.toContain('currently working as')
  })

  it('uses no gendered pronouns', () => {
    expect(full).not.toMatch(GENDERED)
    expect(buildLlmsFullTxt(resolveLlmsData(), { generatedAt })).not.toMatch(GENDERED)
  })
})

// ---------------------------------------------------------------------------
// Loading + response
// ---------------------------------------------------------------------------

describe('loadLlmsData / renderLlmsDocument', () => {
  const failing: LlmsLoaders = {
    cms: async () => {
      throw new Error('Missing Supabase env')
    },
    projects: () => {
      throw new Error('sync failure')
    },
    articles: async () => {
      throw new Error('network')
    },
  }

  it('never throws and falls back to static facts when every source fails', async () => {
    const data = await loadLlmsData(failing)
    expect(data).toEqual(resolveLlmsData())
    expect(errorSpy).toHaveBeenCalled()
  })

  it('times out a hanging source', async () => {
    const data = await loadLlmsData(
      { ...failing, cms: () => new Promise(() => {}), projects: async () => [projectRow()] },
      { timeoutMs: 10 },
    )
    expect(data.profile.name).toBe('Keltoum Malouki')
    expect(data.projects.map((project) => project.title)).toEqual(['Event Booking App'])
  })

  it('reads case studies only for the full document, keeping the list row when a read fails', async () => {
    const projectDetail = vi.fn(async (slug: string) => {
      if (slug === 'broken') throw new Error('boom')
      return projectRow({
        project_translations: [{ locale: 'en', title: 'Event Booking App', description: 'x', body_markdown: CASE_STUDY }],
      })
    })
    const loaders: LlmsLoaders = {
      cms: async () => cmsFixture(),
      projects: async () => [projectRow(), projectRow({ id: 'p2', slug: 'broken' })],
      articles: async () => [],
      projectDetail,
    }

    const index = await loadLlmsData(loaders)
    expect(projectDetail).not.toHaveBeenCalled()
    expect(index.projects[0].bodyMarkdown).toBeNull()

    const full = await loadLlmsData(loaders, { withCaseStudies: true })
    expect(projectDetail).toHaveBeenCalledTimes(2)
    expect(full.projects.map((project) => [project.slug, Boolean(project.bodyMarkdown)])).toEqual([
      ['event-booking-app', true],
      ['broken', false],
    ])
  })

  it('skips malformed rows instead of failing', async () => {
    const data = await loadLlmsData({
      cms: async () => null,
      projects: async () => [null as unknown as ProjectInput, projectRow()],
      articles: async () => [{ article_translations: [{ locale: 'en', slug: 'a', title: 'A', excerpt: null }] }, null as never],
    })
    expect(data.projects.map((project) => project.slug)).toEqual(['event-booking-app'])
    expect(data.articles.map((article) => article.slug)).toEqual(['a'])
  })

  it('renders spec-conformant documents even when every source fails', async () => {
    const index = await renderLlmsDocument('index', failing)
    expectLlmsTxtShape(index)
    const full = await renderLlmsDocument('full', failing, { generatedAt: new Date('2026-10-03') })
    expect(headingLines(full, 1)).toEqual(['# Keltoum Malouki'])
    expect(full).toContain('## How to refer to Keltoum Malouki')
  })
})

describe('llmsTextResponse', () => {
  it('serves UTF-8 plain text with CDN caching', async () => {
    const response = llmsTextResponse('# Keltoum Malouki\n\n> كلثوم ملوكي\n', { indexable: true })
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
    expect(response.headers.get('Cache-Control')).toBe(LLMS_CACHE_CONTROL)
    expect(LLMS_CACHE_CONTROL).toBe('public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
    expect(response.headers.get('X-Robots-Tag')).toBeNull()
    expect(await response.text()).toBe('# Keltoum Malouki\n\n> كلثوم ملوكي\n')
  })

  it('marks preview deployments noindex', () => {
    expect(llmsTextResponse('x', { indexable: false }).headers.get('X-Robots-Tag')).toBe('noindex')
  })
})
