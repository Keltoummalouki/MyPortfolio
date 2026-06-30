'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import GlassCard from '@/components/ui/GlassCard'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function GithubStatsSection() {
  const t = useTranslations('github')
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
        '.github-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  const username = 'keltoummalouki'
  const themeParams = 'theme=dark&hide_border=true&bg_color=0B0F19&title_color=3B82F6&icon_color=8B5CF6&text_color=F8FAFC'

  const githubStats = [
    {
      title: 'GitHub Stats',
      src: `https://github-readme-stats.vercel.app/api?username=${username}&${themeParams}&show_icons=true`,
      width: 520,
      height: 200,
    },
    {
      title: 'GitHub Streak',
      src: `https://github-readme-streak-stats.herokuapp.com?user=${username}&${themeParams}&ring=3B82F6&fire=8B5CF6&currStreakLabel=F8FAFC`,
      width: 520,
      height: 200,
    },
  ]

  return (
    <section
      id="github"
      ref={sectionRef}
      className="relative section-padding overflow-hidden bg-background"
      aria-labelledby="github-title"
    >
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-main">
        <SectionHeader eyebrow={t('subtitle')} title={t('title')} />

        <div className="flex flex-col items-center gap-8 mb-12">
          {githubStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              className="github-card w-full max-w-xl"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.01 }}
            >
              <GlassCard className="p-3 overflow-hidden">
                <Image
                  src={stat.src}
                  alt={stat.title}
                  width={stat.width}
                  height={stat.height}
                  className="w-full h-auto rounded-xl"
                  unoptimized
                />
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
          >
            <Github className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">{t('viewProfile')}</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
