import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { localizedAlternates } from '@/i18n/metadata'
import { getPublishedDesignSettings } from '@/features/cms/queries'
import DesignSettingsStyle from '@/components/ui/DesignSettingsStyle'

// Note: no `generateStaticParams` — public pages read Supabase per request, so
// the locale subtree is rendered on demand (always reflects published content).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const hero = await getTranslations({ locale, namespace: 'hero' })
  const about = await getTranslations({ locale, namespace: 'about' })
  const title = `${hero('name')} | ${hero('role')}`
  const description = about('description')

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: localizedAlternates((l) => `/${l}`),
    },
    openGraph: { title, description, locale },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Enable static rendering for this locale segment.
  setRequestLocale(locale)

  const [messages, design] = await Promise.all([getMessages(), getPublishedDesignSettings()])
  return (
    <NextIntlClientProvider messages={messages}>
      <DesignSettingsStyle settings={design} />
      {children}
    </NextIntlClientProvider>
  )
}
