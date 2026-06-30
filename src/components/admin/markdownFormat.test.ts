import { describe, it, expect } from 'vitest'
import { applyMarkdownAction, type Selection } from './markdownFormat'

const sel = (value: string, start: number, end = start): Selection => ({ value, start, end })

describe('applyMarkdownAction', () => {
  it('wraps a selection in bold and keeps the inner text selected', () => {
    const r = applyMarkdownAction('bold', sel('hello world', 6, 11))
    expect(r.value).toBe('hello **world**')
    expect(r.value.slice(r.start, r.end)).toBe('world')
  })

  it('inserts a bold placeholder when nothing is selected', () => {
    const r = applyMarkdownAction('bold', sel('', 0))
    expect(r.value).toBe('**bold text**')
    expect(r.value.slice(r.start, r.end)).toBe('bold text')
  })

  it('wraps a selection in italics', () => {
    const r = applyMarkdownAction('italic', sel('word', 0, 4))
    expect(r.value).toBe('*word*')
  })

  it('prefixes the current line with a heading and replaces an existing one', () => {
    const r = applyMarkdownAction('h2', sel('### Title', 5))
    expect(r.value).toBe('## Title')
  })

  it('turns multiple selected lines into a bulleted list', () => {
    const r = applyMarkdownAction('bulletList', sel('one\ntwo', 0, 7))
    expect(r.value).toBe('- one\n- two')
  })

  it('numbers each selected line incrementally', () => {
    const r = applyMarkdownAction('numberedList', sel('a\nb\nc', 0, 5))
    expect(r.value).toBe('1. a\n2. b\n3. c')
  })

  it('prefixes selected lines with a blockquote marker', () => {
    const r = applyMarkdownAction('blockquote', sel('quote me', 0, 8))
    expect(r.value).toBe('> quote me')
  })

  it('builds a link with the selection as the label and selects the url', () => {
    const r = applyMarkdownAction('link', sel('docs', 0, 4))
    expect(r.value).toBe('[docs](url)')
    expect(r.value.slice(r.start, r.end)).toBe('url')
  })

  it('wraps a selection in a fenced code block on its own lines', () => {
    const r = applyMarkdownAction('codeBlock', sel('let x = 1', 0, 9))
    expect(r.value).toBe('```\nlet x = 1\n```')
  })

  it('inserts a GFM table template padded onto its own line', () => {
    const r = applyMarkdownAction('table', sel('Intro.', 6))
    expect(r.value).toBe('Intro.\n| Column | Column |\n| --- | --- |\n| Cell | Cell |')
  })

  it('inserts a horizontal rule', () => {
    const r = applyMarkdownAction('hr', sel('', 0))
    expect(r.value).toBe('---')
  })
})
