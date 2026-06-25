'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  PROJECT_LOCALES,
  PROJECT_STATUSES,
  type ProjectFormState,
  type ProjectLocale,
  type ProjectStatus,
} from '@/features/content/projects.schema'

export interface ProjectFormDefaults {
  slug: string
  status: ProjectStatus
  featured: boolean
  sortOrder: number
  techStack: string
  repoUrl: string
  demoUrl: string
  coverImageUrl: string
  startedAt: string
  translations: Record<ProjectLocale, { title: string; description: string }>
}

interface ProjectFormProps {
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>
  submitLabel: string
  defaultValues?: ProjectFormDefaults
}

const EMPTY: ProjectFormDefaults = {
  slug: '',
  status: 'draft',
  featured: false,
  sortOrder: 0,
  techStack: '',
  repoUrl: '',
  demoUrl: '',
  coverImageUrl: '',
  startedAt: '',
  translations: {
    fr: { title: '', description: '' },
    en: { title: '', description: '' },
    ar: { title: '', description: '' },
  },
}

const LOCALE_LABELS: Record<ProjectLocale, string> = { fr: 'Français', en: 'English', ar: 'العربية' }

const field =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-[invalid=true]:border-destructive'
const labelClass = 'text-sm font-medium text-foreground'

export default function ProjectForm({ action, submitLabel, defaultValues }: ProjectFormProps) {
  const dv = defaultValues ?? EMPTY
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(action, {})
  const [activeLocale, setActiveLocale] = useState<ProjectLocale>('fr')
  const [titles, setTitles] = useState<Record<ProjectLocale, string>>({
    fr: dv.translations.fr.title,
    en: dv.translations.en.title,
    ar: dv.translations.ar.title,
  })

  const err = (key: string) => state.errors?.[key]

  return (
    <form action={formAction} className="max-w-3xl space-y-8" noValidate>
      {state.message && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.message}
        </p>
      )}

      {/* General fields */}
      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-foreground">Details</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="slug" className={labelClass}>Slug</label>
            <input id="slug" name="slug" defaultValue={dv.slug} required
              aria-invalid={err('slug') ? true : undefined} className={field} />
            {err('slug') && <p className="text-xs text-destructive">{err('slug')}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="status" className={labelClass}>Status</label>
            <select id="status" name="status" defaultValue={dv.status} className={field}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sortOrder" className={labelClass}>Sort order</label>
            <input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={dv.sortOrder}
              aria-invalid={err('sortOrder') ? true : undefined} className={field} />
            {err('sortOrder') && <p className="text-xs text-destructive">{err('sortOrder')}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="startedAt" className={labelClass}>Started at</label>
            <input id="startedAt" name="startedAt" type="date" defaultValue={dv.startedAt} className={field} />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <input id="featured" name="featured" type="checkbox" defaultChecked={dv.featured}
              className="size-4 rounded border-border" />
            <label htmlFor="featured" className={labelClass}>Featured</label>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="techStack" className={labelClass}>Tech stack <span className="text-muted-foreground">(comma-separated)</span></label>
            <input id="techStack" name="techStack" defaultValue={dv.techStack}
              placeholder="Next.js, TypeScript, PostgreSQL" className={field} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="repoUrl" className={labelClass}>Repository URL</label>
            <input id="repoUrl" name="repoUrl" type="url" defaultValue={dv.repoUrl}
              aria-invalid={err('repoUrl') ? true : undefined} className={field} />
            {err('repoUrl') && <p className="text-xs text-destructive">{err('repoUrl')}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="demoUrl" className={labelClass}>Live demo URL</label>
            <input id="demoUrl" name="demoUrl" type="url" defaultValue={dv.demoUrl}
              aria-invalid={err('demoUrl') ? true : undefined} className={field} />
            {err('demoUrl') && <p className="text-xs text-destructive">{err('demoUrl')}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="coverImageUrl" className={labelClass}>Cover image (URL or /path)</label>
            <input id="coverImageUrl" name="coverImageUrl" defaultValue={dv.coverImageUrl}
              placeholder="/images/project.png" aria-invalid={err('coverImageUrl') ? true : undefined}
              className={field} />
            {err('coverImageUrl') && <p className="text-xs text-destructive">{err('coverImageUrl')}</p>}
          </div>
        </div>
      </fieldset>

      {/* Translations */}
      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-foreground">Translations</legend>

        <div role="tablist" aria-label="Translation language" className="flex gap-1">
          {PROJECT_LOCALES.map((loc) => {
            const complete = titles[loc].trim().length > 0
            const active = loc === activeLocale
            return (
              <button
                key={loc}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveLocale(loc)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60',
                )}
              >
                {LOCALE_LABELS[loc]}
                <span
                  aria-hidden
                  className={cn('size-2 rounded-full', complete ? 'bg-emerald-500' : 'bg-muted-foreground/40')}
                />
                <span className="sr-only">{complete ? '(complete)' : '(empty)'}</span>
              </button>
            )
          })}
        </div>

        {PROJECT_LOCALES.map((loc) => (
          <div key={loc} hidden={loc !== activeLocale} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor={`${loc}.title`} className={labelClass}>
                Title {loc === 'fr' && <span className="text-destructive">*</span>}
              </label>
              <input
                id={`${loc}.title`}
                name={`${loc}.title`}
                defaultValue={dv.translations[loc].title}
                dir={loc === 'ar' ? 'rtl' : 'ltr'}
                aria-invalid={err(`translations.${loc}.title`) ? true : undefined}
                onChange={(e) => setTitles((t) => ({ ...t, [loc]: e.target.value }))}
                className={field}
              />
              {err(`translations.${loc}.title`) && (
                <p className="text-xs text-destructive">{err(`translations.${loc}.title`)}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`${loc}.description`} className={labelClass}>Description</label>
              <textarea
                id={`${loc}.description`}
                name={`${loc}.description`}
                defaultValue={dv.translations[loc].description}
                dir={loc === 'ar' ? 'rtl' : 'ltr'}
                rows={4}
                className={field}
              />
            </div>
          </div>
        ))}
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/projects">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
