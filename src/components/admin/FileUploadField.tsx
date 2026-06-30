'use client'

import { useId, useState } from 'react'
import { CheckCircle2, UploadCloud } from 'lucide-react'

export default function FileUploadField({
  label,
  name,
  help,
  accept,
  buttonLabel = 'Select file',
}: {
  label: string
  name: string
  help?: string
  accept?: string
  buttonLabel?: string
}) {
  const inputId = useId()
  const helpId = `${inputId}-help`
  const [fileName, setFileName] = useState('')
  const hasFile = Boolean(fileName)

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>

      <label
        htmlFor={inputId}
        className="group/upload flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background/80 p-3 transition-colors duration-200 hover:border-primary/50 hover:bg-primary/5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40"
      >
        <input
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          aria-describedby={help ? helpId : undefined}
          className="sr-only"
          onChange={(event) => {
            const selected = event.currentTarget.files?.[0]
            setFileName(selected?.name || '')
          }}
        />

        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-primary transition-colors duration-200 group-hover/upload:border-primary/40 group-hover/upload:bg-primary/10">
          {hasFile ? (
            <CheckCircle2 className="size-5" aria-hidden="true" />
          ) : (
            <UploadCloud className="size-5" aria-hidden="true" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            {buttonLabel}
          </span>
          {hasFile && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground" aria-live="polite">
              {fileName}
            </span>
          )}
        </span>

        {fileName && (
          <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-primary sm:inline-flex">
            Selected
          </span>
        )}
      </label>

      {help && (
        <p id={helpId} className="text-xs text-muted-foreground">
          {help}
        </p>
      )}
    </div>
  )
}
