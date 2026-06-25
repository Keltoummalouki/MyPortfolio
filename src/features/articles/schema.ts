import { z } from 'zod'

// Validation for the blog article dashboard forms. Pure (no server imports) so
// it is safe to import from Client Components and unit tests.

export const ARTICLE_STATUSES = ['draft', 'published', 'archived'] as const
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number]
export const articleStatusSchema = z.enum(ARTICLE_STATUSES)

export const ARTICLE_LOCALES = ['fr', 'en', 'ar'] as const
export type ArticleLocale = (typeof ARTICLE_LOCALES)[number]

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .transform((v) => (v === '' ? null : v))

const optionalImageRef = z
  .union([
    z.literal(''),
    z
      .string()
      .trim()
      .max(2048)
      .refine(
        (v) => v.startsWith('/') || /^https?:\/\//.test(v),
        'Enter a URL or a path starting with "/"',
      ),
  ])
  .transform((v) => (v === '' ? null : v))

const translationSchema = z.object({
  slug: z.string().trim().max(160),
  title: z.string().trim().max(200),
  excerpt: optionalText(500),
  bodyMarkdown: optionalText(50000),
  seoTitle: optionalText(200),
  seoDescription: optionalText(300),
})

export const articleFormSchema = z
  .object({
    status: articleStatusSchema,
    featured: z.boolean(),
    coverImageUrl: optionalImageRef,
    authorName: optionalText(120),
    publishedAt: z
      .union([z.literal(''), z.string().max(40)])
      .transform((v) => (v === '' ? null : v)),
    translations: z.object({
      fr: translationSchema,
      en: translationSchema,
      ar: translationSchema,
    }),
  })
  .superRefine((val, ctx) => {
    const add = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: 'custom', message, path })

    // French (default locale) is required.
    if (!val.translations.fr.title) add(['translations', 'fr', 'title'], 'French title is required')
    if (!val.translations.fr.slug) add(['translations', 'fr', 'slug'], 'French slug is required')

    for (const loc of ARTICLE_LOCALES) {
      const tr = val.translations[loc]
      if (tr.slug && !SLUG_RE.test(tr.slug)) {
        add(['translations', loc, 'slug'], 'Use lowercase letters, numbers, and hyphens')
      }
      // A translation needs a slug whenever it has a title.
      if (tr.title && !tr.slug) {
        add(['translations', loc, 'slug'], 'Slug is required when a title is set')
      }
    }

    // Publishing requires a complete default (French) translation.
    if (val.status === 'published' && !val.translations.fr.bodyMarkdown) {
      add(['translations', 'fr', 'bodyMarkdown'], 'A published article needs a French body')
    }
  })

export type ArticleFormValues = z.infer<typeof articleFormSchema>

export interface ArticleFormState {
  ok?: boolean
  message?: string
  errors?: Record<string, string>
}
