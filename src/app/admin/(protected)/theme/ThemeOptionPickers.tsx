'use client'

import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CURSOR_OPTIONS, FONT_OPTIONS, type CursorKey, type FontKey } from '@/features/cms/design-options'

const FONT_PAGE_SIZE = 4
const CURSOR_PAGE_SIZE = 4

function pageCount(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize))
}

function initialPage<T extends { value: string }>(items: readonly T[], selected: string, pageSize: number) {
  const index = Math.max(0, items.findIndex((item) => item.value === selected))
  return Math.floor(index / pageSize) + 1
}

function PickerPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  label,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  label: string
  onPageChange: (page: number) => void
}) {
  if (totalItems <= pageSize) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(totalItems, page * pageSize)

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}</span>–
        <span className="font-medium text-foreground">{end}</span> of{' '}
        <span className="font-medium text-foreground">{totalItems}</span> {label}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
          <Button
            key={item}
            type="button"
            variant={item === page ? 'default' : 'outline'}
            size="sm"
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}

function FontCard({
  option,
  selected,
  onSelect,
}: {
  option: (typeof FONT_OPTIONS)[number]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'group h-full rounded-2xl border border-border bg-background/70 p-4 text-left transition duration-200 hover:border-primary/50 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        selected && 'border-primary bg-primary/10',
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-sm font-semibold text-foreground">{option.label}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{option.tone}</span>
        </span>
        <span
          className={cn(
            'rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground',
            selected && 'border-primary/40 text-primary',
          )}
        >
          {selected ? 'Selected' : 'Font'}
        </span>
      </span>
      <span className="mt-4 block text-2xl font-bold leading-none text-foreground" style={{ fontFamily: option.stack }}>
        Aa Portfolio
      </span>
      <span className="mt-2 block text-sm text-muted-foreground" style={{ fontFamily: option.stack }}>
        Keltoum Malouki — dynamic CMS
      </span>
    </button>
  )
}

export function PaginatedFontPicker({
  title,
  description,
  name,
  selected,
}: {
  title: string
  description: string
  name: 'fontBody' | 'fontHeading'
  selected: FontKey
}) {
  const [value, setValue] = useState<FontKey>(selected)
  const [page, setPage] = useState(() => initialPage(FONT_OPTIONS, selected, FONT_PAGE_SIZE))
  const totalPages = pageCount(FONT_OPTIONS.length, FONT_PAGE_SIZE)
  const visibleOptions = useMemo(
    () => FONT_OPTIONS.slice((page - 1) * FONT_PAGE_SIZE, page * FONT_PAGE_SIZE),
    [page],
  )

  return (
    <section className="space-y-3">
      <input type="hidden" name={name} value={value} />
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {visibleOptions.map((option) => (
          <FontCard
            key={`${name}-${option.value}`}
            option={option}
            selected={value === option.value}
            onSelect={() => setValue(option.value)}
          />
        ))}
      </div>
      <PickerPagination
        page={page}
        totalPages={totalPages}
        totalItems={FONT_OPTIONS.length}
        pageSize={FONT_PAGE_SIZE}
        label="fonts"
        onPageChange={setPage}
      />
    </section>
  )
}

function CursorCard({
  option,
  selected,
  onSelect,
}: {
  option: (typeof CURSOR_OPTIONS)[number]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'h-full rounded-2xl border border-border bg-background/70 p-4 text-left transition duration-200 hover:border-primary/50 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        selected && 'border-primary bg-primary/10',
      )}
      style={{ cursor: option.previewCursor } as CSSProperties}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">{option.label}</span>
        <span className={cn('flex size-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10', selected && 'bg-primary text-primary-foreground')}>
          {selected && <Check className="size-4" aria-hidden="true" />}
        </span>
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{option.tone}</span>
      <span className="mt-4 flex h-14 items-center justify-center rounded-xl border border-dashed border-border bg-card/60 text-xs text-muted-foreground">
        Hover here
      </span>
    </button>
  )
}

export function PaginatedCursorPicker({ selected }: { selected: CursorKey }) {
  const [value, setValue] = useState<CursorKey>(selected)
  const [page, setPage] = useState(() => initialPage(CURSOR_OPTIONS, selected, CURSOR_PAGE_SIZE))
  const totalPages = pageCount(CURSOR_OPTIONS.length, CURSOR_PAGE_SIZE)
  const visibleOptions = useMemo(
    () => CURSOR_OPTIONS.slice((page - 1) * CURSOR_PAGE_SIZE, page * CURSOR_PAGE_SIZE),
    [page],
  )

  return (
    <section className="space-y-3">
      <input type="hidden" name="cursorStyle" value={value} />
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Cursor style</h2>
        <p className="mt-1 text-xs text-muted-foreground">Hover the preview area to feel the cursor before saving.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {visibleOptions.map((option) => (
          <CursorCard
            key={option.value}
            option={option}
            selected={value === option.value}
            onSelect={() => setValue(option.value)}
          />
        ))}
      </div>
      <PickerPagination
        page={page}
        totalPages={totalPages}
        totalItems={CURSOR_OPTIONS.length}
        pageSize={CURSOR_PAGE_SIZE}
        label="cursor styles"
        onPageChange={setPage}
      />
    </section>
  )
}
