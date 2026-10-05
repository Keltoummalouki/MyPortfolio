import { describe, expect, it } from 'vitest'
import { sortOldestFirst, startYear } from './timeline'

describe('startYear', () => {
  it('reads the first 4-digit year of a display date', () => {
    expect(startYear('2024 – 2026')).toBe(2024)
    expect(startYear('2023 — Present')).toBe(2023)
    expect(startYear('Sept 2021 - 2023')).toBe(2021)
    expect(startYear('')).toBeNull()
    expect(startYear('ongoing')).toBeNull()
  })
})

describe('sortOldestFirst', () => {
  it('orders by start year, keeps ties stable and puts undated items last', () => {
    const items = [
      { id: 'youcode', date: '2024 – 2026' },
      { id: 'undated', date: '' },
      { id: 'bac', date: '2023 – 2024' },
      { id: 'mooc', date: '2024' },
    ]
    expect(sortOldestFirst(items).map((item) => item.id)).toEqual(['bac', 'youcode', 'mooc', 'undated'])
  })

  it('does not mutate the input', () => {
    const items = [{ date: '2025' }, { date: '2020' }]
    sortOldestFirst(items)
    expect(items[0].date).toBe('2025')
  })
})
