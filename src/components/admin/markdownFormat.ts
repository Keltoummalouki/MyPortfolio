// Pure Markdown formatting transforms for the admin article editor toolbar.
// Intentionally free of DOM/React imports so the logic is unit-testable in the
// Node test environment and reused by the editor's textarea handlers. Every
// action returns the new text plus the selection range to restore, letting the
// editor keep the caret on the freshly formatted content.

export type MarkdownAction =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bold'
  | 'italic'
  | 'inlineCode'
  | 'codeBlock'
  | 'link'
  | 'bulletList'
  | 'numberedList'
  | 'blockquote'
  | 'table'
  | 'hr'

export interface Selection {
  value: string
  start: number
  end: number
}

export interface FormatResult {
  value: string
  start: number
  end: number
}

const HEADING_PREFIX: Record<'h1' | 'h2' | 'h3', string> = {
  h1: '# ',
  h2: '## ',
  h3: '### ',
}

const TABLE_TEMPLATE = ['| Column | Column |', '| --- | --- |', '| Cell | Cell |'].join('\n')

function wrapInline(sel: Selection, marker: string, placeholder: string): FormatResult {
  const selected = sel.value.slice(sel.start, sel.end) || placeholder
  const value = sel.value.slice(0, sel.start) + marker + selected + marker + sel.value.slice(sel.end)
  const start = sel.start + marker.length
  return { value, start, end: start + selected.length }
}

/** Grow the selection to cover the full lines it touches. */
function expandToLines(sel: Selection): { lineStart: number; lineEnd: number } {
  const lineStart = sel.value.lastIndexOf('\n', sel.start - 1) + 1
  let lineEnd = sel.value.indexOf('\n', sel.end)
  if (lineEnd === -1) lineEnd = sel.value.length
  return { lineStart, lineEnd }
}

/** Apply a per-line transform across every selected line. */
function mapLines(sel: Selection, fn: (line: string, index: number) => string): FormatResult {
  const { lineStart, lineEnd } = expandToLines(sel)
  const block = sel.value.slice(lineStart, lineEnd)
  const replaced = block.split('\n').map(fn).join('\n')
  const value = sel.value.slice(0, lineStart) + replaced + sel.value.slice(lineEnd)
  return { value, start: lineStart, end: lineStart + replaced.length }
}

/** Insert a block on its own lines, adding blank-line padding only when needed. */
function insertBlock(sel: Selection, block: string): FormatResult {
  const before = sel.value.slice(0, sel.start)
  const after = sel.value.slice(sel.end)
  const leading = before === '' || before.endsWith('\n') ? '' : '\n'
  const trailing = after === '' || after.startsWith('\n') ? '' : '\n'
  const value = before + leading + block + trailing + after
  const start = sel.start + leading.length
  return { value, start, end: start + block.length }
}

export function applyMarkdownAction(action: MarkdownAction, sel: Selection): FormatResult {
  switch (action) {
    case 'h1':
    case 'h2':
    case 'h3':
      return mapLines(sel, (line) => HEADING_PREFIX[action] + line.replace(/^#{1,6}\s+/, ''))
    case 'bold':
      return wrapInline(sel, '**', 'bold text')
    case 'italic':
      return wrapInline(sel, '*', 'italic text')
    case 'inlineCode':
      return wrapInline(sel, '`', 'code')
    case 'blockquote':
      return mapLines(sel, (line) => '> ' + line.replace(/^>\s?/, ''))
    case 'bulletList':
      return mapLines(sel, (line) => '- ' + line.replace(/^[-*]\s+/, ''))
    case 'numberedList':
      return mapLines(sel, (line, i) => `${i + 1}. ` + line.replace(/^\d+\.\s+/, ''))
    case 'link': {
      const selected = sel.value.slice(sel.start, sel.end) || 'text'
      const prefix = `[${selected}](`
      const value = sel.value.slice(0, sel.start) + prefix + 'url)' + sel.value.slice(sel.end)
      const start = sel.start + prefix.length
      return { value, start, end: start + 'url'.length }
    }
    case 'codeBlock': {
      const selected = sel.value.slice(sel.start, sel.end) || 'code'
      return insertBlock(sel, '```\n' + selected + '\n```')
    }
    case 'table':
      return insertBlock(sel, TABLE_TEMPLATE)
    case 'hr':
      return insertBlock(sel, '---')
  }
}
