import Link from 'next/link'
import type React from 'react'
import type { Json } from '@/lib/supabase/database.types'
import { LOCALES, type Locale } from '@/lib/validation/locale'
import { pickI18n, type I18nMap } from '@/features/content/i18n-json'
import { CMS_STATUSES, EMPTY_I18N, type I18nText } from '@/features/cms/schema'
import { PageHeader as SharedPageHeader, SectionCard } from './ui'
import { AdminSelectField, DatePickerField } from './AdminFormControls'
import FileUploadField from './FileUploadField'

export const fieldClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'

export const labelClass = 'text-sm font-medium text-foreground'

// Re-exported from the shared admin kit so every page shares one header/card
// implementation. Existing call sites keep their `{ title, description }` API.
export const PageHeader = SharedPageHeader

export function AdminCard({
  children,
  title,
  description,
}: {
  children: React.ReactNode
  title?: string
  description?: string
}) {
  return (
    <SectionCard title={title} description={description}>
      {children}
    </SectionCard>
  )
}

export { SectionCard, StatCard, StatusBadge, EmptyState, FilterTabs, table } from './ui'

export function ErrorNotice({ error }: { error?: string | string[] }) {
  if (!error) return null
  return (
    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      Could not save this change. Please check the fields and try again.
    </p>
  )
}

export function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  name: string
  defaultValue?: string | number | null
  type?: string
  placeholder?: string
  required?: boolean
}) {
  if (type === 'date') {
    return (
      <DatePickerField
        id={name}
        label={label}
        name={name}
        defaultValue={defaultValue != null ? String(defaultValue) : ''}
        required={required}
      />
    )
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        className={fieldClass}
      />
    </div>
  )
}

export function FileField({
  label,
  name,
  help = 'Upload a JPG, PNG, or WebP image up to 5 MB. If selected, it replaces the current saved file on save.',
  accept = 'image/jpeg,image/png,image/webp',
  buttonLabel,
}: {
  label: string
  name: string
  help?: string
  accept?: string
  buttonLabel?: string
}) {
  return (
    <FileUploadField label={label} name={name} help={help} accept={accept} buttonLabel={buttonLabel} />
  )
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  dir,
  required,
}: {
  label: string
  name: string
  defaultValue?: string | null
  rows?: number
  dir?: 'ltr' | 'rtl'
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        dir={dir}
        defaultValue={defaultValue ?? ''}
        className={fieldClass}
      />
    </div>
  )
}

export function StatusSelect({ defaultValue = 'published' }: { defaultValue?: string | null }) {
  return (
    <AdminSelectField
      id="status"
      label="Status"
      name="status"
      options={CMS_STATUSES.map((status) => ({
        value: status,
        label: status === 'published' ? 'Published' : status === 'draft' ? 'Draft' : 'Archived',
      }))}
      defaultValue={defaultValue ?? 'published'}
    />
  )
}

export function i18nValues(value: Json | null | undefined): I18nText {
  return {
    ...EMPTY_I18N,
    fr: pickI18n(value as I18nMap, 'fr'),
    en: pickI18n(value as I18nMap, 'en', 'en'),
    ar: pickI18n(value as I18nMap, 'ar', 'ar'),
  }
}

export function I18nInputs({
  prefix,
  label,
  values,
  textarea,
  requiredFr = true,
}: {
  prefix: string
  label: string
  values: I18nText
  textarea?: boolean
  requiredFr?: boolean
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {LOCALES.map((locale: Locale) => {
        const name = `${prefix}.${locale}`
        const fieldLabel = `${label} (${locale.toUpperCase()})${requiredFr && locale === 'fr' ? ' *' : ''}`
        if (textarea) {
          return (
            <TextArea
              key={locale}
              label={fieldLabel}
              name={name}
              defaultValue={values[locale]}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              rows={5}
              required={requiredFr && locale === 'fr'}
            />
          )
        }
        return (
          <Field
            key={locale}
            label={fieldLabel}
            name={name}
            defaultValue={values[locale]}
            required={requiredFr && locale === 'fr'}
          />
        )
      })}
    </div>
  )
}

export function AdminBackLink({ href, label = 'Back' }: { href: string; label?: string }) {
  return (
    <Link href={href} className="text-sm font-medium text-primary hover:underline">
      {label}
    </Link>
  )
}
