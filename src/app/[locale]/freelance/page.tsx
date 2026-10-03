import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Header from '@/components/layouts/Header'
import Footer from '@/components/layouts/Footer'
import JsonLd from '@/components/seo/JsonLd'
import { getPublishedCmsContent } from '@/features/cms/queries'
import { PROJECT_TYPES } from '@/features/freelance/schema'
import {
  breadcrumbSchema,
  jsonLdGraph,
  organizationSchema,
  personInputFromCms,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/features/seo/jsonld'
import { buildPageMetadata } from '@/features/seo/metadata'
import { SCHEMA_IDS, localePath } from '@/features/seo/site'
import type { Locale } from '@/lib/validation/locale'
import FreelanceLeadForm from './FreelanceLeadForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const seo = await getTranslations({ locale, namespace: 'seo' })
  return buildPageMetadata({
    locale,
    path: '/freelance',
    title: seo('freelanceTitle'),
    absoluteTitle: true,
    description: seo('freelanceDescription'),
    // Explicit: a page-level `openGraph` replaces the layout's file-based image.
    images: [{ url: localePath(locale, '/opengraph-image'), width: 1200, height: 630, alt: seo('ogImageAlt') }],
  })
}

export default async function FreelancePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = (await params).locale as Locale
  const [t, seo, nav, hero, cms] = await Promise.all([
    getTranslations({ locale, namespace: 'freelance' }),
    getTranslations({ locale, namespace: 'seo' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'hero' }),
    getPublishedCmsContent(locale),
  ])

  const pagePath = localePath(locale, '/freelance')
  const person = personInputFromCms(cms, { jobTitle: hero('role'), description: seo('defaultDescription') })
  const jsonLd = jsonLdGraph(
    webPageSchema({
      path: pagePath,
      name: seo('freelanceTitle'),
      description: seo('freelanceDescription'),
      locale,
      mainEntityId: SCHEMA_IDS.organization,
      hasBreadcrumb: true,
    }),
    organizationSchema({ description: seo('organizationDescription'), sameAs: person.sameAs }),
    breadcrumbSchema(pagePath, [
      { name: nav('home'), path: localePath(locale, '/') },
      { name: nav('freelance'), path: pagePath },
    ]),
    websiteSchema({ description: seo('defaultDescription') }),
    personSchema(person),
  )

  return (
    <div className="min-h-screen relative">
      <JsonLd data={jsonLd} />
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
