import { z } from 'zod'

// Validation for the project dashboard forms. Pure (no server imports) so it is
// safe to import from Client Components and unit tests.

export const PROJECT_STATUSES = ['draft', 'published', 'archived'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]
export const projectStatusSchema = z.enum(PROJECT_STATUSES)

export const PROJECT_LOCALES = ['fr', 'en', 'ar'] as const
export type ProjectLocale = (typeof PROJECT_LOCALES)[number]

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(120, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens')

// repo / demo: full URLs only (or empty -> null).
const optionalUrl = z
  .union([z.literal(''), z.url('Enter a valid URL')])
  .transform((v) => (v === '' ? null : v))

// cover image: a full URL or a local path beginning with "/" (or empty -> null).
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

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .transform((v) => (v === '' ? null : v))

const translationSchema = (titleRequired: boolean) =>
  z.object({
    title: titleRequired
      ? z.string().trim().min(1, 'Title is required').max(200, 'Title is too long')
      : z.string().trim().max(200, 'Title is too long'),
    description: optionalText(2000),
  })

export const projectFormSchema = z.object({
  slug: slugSchema,
  status: projectStatusSchema,
  featured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(100000),
  techStack: z
    .string()
    .max(1000)
    .transform((s) =>
      s
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  coverImageUrl: optionalImageRef,
  // input type=date yields "YYYY-MM-DD" or "".
  startedAt: z
    .union([z.literal(''), z.string().max(10)])
    .transform((v) => (v === '' ? null : v)),
  // Default-locale (fr) title is required; en/ar are optional and fall back.
  translations: z.object({
    fr: translationSchema(true),
    en: translationSchema(false),
    ar: translationSchema(false),
  }),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export interface ProjectFormState {
  ok?: boolean
  message?: string
  errors?: Record<string, string>
}
