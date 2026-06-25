import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type ArticleRow = Database['public']['Tables']['articles']['Row']
type ArticleTranslationRow = Database['public']['Tables']['article_translations']['Row']

export type AdminArticle = ArticleRow & {
  article_translations: ArticleTranslationRow[]
}
export type PublishedArticleDetail = ArticleTranslationRow & { articles: ArticleRow }

const SELECT = '*, article_translations(*)'

/**
 * Public list: PUBLISHED articles only (explicit filter on top of RLS, so an
 * admin viewing the public page never sees drafts). Empty array on failure so
 * the public page degrades gracefully.
 */
export async function getPublishedArticles(): Promise<AdminArticle[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('articles')
      .select(SELECT)
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error('getPublishedArticles failed:', err)
    return []
  }
}

/**
 * Public detail: resolve a published article by one of its localized slugs.
 * Returns the matched translation plus its parent article, or null.
 */
export async function getPublishedArticleBySlug(slug: string): Promise<PublishedArticleDetail | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('article_translations')
      .select('*, articles!inner(*)')
      .eq('slug', slug)
      .eq('articles.status', 'published')
      .maybeSingle()
    if (error) throw error
    return (data as PublishedArticleDetail | null) ?? null
  } catch (err) {
    console.error('getPublishedArticleBySlug failed:', err)
    return null
  }
}

/** Admin list: every article (RLS restricts this to administrators). */
export async function listAdminArticles(): Promise<AdminArticle[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('articles')
    .select(SELECT)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Admin read of a single article with all translations. */
export async function getAdminArticle(id: string): Promise<AdminArticle | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('articles').select(SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data
}
