'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Briefcase } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import SkillIcon from '@/components/ui/SkillIcon'
import type { PublicExperience } from '@/features/cms/queries'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const experienceItems = [
  {
    id: 'dabadoc',
    icon: Briefcase,
    technologies: ['Ruby on Rails', 'Angular', 'CoffeeScript', 'MongoDB', 'Docker', 'Git/GitHub'],
  },
  {
    id: 'caisseManager',
    icon: Briefcase,
    technologies: ['Next.js', 'React.js', 'TailwindCSS', 'GSAP', 'Framer Motion', 'Shadcn UI', 'Git/GitHub'],
  },
]

export default function ExperienceSection({ items: cmsItems }: { items?: PublicExperience[] }) {
  const t = useTranslations('experience')
  const sectionRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || !timelineRef.current || !sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.timeline-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 80%',
          }
        }
      )

      gsap.fromTo(
        '.timeline-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 75%',
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  const items = cmsItems?.length
    ? cmsItems.map((item) => ({
        id: item.id,
        icon: Briefcase,
        title: item.role,
        date: item.date,
        company: item.company,
        description: item.description,
        imageUrl: item.imageUrl,
        technologies: item.technologies,
      }))
    : experienceItems.map((item) => ({
        ...item,
        title: t(`items.${item.id}.title`),
        date: t(`items.${item.id}.date`),
        company: t(`items.${item.id}.company`),
        description: t(`items.${item.id}.description`),
        imageUrl: '',
      }))

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative section-padding overflow-hidden bg-background"
      aria-labelledby="experience-title"
    >
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-main">
        <SectionHeader eyebrow={t('subtitle')} title={t('title')} />

        <div ref={timelineRef} className="relative max-w-3xl mx-auto">
          <div className="timeline-line absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-border origin-top" />

          <div className="space-y-10 md:space-y-12">
            {items.map((item) => {
              const Icon = item.icon

              return (
                <motion.div
                  key={item.id}
                  className="timeline-item relative pl-12 md:pl-20"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute left-0 md:left-4 top-1 w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 border-background bg-primary text-primary-foreground">
                    <Icon size={15} />
                  </div>

                  <div className="group p-5 md:p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors duration-300">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                        {item.title}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {item.date}
                      </span>
                    </div>

                    <p className="text-sm text-primary font-medium mb-3">
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="mr-2 inline-block size-8 rounded-lg border border-border object-cover align-middle" />
                      )}
                      {item.company}
                    </p>

                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-secondary text-muted-foreground"
                        >
                          <SkillIcon name={tech} icon={tech} className="text-primary" size={13} />
                          {tech}
                        </span>
                      ))}
                    </div>

                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
