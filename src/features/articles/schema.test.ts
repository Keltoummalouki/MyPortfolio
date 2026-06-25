import { describe, it, expect } from 'vitest'
import { articleFormSchema } from './schema'

const valid = {
  status: 'draft',
  featured: false,
  coverImageUrl: '',
  authorName: '',
  publishedAt: '',
  translations: {
    fr: { slug: 'mon-article', title: 'Mon article', excerpt: '', bodyMarkdown: '# Bonjour', seoTitle: '', seoDescription: '' },
    en: { slug: '', title: '', excerpt: '', bodyMarkdown: '', seoTitle: '', seoDescription: '' },
    ar: { slug: '', title: '', excerpt: '', bodyMarkdown: '', seoTitle: '', seoDescription: '' },
  },
}

describe('articleFormSchema', () => {
  it('accepts a valid draft with only the French translation', () => {
    const result = articleFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.translations.en.title).toBe('')
  })

  it('requires the French title and slug', () => {
    const result = articleFormSchema.safeParse({
      ...valid,
      translations: { ...valid.translations, fr: { ...valid.translations.fr, title: '', slug: '' } },
    })
    expect(result.success).toBe(false)
  })

  it('requires a slug when a non-French title is set', () => {
    const result = articleFormSchema.safeParse({
      ...valid,
      translations: { ...valid.translations, en: { ...valid.translations.en, title: 'Hello' } },
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid slug', () => {
    const result = articleFormSchema.safeParse({
      ...valid,
      translations: { ...valid.translations, fr: { ...valid.translations.fr, slug: 'Not Valid' } },
    })
    expect(result.success).toBe(false)
  })

  it('rejects publishing without a French body', () => {
    const result = articleFormSchema.safeParse({
      ...valid,
      status: 'published',
      translations: { ...valid.translations, fr: { ...valid.translations.fr, bodyMarkdown: '' } },
    })
    expect(result.success).toBe(false)
  })
})
