'use client'

import { useEffect, useId, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animate } from 'animejs'
import { ChevronDown, MessageCircleQuestion } from 'lucide-react'
import { useTranslations } from 'next-intl'
import SectionHeader from '@/components/ui/SectionHeader'
import type { PublicFaqItem } from '@/features/cms/faq'
import { prefersReducedMotion } from '@/lib/motion/reduced-motion'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * "Popular questions" accordion (WAI-ARIA APG pattern: heading > button with
 * aria-expanded/aria-controls, region panels). Answers stay in the HTML when
 * collapsed — Google accepts FAQ structured data for expandable answers — but
 * are `inert` so keyboard and screen-reader users only meet open panels.
 * Panel height animates with anime.js; the list reveals with GSAP.
 */
export default function FaqSection({ items }: { items: PublicFaqItem[] }) {
  const t = useTranslations('faq')
  const baseId = useId()
  const sectionRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<Set<string>>(() => new Set(items[0] ? [items[0].id] : []))

  useEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.faq-item',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: { trigger: section, start: 'top 80%', once: true },
        },
      )
    }, section)
    return () => ctx.revert()
  }, [])

  if (items.length === 0) return null

  const toggle = (id: string, panel: HTMLElement | null) => {
    const willOpen = !open.has(id)
    setOpen((current) => {
      const next = new Set(current)
      if (willOpen) next.add(id)
      else next.delete(id)
      return next
    })
    if (!panel || prefersReducedMotion()) return
    const from = panel.getBoundingClientRect().height
    // Measure the target height with the panel's content laid out.
    const to = willOpen ? panel.scrollHeight : 0
    animate(panel, {
      height: [from, to],
      duration: 380,
      ease: 'outQuart',
      onComplete: () => {
        panel.style.height = ''
      },
    })
  }

  return (
    <section
      id="faq"
      ref={sectionRef}
      aria-labelledby="faq-title"
      className="relative section-padding overflow-hidden bg-background"
    >
      <div aria-hidden="true" className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

      <div className="relative container-main">
        <SectionHeader id="faq-title" eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="mx-auto max-w-3xl space-y-3">
          {items.map((item, index) => {
            const isOpen = open.has(item.id)
            const buttonId = `${baseId}-q-${index}`
            const panelId = `${baseId}-a-${index}`
            return (
              <div
                key={item.id}
                className={cn(
                  'faq-item rounded-2xl border bg-card/80 backdrop-blur-xl transition-colors duration-300',
                  isOpen ? 'border-primary/30 shadow-lg shadow-primary/5' : 'border-border hover:border-primary/20',
                )}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(item.id, document.getElementById(panelId))}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-start text-base font-semibold text-foreground md:px-6 md:py-5 md:text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="text-balance">{item.question}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-transform duration-300',
                        isOpen && 'rotate-180 bg-primary text-primary-foreground',
                      )}
                    >
                      <ChevronDown className="size-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  inert={!isOpen}
                  className={cn('overflow-hidden', !isOpen && 'h-0')}
                >
                  <p className="px-5 pb-5 leading-relaxed text-muted-foreground text-pretty md:px-6 md:pb-6">{item.answer}</p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-10 flex flex-wrap items-center justify-center gap-2 text-center text-muted-foreground">
          <MessageCircleQuestion aria-hidden="true" className="size-5 text-primary" />
          {t('more')}
          <a
            href="#contact"
            className="rounded-sm font-semibold text-primary-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('moreCta')}
          </a>
        </p>
      </div>
    </section>
  )
}
