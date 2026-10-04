import { z } from 'zod'

// Validation for the project dashboard forms. Pure (no server imports) so it is
// safe to import from Client Components and unit tests.

export const PROJECT_STATUSES = ['draft', 'published', 'archived'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]
export const projectStatusSchema = z.enum(PROJECT_STATUSES)

export const PROJECT_LOCALES = ['fr', 'en', 'ar'] as const
export type ProjectLocale = (typeof PROJECT_LOCALES)[number]

const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PROJECT_SLUG_MAX = 120

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(PROJECT_SLUG_MAX, 'Slug is too long')
  .regex(PROJECT_SLUG_PATTERN, 'Use lowercase letters, numbers, and hyphens')

/** Whether `slug` is a well-formed project slug (used to reject bad URLs early). */
export function isValidProjectSlug(slug: string): boolean {
  return slug.length <= PROJECT_SLUG_MAX && PROJECT_SLUG_PATTERN.test(slug)
}

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

/** Max length of a per-locale case study (Markdown). */
export const PROJECT_CASE_STUDY_MAX = 20000

const translationSchema = (titleRequired: boolean) =>
  z
    .object({
      title: titleRequired
        ? z.string().trim().min(1, 'Title is required').max(200, 'Title is too long')
        : z.string().trim().max(200, 'Title is too long'),
      description: optionalText(2000),
      // Case study rendered on the public /projects/<slug> page (optional).
      bodyMarkdown: optionalText(PROJECT_CASE_STUDY_MAX).default(null),
    })
    // A locale is saved only when it has a title (blank title = locale removed),
    // so refuse content without a title instead of silently discarding it.
    .superRefine((value, ctx) => {
      if (!value.title && (value.description || value.bodyMarkdown)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Add a title to save this translation',
          path: ['title'],
        })
      }
    })

export const projectFormSchema = z.object({
  slug: slugSchema,
  status: projectStatusSchema,
  featured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(100000),
  // Technical skills linked to this project (skills.id values). The picker only
  // offers skills where skill_type = 'technical'; these become the project's
  // public tech stack via the project_skills join table.
  skillIds: z.array(z.uuid('Invalid skill')).max(60, 'Too many skills').default([]),
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

/**
 * Raw (unvalidated) input for `projectFormSchema`, read from the project form's
 * FormData. Field names: `slug`, `status`, `featured` (checkbox), `sortOrder`,
 * `skillIds` (repeated), `repoUrl`, `demoUrl`, `coverImageUrl`, `startedAt`, and
 * per locale `<locale>.title`, `<locale>.description`, `<locale>.bodyMarkdown`.
 */
export function projectFormInput(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? '')
  return {
    slug: text('slug'),
    status: text('status'),
    featured: formData.get('featured') === 'on',
    sortOrder: text('sortOrder'),
    skillIds: formData.getAll('skillIds').map(String).filter(Boolean),
    repoUrl: text('repoUrl'),
    demoUrl: text('demoUrl'),
    coverImageUrl: text('coverImageUrl'),
    startedAt: text('startedAt'),
    translations: Object.fromEntries(
      PROJECT_LOCALES.map((locale) => [
        locale,
        {
          title: text(`${locale}.title`),
          description: text(`${locale}.description`),
          // Browsers submit textarea newlines as CRLF; store LF so the server-side
          // length check matches the client counter.
          bodyMarkdown: text(`${locale}.bodyMarkdown`).replace(/\r\n?/g, '\n'),
        },
      ]),
    ) as Record<ProjectLocale, { title: string; description: string; bodyMarkdown: string }>,
  }
}

export interface ProjectFormState {
  ok?: boolean
  message?: string
  errors?: Record<string, string>
}

// Validation for inline creation of a technical skill from the project form.
export const newSkillNameSchema = z
  .string()
  .trim()
  .min(1, 'Skill name is required')
  .max(120, 'Skill name is too long')

// Shape consumed by the technical-skills picker (and returned when a skill is
// created inline). Pure so it can be imported from Client Components.
export interface ProjectSkillOption {
  id: string
  name: string
  icon: string | null
  imageUrl: string | null
}

export interface CreateSkillResult {
  ok: boolean
  skill?: ProjectSkillOption
  error?: string
}
