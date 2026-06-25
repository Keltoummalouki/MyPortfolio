import ArticleForm from '../ArticleForm'
import { createArticleAction } from '@/features/articles/actions'

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New article</h1>
        <p className="text-sm text-muted-foreground">Draft an article and add its translations.</p>
      </div>
      <ArticleForm action={createArticleAction} submitLabel="Create article" />
    </div>
  )
}
