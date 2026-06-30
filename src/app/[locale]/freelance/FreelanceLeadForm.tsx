'use client'

import { useActionState, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TurnstileWidget from '@/components/ui/TurnstileWidget'
import { submitFreelanceLeadAction } from '@/features/freelance/actions'
import {
  BUDGET_RANGES,
  CONTACT_PREFERENCES,
  PROJECT_TYPES,
  TIMELINES,
  type LeadSubmitState,
} from '@/features/freelance/schema'

const field =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-[invalid=true]:border-destructive'
const labelClass = 'text-sm font-medium text-foreground'

export default function FreelanceLeadForm() {
  const t = useTranslations('freelance')
  const [state, formAction, pending] = useActionState<LeadSubmitState, FormData>(
    submitFreelanceLeadAction,
    {},
  )
  const [token, setToken] = useState<string | null>(null)

  const err = (key: string) => state.errors?.[key]

  if (state.ok) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center"
      >
        <CheckCircle className="text-emerald-500" />
        <p className="font-medium text-foreground">{t('form.success')}</p>
      </div>
    )
  }

  const selectGroup = (
    name: string,
    label: string,
    options: readonly string[],
    optionGroup: string,
  ) => (
    <div className="space-y-1.5">
      <label htmlFor={name} className={labelClass}>{label}</label>
      <select id={name} name={name} defaultValue="" className={field}>
        <option value="">{t('form.selectPlaceholder')}</option>
        {options.map((value) => (
          <option key={value} value={value}>
            {t(`options.${optionGroup}.${value}`)}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error && state.error !== 'invalid' && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {t('form.errorGeneric')}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className={labelClass}>
            {t('form.name')} <span className="text-destructive">*</span>
          </label>
          <input id="name" name="name" autoComplete="name" required
            aria-invalid={err('name') ? true : undefined} className={field} />
          {err('name') && <p className="text-xs text-destructive">{t('form.errors.nameRequired')}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className={labelClass}>
            {t('form.email')} <span className="text-destructive">*</span>
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required
            aria-invalid={err('email') ? true : undefined} className={field} />
          {err('email') && <p className="text-xs text-destructive">{t('form.errors.emailInvalid')}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="company" className={labelClass}>{t('form.company')}</label>
          <input id="company" name="company" autoComplete="organization" className={field} />
        </div>

        {selectGroup('projectType', t('form.projectType'), PROJECT_TYPES, 'projectType')}
        {selectGroup('budget', t('form.budget'), BUDGET_RANGES, 'budget')}
        {selectGroup('timeline', t('form.timeline'), TIMELINES, 'timeline')}
        {selectGroup('contactPreference', t('form.contactPreference'), CONTACT_PREFERENCES, 'contactPreference')}

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="details" className={labelClass}>
            {t('form.details')} <span className="text-destructive">*</span>
          </label>
          <textarea id="details" name="details" rows={6} required
            placeholder={t('form.detailsPlaceholder')}
            aria-invalid={err('details') ? true : undefined} className={field} />
          {err('details') && <p className="text-xs text-destructive">{t('form.errors.detailsRequired')}</p>}
        </div>
      </div>

      <TurnstileWidget onToken={setToken} />
      <input type="hidden" name="turnstileToken" value={token ?? ''} />

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? t('form.sending') : t('form.submit')}
      </Button>
    </form>
  )
}
