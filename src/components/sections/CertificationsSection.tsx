'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { Award, ExternalLink } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import GlassCard from '@/components/ui/GlassCard'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function CertificationsSection() {
  const t = useTranslations('certifications')
  const sectionRef = useRef<HTMLElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.certification-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  return (
    <section
      id="certifications"
      ref={sectionRef}
      className="relative section-padding overflow-hidden bg-background"
      aria-labelledby="certifications-title"
    >
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-main">
        <SectionHeader eyebrow={t('subtitle')} title={t('title')} />

        <div className="max-w-2xl mx-auto">
          <div className="certification-card">
            <GlassCard className="p-8 md:p-10 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-white mb-6">
                <Award size={40} />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {t('items.docker.title')}
              </h3>

              <p className="text-primary font-medium mb-2">
                {t('items.docker.issuer')}
              </p>

              <p className="text-muted-foreground mb-6">
                {t('items.docker.description')}
              </p>

              <a
                href="https://www.linkedin.com/in/keltoummalouki"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              >
                {t('viewCredential')}
                <ExternalLink size={16} />
              </a>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  )
}
