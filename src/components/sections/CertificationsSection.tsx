'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ArrowUpRight, Award, BadgeCheck } from 'lucide-react'
import ShowcaseSection from '@/components/sections/showcase/ShowcaseSection'
import { pillOutline, surface } from '@/components/sections/showcase/classes'
import type { PublicCertification } from '@/features/cms/queries'
import { isOptimizableImageSrc } from '@/lib/images'
import { prefersReducedMotion } from '@/lib/motion/reduced-motion'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function CertificationsSection({ items: cmsItems, index }: { items?: PublicCertification[]; index: string }) {
  const t = useTranslations('certifications')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-certification]',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%', once: true },
        },
      )
    }, section)
    return () => ctx.revert()
  }, [])

  const items = cmsItems?.length
    ? cmsItems.map((item) => ({
        id: item.id,
        title: item.name,
        issuer: item.issuer,
        date: item.issueDate.slice(0, 4),
        description: item.description,
        credentialUrl: item.credentialUrl,
        imageUrl: item.imageUrl,
      }))
    : [
        {
          id: 'docker',
          title: t('items.docker.title'),
          issuer: t('items.docker.issuer'),
          date: t('items.docker.date'),
          description: t('items.docker.description'),
          credentialUrl:
            'https://www.linkedin.com/learning/certificates/8556c209c6898f55066429ef88fa4d13bed6d4bdb38b594b6d7dbc02216898b2',
          imageUrl: '',
        },
      ]

  return (
    <ShowcaseSection
      ref={sectionRef}
      id="certifications"
      index={index}
      layout="half"
      eyebrow={t('title')}
      title={t('heading')}
      description={t('subtitle')}
    >
      <ul className="grid gap-4">
        {items.map((item) => (
          <li key={item.id} data-certification>
            <article
              className={cn(
                surface,
                'relative flex gap-4 p-4 transition-[border-color,box-shadow] duration-300 ease-fluid hover:border-primary/35 hover:shadow-lg hover:shadow-primary/10 sm:p-5',
              )}
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized={!isOptimizableImageSrc(item.imageUrl)}
                  className="size-14 shrink-0 rounded-xl border border-border object-cover sm:size-16"
                />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-linear-135 from-primary to-violet-600 text-white shadow-lg shadow-primary/25 sm:size-16">
                  <Award aria-hidden="true" className="size-7" strokeWidth={1.75} />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="pe-8">
                  <p className="text-sm font-semibold text-primary-text">{item.issuer}</p>
                  <h3 className="mt-0.5 text-base font-bold leading-snug text-foreground text-balance">{item.title}</h3>
                </div>
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{item.description}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    href={item.credentialUrl || 'https://www.linkedin.com/in/keltoummalouki'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(pillOutline, 'h-10 px-4')}
                  >
                    {t('viewCertificate')}
                    <span className="sr-only">: {item.title}</span>
                    <ArrowUpRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                  </a>
                  {item.date && <span className="text-xs font-medium tabular-nums text-muted-foreground">{item.date}</span>}
                </div>
              </div>

              {item.credentialUrl && (
                <span
                  title={t('verified')}
                  className="absolute top-4 end-4 flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-400"
                >
                  <BadgeCheck aria-hidden="true" className="size-4" />
                  <span className="sr-only">{t('verified')}</span>
                </span>
              )}
            </article>
          </li>
        ))}
      </ul>
    </ShowcaseSection>
  )
}
