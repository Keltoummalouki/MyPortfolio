'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Sparkles, Users, Lightbulb, Target, Code, Calendar, Layers, GitCommit, Clock, RotateCcw, Handshake, Globe, type LucideIcon } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import GlassCard from '@/components/ui/GlassCard'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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
      { threshold: 0.4 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="group relative p-5 md:p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors duration-300">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="p-3 rounded-xl bg-secondary text-primary">
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          {count}{suffix}
        </div>
        <div className="text-sm text-muted-foreground font-medium">{label}</div>
      </div>
    </div>
  )
}

function QualityCard({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <GlassCard className="p-5 md:p-6 text-center">
      <div className="inline-flex p-3 rounded-xl bg-secondary text-primary mb-4">
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <h3 className="font-semibold text-foreground">{label}</h3>
    </GlassCard>
  )
}

export default function AboutSection() {
  const t = useTranslations('about')
  const tSoftSkills = useTranslations('softSkills')
  const tLanguages = useTranslations('languages')
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches || !sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-bio',
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
  }, [])

  const stats = [
    { value: 40, label: t('stats.projects'), suffix: '+', icon: Code },
    { value: 1, label: t('stats.experience'), suffix: '+', icon: Calendar },
    { value: 20, label: t('stats.technologies'), suffix: '+', icon: Layers },
    { value: 500, label: t('stats.commits'), suffix: '+', icon: GitCommit },
  ]

  const qualities = [
    { key: 'creative', icon: Sparkles },
    { key: 'dedicated', icon: Target },
    { key: 'teamPlayer', icon: Users },
    { key: 'problemSolver', icon: Lightbulb },
  ]

  const softSkills = [
    { key: 'timeManagement', icon: Clock },
    { key: 'adaptability', icon: RotateCcw },
    { key: 'teamwork', icon: Handshake },
  ]

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative section-padding overflow-hidden bg-background"
      aria-labelledby="about-title"
    >
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl float pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl float-delayed pointer-events-none" />

      <div className="relative container-main">
        <SectionHeader eyebrow={t('subtitle')} title={t('title')} />

        <div className="about-bio grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16 md:mb-20">
          <GlassCard className="p-6 md:p-8 h-full">
            <div className="inline-flex p-3 rounded-xl bg-secondary text-primary mb-5">
              <Target className="w-6 h-6" />
            </div>
            <p className="text-lg md:text-xl text-foreground leading-relaxed text-pretty">
              {t('description')}
            </p>
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * index }}
              >
                <AnimatedStat {...stat} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-20">
          {qualities.map((quality, index) => (
            <motion.div
              key={quality.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * index }}
            >
              <QualityCard icon={quality.icon} label={t(`qualities.${quality.key}`)} />
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-xl bg-secondary text-primary">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">{tSoftSkills('title')}</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {softSkills.map((skill) => (
                <span
                  key={skill.key}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-foreground text-sm"
                >
                  <skill.icon size={16} className="text-primary" />
                  {tSoftSkills(`items.${skill.key}`)}
                </span>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-xl bg-secondary text-primary">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">{tLanguages('title')}</h3>
            </div>
            <div className="space-y-3">
              {(['arabic', 'french', 'english'] as const).map((lang) => (
                <div key={lang} className="flex items-center justify-between">
                  <span className="text-foreground">{tLanguages(lang)}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
