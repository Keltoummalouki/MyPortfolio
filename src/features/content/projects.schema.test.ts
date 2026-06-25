import { describe, it, expect } from 'vitest'
import { projectFormSchema } from './projects.schema'

const valid = {
  slug: 'my-project',
  status: 'published',
  featured: true,
  sortOrder: '2',
  techStack: 'Next.js, TypeScript ,  PostgreSQL ,',
  repoUrl: 'https://github.com/example/repo',
  demoUrl: '',
  coverImageUrl: '/images/cover.png',
  startedAt: '2025-04-01',
  translations: {
    fr: { title: 'Titre', description: 'Description fr' },
    en: { title: '', description: '' },
    ar: { title: '', description: '' },
  },
}

describe('projectFormSchema', () => {
  it('parses a valid payload and normalizes fields', () => {
    const result = projectFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.sortOrder).toBe(2)
    expect(result.data.techStack).toEqual(['Next.js', 'TypeScript', 'PostgreSQL'])
    expect(result.data.demoUrl).toBeNull() // empty -> null
    expect(result.data.coverImageUrl).toBe('/images/cover.png')
    expect(result.data.translations.en.title).toBe('')
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
})
