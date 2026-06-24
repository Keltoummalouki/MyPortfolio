'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BentoCardProps {
  children: React.ReactNode
  className?: string
  colSpan?: 1 | 2 | 3
  rowSpan?: 1 | 2
  delay?: number
}

export default function BentoCard({ children, className, delay = 0 }: BentoCardProps) {
  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl',
        'transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
        className
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}
