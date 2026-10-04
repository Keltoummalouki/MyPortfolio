import type { MetadataRoute } from 'next'
import { SITE_URL, absoluteUrl, isIndexable } from '@/features/seo/site'

// /robots.txt. Production: everything public is crawlable (admin and API are
// not). AI answer engines and search-assistant crawlers are welcomed
// explicitly, so a future blanket rule can't silently hide the site from AI
// search. Preview/development deployments block all crawling.

const DISALLOW = ['/admin', '/api']

/** Search-answer and AI crawlers allowed explicitly (same rules as everyone). */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
]

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  }
}
