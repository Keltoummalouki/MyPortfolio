import { describe, it, expect } from 'vitest'
import { PROJECT_CASE_STUDY_MAX, isValidProjectSlug, projectFormInput, projectFormSchema } from './projects.schema'

const SKILL_A = '11111111-1111-4111-8111-111111111111'
const SKILL_B = '22222222-2222-4222-8222-222222222222'

const valid = {
  slug: 'my-project',
  status: 'published',
  featured: true,
  sortOrder: '2',
  skillIds: [SKILL_A, SKILL_B],
  repoUrl: 'https://github.com/example/repo',
  demoUrl: '',
  coverImageUrl: '/images/cover.png',
  startedAt: '2025-04-01',
  translations: {
    fr: { title: 'Titre', description: 'Description fr', bodyMarkdown: '## Vue d’ensemble\n\nTexte.' },
    en: { title: '', description: '', bodyMarkdown: '' },
    ar: { title: '', description: '', bodyMarkdown: '' },
  },
}

describe('projectFormSchema', () => {
  it('parses a valid payload and normalizes fields', () => {
    const result = projectFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.sortOrder).toBe(2)
    expect(result.data.skillIds).toEqual([SKILL_A, SKILL_B])
    expect(result.data.demoUrl).toBeNull() // empty -> null
    expect(result.data.coverImageUrl).toBe('/images/cover.png')
    expect(result.data.translations.en.title).toBe('')
  })

  it('defaults skillIds to an empty array when omitted', () => {
    const { skillIds, ...withoutSkills } = valid
    void skillIds
    const result = projectFormSchema.safeParse(withoutSkills)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.skillIds).toEqual([])
  })

  it('rejects non-UUID skill ids', () => {
    const result = projectFormSchema.safeParse({ ...valid, skillIds: ['not-a-uuid'] })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid slug', () => {
    const result = projectFormSchema.safeParse({ ...valid, slug: 'Not A Slug' })
    expect(result.success).toBe(false)
  })

  it('requires the French (default-locale) title', () => {
    const result = projectFormSchema.safeParse({
      ...valid,
      translations: { ...valid.translations, fr: { title: '', description: '' } },
    })
    expect(result.success).toBe(false)
  })

  it('rejects a non-URL repo link', () => {
    const result = projectFormSchema.safeParse({ ...valid, repoUrl: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid status', () => {
    const result = projectFormSchema.safeParse({ ...valid, status: 'live' })
    expect(result.success).toBe(false)
  })

  it('keeps the case study Markdown and trims surrounding whitespace', () => {
    const result = projectFormSchema.safeParse({
      ...valid,
      translations: {
        ...valid.translations,
        fr: { ...valid.translations.fr, bodyMarkdown: '\n  ## Overview\n\nBody text.  \n' },
      },
    })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.translations.fr.bodyMarkdown).toBe('## Overview\n\nBody text.')
  })

  it('normalizes an empty case study to null', () => {
    const result = projectFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.translations.en.bodyMarkdown).toBeNull()
    expect(result.data.translations.ar.bodyMarkdown).toBeNull()
  })

  it('treats a missing case study field as null (older payloads)', () => {
    const result = projectFormSchema.safeParse({
      ...valid,
      translations: {
        fr: { title: 'Titre', description: '' },
        en: { title: '', description: '' },
        ar: { title: '', description: '' },
      },
    })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.translations.fr.bodyMarkdown).toBeNull()
  })

  it('rejects a case study longer than the maximum', () => {
    const result = projectFormSchema.safeParse({
      ...valid,
      translations: {
        ...valid.translations,
        fr: { ...valid.translations.fr, bodyMarkdown: 'a'.repeat(PROJECT_CASE_STUDY_MAX + 1) },
      },
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.path.join('.')).toBe('translations.fr.bodyMarkdown')
  })

  it('accepts a case study at exactly the maximum length', () => {
    const result = projectFormSchema.safeParse({
      ...valid,
      translations: {
        ...valid.translations,
        fr: { ...valid.translations.fr, bodyMarkdown: 'a'.repeat(PROJECT_CASE_STUDY_MAX) },
      },
    })
    expect(result.success).toBe(true)
  })

  it('refuses optional-locale content without a title instead of dropping it', () => {
    const result = projectFormSchema.safeParse({
      ...valid,
      translations: {
        ...valid.translations,
        en: { title: '', description: '', bodyMarkdown: '## Overview' },
      },
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain('translations.en.title')
  })

  it('refuses an optional-locale description without a title', () => {
    const result = projectFormSchema.safeParse({
      ...valid,
      translations: {
        ...valid.translations,
        ar: { title: '   ', description: 'وصف', bodyMarkdown: '' },
      },
    })
    expect(result.success).toBe(false)
  })
})

describe('projectFormInput', () => {
  function formData(entries: [string, string][]) {
    const fd = new FormData()
    for (const [key, value] of entries) fd.append(key, value)
    return fd
  }

  it('reads every field, including the per-locale case study', () => {
    const input = projectFormInput(
      formData([
        ['slug', 'event-booking-app'],
        ['status', 'published'],
        ['featured', 'on'],
        ['sortOrder', '1'],
        ['skillIds', SKILL_B],
        ['skillIds', SKILL_A],
        ['repoUrl', 'https://github.com/example/repo'],
        ['demoUrl', ''],
        ['coverImageUrl', '/images/cover.png'],
        ['startedAt', '2025-12-01'],
        ['fr.title', 'Titre'],
        ['fr.description', 'Desc'],
        ['fr.bodyMarkdown', '## Vue d’ensemble'],
        ['en.title', 'Title'],
        ['en.bodyMarkdown', '## Overview'],
      ]),
    )
    expect(input.featured).toBe(true)
    expect(input.skillIds).toEqual([SKILL_B, SKILL_A]) // order preserved
    expect(input.translations.fr).toEqual({ title: 'Titre', description: 'Desc', bodyMarkdown: '## Vue d’ensemble' })
    expect(input.translations.en).toEqual({ title: 'Title', description: '', bodyMarkdown: '## Overview' })
    expect(input.translations.ar).toEqual({ title: '', description: '', bodyMarkdown: '' })

    const parsed = projectFormSchema.safeParse(input)
    expect(parsed.success).toBe(true)
    if (!parsed.success) return
    expect(parsed.data.translations.en.bodyMarkdown).toBe('## Overview')
    expect(parsed.data.translations.ar.bodyMarkdown).toBeNull()
  })

  it('treats an unchecked featured box and missing fields as empty', () => {
    const input = projectFormInput(formData([['slug', 'x']]))
    expect(input.featured).toBe(false)
    expect(input.skillIds).toEqual([])
    expect(input.translations.fr.bodyMarkdown).toBe('')
  })
})

describe('isValidProjectSlug', () => {
  it('accepts the slugs the admin form accepts', () => {
    expect(isValidProjectSlug('event-booking-app')).toBe(true)
    expect(isValidProjectSlug('reservez-moi')).toBe(true)
    expect(isValidProjectSlug('a1')).toBe(true)
  })

  it('rejects malformed or oversized URL segments before any query', () => {
    for (const slug of ['', 'Event-Booking', 'a--b', '-a', 'a-', '../etc', 'a b', 'réservez', 'a/b', 'a'.repeat(121)]) {
      expect(isValidProjectSlug(slug)).toBe(false)
    }
  })
})
