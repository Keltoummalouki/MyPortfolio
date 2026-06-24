'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Mail, Github, Linkedin, Download, ChevronDown, ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const ThreeBackground = dynamic(
  () => import('@/components/three/ThreeBackground'),
  { ssr: false }
)

export default function HeroSection() {
  const t = useTranslations('hero')
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [showThreeJS, setShowThreeJS] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const isDesktop = window.innerWidth >= 1024
    const timer = !mediaQuery.matches && isDesktop
      ? setTimeout(() => setShowThreeJS(true), 1200)
      : null

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
      if (e.matches) setShowThreeJS(false)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      if (timer) clearTimeout(timer)
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || !contentRef.current || !imageRef.current || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

      tl.fromTo(
        '.hero-greeting',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
      .fromTo(
        '.hero-title',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.2
      )
      .fromTo(
        '.hero-role',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.4
      )
      .fromTo(
        '.hero-desc',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.5
      )
      .fromTo(
        '.hero-meta',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5 },
        0.6
      )
      .fromTo(
        '.hero-ctas',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.7
      )
      .fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.9, x: 40 },
        { opacity: 1, scale: 1, x: 0, duration: 0.9 },
        0.4
      )

      gsap.to(imageRef.current, {
        y: 40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      })

      gsap.to(contentRef.current, {
        opacity: 0,
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '20% top',
          end: '60% top',
          scrub: true,
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  const socialLinks = [
    { name: 'Email', href: 'mailto:keltoummalouki@gmail.com', icon: Mail },
    { name: 'GitHub', href: 'https://github.com/keltoummalouki', icon: Github },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/keltoummalouki', icon: Linkedin },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background"
      aria-label="Introduction"
    >
      {showThreeJS && (
        <Suspense fallback={null}>
          <ThreeBackground />
        </Suspense>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10 container-main grid lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-32 pb-24">
        <div ref={contentRef} className="order-2 lg:order-1">
          <p className="hero-greeting text-muted-foreground text-base md:text-lg mb-4 flex items-center gap-3">
            <span className="inline-block w-10 h-[1px] bg-primary" />
            {t('greeting')}
          </p>

          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-5 leading-[1.05] tracking-tight text-foreground">
            {t('name')}
          </h1>

          <p className="hero-role text-xl md:text-2xl lg:text-3xl font-medium text-gradient mb-6">
            {t('role')}
          </p>

          <p className="hero-desc text-base md:text-lg text-muted-foreground mb-6 max-w-lg leading-relaxed text-pretty">
            {t('description')}
          </p>

          <div className="hero-meta flex flex-wrap items-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground">
              <MapPin size={14} className="text-primary" />
              {t('location')}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {t('openToWork')}
            </span>
          </div>

          <div className="hero-ctas flex flex-wrap gap-4 mb-8">
            <Button
              asChild
              size="lg"
              className="group bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-5 rounded-xl transition-all duration-200"
            >
              <a href="/cv.pdf" download target="_blank" rel="noopener noreferrer">
                <Download size={18} className="mr-2" />
                {t('downloadCV')}
                <ArrowRight size={16} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </a>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="px-6 py-5 rounded-xl border-border hover:border-primary hover:text-primary transition-all duration-200"
            >
              <a href="#contact">{t('contactMe')}</a>
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                target={link.name !== 'Email' ? '_blank' : undefined}
                rel={link.name !== 'Email' ? 'noopener noreferrer' : undefined}
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-all duration-200 min-h-[44px]"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -16 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.8 + index * 0.08 }}
                whileHover={{ y: -2 }}
                aria-label={link.name}
              >
                <link.icon size={16} aria-hidden="true" />
                <span className="hidden sm:inline text-sm font-medium">{link.name}</span>
              </motion.a>
            ))}
          </div>
        </div>

        <div ref={imageRef} className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-full blur-3xl" />

          <motion.div
            className="absolute inset-0 rounded-full border border-primary/20"
            animate={prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative w-[260px] h-[260px] md:w-[320px] md:h-[320px]">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-border relative z-10 bg-card">
              <Image
                src="/images/keltoum.png"
                alt="Keltoum Malouki, Full Stack Web Developer"
                fill
                sizes="(max-width: 768px) 260px, 320px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 1 }}
      >
        <span className="text-xs text-muted-foreground uppercase tracking-widest">{t('scrollDown')}</span>
        <motion.div
          className="p-2 rounded-full border border-border bg-card"
          animate={prefersReducedMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-primary" />
        </motion.div>
      </motion.div>
    </section>
  )
}
