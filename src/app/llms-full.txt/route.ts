import { getPublishedArticles } from '@/features/articles/queries'
import { getPublishedCmsContent } from '@/features/cms/queries'
import { getPublishedProjectBySlug, getPublishedProjects } from '@/features/content/projects.queries'
import { cookies } from 'next/headers'
import { llmsTextResponse, renderLlmsDocument } from '@/features/seo/llms'

// /llms-full.txt: the complete, self-contained profile of Keltoum Malouki for
// AI assistants, in one Markdown file: identity, current role, experience,
// education, skills, certifications, languages, services, every published case
// study in full, writing, links and how to refer to Keltoum. Linked from the
// "Optional" section of /llms.txt.
//
// Same routing and failure rules as /llms.txt: a static, dotted segment (no
// locale routing), rendered per request, CDN-cached for an hour, and never
// 500s. The list read omits case-study bodies, so each published project is
// re-read with its case study; a failed read falls back to the list row.
export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const body = await renderLlmsDocument('full', {
    cms: () => getPublishedCmsContent('en'),
    projects: getPublishedProjects,
    projectDetail: getPublishedProjectBySlug,
    articles: getPublishedArticles,
  })
  const personalized = (await cookies()).getAll().some((cookie) => cookie.name.startsWith('sb-'))
  return llmsTextResponse(body, { personalized })
}
