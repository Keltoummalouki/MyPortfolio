import type { JsonLdNode } from '@/features/seo/jsonld'

/**
 * Server-rendered JSON-LD. `<` is escaped so CMS-provided strings can never
 * close the script tag (no XSS via `</script>` in a bio or title).
 */
export default function JsonLd({ data }: { data: JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
