'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Github, ExternalLink, Star, Folder, Code2, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SectionHeader from '@/components/ui/SectionHeader'
import BentoCard from '@/components/ui/BentoCard'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const projects = [
  {
    id: 'eventBooking',
    image: '/images/event-booking-app.png',
    github: 'https://github.com/Keltoummalouki/event-booking-app',
    demo: '',
    featured: true,
  },
  {
    id: 'reservezmoi',
    image: '/images/reservezmoi.png',
    github: 'https://github.com/keltoummalouki/Reservez-Moi',
    demo: '',
    featured: true,
  },
]

export default function ProjectsSection() {
  const t = useTranslations('projects')
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
        '.projects-grid',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
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
      id="projects"
      ref={sectionRef}
      className="relative section-padding overflow-hidden bg-background"
      aria-labelledby="projects-title"
    >
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-main">
        <SectionHeader eyebrow={t('subtitle')} title={t('title')} />

        <div className="projects-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <BentoCard
              key={project.id}
              className="lg:col-span-2 group"
              delay={index * 0.1}
            >
              <div className="grid md:grid-cols-2 h-full">
                <div className="relative h-56 md:h-full overflow-hidden">
                  <Image
                    src={project.image}
                    alt={t(`items.${project.id}.title`)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/90 hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent md:hidden" />

                  {project.featured && (
                    <span className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <Star size={12} className="fill-current" />
                      {t('featured')}
                    </span>
                  )}
                </div>

                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm text-primary font-medium mb-1">{t(`items.${project.id}.date`)}</p>
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                        {t(`items.${project.id}.title`)}
                      </h3>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary text-primary">
                      <Folder size={18} />
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-5 leading-relaxed">
                    {t(`items.${project.id}.description`)}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {t(`items.${project.id}.stack`).split(',').slice(0, 6).map((tech) => (
                      <span
                        key={tech.trim()}
                        className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground border border-border"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-auto">
                    {project.github && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <Github size={16} />
                          {t('viewCode')}
                        </a>
                      </Button>
                    )}
                    {project.demo && (
                      <Button size="sm" asChild className="flex-1">
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={16} />
                          {t('liveDemo')}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </BentoCard>
          ))}

          <BentoCard className="p-6 md:p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary/10 to-violet-500/10" delay={0.2}>
            <div className="p-4 rounded-2xl bg-secondary text-primary mb-5">
              <Code2 size={32} />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-2">40+</h3>
            <p className="text-muted-foreground mb-6">{t('moreProjects')}</p>
            <a
              href="https://github.com/keltoummalouki"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              {t('viewCode')}
              <ArrowUpRight size={16} />
            </a>
          </BentoCard>
        </div>
      </div>
    </section>
  )
}
