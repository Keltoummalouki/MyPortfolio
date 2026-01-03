'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { TechIcon, type TechName, getTechColor } from '@/components/ui/TechIcon'
import { Code2, Palette, Server, Database, Rocket } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// Updated skills data with TechName types for icon lookup
const skillsData = {
  languages: [
    { name: 'JavaScript' as TechName, level: 95 },
    { name: 'TypeScript' as TechName, level: 85 },
    { name: 'PHP' as TechName, level: 90 },
    { name: 'C' as TechName, level: 75 },
    { name: 'HTML5' as TechName, level: 100 },
    { name: 'CSS3' as TechName, level: 95 },
    { name: 'SQL' as TechName, level: 85 },
  ],
  frontend: [
    { name: 'React' as TechName, level: 90 },
    { name: 'Next.js' as TechName, level: 85 },
    { name: 'Tailwind CSS' as TechName, level: 95 },
    { name: 'GSAP' as TechName, level: 80 },
    { name: 'Framer Motion' as TechName, level: 85 },
    { name: 'GraphQL' as TechName, level: 70 },
  ],
  backend: [
    { name: 'Node.js' as TechName, level: 80 },
    { name: 'Express.js' as TechName, level: 80 },
    { name: 'NestJS' as TechName, level: 70 },
    { name: 'Laravel' as TechName, level: 90 },
  ],
  databases: [
    { name: 'MySQL' as TechName, level: 90 },
    { name: 'PostgreSQL' as TechName, level: 85 },
    { name: 'MongoDB' as TechName, level: 75 },
  ],
  devops: [
    { name: 'Docker' as TechName, level: 75 },
    { name: 'Git/GitHub' as TechName, level: 95 },
    { name: 'CI/CD' as TechName, level: 70 },
    { name: 'GitLab' as TechName, level: 70 },
  ],
}

type Category = keyof typeof skillsData

interface SkillCardProps {
  name: TechName
  level: number
  index: number
  isActive: boolean
}

