import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { listAdminArticles } from '@/features/articles/queries'
import ArticlesTable, { type ArticleRowVM } from './ArticlesTable'

export default async function AdminBlogPage() {
  const articles = await listAdminArticles()

  const rows: ArticleRowVM[] = articles.map((a) => {
    const hasLocale = (loc: string) => a.article_translations.some((t) => t.locale === loc && t.title)
    const frTitle = a.article_translations.find((t) => t.locale === 'fr')?.title
    const anyTitle = a.article_translations[0]?.title

    return {
      id: a.id,
      title: frTitle || anyTitle || '',
      slug: a.slug,
      status: a.status,
      featured: a.featured,
      publishedAt: a.published_at,
      locales: { fr: hasLocale('fr'), en: hasLocale('en'), ar: hasLocale('ar') },
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog</h1>
          <p className="text-sm text-muted-foreground">Write and publish multilingual articles.</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">New article</Link>
        </Button>
      </div>

      <ArticlesTable articles={rows} />
    </div>
  )
}
