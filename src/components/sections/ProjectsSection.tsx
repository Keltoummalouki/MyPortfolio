'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Github, ExternalLink, Star, Folder, Code2, ArrowUpRight, ArrowRight, BookOpen } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import SectionHeader from '@/components/ui/SectionHeader'
import BentoCard from '@/components/ui/BentoCard'
import SkillIcon from '@/components/ui/SkillIcon'
import Pagination from '@/components/ui/Pagination'
import { fallbackProjectCards } from '@/features/content/projects.fallback'
import type { ProjectCardData } from '@/features/content/projects.map'
import { paginate } from '@/lib/pagination'
import { prefersReducedMotion as reducedMotionNow } from '@/lib/motion/reduced-motion'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/** Projects per page on the home page; /projects lists them all (6 per page). */
const PROJECTS_PER_PAGE = 2

export default function ProjectsSection({ projects }: { projects?: ProjectCardData[] }) {
  const t = useTranslations('projects')
  const tp = useTranslations('projectPages')
  const sectionRef = useRef<HTMLElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [page, setPage] = useState(1)

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

  // Prefer database-managed projects; otherwise fall back to the shared static
  // projects (same slugs as the /projects case-study pages).
  const items: ProjectCardData[] =
    projects && projects.length > 0 ? projects : fallbackProjectCards((key) => t(key))
  const slice = paginate(items, page, PROJECTS_PER_PAGE)

  const goToPage = useCallback((next: number) => {
    setPage(next)
    // Bring the list back into view when the control sits below the fold.
    const section = sectionRef.current
    if (section && section.getBoundingClientRect().top < 0) {
      section.scrollIntoView({ behavior: reducedMotionNow() ? 'auto' : 'smooth', block: 'start' })
    }
  }, [])

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

        <div id="projects-list" className="projects-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
          {slice.items.map((project, index) => (
            <BentoCard
              key={project.id}
              className="lg:col-span-2 group"
              delay={index * 0.1}
            >
              <div className="grid md:grid-cols-2 h-full">
                <div className="relative h-56 md:h-full overflow-hidden">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-violet-500/10 text-primary">
                      <Folder size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-transparent to-background/90 hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent md:hidden" />

                  {project.featured && (
                    <span className="absolute top-4 start-4 z-10 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <Star size={12} className="fill-current" />
                      {t('featured')}
                    </span>
                  )}
                </div>

                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      {project.dateLabel && (
                        <p className="text-sm text-primary font-medium mb-1">{project.dateLabel}</p>
                      )}
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                        {project.title}
                      </h3>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary text-primary">
                      <Folder size={18} />
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-muted-foreground mb-5 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.stackItems.slice(0, 6).map((tech) => (
                      <span
                        key={tech.name}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground border border-border"
                      >
                        <SkillIcon name={tech.name} icon={tech.icon} imageUrl={tech.imageUrl} className="text-primary" size={13} />
                        {tech.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-auto">
                    <Button size="sm" asChild className="flex-1">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="flex items-center justify-center gap-2"
                      >
                        <BookOpen size={16} aria-hidden="true" />
                        {tp('caseStudy')}
                        {/* Unique link text per project (SEO + "identical links" a11y audit). */}
                        <span className="sr-only">: {project.title}</span>
                      </Link>
                    </Button>
                    {project.github && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <Github size={16} aria-hidden="true" />
                          {t('viewCode')}
                          <span className="sr-only">: {project.title}</span>
                        </a>
                      </Button>
                    )}
                    {project.demo && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={16} aria-hidden="true" />
                          {t('liveDemo')}
                          <span className="sr-only">: {project.title}</span>
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
            <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">50+</p>
            <p className="text-muted-foreground mb-6">{t('moreProjects')}</p>
            <Button size="sm" asChild className="mb-4">
              <Link href="/projects" className="flex items-center justify-center gap-2">
                {tp('viewAll')}
                <ArrowRight size={16} className="rtl:rotate-180" />
              </Link>
            </Button>
            <a
              href="https://github.com/keltoummalouki"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              {t('moreOnGithub')}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </BentoCard>
        </div>

        <Pagination
          page={slice.page}
          totalPages={slice.totalPages}
          onPageChange={goToPage}
          controls="projects-list"
          label={t('paginationLabel')}
          className="mt-10"
        />
      </div>
    </section>
  )
}
