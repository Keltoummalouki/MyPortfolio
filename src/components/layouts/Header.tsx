'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { cn } from '@/lib/utils'

const Logo3D = dynamic(() => import('@/components/three/Logo3D'), {
  ssr: false,
  loading: () => (
    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary text-primary font-bold">
      M
    </div>
  ),
})

const navItems = [
  { href: '#about', key: 'about' },
  { href: '#skills', key: 'skills' },
  { href: '#experience', key: 'experience' },
  { href: '#education', key: 'education' },
  { href: '#projects', key: 'projects' },
  { href: '#certifications', key: 'certifications' },
  { href: '#github', key: 'github' },
  { href: '#contact', key: 'contact' },
] as const

export default function Header() {
  const t = useTranslations('nav')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const headerRef = useRef<HTMLElement>(null)

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20)

    for (const item of navItems) {
      const element = document.getElementById(item.href.slice(1))
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= 160 && rect.bottom >= 160) {
          setActiveSection(item.href.slice(1))
          break
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false)

    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      ref={headerRef}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <div
        className={cn(
          'max-w-7xl mx-auto transition-all duration-300 rounded-2xl px-4 py-3',
          isScrolled
            ? 'bg-background/85 backdrop-blur-xl border border-border shadow-lg shadow-black/5'
            : 'bg-background/50 backdrop-blur-md border border-transparent'
        )}
      >
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="relative flex items-center gap-2 group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-10 h-10">
                <Logo3D className="w-full h-full" />
              </div>
              <span className="hidden sm:block text-lg font-semibold text-foreground tracking-tight">
                <span className="text-primary">M</span>alouki
              </span>
            </Link>
          </motion.div>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'group relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg',
                  activeSection === item.href.slice(1)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                {t(item.key)}
                {activeSection === item.href.slice(1) && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />

            <button
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={20} className="text-primary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -45 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden"
            >
              <nav className="flex flex-col gap-1 pt-4 pb-2 border-t border-border mt-3" aria-label="Mobile navigation">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      'w-full py-3 px-4 rounded-xl text-left font-medium transition-colors duration-200',
                      activeSection === item.href.slice(1)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    {t(item.key)}
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
