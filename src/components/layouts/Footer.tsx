'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Heart, Code } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('footer')
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: t('links.github'),
      href: 'https://github.com/keltoummalouki',
      icon: Github,
    },
    {
      name: t('links.linkedin'),
      href: 'https://www.linkedin.com/in/keltoummalouki',
      icon: Linkedin,
    },
    {
      name: t('links.email'),
      href: 'mailto:keltoummalouki@gmail.com',
      icon: Mail,
    },
  ]

  return (
    <footer className="relative py-12 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <h3 className="text-xl font-bold text-foreground tracking-tight mb-1">
              Keltoum <span className="text-primary">Malouki</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              © {currentYear} {t('copyright')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                aria-label={link.name}
              >
                <link.icon size={18} />
              </a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span>{t('madeWith')}</span>
            <Heart size={14} className="text-primary fill-primary" />
            <span>{t('and')}</span>
            <Code size={14} className="text-primary" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-6 border-t border-border text-center"
        >
          <p className="text-xs text-muted-foreground">
            Built with Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, GSAP, Three.js & Framer Motion
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
