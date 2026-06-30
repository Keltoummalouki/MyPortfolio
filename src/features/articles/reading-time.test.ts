import { describe, it, expect } from 'vitest'
import { readingMinutes } from './reading-time'

describe('readingMinutes', () => {
  it('returns at least 1 minute for short or empty content', () => {
    expect(readingMinutes('')).toBe(1)
    expect(readingMinutes(null)).toBe(1)
    expect(readingMinutes('a few words here')).toBe(1)
  })

  it('scales with word count (~200 wpm)', () => {
    const words = Array.from({ length: 600 }, () => 'word').join(' ')
    expect(readingMinutes(words)).toBe(3)
  })
})
