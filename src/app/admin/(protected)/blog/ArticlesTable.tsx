'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { deleteArticleAction } from '@/features/articles/actions'
import {
  ARTICLE_LOCALES,
  ARTICLE_STATUSES,
  type ArticleLocale,
  type ArticleStatus,
} from '@/features/articles/schema'

export interface ArticleRowVM {
  id: string
  title: string
  slug: string
  status: ArticleStatus
  featured: boolean
  publishedAt: string | null
  locales: Record<ArticleLocale, boolean>
}

const statusStyles: Record<ArticleStatus, string> = {
  draft: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  published: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  archived: 'bg-muted text-muted-foreground',
}

const control =
  'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'

export default function ArticlesTable({ articles }: { articles: ArticleRowVM[] }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<ArticleStatus | 'all'>('all')

  const filtered = articles.filter((a) => {
    const needle = q.trim().toLowerCase()
    const matchesQ =
      !needle || a.title.toLowerCase().includes(needle) || a.slug.toLowerCase().includes(needle)
    const matchesStatus = status === 'all' || a.status === status
    return matchesQ && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or slug…"
          aria-label="Search articles"
          className={cn(control, 'sm:max-w-xs sm:flex-1')}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ArticleStatus | 'all')}
          aria-label="Filter by status"
          className={control}
        >
          <option value="all">All statuses</option>
          {ARTICLE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {articles.length === 0 ? (
            <>
              No articles yet.{' '}
              <Link href="/admin/blog/new" className="text-primary hover:underline">
                Write your first article
              </Link>
              .
            </>
          ) : (
            'No articles match your filters.'
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Article</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium">Locales</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {a.title || <span className="text-muted-foreground">(untitled)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{a.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusStyles[a.status])}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.featured ? (
                      <Star size={16} className="fill-current text-amber-500" aria-label="Featured" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {ARTICLE_LOCALES.map((loc) => (
                        <span
                          key={loc}
                          title={a.locales[loc] ? `${loc} translated` : `${loc} missing`}
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                            a.locales[loc]
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground/60',
                          )}
                        >
                          {loc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/blog/${a.id}`}>Edit</Link>
                      </Button>
                      <form
                        action={deleteArticleAction}
                        onSubmit={(e) => {
                          if (!confirm('Delete this article? This cannot be undone.')) {
                            e.preventDefault()
                          }
                        }}
                      >
                        <input type="hidden" name="id" value={a.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
