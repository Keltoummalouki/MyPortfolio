import { getPublishedArticles } from '@/features/articles/queries'
import { getPublishedCmsContent } from '@/features/cms/queries'
import { getPublishedProjects } from '@/features/content/projects.queries'
import { llmsTextResponse, renderLlmsDocument } from '@/features/seo/llms'

// /llms.txt (https://llmstxt.org): the curated Markdown guide that tells AI
// assistants who Keltoum Malouki is and links the detail (profile, case
// studies, writing, contact, profiles elsewhere). English, linking the French
// and Arabic versions of the site.
//
// Routing: `llms.txt` is a static segment, so it outranks `[locale]`, and the
// middleware matcher skips every path containing a dot, so it is never
// locale-redirected. Rendered per request (CDN-cached for an hour) and never
// 500s: every data failure degrades to the static facts in features/seo/llms.
export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const body = await renderLlmsDocument('index', {
    cms: () => getPublishedCmsContent('en'),
    projects: getPublishedProjects,
    articles: getPublishedArticles,
  })
  return llmsTextResponse(body)
}
