'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { BookOpen, GraduationCap, Infinity as InfinityIcon, type LucideIcon } from 'lucide-react'
import ShowcaseSection from '@/components/sections/showcase/ShowcaseSection'
import type { PublicEducation } from '@/features/cms/queries'
import { sortOldestFirst } from '@/features/cms/timeline'
import { isOptimizableImageSrc } from '@/lib/images'
import { prefersReducedMotion } from '@/lib/motion/reduced-motion'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const FALLBACK_IDS = ['youcode', 'bac'] as const

interface TimelineNode {
  id: string
  icon: LucideIcon
  title: string
  school: string
  date: string
  description: string
  imageUrl: string
}

/** Wave drawn behind the icon row (md+); the opaque icon wells hide it at each node. */
const WAVE = 'M0 28 C 85 6, 165 50, 250 28 S 415 6, 500 28 S 665 50, 750 28 S 915 6, 1000 28'

export default function EducationSection({ items: cmsItems, index }: { items?: PublicEducation[]; index: string }) {
  const t = useTranslations('education')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 75%', once: true } })
      timeline
        .fromTo('[data-education-wave]', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power3.out' })
        .fromTo('[data-education-rail]', { scaleY: 0 }, { scaleY: 1, duration: 1.1, ease: 'power3.out' }, 0)
        .fromTo(
          '[data-education-node]',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' },
          0.15,
        )
    }, section)

    return () => ctx.revert()
  }, [])

  const studies: TimelineNode[] = cmsItems?.length
    ? cmsItems.map((item, i) => ({
        id: item.id,
        icon: i % 2 === 0 ? GraduationCap : BookOpen,
        title: item.degree,
        school: item.institution,
        date: item.date,
        description: item.description || item.field,
        imageUrl: item.imageUrl,
      }))
    : FALLBACK_IDS.map((id, i) => ({
        id,
        icon: i % 2 === 0 ? GraduationCap : BookOpen,
        title: t(`items.${id}.title`),
        school: t(`items.${id}.school`),
        date: t(`items.${id}.date`),
        description: t(`items.${id}.description`),
        imageUrl: '',
      }))

  // Reads left to right (oldest first) and ends on an open "always learning" node.
  const nodes: TimelineNode[] = [
    ...sortOldestFirst(studies),
    {
      id: 'ongoing',
      icon: InfinityIcon,
      title: t('ongoing.title'),
      school: t('ongoing.school'),
      date: t('ongoing.date'),
      description: '',
      imageUrl: '',
    },
  ]

  return (
    <ShowcaseSection
      ref={sectionRef}
      id="education"
      index={index}
      eyebrow={t('title')}
      title={t('heading')}
      description={t('subtitle')}
    >
      <div className="relative">
        {/* Vertical rail (mobile) and glowing wave (md+), both decorative. */}
        <span
          aria-hidden="true"
          data-education-rail
          className="absolute start-7 top-7 bottom-7 w-px origin-top bg-linear-to-b from-primary/70 via-violet-500/50 to-transparent md:hidden"
        />
        <svg
          aria-hidden="true"
          data-education-wave
          viewBox="0 0 1000 56"
          preserveAspectRatio="none"
          fill="none"
          className="absolute inset-x-0 top-0 hidden h-14 w-full origin-left overflow-visible md:block rtl:origin-right"
        >
          <defs>
            <linearGradient id="education-wave" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="var(--primary)" stopOpacity="0.15" />
              <stop offset="0.45" stopColor="var(--primary)" />
              <stop offset="0.85" stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
            <filter id="education-glow" x="-5%" y="-100%" width="110%" height="300%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <path d={WAVE} stroke="url(#education-wave)" strokeWidth={6} strokeOpacity={0.45} filter="url(#education-glow)" vectorEffect="non-scaling-stroke" />
          <path d={WAVE} stroke="url(#education-wave)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        </svg>

        <ol className="relative grid gap-9 md:grid-flow-col md:auto-cols-fr md:gap-6">
          {nodes.map((node) => {
            const Icon = node.icon
            return (
              <li key={node.id} data-education-node className="relative flex gap-5 md:flex-col md:gap-5">
                <span className="relative z-10 flex size-14 shrink-0 rounded-full bg-gradient-primary p-px shadow-[0_0_32px_-6px_var(--glow-color)]">
                  <span className="flex size-full items-center justify-center overflow-hidden rounded-full bg-card text-primary-text">
                    {node.imageUrl ? (
                      <Image
                        src={node.imageUrl}
                        alt=""
                        width={56}
                        height={56}
                        unoptimized={!isOptimizableImageSrc(node.imageUrl)}
                        className="size-full object-contain p-1"
                      />
                    ) : (
                      <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
                    )}
                  </span>
                </span>
  
                <div className="min-w-0 pt-1 md:pt-0">
                  {node.date && (
                    <p className="text-xs font-semibold tabular-nums text-primary-text">{node.date}</p>
                  )}
                  <h3 className="mt-1 text-base font-semibold leading-snug text-foreground text-balance md:text-lg">
                    {node.title}
                  </h3>
                  {node.school && <p className="mt-1 text-sm text-muted-foreground">{node.school}</p>}
                  {node.description && (
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground/90 text-pretty">
                      {node.description}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </ShowcaseSection>
  )
}
