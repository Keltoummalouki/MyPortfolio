// Pure pagination helpers shared by the projects list (server, `?page=N`), the
// home projects section and the reviews list (client state). No React here.

export interface PageSlice<T> {
  items: T[]
  /** 1-based, clamped to [1, totalPages]. */
  page: number
  totalPages: number
  total: number
  perPage: number
  hasPrev: boolean
  hasNext: boolean
}

/** Parse a `?page=` value: positive integers only; anything else is page 1. */
export function parsePageParam(value: string | string[] | undefined | null): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || !/^\d+$/.test(raw.trim())) return 1
  const page = Number.parseInt(raw.trim(), 10)
  return Number.isSafeInteger(page) && page >= 1 ? page : 1
}

export function totalPagesFor(total: number, perPage: number): number {
  if (perPage <= 0) return 1
  return Math.max(1, Math.ceil(Math.max(0, total) / perPage))
}

/** Slice `items` for a 1-based `page`, clamping out-of-range pages. */
export function paginate<T>(items: readonly T[], page: number, perPage: number): PageSlice<T> {
  const size = Math.max(1, Math.floor(perPage))
  const totalPages = totalPagesFor(items.length, size)
  const current = Math.min(Math.max(1, Math.floor(page) || 1), totalPages)
  const start = (current - 1) * size
  return {
    items: items.slice(start, start + size),
    page: current,
    totalPages,
    total: items.length,
    perPage: size,
    hasPrev: current > 1,
    hasNext: current < totalPages,
  }
}

export type PageToken = number | 'ellipsis-start' | 'ellipsis-end'

/**
 * Compact page list: always the first and last page, `siblings` pages around
 * the current one, and an ellipsis for each skipped run. A gap of exactly one
 * page shows that page instead of an ellipsis.
 *   pageTokens(6, 10) -> [1, 'ellipsis-start', 5, 6, 7, 'ellipsis-end', 10]
 */
export function pageTokens(current: number, totalPages: number, siblings = 1): PageToken[] {
  const total = Math.max(1, Math.floor(totalPages))
  const page = Math.min(Math.max(1, Math.floor(current) || 1), total)
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

  // first + last + current + 2*siblings + 2 ellipses
  if (total <= siblings * 2 + 5) return range(1, total)

  const left = Math.max(page - siblings, 2)
  const right = Math.min(page + siblings, total - 1)
  const tokens: PageToken[] = [1]

  if (left > 3) tokens.push('ellipsis-start')
  else tokens.push(...range(2, left - 1))

  tokens.push(...range(left, right))

  if (right < total - 2) tokens.push('ellipsis-end')
  else tokens.push(...range(right + 1, total - 1))

  tokens.push(total)
  return tokens
}

/** Locale-less path for a page of a list: page 1 is the bare path (canonical). */
export function pagePath(basePath: string, page: number): string {
  return page > 1 ? `${basePath}?page=${page}` : basePath
}
