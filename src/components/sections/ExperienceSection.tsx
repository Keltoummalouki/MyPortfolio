'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Briefcase, Award, Code } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const experienceItems = [
  {
    id: 'caisseManager',
    type: 'work',
    icon: Briefcase,
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'GSAP', 'Framer Motion'],
  },
  {
    id: 'docker',
    type: 'certification',
    icon: Award,
    technologies: ['Docker', 'Containerization', 'DevOps'],
  },
]

export default function ExperienceSection() {
  const t = useTranslations('experience')
  const sectionRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate timeline line
      gsap.fromTo(
        '.timeline-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 80%',
          }
        }
      )

      // Animate items
      gsap.fromTo(
        '.timeline-item',
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 75%',
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            className="inline-block px-4 py-2 rounded-full border border-[#27272A] text-sm font-medium text-[#3B82F6] mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('subtitle')}
          </motion.span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">{t('title')}</span>
          </h2>

          <div className="w-24 h-1 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] mx-auto rounded-full" />
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Timeline Line */}
          <div className="timeline-line absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#3B82F6] via-[#60A5FA] to-[#64748B] origin-top" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {experienceItems.map((item) => {
              const Icon = item.icon

              return (
                <motion.div
                  key={item.id}
                  className="timeline-item relative pl-12 md:pl-20"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 md:left-4 top-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${item.type === 'certification'
                    ? 'bg-gradient-to-br from-[#64748B] to-[#94A3B8]'
                    : 'bg-gradient-to-br from-[#3B82F6] to-[#1E40AF]'
                    }`}>
                    <Icon size={16} className="text-[#0A0A0B]" />
                  </div>

                  {/* Content Card */}
                  <div className="group p-6 rounded-2xl glass-card hover-lift">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-[#3B82F6] transition-colors">
                        {t(`items.${item.id}.title`)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.type === 'certification'
                        ? 'bg-[#64748B]/20 text-[#94A3B8]'
                        : 'bg-[#3B82F6]/20 text-[#3B82F6]'
                        }`}>
                        {t(`items.${item.id}.date`)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {t(`items.${item.id}.company`)}
                    </p>

                    <p className="text-muted-foreground mb-4">
                      {t(`items.${item.id}.description`)}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
