'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Bold,
  Code,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pencil,
  Quote,
  SquareCode,
  Table as TableIcon,
} from 'lucide-react'
import Markdown from '@/components/ui/Markdown'
import { cn } from '@/lib/utils'
import { applyMarkdownAction, type MarkdownAction } from './markdownFormat'

interface ToolItem {
  action: MarkdownAction
  label: string
  icon: ReactNode
}

// Grouped so the toolbar can render visual separators between families of tools.
const TOOL_GROUPS: ToolItem[][] = [
  [
    { action: 'h1', label: 'Heading 1', icon: <Heading1 className="size-4" /> },
    { action: 'h2', label: 'Heading 2', icon: <Heading2 className="size-4" /> },
    { action: 'h3', label: 'Heading 3', icon: <Heading3 className="size-4" /> },
  ],
  [
    { action: 'bold', label: 'Bold', icon: <Bold className="size-4" /> },
    { action: 'italic', label: 'Italic', icon: <Italic className="size-4" /> },
    { action: 'inlineCode', label: 'Inline code', icon: <Code className="size-4" /> },
  ],
  [
    { action: 'bulletList', label: 'Bulleted list', icon: <List className="size-4" /> },
    { action: 'numberedList', label: 'Numbered list', icon: <ListOrdered className="size-4" /> },
    { action: 'blockquote', label: 'Quote', icon: <Quote className="size-4" /> },
  ],
  [
    { action: 'link', label: 'Link', icon: <Link2 className="size-4" /> },
    { action: 'codeBlock', label: 'Code block', icon: <SquareCode className="size-4" /> },
    { action: 'table', label: 'Table', icon: <TableIcon className="size-4" /> },
    { action: 'hr', label: 'Horizontal rule', icon: <Minus className="size-4" /> },
  ],
]

interface MarkdownEditorProps {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  dir?: 'ltr' | 'rtl'
  ariaInvalid?: boolean
  rows?: number
}

/**
 * Markdown-first rich editor: a shadcn-styled toolbar inserts Markdown syntax at
 * the caret of a plain textarea, so the textarea value *is* the stored Markdown
 * and submits through the normal Server Action field. Preview reuses the shared
 * sanitized `Markdown` renderer — no raw/unsafe HTML is ever produced.
 */
export default function MarkdownEditor({
  id,
  name,
  value,
  onChange,
  dir = 'ltr',
  ariaInvalid,
  rows = 14,
}: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const pendingSelection = useRef<{ start: number; end: number } | null>(null)
  const [preview, setPreview] = useState(false)

  // After a toolbar action updates the controlled value, restore the caret to
  // the formatted range so typing can continue seamlessly.
  useEffect(() => {
    const next = pendingSelection.current
    if (next && ref.current) {
      ref.current.focus()
      ref.current.setSelectionRange(next.start, next.end)
      pendingSelection.current = null
    }
  })

  function run(action: MarkdownAction) {
    const textarea = ref.current
    if (!textarea) return
    const result = applyMarkdownAction(action, {
      value: textarea.value,
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    })
    pendingSelection.current = { start: result.start, end: result.end }
    onChange(result.value)
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border bg-card',
        ariaInvalid ? 'border-destructive' : 'border-border',
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-1.5">
        {TOOL_GROUPS.map((group, groupIndex) => (
          <div key={group[0].action} className="flex items-center gap-0.5">
            {groupIndex > 0 && <span aria-hidden className="mx-1 h-5 w-px bg-border" />}
            {group.map((tool) => (
              <button
                key={tool.action}
                type="button"
                title={tool.label}
                aria-label={tool.label}
                disabled={preview}
                onClick={() => run(tool.action)}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                {tool.icon}
              </button>
            ))}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="ms-auto inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-accent"
        >
          {preview ? <Pencil className="size-3.5" /> : <Eye className="size-3.5" />}
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Stays mounted (only visually hidden) during preview so its value still submits. */}
      <textarea
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        rows={rows}
        hidden={preview}
        aria-invalid={ariaInvalid ? true : undefined}
        className="w-full resize-y border-0 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus-visible:ring-0"
      />

      {preview && (
        <div className="min-h-40 bg-background p-4" dir={dir}>
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  )
}
