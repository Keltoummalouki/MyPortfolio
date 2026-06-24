'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import GlassCard from '@/components/ui/GlassCard'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const educationItems = [
  {
    id: 'youcode',
    icon: GraduationCap,
  },
  {
    id: 'bac',
    icon: BookOpen,
  },
]

export default function EducationSection() {
  const t = useTranslations('education')
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
        '.education-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  return (
    <section
      id="education"
      ref={sectionRef}
      className="relative section-padding overflow-hidden bg-background"
      aria-labelledby="education-title"
    >
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-main">
        <SectionHeader eyebrow={t('subtitle')} title={t('title')} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {educationItems.map((item, index) => {
            const Icon = item.icon

            return (
              <motion.div
                key={item.id}
                className="education-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
              >
                <GlassCard className="p-6 md:p-8 h-full">
                  <div className="inline-flex p-3 rounded-xl bg-secondary text-primary mb-5">
                    <Icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-foreground tracking-tight">
                    {t(`items.${item.id}.title`)}
                  </h3>

                  <p className="text-sm text-primary font-medium mb-1">
                    {t(`items.${item.id}.school`)}
                  </p>

                  <p className="text-sm text-muted-foreground mb-4">
                    {t(`items.${item.id}.date`)}
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    {t(`items.${item.id}.description`)}
                  </p>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
