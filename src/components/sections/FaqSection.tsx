'use client'

import { useEffect, useId, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animate } from 'animejs'
import { MessageCircleQuestion, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ShowcaseSection from '@/components/sections/showcase/ShowcaseSection'
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
export default function FaqSection({ items, index }: { items: PublicFaqItem[]; index: string }) {
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
    <ShowcaseSection
      ref={sectionRef}
      id="faq"
      index={index}
      layout="half"
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('subtitle')}
      actions={
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <MessageCircleQuestion aria-hidden="true" className="size-4 text-primary-text" />
          {t('more')}
          <a
            href="#contact"
            className="rounded-sm font-semibold text-primary-text underline-offset-4 hover:underline"
          >
            {t('moreCta')}
          </a>
        </p>
      }
    >
      <div className="space-y-2.5">
        {items.map((item, i) => {
          const isOpen = open.has(item.id)
          const buttonId = `${baseId}-q-${i}`
          const panelId = `${baseId}-a-${i}`
          return (
            <div
              key={item.id}
              className={cn(
                'faq-item rounded-xl border bg-card/80 backdrop-blur-xl transition-[border-color,box-shadow] duration-300 ease-fluid',
                isOpen ? 'border-primary/35 shadow-lg shadow-primary/5' : 'border-border hover:border-primary/25',
              )}
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(item.id, document.getElementById(panelId))}
                  className="flex min-h-14 w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-start text-sm font-semibold text-foreground sm:px-5 sm:text-base"
                >
                  <span className="text-balance">{item.question}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full border transition-[rotate,background-color,border-color,color] duration-300 ease-fluid',
                      isOpen
                        ? 'rotate-45 border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-secondary text-primary-text',
                    )}
                  >
                    <Plus className="size-4" />
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
                <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground text-pretty sm:px-5 sm:pb-5">{item.answer}</p>
              </div>
            </div>
          )
        })}
      </div>
    </ShowcaseSection>
  )
}
