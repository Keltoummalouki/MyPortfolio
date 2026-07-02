import { z } from 'zod'

// Validation for the freelance lead pipeline. Pure (no server imports) so it is
// safe to import from Client Components and unit tests.

export const LEAD_STATUSES = [
  'new',
  'qualified',
  'meeting',
  'proposal',
  'won',
  'lost',
  'spam',
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]
export const leadStatusSchema = z.enum(LEAD_STATUSES)

// Stable option keys stored in the DB; their human labels are localized on the
// public form (i18n) and shown in English in the admin (LABELS maps below).
export const PROJECT_TYPES = ['web_app', 'website', 'ecommerce', 'api', 'consulting', 'other'] as const
export const BUDGET_RANGES = ['lt_1k', '1k_5k', '5k_15k', 'gt_15k', 'unsure'] as const
export const TIMELINES = ['asap', '1_3_months', '3_6_months', 'flexible'] as const
export const CONTACT_PREFERENCES = ['email', 'call', 'video'] as const

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  web_app: 'Web app',
  website: 'Website',
  ecommerce: 'E-commerce',
  api: 'API / backend',
  consulting: 'Consulting',
  other: 'Other',
}
export const BUDGET_RANGE_LABELS: Record<string, string> = {
  lt_1k: 'Under €1k',
  '1k_5k': '€1k–5k',
  '5k_15k': '€5k–15k',
  gt_15k: '€15k+',
  unsure: 'Not sure yet',
}
export const TIMELINE_LABELS: Record<string, string> = {
  asap: 'As soon as possible',
  '1_3_months': '1–3 months',
  '3_6_months': '3–6 months',
  flexible: 'Flexible',
}
export const CONTACT_PREFERENCE_LABELS: Record<string, string> = {
  email: 'Email',
  call: 'Phone call',
  video: 'Video call',
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .transform((v) => (v === '' ? null : v))

const optionalProjectType = z
  .union([z.literal(''), z.enum(PROJECT_TYPES)])
  .transform((v) => (v === '' ? null : v))
const optionalBudget = z
  .union([z.literal(''), z.enum(BUDGET_RANGES)])
  .transform((v) => (v === '' ? null : v))
const optionalTimeline = z
  .union([z.literal(''), z.enum(TIMELINES)])
  .transform((v) => (v === '' ? null : v))
const optionalContactPreference = z
  .union([z.literal(''), z.enum(CONTACT_PREFERENCES)])
  .transform((v) => (v === '' ? null : v))

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(120, 'Name is too long'),
  email: z.email('Enter a valid email').max(320),
  company: optionalText(160),
  projectType: optionalProjectType,
  budget: optionalBudget,
  timeline: optionalTimeline,
  contactPreference: optionalContactPreference,
  details: z.string().trim().min(10, 'Please add a few details').max(5000, 'Details are too long'),
})

export type LeadFormValues = z.output<typeof leadFormSchema>

export interface LeadSubmitState {
  ok?: boolean
  /** Coarse, non-leaking reason code mapped to a localized message by the client. */
  error?: 'invalid' | 'captcha' | 'rate_limited' | 'server'
  errors?: Record<string, string>
}
