'use client'

import { useEffect, useRef, Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Mail, Github, Linkedin, Download, ChevronDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

gsap.registerPlugin(ScrollTrigger)

// Dynamically import Three.js background
const ThreeBackground = dynamic(
  () => import('@/components/three/ThreeBackground'),
  { ssr: false }
)

export default function Hero() {
  const t = useTranslations('hero')
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    const ctx = gsap.context(() => {
      // Create a master timeline
      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' }
      })

      // Title animation - letter by letter effect
      if (titleRef.current) {
        const chars = titleRef.current.querySelectorAll('.char')
        tl.fromTo(
          chars,
          {
            opacity: 0,
            y: 100,
            rotateX: -80
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1,
            stagger: 0.03
          },
          0.3
        )
      }

      // Subtitle slide up
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 },
          0.8
        )
      }

      // Description fade in
      if (descRef.current) {
        tl.fromTo(
          descRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          1
        )
      }

      // Image reveal with scale
      if (imageRef.current) {
        tl.fromTo(
          imageRef.current,
          { opacity: 0, scale: 0.8, x: 50 },
          { opacity: 1, scale: 1, x: 0, duration: 1 },
          0.5
        )
      }

      // CTA buttons
      if (ctaRef.current) {
        const buttons = ctaRef.current.querySelectorAll('a, button')
        tl.fromTo(
          buttons,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          1.2
        )
      }

      // Scroll-triggered parallax for image
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          y: 100,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          }
        })
      }

      // Fade out content on scroll
      gsap.to('.hero-content', {
        opacity: 0,
        y: -80,
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
  }, [])

  const socialLinks = [
    { name: 'Email', href: 'mailto:keltoummalouki@gmail.com', icon: Mail },
    { name: 'GitHub', href: 'https://github.com/Keltoummalouki', icon: Github },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/keltoum-malouki-79a28029a/', icon: Linkedin }
  ]

  // Split name into characters for animation
  const nameChars = t('name').split('').map((char, i) => (
    <span key={i} className="char inline-block" style={{ perspective: '1000px' }}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A0A0B]"
    >
      {/* Three.js Background */}
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0B] pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Content */}
      <div className="hero-content relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="order-2 lg:order-1">
          {/* Greeting */}
          <motion.p
            className="text-[#94A3B8] text-lg mb-4 flex items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-block w-12 h-[1px] bg-[#3B82F6]" />
            {t('greeting')}
          </motion.p>

          {/* Name */}
          <h1
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight text-foreground"
            style={{ perspective: '1000px' }}
          >
            {nameChars}
          </h1>

          {/* Role */}
          <p
            ref={subtitleRef}
            className="text-2xl md:text-3xl font-light text-[#3B82F6] mb-6"
          >
            {t('role')}
          </p>

          {/* Description */}
          <p
            ref={descRef}
            className="text-lg text-[#94A3B8] mb-8 max-w-lg leading-relaxed"
          >
            {t('description')}
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap gap-3 mb-8">
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                target={link.name !== 'Email' ? '_blank' : undefined}
                rel={link.name !== 'Email' ? 'noopener noreferrer' : undefined}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-[#27272A] text-[#94A3B8] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <link.icon size={18} />
                <span className="hidden sm:inline text-sm font-medium">{link.name}</span>
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <a href="/cv.pdf" download target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="group bg-[#3B82F6] hover:bg-[#1E40AF] text-white font-semibold px-6 py-6 rounded-lg transition-all duration-300"
              >
                <Download size={18} className="mr-2" />
                {t('downloadCV')}
                <ArrowRight size={16} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </a>

            <a href="#contact">
              <Button
                size="lg"
                variant="outline"
                className="px-6 py-6 rounded-lg border-[#27272A] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all duration-300"
              >
                {t('contactMe')}
              </Button>
            </a>
          </div>
        </div>

        {/* Profile Image */}
        <div ref={imageRef} className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
          {/* Decorative elements */}
          <div className="absolute -inset-4 bg-gradient-to-br from-[#3B82F6]/10 to-[#60A5FA]/10 rounded-full blur-3xl" />

          {/* Blue accent ring */}
          <motion.div
            className="absolute -inset-2 rounded-full border border-[#3B82F6]/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          />

          {/* Image container */}
          <div className="relative w-[280px] h-[280px] md:w-[350px] md:h-[350px]">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#27272A] relative z-10">
              <Image
                src="/images/keltoum.jpg"
                alt="Keltoum Malouki"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Status Badge */}
            <motion.div
              className="absolute -bottom-2 -right-2 px-4 py-2 rounded-lg bg-[#111113] border border-[#27272A] shadow-lg z-20"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: isLoaded ? 1 : 0, rotate: isLoaded ? 0 : -10 }}
              transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-foreground">{t('openToWork')}</span>
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <span className="text-xs text-[#94A3B8] uppercase tracking-widest">{t('scrollDown')}</span>
        <motion.div
          className="p-2 rounded-full border border-[#27272A]"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} className="text-[#3B82F6]" />
        </motion.div>
      </motion.div>
    </section>
  )
}
