import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { ArrowUpRight } from 'lucide-react'
import Header from '@/components/layouts/Header'
import Footer from '@/components/layouts/Footer'
import Breadcrumbs from '@/components/projects/Breadcrumbs'
import ProjectCard, { type ProjectCardLabels } from '@/components/projects/ProjectCard'
import JsonLd from '@/components/seo/JsonLd'
import { getPublishedCmsContent } from '@/features/cms/queries'
import { fallbackProjectCards } from '@/features/content/projects.fallback'
import { toProjectCard, type ProjectCardData } from '@/features/content/projects.map'
import { getPublishedProjects } from '@/features/content/projects.queries'
import {
  breadcrumbSchema,
  itemListSchema,
  jsonLdGraph,
  personInputFromCms,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/features/seo/jsonld'
import { buildPageMetadata } from '@/features/seo/metadata'
import { FALLBACK_SAME_AS, absoluteUrl, localePath } from '@/features/seo/site'
import { routing } from '@/i18n/routing'

// Rendered per request so newly published projects appear without a rebuild.
export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const [t, seo] = await Promise.all([
    getTranslations({ locale, namespace: 'projectPages.index' }),
    getTranslations({ locale, namespace: 'seo' }),
  ])
  return buildPageMetadata({
    locale,
    path: '/projects',
    title: t('metaTitle'),
    absoluteTitle: true,
    description: t('metaDescription'),
    // Explicit: a page-level `openGraph` replaces the layout's file-based image.
    images: [{ url: localePath(locale, '/opengraph-image'), width: 1200, height: 630, alt: seo('ogImageAlt') }],
  })
}

export default async function ProjectsIndexPage({ params }: PageProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const [t, projectsT, seo, nav, hero, rows, cms] = await Promise.all([
    getTranslations({ locale, namespace: 'projectPages' }),
    getTranslations({ locale, namespace: 'projects' }),
    getTranslations({ locale, namespace: 'seo' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'hero' }),
    getPublishedProjects(),
    getPublishedCmsContent(locale),
  ])

  // Database projects when any are published; otherwise (empty or unreachable
  // database) the same static projects as the home ProjectsSection.
  const projects: ProjectCardData[] =
    rows.length > 0
      ? rows.map((row) => toProjectCard(row, locale)).filter((project) => project.title)
      : fallbackProjectCards((key) => projectsT(key))

  const labelsFor = (project: ProjectCardData): ProjectCardLabels => ({
    readCaseStudy: t('readCaseStudy'),
    readCaseStudyAria: t('readCaseStudyAria', { title: project.title }),
    viewCode: t('viewCode'),
    viewCodeAria: t('viewCodeAria', { title: project.title }),
    liveDemo: t('liveDemo'),
    liveDemoAria: t('liveDemoAria', { title: project.title }),
    coverAlt: t('coverAlt', { title: project.title }),
    stack: projectsT('techStack'),
  })

  const person = personInputFromCms(cms, { jobTitle: hero('role'), description: seo('defaultDescription') })
  const githubUrl =
    [...(person.sameAs ?? []), ...FALLBACK_SAME_AS].find((url) => /^https:\/\/github\.com\//i.test(url)) ??
    FALLBACK_SAME_AS[0]

  const pagePath = localePath(locale, '/projects')
  const jsonLd = jsonLdGraph(
    webPageSchema({
      type: 'CollectionPage',
      path: pagePath,
      name: t('index.title'),
      description: t('index.metaDescription'),
      locale,
      hasBreadcrumb: true,
      mainEntityId: projects.length > 0 ? `${absoluteUrl(pagePath)}#itemlist` : undefined,
    }),
    projects.length > 0 &&
      itemListSchema(
        pagePath,
        projects.map((project) => ({
          name: project.title,
          path: localePath(locale, `/projects/${project.slug}`),
        })),
      ),
    breadcrumbSchema(pagePath, [
      { name: nav('home'), path: localePath(locale, '/') },
      { name: nav('projects'), path: pagePath },
    ]),
    websiteSchema({ description: seo('defaultDescription') }),
    personSchema(person),
  )

  return (
    <div className="min-h-screen relative">
      <JsonLd data={jsonLd} />
      <Header brandName={cms.about?.fullName} design={cms.design} />
      <main id="main-content" className="section-padding">
        <div className="container-main">
          <Breadcrumbs
            label={t('breadcrumbLabel')}
            items={[{ name: nav('home'), href: '/' }, { name: nav('projects') }]}
          />

          <header className="mx-auto mt-8 mb-12 max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">{t('index.title')}</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t('index.intro')}</p>
          </header>

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((project, index) => (
              <li key={project.id}>
                <ProjectCard project={project} labels={labelsFor(project)} priority={index < 2} />
              </li>
            ))}
          </ul>

          <p className="mt-12 text-center text-muted-foreground">
            {t('index.selection')}{' '}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('index.githubCta')}
              <ArrowUpRight size={16} aria-hidden className="rtl:-scale-x-100" />
            </a>
          </p>
        </div>
      </main>
      <Footer links={cms.socialLinks} />
    </div>
  )
}
