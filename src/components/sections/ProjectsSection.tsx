'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Github, ExternalLink, Star, ChevronLeft, ChevronRight, Folder, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

gsap.registerPlugin(ScrollTrigger)

// Projects data with TruckFlow and Réservez-Moi featured
const projects = [
  {
    id: 'truckflow',
    title: 'TruckFlow',
    image: '/images/truckflow.jpg',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express.js', 'Socket.io'],
    github: 'https://github.com/Keltoummalouki/TruckFlow',
    demo: '',
    featured: true,
    category: 'fullstack',
  },
  {
    id: 'reservezmoi',
    title: 'Réservez-Moi',
    image: '/images/reservezmoi.png',
    technologies: ['Laravel', 'Blade', 'PHP', 'MySQL', 'Tailwind CSS'],
    github: 'https://github.com/Keltoummalouki/Reservez-Moi',
    demo: '',
    featured: false,
    category: 'fullstack',
  },
  {
    id: 'budgetbuddy',
    title: 'BudgetBuddy',
    image: '/images/BudgetBuddy.png',
    technologies: ['Laravel', 'React.js', 'PostgreSQL', 'Swagger'],
    github: 'https://github.com/Keltoummalouki/BudgetBuddy',
    demo: '',
    featured: false,
    category: 'fullstack',
  },
  {
    id: 'testsplatform',
    title: 'Tests Acceptance Platform',
    image: '/images/youcode.png',
    technologies: ['Laravel', 'Blade', 'PHP', 'PostgreSQL'],
    github: 'https://github.com/Keltoummalouki/Tests-Acceptance-Platform-Youcode',
    demo: '',
    featured: false,
    category: 'backend',
  },
  {
    id: 'dentacare',
    title: 'DentaCare',
    image: '/images/dentacare.jpg',
    technologies: ['C'],
    github: 'https://github.com/Keltoummalouki/DentaCare',
    demo: '',
    featured: false,
    category: 'other',
  },
  {
    id: 'youdemy',
    title: 'Youdemy',
    image: '/images/Udemy.png',
    technologies: ['HTML', 'Tailwind CSS', 'JavaScript', 'PHP', 'MySQL'],
    github: 'https://github.com/Keltoummalouki/Youdemy',
    demo: '',
    featured: false,
    category: 'fullstack',
  },
]

interface ProjectCardProps {
  project: typeof projects[0]
  index: number
  t: ReturnType<typeof useTranslations<'projects'>>
}

function ProjectCard({ project, index, t }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Get translated description
  const descriptionKey = `items.${project.id}.description` as const
  const description = t.has(descriptionKey) ? t(descriptionKey) : project.title

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * 10
    const rotateY = ((centerX - x) / centerX) * 10

    setMousePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    })

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      className="group relative rounded-2xl overflow-hidden glass-card transition-all duration-500"
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Dynamic gradient spotlight following mouse */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)`
        }}
      />

      {/* Featured Badge */}
      {project.featured && (
        <motion.div
          className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg"
          initial={{ scale: 0, rotate: -20 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
        >
          <Star size={12} className="fill-current" />
          {t('featured')}
        </motion.div>
      )}

      {/* Image Container */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={project.image || '/images/placeholder.png'}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-all duration-700 ${isHovered ? 'scale-110 blur-sm' : 'scale-100'
            }`}
        />

        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-70'
          }`} />

        {/* Quick Actions - appear on hover */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          {project.github && (
            <motion.a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Github size={24} className="text-white" />
            </motion.a>
          )}
          {project.demo && (
            <motion.a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.15, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <ExternalLink size={24} className="text-white" />
            </motion.a>
          )}
        </motion.div>

        {/* Floating folder icon */}
        <motion.div
          className="absolute bottom-4 right-4"
          style={{ transform: 'translateZ(30px)' }}
        >
          <div className="p-2 rounded-lg bg-purple-500/20 backdrop-blur-sm">
            <Folder size={20} className="text-purple-300" />
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative p-6" style={{ transform: 'translateZ(25px)' }}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-xl font-bold text-foreground group-hover:text-purple-500 transition-colors">
            {project.title}
          </h3>
          <Code2 size={18} className="text-muted-foreground flex-shrink-0 mt-1" />
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-5">
          {project.technologies.slice(0, 4).map((tech, i) => (
            <motion.span
              key={tech}
              className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.05 }}
            >
              {tech}
            </motion.span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {project.github && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 group/btn"
            >
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Github size={16} className="group-hover/btn:rotate-12 transition-transform" />
                {t('viewCode')}
              </a>
            </Button>
          )}
          {project.demo && (
            <Button
              size="sm"
              asChild
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                {t('liveDemo')}
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  )
}

export default function ProjectsSection() {
  const t = useTranslations('projects')
  const sectionRef = useRef<HTMLElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const projectsPerPage = 6

  const totalPages = Math.ceil(projects.length / projectsPerPage)
  const currentProjects = projects.slice(
    currentPage * projectsPerPage,
    (currentPage + 1) * projectsPerPage
  )

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header
      gsap.fromTo(
        '.projects-header',
        { opacity: 0, y: 60 },
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

  // Count featured projects
  const featuredCount = projects.filter(p => p.featured).length

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="projects-header text-center mb-16">
          <motion.span
            className="inline-block px-4 py-2 rounded-full glass text-sm font-medium text-purple-500 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('techStack')}
          </motion.span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">{t('title')}</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('subtitle')}
          </p>

          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mx-auto rounded-full mb-8" />

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div
              className="px-5 py-2 rounded-full glass-card text-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <span className="font-bold text-purple-500">{projects.length}</span>
              <span className="text-muted-foreground ml-2">Projects</span>
            </motion.div>
            <motion.div
              className="px-5 py-2 rounded-full glass-card text-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <span className="font-bold text-amber-500">{featuredCount}</span>
              <span className="text-muted-foreground ml-2">Featured</span>
            </motion.div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              t={t}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="flex justify-center items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="rounded-full hover:bg-purple-500/10 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentPage
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125'
                    : 'bg-gray-400 hover:bg-purple-400'
                    }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="rounded-full hover:bg-purple-500/10 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
