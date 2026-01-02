'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Github, ExternalLink } from 'lucide-react'
import Image from 'next/image'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function GitHubStats() {
  const t = useTranslations('github')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
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
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const githubStats = [
    {
      title: 'GitHub Stats',
      src: 'https://github-readme-stats.vercel.app/api?username=Keltoummalouki&show_icons=true&theme=radical&hide_border=true&bg_color=0d1117&title_color=a855f7&icon_color=ec4899&text_color=ffffff',
    },
    {
      title: 'GitHub Streak',
      src: 'https://github-readme-streak-stats.herokuapp.com?user=Keltoummalouki&theme=radical&hide_border=true&background=0d1117&ring=a855f7&fire=ec4899&currStreakLabel=ffffff',
    },
  ]

  return (
    <section
      id="github"
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            className="inline-block px-4 py-2 rounded-full glass text-sm font-medium text-purple-500 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Github className="inline-block w-4 h-4 mr-2" />
            Open Source
          </motion.span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">{t('title')}</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('subtitle')}
          </p>

          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mx-auto rounded-full" />
        </div>

        {/* Stats Cards */}
        <div className="flex flex-col items-center gap-8 mb-12">
          {githubStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              className="github-card w-full max-w-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-2 rounded-2xl glass-card overflow-hidden">
                <Image
                  src={stat.src}
                  alt={stat.title}
                  width={495}
                  height={195}
                  className="w-full h-auto rounded-xl"
                  unoptimized // External URL
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="https://github.com/Keltoummalouki"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass hover:bg-purple-500/20 transition-all duration-300 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Github className="w-5 h-5 text-purple-500" />
            <span className="font-medium">{t('viewProfile')}</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
