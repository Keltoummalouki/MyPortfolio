import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Header from '@/components/layouts/Header'
import Footer from '@/components/layouts/Footer'
import Markdown from '@/components/ui/Markdown'
import { getPublishedArticleBySlug } from '@/features/articles/queries'
import { readingMinutes } from '@/features/articles/reading-time'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const detail = await getPublishedArticleBySlug(slug)
  if (!detail) return { title: 'Article' }
  return {
    title: detail.seo_title ?? detail.title,
    description: detail.seo_description ?? detail.excerpt ?? undefined,
  }
}

function formatDate(value: string | null, locale: string): string | null {
  if (!value) return null
  return new Date(value).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('blog')

  const detail = await getPublishedArticleBySlug(slug)
  if (!detail) notFound()

  const published = formatDate(detail.articles.published_at, locale)
  const minutes = readingMinutes(detail.body_markdown)
  const rtl = detail.locale === 'ar'

  return (
    <div className="min-h-screen relative">
      <Header />
      <main id="main-content" className="section-padding">
        <article className="container-main max-w-3xl" dir={rtl ? 'rtl' : 'ltr'}>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            {t('backToBlog')}
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">{detail.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {detail.articles.author_name && <span>{detail.articles.author_name}</span>}
            {detail.articles.author_name && <span aria-hidden>·</span>}
            {published && <span>{published}</span>}
            <span aria-hidden>·</span>
            <span>{t('minRead', { minutes })}</span>
          </div>

          {detail.articles.cover_image_url && (
            <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={detail.articles.cover_image_url}
                alt={detail.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {detail.excerpt && (
            <p className="mt-6 text-lg text-muted-foreground">{detail.excerpt}</p>
          )}

          <div className="mt-8">
            <Markdown>{detail.body_markdown ?? ''}</Markdown>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
