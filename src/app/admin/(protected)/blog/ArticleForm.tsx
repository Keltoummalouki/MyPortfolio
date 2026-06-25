'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Markdown from '@/components/ui/Markdown'
import {
  ARTICLE_LOCALES,
  ARTICLE_STATUSES,
  type ArticleFormState,
  type ArticleLocale,
  type ArticleStatus,
} from '@/features/articles/schema'

interface TranslationDefaults {
  slug: string
  title: string
  excerpt: string
  body: string
  seoTitle: string
  seoDescription: string
}

export interface ArticleFormDefaults {
  status: ArticleStatus
  featured: boolean
  coverImageUrl: string
  authorName: string
  publishedAt: string
  translations: Record<ArticleLocale, TranslationDefaults>
}

interface ArticleFormProps {
  action: (state: ArticleFormState, formData: FormData) => Promise<ArticleFormState>
  submitLabel: string
  defaultValues?: ArticleFormDefaults
}

const emptyTranslation: TranslationDefaults = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  seoTitle: '',
  seoDescription: '',
}

const EMPTY: ArticleFormDefaults = {
  status: 'draft',
  featured: false,
  coverImageUrl: '',
  authorName: '',
  publishedAt: '',
  translations: { fr: emptyTranslation, en: emptyTranslation, ar: emptyTranslation },
}

const LOCALE_LABELS: Record<ArticleLocale, string> = { fr: 'Français', en: 'English', ar: 'العربية' }

const field =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-[invalid=true]:border-destructive'
const labelClass = 'text-sm font-medium text-foreground'

export default function ArticleForm({ action, submitLabel, defaultValues }: ArticleFormProps) {
  const dv = defaultValues ?? EMPTY
  const [state, formAction, pending] = useActionState<ArticleFormState, FormData>(action, {})
  const [activeLocale, setActiveLocale] = useState<ArticleLocale>('fr')
  const [preview, setPreview] = useState(false)
  const [titles, setTitles] = useState<Record<ArticleLocale, string>>({
    fr: dv.translations.fr.title,
    en: dv.translations.en.title,
    ar: dv.translations.ar.title,
  })
  const [bodies, setBodies] = useState<Record<ArticleLocale, string>>({
    fr: dv.translations.fr.body,
    en: dv.translations.en.body,
    ar: dv.translations.ar.body,
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

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-foreground">Article</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="status" className={labelClass}>Status</label>
            <select id="status" name="status" defaultValue={dv.status} className={field}>
              {ARTICLE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="publishedAt" className={labelClass}>Published date</label>
            <input id="publishedAt" name="publishedAt" type="date" defaultValue={dv.publishedAt} className={field} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="authorName" className={labelClass}>Author</label>
            <input id="authorName" name="authorName" defaultValue={dv.authorName} className={field} />
          </div>

          <div className="flex items-center gap-2">
            <input id="featured" name="featured" type="checkbox" defaultChecked={dv.featured} className="size-4 rounded border-border" />
            <label htmlFor="featured" className={labelClass}>Featured</label>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="coverImageUrl" className={labelClass}>Cover image (URL or /path)</label>
            <input id="coverImageUrl" name="coverImageUrl" defaultValue={dv.coverImageUrl}
              placeholder="/images/article.png" aria-invalid={err('coverImageUrl') ? true : undefined} className={field} />
            {err('coverImageUrl') && <p className="text-xs text-destructive">{err('coverImageUrl')}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-foreground">Translations</legend>

        <div role="tablist" aria-label="Translation language" className="flex gap-1">
          {ARTICLE_LOCALES.map((loc) => {
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
                <span aria-hidden className={cn('size-2 rounded-full', complete ? 'bg-emerald-500' : 'bg-muted-foreground/40')} />
                <span className="sr-only">{complete ? '(complete)' : '(empty)'}</span>
              </button>
            )
          })}
        </div>

        {ARTICLE_LOCALES.map((loc) => {
          const rtl = loc === 'ar'
          return (
            <div key={loc} hidden={loc !== activeLocale} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor={`${loc}.title`} className={labelClass}>
                    Title {loc === 'fr' && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    id={`${loc}.title`}
                    name={`${loc}.title`}
                    defaultValue={dv.translations[loc].title}
                    dir={rtl ? 'rtl' : 'ltr'}
                    aria-invalid={err(`translations.${loc}.title`) ? true : undefined}
                    onChange={(e) => setTitles((t) => ({ ...t, [loc]: e.target.value }))}
                    className={field}
                  />
                  {err(`translations.${loc}.title`) && (
                    <p className="text-xs text-destructive">{err(`translations.${loc}.title`)}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`${loc}.slug`} className={labelClass}>
                    Slug {loc === 'fr' && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    id={`${loc}.slug`}
                    name={`${loc}.slug`}
                    defaultValue={dv.translations[loc].slug}
                    placeholder="my-article"
                    aria-invalid={err(`translations.${loc}.slug`) ? true : undefined}
                    className={field}
                  />
                  {err(`translations.${loc}.slug`) && (
                    <p className="text-xs text-destructive">{err(`translations.${loc}.slug`)}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`${loc}.excerpt`} className={labelClass}>Excerpt</label>
                <textarea id={`${loc}.excerpt`} name={`${loc}.excerpt`} defaultValue={dv.translations[loc].excerpt}
                  dir={rtl ? 'rtl' : 'ltr'} rows={2} className={field} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor={`${loc}.body`} className={labelClass}>
                    Body (Markdown) {loc === 'fr' && <span className="text-destructive">*</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreview((p) => !p)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {preview ? 'Edit' : 'Preview'}
                  </button>
                </div>
                <textarea
                  id={`${loc}.body`}
                  name={`${loc}.body`}
                  value={bodies[loc]}
                  onChange={(e) => setBodies((b) => ({ ...b, [loc]: e.target.value }))}
                  dir={rtl ? 'rtl' : 'ltr'}
                  rows={14}
                  hidden={preview}
                  aria-invalid={err(`translations.${loc}.bodyMarkdown`) ? true : undefined}
                  className={cn(field, 'font-mono')}
                />
                {preview && (
                  <div className="min-h-40 rounded-md border border-border bg-background p-4" dir={rtl ? 'rtl' : 'ltr'}>
                    {bodies[loc].trim() ? (
                      <Markdown>{bodies[loc]}</Markdown>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nothing to preview.</p>
                    )}
                  </div>
                )}
                {err(`translations.${loc}.bodyMarkdown`) && (
                  <p className="text-xs text-destructive">{err(`translations.${loc}.bodyMarkdown`)}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor={`${loc}.seoTitle`} className={labelClass}>SEO title</label>
                  <input id={`${loc}.seoTitle`} name={`${loc}.seoTitle`} defaultValue={dv.translations[loc].seoTitle}
                    dir={rtl ? 'rtl' : 'ltr'} className={field} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor={`${loc}.seoDescription`} className={labelClass}>SEO description</label>
                  <input id={`${loc}.seoDescription`} name={`${loc}.seoDescription`} defaultValue={dv.translations[loc].seoDescription}
                    dir={rtl ? 'rtl' : 'ltr'} className={field} />
                </div>
              </div>
            </div>
          )
        })}
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/blog">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
