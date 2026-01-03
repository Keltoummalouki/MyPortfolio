'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Users,
  Lightbulb,
  Target,
  Code,
  Calendar,
  Layers,
  GitCommit,
  MapPin,
  Briefcase,
  GraduationCap
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

import type { LucideIcon } from 'lucide-react'

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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 2000
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
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value])

  return (
    <motion.div
      ref={ref}
      className="relative p-6 rounded-2xl glass-card hover-lift group"
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 to-[#60A5FA]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex flex-col items-center text-center gap-3">
        <motion.div
          className="p-3 rounded-xl bg-[#1A1A1D] border border-[#27272A]"
          whileHover={{ rotate: 10, scale: 1.1 }}
        >
          <Icon className="w-6 h-6 text-[#3B82F6]" />
        </motion.div>

        <div className="text-4xl md:text-5xl font-bold gradient-text">
          {count}{suffix}
        </div>

        <div className="text-sm text-muted-foreground font-medium">
          {label}
        </div>
      </div>
    </motion.div>
  )
}

// Timeline component for journey visualization
function JourneyTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null)

  const journeyItems = [
    {
      year: '2024',
      title: 'YouCode (UM6P)',
      description: 'Full Stack Development Training',
      icon: GraduationCap,
      color: 'from-[#3B82F6] to-[#1E40AF]',
    },
    {
      year: '2025',
      title: 'Caisse Manager',
      description: 'Front-End Developer Internship',
      icon: Briefcase,
      color: 'from-[#3B82F6] to-[#60A5FA]',
    },
    {
      year: 'Now',
      title: 'Casablanca, Morocco',
      description: 'Ready for new opportunities',
      icon: MapPin,
      color: 'from-[#64748B] to-[#94A3B8]',
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.timeline-item',
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.2,
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 80%',
          }
        }
      )
    }, timelineRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={timelineRef} className="relative mt-12">
      {/* Timeline line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#3B82F6] via-[#60A5FA] to-[#64748B]" />

      {journeyItems.map((item, index) => (
        <motion.div
          key={item.year}
          className={`timeline-item relative flex items-center mb-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {/* Content */}
          <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'} pl-12 md:pl-0`}>
            <motion.div
              className="p-4 rounded-xl glass-card inline-block"
              whileHover={{ scale: 1.02 }}
            >
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${item.color} mb-2`}>
                {item.year}
              </span>
              <h4 className="font-bold text-foreground">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          </div>

          {/* Center dot */}
          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-[#3B82F6] flex items-center justify-center z-10">
            <item.icon className="w-4 h-4 text-[#3B82F6]" />
          </div>

          {/* Spacer for alternating layout */}
          <div className="hidden md:block flex-1" />
        </motion.div>
      ))}
    </div>
  )
}

export default function AboutSection() {
  const t = useTranslations('about')
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate section entrance
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      )

      // Animate qualities with stagger
      gsap.fromTo(
        '.quality-card',
        { opacity: 0, scale: 0.8, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: '.qualities-container',
            start: 'top 85%',
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const stats = [
    { value: 15, label: t('stats.projects'), suffix: '+', icon: Code },
    { value: 2, label: t('stats.experience'), suffix: '+', icon: Calendar },
    { value: 20, label: t('stats.technologies'), suffix: '+', icon: Layers },
    { value: 500, label: t('stats.commits'), suffix: '+', icon: GitCommit },
  ]

  const qualities = [
    { key: 'creative', icon: Sparkles, color: 'from-[#3B82F6] to-[#1E40AF]' },
    { key: 'dedicated', icon: Target, color: 'from-[#60A5FA] to-[#3B82F6]' },
    { key: 'teamPlayer', icon: Users, color: 'from-[#3B82F6] to-[#60A5FA]' },
    { key: 'problemSolver', icon: Lightbulb, color: 'from-[#64748B] to-[#94A3B8]' },
  ]

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 px-4 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Decorative Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl float-delayed" />

      <div ref={contentRef} className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            className="inline-block px-4 py-2 rounded-full glass text-sm font-medium text-purple-500 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('subtitle')}
          </motion.span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">{t('title')}</span>
          </h2>

          {/* Decorative Line */}
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mx-auto rounded-full" />
        </div>

        {/* Description */}
        <motion.div
          className="max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg md:text-xl text-center text-muted-foreground leading-relaxed">
            {t('description')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
            >
              <AnimatedStat {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Journey Timeline */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-center mb-4 gradient-text">My Journey</h3>
          <JourneyTimeline />
        </motion.div>

        {/* Qualities */}
        <div className="qualities-container grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {qualities.map((quality) => (
            <motion.div
              key={quality.key}
              className="quality-card group relative p-6 rounded-2xl glass-card text-center hover-lift cursor-default"
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${quality.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <div className="relative">
                <motion.div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${quality.color} mb-4`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <quality.icon className="w-6 h-6 text-white" />
                </motion.div>

                <h3 className="font-semibold text-foreground">
                  {t(`qualities.${quality.key}`)}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}