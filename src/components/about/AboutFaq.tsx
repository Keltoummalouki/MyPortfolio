import type { AboutFaqItem } from '@/features/seo/about-faq'
import { cn } from '@/lib/utils'
import ProfileSection, { cardClass } from './ProfileSection'

/**
 * Always-visible Q&As (no accordion): the FAQPage JSON-LD is built from the
 * same items, and structured data must match content users can see.
 */
export default function AboutFaq({ title, lead, items }: { title: string; lead: string; items: AboutFaqItem[] }) {
  if (items.length === 0) return null
  return (
    <ProfileSection id="faq" title={title} lead={lead}>
      <div className={cn(cardClass, 'divide-y divide-border')}>
        {items.map((item) => (
          <div key={item.id} id={`faq-${item.id}`} className="scroll-mt-24 p-5 md:p-7">
            <h3 className="text-lg font-semibold text-foreground text-balance">{item.question}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground text-pretty">{item.answer}</p>
          </div>
        ))}
      </div>
    </ProfileSection>
  )
}
