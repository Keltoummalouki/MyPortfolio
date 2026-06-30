import type { Metadata } from 'next'
import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Header from '@/components/layouts/Header'
import Footer from '@/components/layouts/Footer'
import { getPublishedArticles } from '@/features/articles/queries'
import { toArticleCard, type ArticleCardData } from '@/features/articles/map'
import { getPublishedCmsContent } from '@/features/cms/queries'
import { localizedAlternates } from '@/i18n/metadata'
import type { Locale } from '@/lib/validation/locale'

// Rendered per request so newly published articles appear without a rebuild.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: localizedAlternates((l) => `/${l}/blog`),
    },
  }
}

function formatDate(value: string | null, locale: string): string | null {
  if (!value) return null
  return new Date(value).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogIndexPage() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('blog')

  const [articleRows, cms] = await Promise.all([
    getPublishedArticles(),
    getPublishedCmsContent(locale),
  ])
  const articles = articleRows
    .map((a) => toArticleCard(a, locale))
    .filter((a): a is ArticleCardData => a !== null)

  return (
    <div className="min-h-screen relative">
      <Header brandName={cms.about?.fullName} design={cms.design} />
      <main id="main-content" className="section-padding">
        <div className="container-main">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">{t('title')}</h1>
            <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
          </header>

          {articles.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              {t('empty')}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
                >
                  {article.coverImage && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      {formatDate(article.publishedAt, locale) && (
                        <span>{formatDate(article.publishedAt, locale)}</span>
                      )}
                      <span aria-hidden>·</span>
                      <span>{t('minRead', { minutes: article.readingMinutes })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer links={cms.socialLinks} />
    </div>
  )
}