function SkillCard({ name, level, index, isActive }: SkillCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<SVGCircleElement>(null)
  const [count, setCount] = useState(0)
  const iconColor = getTechColor(name)

  useEffect(() => {
    if (!isActive) return

    // Animate count up
    const duration = 1500
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(level * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    const timeout = setTimeout(() => {
      requestAnimationFrame(animate)
    }, index * 100)

    return () => clearTimeout(timeout)
  }, [isActive, level, index])

  useEffect(() => {
    if (!isActive || !progressRef.current) return

    // Animate the SVG circle
    const circumference = 2 * Math.PI * 36
    gsap.fromTo(
      progressRef.current,
      { strokeDashoffset: circumference },
      {
        strokeDashoffset: circumference - (level / 100) * circumference,
        duration: 1.5,
        delay: index * 0.1,
        ease: 'power3.out',
      }
    )
  }, [isActive, level, index])

  const getGradientId = (level: number) => {
    if (level >= 90) return 'gradient-expert'
    if (level >= 75) return 'gradient-advanced'
    if (level >= 60) return 'gradient-intermediate'
    return 'gradient-learning'
  }

  return (
    <motion.div
      ref={cardRef}
      className="group relative p-4 rounded-2xl glass-card hover-lift cursor-default"
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* Hover glow effect with dynamic color */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${iconColor}10, ${iconColor}05)`
        }}
      />

      <div className="relative flex items-center gap-4">
        {/* Circular Progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            {/* SVG Gradients */}
            <defs>
              <linearGradient id="gradient-expert" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>
              <linearGradient id="gradient-advanced" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="gradient-intermediate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#93C5FD" />
              </linearGradient>
              <linearGradient id="gradient-learning" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>
            </defs>

            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeWidth="6"
            />

            {/* Progress circle */}
            <circle
              ref={progressRef}
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke={`url(#${getGradientId(level)})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 36}
              strokeDashoffset={2 * Math.PI * 36}
            />
          </svg>

          {/* Center content - Official Tech Icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <TechIcon name={name} size={22} />
            <span className="text-xs font-bold text-foreground mt-0.5">{count}%</span>
          </div>
        </div>

        {/* Skill info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-[#3B82F6] transition-colors truncate flex items-center gap-2">
            {name}
          </h3>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${level >= 90 ? 'from-[#3B82F6] to-[#1E40AF]' :
                level >= 75 ? 'from-[#60A5FA] to-[#3B82F6]' :
                  level >= 60 ? 'from-[#60A5FA] to-[#93C5FD]' :
                    'from-[#64748B] to-[#94A3B8]'
                }`}
              initial={{ width: 0 }}
              animate={{ width: isActive ? `${level}%` : 0 }}
              transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CompetenceSection() {
  const t = useTranslations('skills')
  const sectionRef = useRef<HTMLElement>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('frontend')
  const [isVisible, setIsVisible] = useState(false)

  // Category configuration with Lucide icons and gradients
  const categories: { key: Category; icon: React.ReactNode; gradient: string }[] = [
    { key: 'languages', icon: <Code2 size={16} />, gradient: 'from-[#3B82F6] to-[#1E40AF]' },
    { key: 'frontend', icon: <Palette size={16} />, gradient: 'from-[#60A5FA] to-[#3B82F6]' },
    { key: 'backend', icon: <Server size={16} />, gradient: 'from-[#3B82F6] to-[#60A5FA]' },
    { key: 'databases', icon: <Database size={16} />, gradient: 'from-[#3B82F6] to-[#93C5FD]' },
    { key: 'devops', icon: <Rocket size={16} />, gradient: 'from-[#64748B] to-[#94A3B8]' },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        onEnter: () => setIsVisible(true),
      })

      // Animate section header
      gsap.fromTo(
        '.skills-header',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Calculate total skills count
  const totalSkills = Object.values(skillsData).flat().length
  const avgProficiency = Math.round(
    Object.values(skillsData).flat().reduce((acc, skill) => acc + skill.level, 0) / totalSkills
  )

  return (
    <section
      id="competences"
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="skills-header text-center mb-16">
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

          <div className="w-24 h-1 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] mx-auto rounded-full mb-8" />

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <motion.div
              className="px-6 py-3 rounded-2xl glass-card"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-2xl font-bold gradient-text">{totalSkills}+</span>
              <span className="text-sm text-muted-foreground ml-2">Technologies</span>
            </motion.div>
            <motion.div
              className="px-6 py-3 rounded-2xl glass-card"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-2xl font-bold gradient-text">{avgProficiency}%</span>
              <span className="text-sm text-muted-foreground ml-2">Avg. Proficiency</span>
            </motion.div>
          </div>
        </div>

        {/* Category Tabs with Lucide Icons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category, index) => (
            <motion.button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`relative px-6 py-3 rounded-full font-medium transition-all duration-300 overflow-hidden ${activeCategory === category.key
                ? 'text-white shadow-lg'
                : 'glass hover:bg-white/20 dark:hover:bg-white/10'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Active background */}
              {activeCategory === category.key && (
                <motion.div
                  layoutId="activeCategory"
                  className={`absolute inset-0 bg-gradient-to-r ${category.gradient}`}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <span className="relative flex items-center gap-2">
                {category.icon}
                {t(`categories.${category.key}`)}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {skillsData[activeCategory].map((skill, index) => (
                <SkillCard
                  key={skill.name}
                  name={skill.name}
                  level={skill.level}
                  index={index}
                  isActive={isVisible}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Proficiency Legend */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: t('proficiency.expert'), color: 'bg-gradient-to-r from-emerald-500 to-emerald-400', range: '90-100%' },
            { label: t('proficiency.advanced'), color: 'bg-gradient-to-r from-blue-500 to-blue-400', range: '75-89%' },
            { label: t('proficiency.intermediate'), color: 'bg-gradient-to-r from-purple-500 to-purple-400', range: '60-74%' },
            { label: t('proficiency.learning'), color: 'bg-gradient-to-r from-amber-500 to-amber-400', range: '<60%' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <div className={`w-4 h-4 rounded-full ${item.color}`} />
              <span className="text-muted-foreground">
                {item.label} ({item.range})
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
