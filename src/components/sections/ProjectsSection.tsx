'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Folder, Github, Star } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import ShowcaseSection from '@/components/sections/showcase/ShowcaseSection'
import { iconButton, pillArrow, pillOutline, pillPrimary, surface } from '@/components/sections/showcase/classes'
import SkillIcon from '@/components/ui/SkillIcon'
import { fallbackProjectCards } from '@/features/content/projects.fallback'
import type { ProjectCardData } from '@/features/content/projects.map'
import { prefersReducedMotion } from '@/lib/motion/reduced-motion'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const TRACK_ID = 'projects-track'
const pad = (value: number) => String(value).padStart(2, '0')

/**
 * Featured projects as a scroll-snap carousel: native horizontal scrolling
 * (touch, trackpad, keyboard via the card links) plus prev/next buttons. The
 * first card is the wide "lead" card. /projects lists everything.
 */
export default function ProjectsSection({ projects, index }: { projects?: ProjectCardData[]; index: string }) {
  const t = useTranslations('projects')
  const tp = useTranslations('projectPages')
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  // Starts as 'more to the end' so the controls render server-side without a layout shift.
  const [edges, setEdges] = useState({ start: true, end: false })

  // Prefer database-managed projects; otherwise fall back to the shared static
  // projects (same slugs as the /projects case-study pages).
  const items: ProjectCardData[] =
    projects && projects.length > 0 ? projects : fallbackProjectCards((key) => t(key))

  useEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-project-card]',
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 75%', once: true },
        },
      )
    }, section)
    return () => ctx.revert()
  }, [])

  // Track which ends are reached (RTL scrollLeft is negative, hence Math.abs).
  // Runs on every scroll event; the state setter bails out when nothing changed.
  const updateEdges = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const offset = Math.abs(track.scrollLeft)
    const start = offset <= 2
    const end = offset + track.clientWidth >= track.scrollWidth - 2
    setEdges((current) => (current.start === start && current.end === end ? current : { start, end }))
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    updateEdges()
    track.addEventListener('scroll', updateEdges, { passive: true })
    const observer = new ResizeObserver(updateEdges)
    observer.observe(track)
    return () => {
      track.removeEventListener('scroll', updateEdges)
      observer.disconnect()
    }
  }, [updateEdges, items.length])

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const rtl = getComputedStyle(track).direction === 'rtl'
    // Snap points settle the exact position.
    track.scrollBy({
      left: direction * (rtl ? -1 : 1) * track.clientWidth * 0.75,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  return (
    <ShowcaseSection
      ref={sectionRef}
      id="projects"
      index={index}
      eyebrow={t('title')}
      title={t('heading')}
      description={t('subtitle')}
      actions={
        <Link href="/projects" className={pillOutline}>
          {tp('viewAll')}
          <ArrowRight aria-hidden="true" className={pillArrow} />
        </Link>
      }
    >
      <div role="group" aria-label={t('carouselLabel')} className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          disabled={edges.start}
          aria-controls={TRACK_ID}
          aria-label={t('previousProjects')}
          className={iconButton}
        >
          <ChevronLeft aria-hidden="true" className="size-5 rtl:rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          disabled={edges.end}
          aria-controls={TRACK_ID}
          aria-label={t('nextProjects')}
          className={iconButton}
        >
          <ChevronRight aria-hidden="true" className="size-5 rtl:rotate-180" />
        </button>
      </div>

      <ul
        ref={trackRef}
        id={TRACK_ID}
        aria-label={t('title')}
        className="-mx-1 flex snap-x snap-mandatory scroll-px-1 gap-4 overflow-x-auto overscroll-x-contain px-1 pt-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((project, i) => (
          <li
            key={project.id}
            data-project-card
            className={cn(
              'flex shrink-0 snap-start',
              i === 0 ? 'w-[88%] sm:w-[70%] xl:w-[54%]' : 'w-[80%] sm:w-[46%] xl:w-[31%]',
            )}
          >
            <ProjectCard
              project={project}
              lead={i === 0}
              position={`${pad(i + 1)} / ${pad(items.length)}`}
              labels={{
                featured: t('featured'),
                caseStudy: tp('caseStudy'),
                code: t('viewCode'),
                demo: t('liveDemo'),
                stack: t('techStack'),
              }}
            />
          </li>
        ))}
      </ul>
    </ShowcaseSection>
  )
}

