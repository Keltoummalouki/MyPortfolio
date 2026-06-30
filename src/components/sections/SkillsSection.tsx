'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { Code2, Layers, Server, Database, FolderKanban, PenTool, GitBranch, Palette, type LucideIcon } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import BentoCard from '@/components/ui/BentoCard'
import SkillIcon from '@/components/ui/SkillIcon'
import type { PublicSkillCategory } from '@/features/cms/queries'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface SkillCategory {
  key: string
  title?: string
  icon: LucideIcon
  technologies: SkillItem[]
}

interface SkillItem {
  name: string
  icon?: string
  imageUrl?: string
}

function SkillChip({ skill }: { skill: SkillItem }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border text-sm text-foreground hover:border-primary/30 hover:bg-secondary transition-colors duration-200">
      <SkillIcon name={skill.name} icon={skill.icon} imageUrl={skill.imageUrl} className="text-primary" size={16} />
      {skill.name}
    </span>
  )
}

export default function SkillsSection({
  categories: cmsCategories,
}: {
  categories?: PublicSkillCategory[]
}) {
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

  const fallbackIconMap = [Code2, Layers, Server, Database, FolderKanban, PenTool, GitBranch, Palette]
  const baseCategories: SkillCategory[] = cmsCategories?.length
    ? cmsCategories.map((category, index) => ({
        key: category.id,
        title: category.name,
        icon: fallbackIconMap[index % fallbackIconMap.length],
        technologies: category.skills.map((skill) => ({
          name: skill.name,
          icon: skill.icon,
          imageUrl: skill.imageUrl,
        })),
      }))
    : [
    {
      key: 'languages',
      icon: Code2,
      technologies: ['C', 'HTML5', 'CSS3', 'SQL', 'NoSQL', 'JavaScript', 'TypeScript', 'PHP'].map((name) => ({ name })),
    },
    {
      key: 'frameworks',
      icon: Layers,
      technologies: ['Laravel', 'Node.js', 'React', 'Next.js', 'Express.js', 'NestJS', 'Ruby on Rails', 'Angular', 'Tailwind CSS', 'GraphQL'].map((name) => ({ name })),
    },
    {
      key: 'devops',
      icon: Server,
      technologies: ['Docker', 'CI/CD', 'GitLab'].map((name) => ({ name })),
    },
    {
      key: 'databases',
      icon: Database,
      technologies: ['MySQL', 'PostgreSQL', 'MongoDB'].map((name) => ({ name })),
    },
    {
      key: 'management',
      icon: FolderKanban,
      technologies: ['Agile', 'Jira'].map((name) => ({ name })),
    },
    {
      key: 'modeling',
      icon: PenTool,
      technologies: ['Merise', 'UML'].map((name) => ({ name })),
    },
    {
      key: 'versioning',
      icon: GitBranch,
      technologies: ['Git', 'GitHub', 'GitLab'].map((name) => ({ name })),
    },
    {
      key: 'design',
      icon: Palette,
      technologies: ['Figma', 'Canva', 'Adobe XD'].map((name) => ({ name })),
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
        <SectionHeader
          eyebrow={t('subtitle')}
          title={t('title')}
        />

        <div className="skills-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {baseCategories.map((category, index) => {
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
                  <h3 className="text-lg font-bold text-foreground">{category.title ?? t(`categories.${category.key}`)}</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {category.technologies.map((tech) => (
                    <SkillChip key={`${tech.name}-${tech.imageUrl ?? tech.icon ?? ''}`} skill={tech} />
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
