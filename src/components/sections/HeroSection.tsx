'use client'

import { useEffect, useRef, useState, Suspense, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { ArrowRight, ChevronDown, Download, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SocialIcon from '@/components/ui/SocialIcon'
import { useThreeReady } from '@/components/three/useThreeReady'
import type { PublicAbout, PublicSocialLink } from '@/features/cms/queries'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const ThreeBackground = dynamic(
  () => import('@/components/three/ThreeBackground'),
  { ssr: false },
)

// Staggered CSS entrance (see `.hero-enter` in globals.css). It runs from the
// first paint, so server-rendered content is never hidden waiting for hydration.
function enterDelay(seconds: number): CSSProperties {
  return { '--hero-delay': `${seconds}s` } as CSSProperties
}

// next/image can only optimize hosts allowed in next.config `images.remotePatterns`.
function canOptimize(src: string) {
  return src.startsWith('/') || /^https:\/\/[^/]+\.supabase\.co\//.test(src)
}

function availabilityLabel(t: ReturnType<typeof useTranslations>, status: string | undefined) {
  if (status === 'limited' || status === 'unavailable') {
    return t(`availability.${status}`)
  }
  if (status === 'available') return t('availability.available')
  return t('openToWork')
}

export default function HeroSection({
  about,
  socialLinks = [],
}: {
  about?: PublicAbout
  socialLinks?: PublicSocialLink[]
}) {
  const t = useTranslations('hero')
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const threeReady = useThreeReady()
  const showThreeJS = threeReady && !prefersReducedMotion

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || !contentRef.current || !imageRef.current || !sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        y: 40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
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
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  const displayName = about?.fullName || t('name')
  const role = about?.headline || t('role')
  const description = about?.bio || t('description')
  const location = about?.location || t('location')
  const cvUrl = about?.cvUrl || '/cv.pdf'
  const avatarUrl = about?.avatarUrl || '/images/keltoum.png'
  const socialItems = socialLinks.length
    ? socialLinks.slice(0, 3).map((link) => ({
        name: link.label || link.platform,
        href: link.url,
        platform: link.platform,
        icon: link.icon,
      }))
    : [
        { name: 'Email', href: 'mailto:keltoummalouki@gmail.com', platform: 'email', icon: 'email' },
        { name: 'GitHub', href: 'https://github.com/keltoummalouki', platform: 'github', icon: 'github' },
        { name: 'LinkedIn', href: 'https://www.linkedin.com/in/keltoummalouki', platform: 'linkedin', icon: 'linkedin' },
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
          <p className="hero-enter text-muted-foreground text-base md:text-lg mb-4 flex items-center gap-3">
            <span className="inline-block w-10 h-[1px] bg-primary" />
            {t('greeting')}
          </p>

          <h1 className="hero-enter text-5xl md:text-6xl lg:text-7xl font-bold mb-5 leading-[1.05] tracking-tight text-foreground" style={enterDelay(0.08)}>
            {displayName}
          </h1>

          <p className="hero-enter text-xl md:text-2xl lg:text-3xl font-medium text-gradient mb-6" style={enterDelay(0.16)}>
            {role}
          </p>

          <p className="hero-enter text-base md:text-lg text-muted-foreground mb-6 max-w-lg leading-relaxed text-pretty" style={enterDelay(0.24)}>
            {description}
          </p>

          <div className="hero-enter flex flex-wrap items-center gap-3 mb-8" style={enterDelay(0.32)}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground">
              <MapPin size={14} className="text-primary" />
              {location}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {availabilityLabel(t, about?.availabilityStatus)}
            </span>
          </div>

          <div className="hero-enter flex flex-wrap gap-4 mb-8" style={enterDelay(0.4)}>
            <Button
              asChild
              size="lg"
              className="group bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-5 rounded-xl transition-all duration-200"
            >
              <a href={cvUrl} download target="_blank" rel="noopener noreferrer">
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
            {socialItems.map((link, index) => (
              <a
                key={`${link.name}-${link.href}`}
                href={link.href}
                target={link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
                className="hero-enter group flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-muted-foreground hover:-translate-y-0.5 hover:border-primary hover:text-primary transition-all duration-200 min-h-[44px]"
                style={enterDelay(0.48 + index * 0.06)}
                aria-label={link.name}
              >
                {link.platform === 'email' ? (
                  <Mail size={16} aria-hidden="true" />
                ) : (
                  <SocialIcon platform={link.platform} icon={link.icon} className="size-4" />
                )}
                <span className="hidden sm:inline text-sm font-medium">{link.name}</span>
              </a>
            ))}
          </div>
        </div>

        <div ref={imageRef} className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-full blur-3xl" />

          <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_60s_linear_infinite]" />

          {/* Transform-only entrance: the avatar is the LCP element, so it must never start hidden. */}
          <div className="hero-pop relative w-[260px] h-[260px] md:w-[320px] md:h-[320px]">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-border relative z-10 bg-card">
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 768px) 320px, 260px"
                unoptimized={!canOptimize(avatarUrl)}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="hero-enter flex flex-col items-center gap-2" style={enterDelay(0.7)}>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">{t('scrollDown')}</span>
          <div className="p-2 rounded-full border border-border bg-card animate-[hero-bob_1.6s_ease-in-out_infinite]">
            <ChevronDown size={18} className="text-primary" />
          </div>
        </div>
      </div>
    </section>
  )
}
