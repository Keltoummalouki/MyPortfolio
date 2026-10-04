import { describe, expect, it } from 'vitest'
import { pagePath, pageTokens, paginate, parsePageParam, totalPagesFor } from './pagination'

describe('parsePageParam', () => {
  it('accepts positive integers', () => {
    expect(parsePageParam('3')).toBe(3)
    expect(parsePageParam(['2', '9'])).toBe(2)
    expect(parsePageParam(' 4 ')).toBe(4)
  })

  it('falls back to page 1 for anything else', () => {
    for (const value of [undefined, null, '', '0', '-2', '1.5', 'abc', '2abc', '99999999999999999999']) {
      expect(parsePageParam(value)).toBe(1)
    }
  })
})

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5, 6, 7]

  it('slices a page and reports navigation state', () => {
    expect(paginate(items, 2, 3)).toEqual({
      items: [4, 5, 6],
      page: 2,
      totalPages: 3,
      total: 7,
      perPage: 3,
      hasPrev: true,
      hasNext: true,
    })
  })

  it('clamps out-of-range pages', () => {
    expect(paginate(items, 99, 3)).toMatchObject({ page: 3, items: [7], hasNext: false })
    expect(paginate(items, 0, 3)).toMatchObject({ page: 1, items: [1, 2, 3], hasPrev: false })
  })

  it('treats an empty list as one empty page', () => {
    expect(paginate([], 1, 6)).toMatchObject({ items: [], page: 1, totalPages: 1, hasPrev: false, hasNext: false })
  })
})

describe('totalPagesFor', () => {
  it('rounds up and never returns less than one page', () => {
    expect(totalPagesFor(7, 3)).toBe(3)
    expect(totalPagesFor(6, 3)).toBe(2)
    expect(totalPagesFor(0, 3)).toBe(1)
    expect(totalPagesFor(5, 0)).toBe(1)
  })
})

describe('pageTokens', () => {
  it('lists every page when they all fit', () => {
    expect(pageTokens(1, 1)).toEqual([1])
    expect(pageTokens(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses distant runs into ellipses around the current page', () => {
    expect(pageTokens(6, 10)).toEqual([1, 'ellipsis-start', 5, 6, 7, 'ellipsis-end', 10])
    expect(pageTokens(1, 10)).toEqual([1, 2, 'ellipsis-end', 10])
    expect(pageTokens(10, 10)).toEqual([1, 'ellipsis-start', 9, 10])
  })

  it('shows a single skipped page instead of an ellipsis', () => {
    expect(pageTokens(4, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 10])
    expect(pageTokens(7, 10)).toEqual([1, 'ellipsis-start', 6, 7, 8, 9, 10])
  })

  it('clamps the current page', () => {
    expect(pageTokens(50, 10)).toEqual(pageTokens(10, 10))
  })
})

describe('pagePath', () => {
  it('keeps page 1 on the bare (canonical) path', () => {
    expect(pagePath('/projects', 1)).toBe('/projects')
    expect(pagePath('/projects', 3)).toBe('/projects?page=3')
  })
})
