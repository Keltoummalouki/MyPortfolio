'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import gsap from 'gsap'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageSwitcher from '../ui/LanguageSwitcher'

// Dynamically import 3D logo
const Logo3D = dynamic(() => import('../three/Logo3D'), {
  ssr: false,
  loading: () => (
    <div className="w-12 h-12 flex items-center justify-center">
      <span className="text-xl font-bold text-[#3B82F6]">M</span>
    </div>
  ),
})

export default function Header() {
  const t = useTranslations('nav')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const headerRef = useRef<HTMLElement>(null)
  const navItemsRef = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Determine active section
      const sections = ['about', 'competences', 'education', 'experience', 'projects', 'github', 'contact']

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate nav items with stagger
      gsap.fromTo(
        navItemsRef.current.filter(Boolean),
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.5,
        }
      )
    }, headerRef)

    return () => ctx.revert()
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    { href: '#about', key: 'about' },
    { href: '#competences', key: 'skills' },
    { href: '#education', key: 'education' },
    { href: '#experience', key: 'experience' },
    { href: '#projects', key: 'projects' },
    { href: '#github', key: 'github' },
    { href: '#contact', key: 'contact' },
  ]

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
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${isScrolled
        ? 'py-2 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-[#27272A]'
        : 'py-4 bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* 3D Logo */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <Link
            href="/"
            className="relative flex items-center gap-2"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-12 h-12">
              <Logo3D className="w-full h-full" />
            </div>
            <span className="hidden sm:block text-lg font-semibold text-foreground">
              <span className="text-[#3B82F6]">M</span>alouki
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item, index) => (
            <button
              key={item.href}
              ref={(el) => { navItemsRef.current[index] = el }}
              onClick={() => handleNavClick(item.href)}
              className={`group relative px-4 py-2 text-sm font-medium transition-all duration-300 ${activeSection === item.href.slice(1)
                ? 'text-[#3B82F6]'
                : 'text-[#94A3B8] hover:text-foreground'
                }`}
            >
              {t(item.key)}

              {/* Underline animation */}
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#3B82F6] transition-all duration-300 ${activeSection === item.href.slice(1)
                  ? 'w-full'
                  : 'w-0 group-hover:w-1/2'
                  }`}
              />
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          {/* Mobile Menu Toggle */}
          <motion.button
            className="lg:hidden p-2 rounded-lg border border-[#27272A] hover:border-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={22} className="text-[#3B82F6]" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-4 right-4 mt-2 p-4 rounded-xl bg-[#111113] border border-[#27272A] shadow-2xl lg:hidden"
            >
              <nav className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`w-full py-3 px-4 rounded-lg text-left font-medium transition-all ${activeSection === item.href.slice(1)
                      ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-l-2 border-[#3B82F6]'
                      : 'text-[#94A3B8] hover:bg-[#1A1A1D] hover:text-foreground'
                      }`}
                    initial={{ opacity: 0, x: -20 }}
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
