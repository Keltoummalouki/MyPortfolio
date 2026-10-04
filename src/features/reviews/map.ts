import type { PublicReview } from './schema'

// Pure mapping from DB rows to UI shapes + rating summary. Client-safe.

/** Columns the public query selects (anon has column-level SELECT on these only). */
export const PUBLIC_REVIEW_COLUMNS = 'id, author_name, rating, comment, locale, approved_at, created_at' as const

export interface PublicReviewRow {
  id: string
  author_name: string
  rating: number
  comment: string
  locale: string
  approved_at: string | null
  created_at: string
}

export function toPublicReview(row: PublicReviewRow): PublicReview {
  return {
    id: row.id,
    name: row.author_name.trim(),
    rating: clampRating(row.rating),
    comment: row.comment.trim(),
    locale: row.locale,
    date: row.approved_at ?? row.created_at,
  }
}

export function clampRating(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(5, Math.max(1, Math.round(value)))
}

export interface ReviewSummary {
  count: number
  /** Mean rating rounded to one decimal; 0 when there are no reviews. */
  average: number
  /** Number of reviews per star value, 5 -> 1. */
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

export function summarizeReviews(reviews: readonly Pick<PublicReview, 'rating'>[]): ReviewSummary {
  const distribution: ReviewSummary['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let sum = 0
  for (const review of reviews) {
    const rating = clampRating(review.rating) as 1 | 2 | 3 | 4 | 5
    distribution[rating] += 1
    sum += rating
  }
  const count = reviews.length
  return {
    count,
    average: count === 0 ? 0 : Math.round((sum / count) * 10) / 10,
    distribution,
  }
}

/** Initials for the avatar bubble: first + last word ("Sara El Idrissi" -> "SI"). */
export function reviewerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = Array.from(parts[0])[0] ?? ''
  const last = parts.length > 1 ? (Array.from(parts[parts.length - 1])[0] ?? '') : ''
  return (first + last).toLocaleUpperCase()
}
