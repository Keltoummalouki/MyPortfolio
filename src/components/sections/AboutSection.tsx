'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  Code,
  Compass,
  GitCommit,
  Globe,
  Handshake,
  Layers,
  Lightbulb,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import SectionHeader from '@/components/ui/SectionHeader'
import GlassCard from '@/components/ui/GlassCard'
import SkillIcon from '@/components/ui/SkillIcon'
import type { PublicAbout, PublicSkill } from '@/features/cms/queries'
import type { PublicLanguage } from '@/features/cms/languages'
import { statValue } from '@/features/stats/portfolio'

interface StatProps {
  value: number
  label: string
  suffix?: string
  icon: LucideIcon
}

function AnimatedStat({ value, label, suffix = '', icon: Icon }: StatProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (mediaQuery.matches) {
      setCount(value)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 1800
          const startTime = Date.now()

          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(value * eased))

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value])

  return (
    <div
      ref={ref}
      className="group/stat flex flex-col items-center gap-2.5 rounded-xl p-4 text-center transition-colors duration-300 hover:bg-secondary/60"
    >
      <div className="p-2.5 rounded-xl bg-secondary text-primary transition-colors duration-300 group-hover/stat:bg-primary group-hover/stat:text-primary-foreground">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl md:text-4xl font-bold text-foreground tracking-tight tabular-nums">
        {count}
        {suffix}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground font-medium leading-tight">{label}</div>
    </div>
  )
}

function Trait({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-secondary/40 p-4 text-center transition-colors duration-300 hover:bg-secondary/70">
      <div className="p-2 rounded-lg bg-card text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-semibold text-foreground leading-tight">{label}</span>
    </div>
  )
}

const CEFR_LEVELS: { match: string[]; pct: number }[] = [
  { match: ['native', 'natif', 'maternelle', 'الأم', 'c2'], pct: 100 },
  { match: ['c1'], pct: 88 },
  { match: ['b2'], pct: 74 },
  { match: ['b1'], pct: 58 },
  { match: ['a2'], pct: 40 },
  { match: ['a1'], pct: 24 },
]

function levelToPercent(raw: string): number {
  const value = raw.toLowerCase()
  for (const level of CEFR_LEVELS) {
    if (level.match.some((token) => value.includes(token))) return level.pct
  }
  return 62
}