function ProjectCard({
  project,
  lead,
  position,
  labels,
}: {
  project: ProjectCardData
  lead: boolean
  position: string
  labels: { featured: string; caseStudy: string; code: string; demo: string; stack: string }
}) {
  const href = `/projects/${project.slug}`

  return (
    <article
      className={cn(
        surface,
        'group relative flex w-full flex-col overflow-hidden p-2 transition-[border-color,box-shadow,translate] duration-300 ease-fluid hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/10',
        lead && 'border-primary/25 shadow-lg shadow-primary/10',
      )}
    >
      <div className={cn('relative overflow-hidden rounded-xl bg-secondary', lead ? 'h-48 sm:h-56' : 'h-36 sm:h-40')}>
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            fill
            sizes={lead ? '(max-width: 640px) 88vw, (max-width: 1280px) 70vw, 640px' : '(max-width: 640px) 80vw, (max-width: 1280px) 46vw, 380px'}
            className="object-cover transition-transform duration-500 ease-fluid group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-135 from-primary/15 to-violet-500/15 text-primary-text">
            <Folder aria-hidden="true" className="size-10" strokeWidth={1.5} />
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-card/70 via-transparent to-transparent" />
        <span
          aria-hidden="true"
          className="absolute top-3 start-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur"
          dir="ltr"
        >
          {position}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-2 md:px-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className={cn('font-bold tracking-tight text-foreground', lead ? 'text-xl md:text-2xl' : 'text-lg')}>
            {project.title}
          </h3>
          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary-text">
              <Star aria-hidden="true" className="size-3 fill-current" />
              {labels.featured}
            </span>
          )}
        </div>
        {project.dateLabel && <p className="mt-1 text-xs font-medium text-muted-foreground">{project.dateLabel}</p>}

        {project.description && (
          <p className={cn('mt-2 text-sm leading-relaxed text-muted-foreground text-pretty', lead ? 'line-clamp-3' : 'line-clamp-2')}>
            {project.description}
          </p>
        )}

        <ul aria-label={labels.stack} className="mt-4 flex flex-wrap gap-1.5">
          {project.stackItems.slice(0, lead ? 5 : 3).map((tech) => (
            <li
              key={tech.name}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/70 px-2 py-1 text-xs font-medium text-muted-foreground"
            >
              <SkillIcon name={tech.name} icon={tech.icon} imageUrl={tech.imageUrl} className="text-primary-text" size={12} />
              {tech.name}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center gap-2 pt-5">
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className={iconButton}>
              <Github aria-hidden="true" className="size-4" />
              <span className="sr-only">
                {labels.code}: {project.title}
              </span>
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className={iconButton}>
              <ExternalLink aria-hidden="true" className="size-4" />
              <span className="sr-only">
                {labels.demo}: {project.title}
              </span>
            </a>
          )}
          {lead ? (
            <Link href={href} className={cn(pillPrimary, 'ms-auto')}>
              {labels.caseStudy}
              {/* Unique link text per project (SEO + "identical links" a11y audit). */}
              <span className="sr-only">: {project.title}</span>
              <ArrowRight aria-hidden="true" className={pillArrow} />
            </Link>
          ) : (
            <Link
              href={href}
              className={cn(iconButton, 'ms-auto border-primary/40 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground')}
            >
              <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
              <span className="sr-only">
                {labels.caseStudy}: {project.title}
              </span>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
