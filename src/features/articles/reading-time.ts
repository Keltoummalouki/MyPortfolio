// Reading time estimate, computed consistently from a Markdown body at render
// time (~200 words per minute). Pure and unit-testable.

const WORDS_PER_MINUTE = 200

export function readingMinutes(markdown: string | null | undefined): number {
  if (!markdown) return 1
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
