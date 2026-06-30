'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow: string
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
}

export default function SectionHeader({ eyebrow, title, subtitle, centered = true, className }: SectionHeaderProps) {
  return (
    <div className={cn(centered && 'text-center', 'mb-14 md:mb-20', className)}>
      <motion.span
        data-section-eyebrow
        className="inline-block px-4 py-1.5 rounded-full bg-secondary border border-border text-sm font-medium text-primary mb-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        {eyebrow}
      </motion.span>

      <motion.h2
        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight text-foreground"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {title}
      </motion.h2>

      <motion.div
        className="h-1 w-16 bg-gradient-to-r from-primary to-violet-500 rounded-full"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ transformOrigin: centered ? 'center' : 'left', margin: centered ? '0 auto 1.25rem' : undefined }}
      />

      {subtitle && (
        <motion.p
          className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
