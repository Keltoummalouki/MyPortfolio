import { z } from 'zod'
import { localeSchema } from '@/lib/validation/locale'

// Visitor reviews: validation + form state. Pure (no server imports) so it is
// safe to import from Client Components and unit tests.

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected', 'spam'] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]
export const reviewStatusSchema = z.enum(REVIEW_STATUSES)

export const REVIEW_NAME_MAX = 80
export const REVIEW_COMMENT_MIN = 10
export const REVIEW_COMMENT_MAX = 1000
/** Reviews per page in the public list. */
export const REVIEWS_PER_PAGE = 4

// Error messages are stable keys, mapped to localized text by the client.
export const reviewFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'nameRequired')
    .max(REVIEW_NAME_MAX, 'nameTooLong'),
  rating: z.coerce
    .number({ error: 'ratingRequired' })
    .int('ratingRequired')
    .min(1, 'ratingRequired')
    .max(5, 'ratingRequired'),
  comment: z
    .string()
    .trim()
    .min(REVIEW_COMMENT_MIN, 'commentTooShort')
    .max(REVIEW_COMMENT_MAX, 'commentTooLong'),
  locale: localeSchema,
})

export type ReviewFormValues = z.output<typeof reviewFormSchema>
export type ReviewFieldError =
  | 'nameRequired'
  | 'nameTooLong'
  | 'ratingRequired'
  | 'commentTooShort'
  | 'commentTooLong'

export interface ReviewSubmitState {
  ok?: boolean
  /** Coarse, non-leaking reason code mapped to a localized message by the client. */
  error?: 'invalid' | 'captcha' | 'rate_limited' | 'server'
  errors?: Partial<Record<'name' | 'rating' | 'comment', ReviewFieldError>>
}

/** A review as shown publicly (approved only; no moderation fields). */
export interface PublicReview {
  id: string
  name: string
  rating: number
  comment: string
  locale: string
  /** ISO timestamp used for display and ordering (approval, else creation). */
  date: string
}
