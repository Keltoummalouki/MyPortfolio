'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { Code2, Layers, Server, Database, FolderKanban, PenTool, GitBranch, Palette, CheckCircle2, type LucideIcon } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import BentoCard from '@/components/ui/BentoCard'
import { TechIcon, hasTechIcon } from '@/components/ui/TechIcon'
import type { TechName } from '@/components/ui/TechIcon'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface SkillCategory {
  key: string
  icon: LucideIcon
  technologies: string[]
}

function SkillChip({ name }: { name: string }) {
  const isIconTech = hasTechIcon(name)

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border text-sm text-foreground hover:border-primary/30 hover:bg-secondary transition-colors duration-200">
      {isIconTech && <TechIcon name={name as TechName} size={16} showColor />}
      {!isIconTech && <CheckCircle2 size={14} className="text-primary" />}
      {name}
    </span>
  )
}

export default function SkillsSection() {
  const t = useTranslations('skills')
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
        '.skills-grid',
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

  const categories: SkillCategory[] = [
    {
      key: 'languages',
      icon: Code2,
      technologies: ['C', 'HTML5', 'CSS3', 'SQL', 'NoSQL', 'JavaScript', 'TypeScript', 'PHP'],
    },
    {
      key: 'frameworks',
      icon: Layers,
      technologies: ['Laravel', 'Node.js', 'React', 'Next.js', 'Express.js', 'NestJS', 'Ruby on Rails', 'Angular', 'Tailwind CSS', 'GraphQL'],
    },
    {
      key: 'devops',
      icon: Server,
      technologies: ['Docker', 'CI/CD', 'GitLab'],
    },
    {
      key: 'databases',
      icon: Database,
      technologies: ['MySQL', 'PostgreSQL', 'MongoDB'],
    },
    {
      key: 'management',
      icon: FolderKanban,
      technologies: ['Agile', 'Jira'],
    },
    {
      key: 'modeling',
      icon: PenTool,
      technologies: ['Merise', 'UML'],
    },
    {
      key: 'versioning',
      icon: GitBranch,
      technologies: ['Git', 'GitHub', 'GitLab'],
    },
    {
      key: 'design',
      icon: Palette,
      technologies: ['Figma', 'Canva', 'Adobe XD'],
    },
  ]

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative section-padding overflow-hidden bg-background"
      aria-labelledby="skills-title"
    >
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-main">
        <SectionHeader eyebrow={t('subtitle')} title={t('title')} />

        <div className="skills-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <BentoCard
                key={category.key}
                className="p-6"
                delay={index * 0.05}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-secondary text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{t(`categories.${category.key}`)}</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {category.technologies.map((tech) => (
                    <SkillChip key={tech} name={tech} />
                  ))}
                </div>
              </BentoCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
