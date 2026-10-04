import { describe, expect, it } from 'vitest'
import { reviewerInitials, summarizeReviews, toPublicReview } from './map'
import { reviewFormSchema, reviewStatusSchema } from './schema'

const valid = { name: 'Sara El Idrissi', rating: '5', comment: 'Great collaboration, clear and fast.', locale: 'fr' }

describe('reviewFormSchema', () => {
  it('accepts a valid review and coerces the rating', () => {
    const result = reviewFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.rating).toBe(5)
  })

  it('trims and bounds the name', () => {
    expect(reviewFormSchema.safeParse({ ...valid, name: ' a ' }).success).toBe(false)
    expect(reviewFormSchema.safeParse({ ...valid, name: 'x'.repeat(81) }).success).toBe(false)
  })

  it('requires a whole rating between 1 and 5', () => {
    for (const rating of ['', '0', '6', '4.5', 'abc']) {
      const result = reviewFormSchema.safeParse({ ...valid, rating })
      expect(result.success).toBe(false)
      if (!result.success) expect(result.error.issues[0]?.message).toBe('ratingRequired')
    }
  })

  it('bounds the comment length', () => {
    expect(reviewFormSchema.safeParse({ ...valid, comment: 'too short' }).success).toBe(false)
    expect(reviewFormSchema.safeParse({ ...valid, comment: 'x'.repeat(1001) }).success).toBe(false)
  })

  it('rejects unknown locales', () => {
    expect(reviewFormSchema.safeParse({ ...valid, locale: 'de' }).success).toBe(false)
  })
})

describe('reviewStatusSchema', () => {
  it('only accepts moderation statuses', () => {
    expect(reviewStatusSchema.safeParse('approved').success).toBe(true)
    expect(reviewStatusSchema.safeParse('published').success).toBe(false)
  })
})

describe('toPublicReview', () => {
  it('maps a row, trims text and prefers the approval date', () => {
    expect(
      toPublicReview({
        id: '1',
        author_name: ' Sara ',
        rating: 4,
        comment: ' Nice work ',
        locale: 'en',
        approved_at: '2026-10-02T10:00:00Z',
        created_at: '2026-10-01T10:00:00Z',
      }),
    ).toEqual({ id: '1', name: 'Sara', rating: 4, comment: 'Nice work', locale: 'en', date: '2026-10-02T10:00:00Z' })
  })

  it('falls back to the creation date and clamps ratings', () => {
    const review = toPublicReview({
      id: '2',
      author_name: 'A',
      rating: 9,
      comment: 'c',
      locale: 'fr',
      approved_at: null,
      created_at: '2026-10-01T10:00:00Z',
    })
    expect(review.date).toBe('2026-10-01T10:00:00Z')
    expect(review.rating).toBe(5)
  })
})

describe('summarizeReviews', () => {
  it('computes count, rounded average and distribution', () => {
    expect(summarizeReviews([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toEqual({
      count: 3,
      average: 4.3,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 1 },
    })
  })

  it('handles no reviews', () => {
    expect(summarizeReviews([])).toMatchObject({ count: 0, average: 0 })
  })
})

describe('reviewerInitials', () => {
  it('uses the first and last word', () => {
    expect(reviewerInitials('Sara El Idrissi')).toBe('SI')
    expect(reviewerInitials('karim')).toBe('K')
    expect(reviewerInitials('  ')).toBe('?')
    expect(reviewerInitials('كلثوم ملوكي')).toBe('كم')
  })
})
