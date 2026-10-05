// Pure ordering helpers for timeline-style sections (client-safe).

/** First 4-digit year in a display date ("2023 — 2024", "Sept 2024 – Present"), or null. */
export function startYear(date: string): number | null {
  const match = /\b(\d{4})\b/.exec(date)
  return match ? Number(match[1]) : null
}

/**
 * Oldest first by start year, whatever order the CMS returns. Ties keep their
 * original order; undated items go last.
 */
export function sortOldestFirst<T extends { date: string }>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index, year: startYear(item.date) ?? Number.POSITIVE_INFINITY }))
    .sort((a, b) => a.year - b.year || a.index - b.index)
    .map(({ item }) => item)
}
