import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Header from '@/components/layouts/Header'
import Footer from '@/components/layouts/Footer'
import { getPublishedCmsContent } from '@/features/cms/queries'
import { PROJECT_TYPES } from '@/features/freelance/schema'
import { localizedAlternates } from '@/i18n/metadata'
import type { Locale } from '@/lib/validation/locale'
import FreelanceLeadForm from './FreelanceLeadForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'freelance' })
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `/${locale}/freelance`,
      languages: localizedAlternates((l) => `/${l}/freelance`),
    },
  }
}

export default async function FreelancePage() {
  const locale = (await getLocale()) as Locale
  const [t, cms] = await Promise.all([
    getTranslations('freelance'),
    getPublishedCmsContent(locale),
  ])

  return (
    <div className="min-h-screen relative">
      <Header brandName={cms.about?.fullName} design={cms.design} />
      <main id="main-content" className="section-padding">
        <div className="container-main max-w-4xl">
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">{t('title')}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t('subtitle')}</p>
          </header>

          <section className="mb-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">{t('helpTitle')}</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {PROJECT_TYPES.map((value) => (
                <li key={value} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span aria-hidden className="size-1.5 rounded-full bg-primary" />
                  {t(`options.projectType.${value}`)}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">{t('intro')}</p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-foreground">{t('formTitle')}</h2>
            <FreelanceLeadForm />
          </section>
        </div>
      </main>
      <Footer links={cms.socialLinks} />
    </div>
  )
}
