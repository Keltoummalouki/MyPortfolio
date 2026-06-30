import { pickTranslation, type Translated } from '@/features/content/translations'
import type { Locale } from '@/lib/validation/locale'
import { readingMinutes } from './reading-time'

// Pure mapping from DB article rows to the localized card view model used by the
// public blog index. No I/O — unit-testable without Supabase.

export interface ArticleCardData {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  author: string | null
  publishedAt: string | null
  readingMinutes: number
}

interface TranslationInput {
  locale: string
  slug: string
  title: string
  excerpt: string | null
  body_markdown: string | null
}

export interface ArticleInput {
  id: string
  cover_image_url: string | null
  author_name: string | null
  published_at: string | null
  article_translations: TranslationInput[]
}

export function toArticleCard(article: ArticleInput, locale: Locale): ArticleCardData | null {
  const translations = article.article_translations.filter(
    (t): t is TranslationInput & Translated =>
      t.locale === 'fr' || t.locale === 'en' || t.locale === 'ar',
  )
  const tr = pickTranslation(translations, locale)
  if (!tr) return null

  return {
    id: article.id,
    slug: tr.slug,
    title: tr.title,
    excerpt: tr.excerpt,
    coverImage: article.cover_image_url,
    author: article.author_name,
    publishedAt: article.published_at,
    readingMinutes: readingMinutes(tr.body_markdown),
  }
}