function LanguageBar({
  name,
  levelText,
  percent,
  index,
  reduce,
}: {
  name: string
  levelText: string
  percent: number
  index: number
  reduce: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-foreground font-medium">{name}</span>
        {levelText && <span className="text-sm text-muted-foreground">{levelText}</span>}
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 origin-left"
          style={{ width: `${percent}%` }}
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

const reveal = (reduce: boolean, delay: number) => ({
  initial: reduce ? false : { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
})

export default function AboutSection({
  about,
  softSkills: cmsSoftSkills,
  languages: cmsLanguages,
}: {
  about?: PublicAbout
  softSkills?: PublicSkill[]
  languages?: PublicLanguage[]
}) {
  const t = useTranslations('about')
  const tHero = useTranslations('hero')
  const tSoftSkills = useTranslations('softSkills')
  const tLanguages = useTranslations('languages')
  const tHome = useTranslations('home')
  const reduce = useReducedMotion() ?? false

  const role = about?.headline || tHero('role')

  const stats = [
    { value: statValue('projects'), label: t('stats.projects'), suffix: '+', icon: Code },
    { value: statValue('experience'), label: t('stats.experience'), suffix: '+', icon: Calendar },
    { value: statValue('technologies'), label: t('stats.technologies'), suffix: '+', icon: Layers },
    { value: statValue('commits'), label: t('stats.commits'), suffix: '+', icon: GitCommit },
  ]

  const qualities = [
    { key: 'creative', icon: Sparkles },
    { key: 'dedicated', icon: Target },
    { key: 'teamPlayer', icon: Users },
    { key: 'problemSolver', icon: Lightbulb },
  ]

  const softSkills = cmsSoftSkills?.length
    ? cmsSoftSkills.map((skill) => ({
        key: skill.id,
        label: skill.name,
        icon: skill.icon,
        imageUrl: skill.imageUrl,
      }))
    : [
        { key: 'timeManagement', label: tSoftSkills('items.timeManagement'), icon: 'time', imageUrl: '' },
        { key: 'adaptability', label: tSoftSkills('items.adaptability'), icon: 'adaptability', imageUrl: '' },
        { key: 'teamwork', label: tSoftSkills('items.teamwork'), icon: 'teamwork', imageUrl: '' },
      ]

  const languages = (
    cmsLanguages?.length
      ? cmsLanguages
      : (['arabic', 'french', 'english'] as const).map((lang) => ({
          id: lang,
          name: tLanguages(lang),
          level: '',
          icon: '',
        }))
  ).map((language) => {
    const rawLevel = language.level?.trim() || ''
    const parenthetical = language.name.match(/[([（]([^)\]）]+)[)\]）]/)?.[1] ?? ''
    const levelText = rawLevel || parenthetical
    const displayName = language.name.replace(/\s*[([（][^)\]）]*[)\]）]\s*$/, '').trim()
    return {
      id: language.id,
      name: displayName || language.name,
      levelText,
      percent: levelToPercent(rawLevel || language.name),
    }
  })

  return (
    <section
      id="about"
      className="relative section-padding overflow-hidden bg-background"
      aria-label={t('title')}
    >
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl float pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl float-delayed pointer-events-none" />

      <div className="relative container-main">
        <SectionHeader eyebrow={t('subtitle')} title={t('title')} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
          {/* Identity */}
          <motion.div className="lg:col-span-5" {...reveal(reduce, 0)}>
            <GlassCard className="h-full p-6 md:p-8 flex flex-col justify-center">
              <div className="inline-flex w-fit p-3 rounded-xl bg-secondary text-primary mb-6">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{role}</h3>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed text-pretty max-w-[44ch]">
                {t('lead')}
              </p>
              <Link
                href="/about"
                className="group mt-6 inline-flex w-fit items-center gap-2 rounded-lg text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {tHome('aboutLink.readFullStory')}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                />
              </Link>
            </GlassCard>
          </motion.div>

          {/* Stats */}
          <motion.div className="lg:col-span-7" {...reveal(reduce, 0.08)}>
            <GlassCard className="h-full p-4 md:p-6 flex items-center">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 w-full">
                {stats.map((stat) => (
                  <AnimatedStat key={stat.label} {...stat} />
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* How I work — qualities + soft skills merged */}
          <motion.div className="lg:col-span-7" {...reveal(reduce, 0.16)}>
            <GlassCard className="h-full p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-secondary text-primary">
                  <Handshake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{tSoftSkills('subtitle')}</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {qualities.map((quality) => (
                  <Trait key={quality.key} icon={quality.icon} label={t(`qualities.${quality.key}`)} />
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-2.5">
                {softSkills.map((skill) => (
                  <span
                    key={skill.key}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/70 border border-border text-foreground text-sm"
                  >
                    <SkillIcon name={skill.label} icon={skill.icon} imageUrl={skill.imageUrl} className="text-primary" size={16} />
                    {skill.label}
                  </span>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Languages */}
          <motion.div className="lg:col-span-5" {...reveal(reduce, 0.24)}>
            <GlassCard className="h-full p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-secondary text-primary">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{tLanguages('title')}</h3>
              </div>
              <div className="flex flex-col justify-center gap-5 flex-1">
                {languages.map((language, index) => (
                  <LanguageBar
                    key={language.id}
                    name={language.name}
                    levelText={language.levelText}
                    percent={language.percent}
                    index={index}
                    reduce={reduce}
                  />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
