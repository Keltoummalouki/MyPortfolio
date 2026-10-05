'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animate } from 'animejs'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight, Github, ExternalLink } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import SkillIcon from '@/components/ui/SkillIcon'
import { fallbackProjectCards } from '@/features/content/projects.fallback'
import type { ProjectCardData } from '@/features/content/projects.map'
import { prefersReducedMotion } from '@/lib/motion/reduced-motion'
import { cn } from '@/lib/utils'
import styles from './ProjectsSection.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

export default function ProjectsSection({ projects, index }: { projects?: ProjectCardData[]; index: string }) {
  const t = useTranslations('projects')
  const tp = useTranslations('projectPages')
  const items = projects?.length ? projects : fallbackProjectCards(key => t(key))
  const [selected, setSelected] = useState(0)
  const active = Math.min(selected, items.length - 1)
  const project = items[active]
  const sectionRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const motionRef = useRef<ReturnType<typeof animate> | null>(null)
  const animateSelection = useRef(false)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const section = sectionRef.current
      if (!section) return
      gsap.fromTo(section.querySelectorAll('[data-work-reveal]'),
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 85%', once: true } })
      gsap.fromTo(section.querySelector('[data-work-rule]'), { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 25%', scrub: true },
      })
    })
    return () => media.revert()
  }, [])

  useEffect(() => {
    if (!animateSelection.current || prefersReducedMotion()) return
    const targets = [previewRef.current, contentRef.current].filter(Boolean) as HTMLElement[]
    motionRef.current = animate(targets, {
      opacity: [0.35, 1], translateY: [12, 0], duration: 280, ease: 'outCubic',
    })
    return () => { motionRef.current?.revert(); motionRef.current = null }
  }, [active])

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const reset = () => { if (preference.matches) motionRef.current?.revert() }
    preference.addEventListener('change', reset)
    return () => preference.removeEventListener('change', reset)
  }, [])

  const select = (next: number, pointer: boolean) => {
    animateSelection.current = pointer
    setSelected(Math.max(0, Math.min(items.length - 1, next)))
  }

  if (!project) return null
  return (
    <section id="projects" ref={sectionRef} aria-labelledby="projects-title" className={styles.section}>
      <header className={styles.header} data-work-reveal>
        <div>
          <p className={styles.eyebrow}><span />{index} / {t('title')}<span className={styles.total}>{pad(items.length)}</span></p>
          <h2 id="projects-title" className={styles.heading}>{t('heading')}</h2>
        </div>
        <div className={styles.intro}>
          <p>{t('subtitle')}</p>
          <Link href="/projects" className={styles.archive}>{tp('viewAll')}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </header>
      <div className={styles.rule}><div data-work-rule /></div>

      <div className={styles.stage} data-work-reveal>
        <div className={styles.visual}>
          <div className={styles.visualBar} aria-hidden="true">
            <span><i />{t('featured')}</span><span>{pad(active + 1)} / {pad(items.length)}</span>
          </div>
          <div ref={previewRef} className={styles.preview}>
            <Link href={`/projects/${project.slug}`} aria-label={`${tp('caseStudy')}: ${project.title}`} className={styles.cover}>
              {project.image ? <Image key={project.image} src={project.image} alt="" fill sizes="(max-width: 900px) 95vw, 65vw" className={styles.image} />
                : <div className={styles.placeholder} aria-hidden="true">{project.title.slice(0, 2).toUpperCase()}</div>}
              <span className={styles.open}><ArrowUpRight aria-hidden="true" size={26} /></span>
            </Link>
          </div>
          <div className={styles.visualFooter}>
            <span className={styles.date}>{project.dateLabel}</span>
            <div className={styles.controls} role="group" aria-label={t('carouselLabel')}>
              <button type="button" disabled={active === 0} aria-label={t('previousProjects')} aria-controls="work-detail" onClick={e => select(active - 1, e.detail > 0)}><ChevronLeft size={18} className="rtl:rotate-180" /></button>
              <button type="button" disabled={active === items.length - 1} aria-label={t('nextProjects')} aria-controls="work-detail" onClick={e => select(active + 1, e.detail > 0)}><ChevronRight size={18} className="rtl:rotate-180" /></button>
            </div>
          </div>
        </div>

        <div className={styles.directory}>
          <div id="work-detail" ref={contentRef} className={styles.detail}>
            <p className={styles.featureLabel}><span aria-hidden="true">✦</span> {t('featured')}</p>
            <h3 aria-live="polite" aria-atomic="true">{project.title}</h3>
            {project.description && <p className={styles.description}>{project.description}</p>}
            <ul className={styles.stack} aria-label={t('techStack')}>
              {project.stackItems.slice(0, 5).map(tech => <li key={tech.name}><SkillIcon name={tech.name} icon={tech.icon} imageUrl={tech.imageUrl} size={13} />{tech.name}</li>)}
            </ul>
            <div className={styles.links}>
              <Link href={`/projects/${project.slug}`} className={styles.caseStudy}>{tp('caseStudy')}<ArrowRight size={17} className="rtl:rotate-180" aria-hidden="true" /></Link>
              {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`${t('viewCode')}: ${project.title}`}><Github size={18} /></a>}
              {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" aria-label={`${t('liveDemo')}: ${project.title}`}><ExternalLink size={18} /></a>}
            </div>
          </div>
        </div>
      </div>

      <ol className={styles.thumbnails} aria-label={t('title')} data-work-reveal>
        {items.map((item, i) => <li key={item.id}>
          <button type="button" className={cn(styles.thumbnail, i === active && styles.active)} aria-pressed={i === active} aria-controls="work-detail" onClick={e => select(i, e.detail > 0)}>
            <span className={styles.thumbImage}>
              {item.image ? <Image src={item.image} alt="" fill sizes="(max-width: 640px) 65vw, 240px" className={styles.image} /> : <span className={styles.thumbPlaceholder}>{item.title.slice(0, 2)}</span>}
            </span>
            <span className={styles.thumbMeta}><span>{pad(i + 1)}</span><ArrowUpRight size={17} aria-hidden="true" /></span>
            <span className={styles.thumbTitle}>{item.title}</span>
            <span className={styles.thumbStack}>{item.stackItems.slice(0, 2).map(tech => <span key={tech.name}>{tech.name}</span>)}</span>
          </button>
        </li>)}
        <li><Link href="/projects" className={styles.more}><span aria-hidden="true">+</span><strong>{tp('viewAll')}</strong><ArrowUpRight size={19} aria-hidden="true" /></Link></li>
      </ol>
    </section>
  )
}
