'use client'

import { useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { prefersReducedMotion } from '@/lib/motion/reduced-motion'
import { cn } from '@/lib/utils'

/**
 * 1–5 star picker built on native radio inputs (one tab stop, arrow keys move
 * the selection, works without JS for the form post). Hovering previews a
 * value; choosing one plays a short anime.js stagger over the filled stars.
 */
export default function StarRatingInput({
  name,
  labelId,
  describedBy,
  invalid,
}: {
  name: string
  /** id of the visible group label. */
  labelId: string
  describedBy?: string
  invalid?: boolean
}) {
  const t = useTranslations('reviews.form')
  const [value, setValue] = useState(0)
  const [hover, setHover] = useState(0)
  const groupRef = useRef<HTMLDivElement>(null)
  const shown = hover || value

  const choose = (rating: number) => {
    setValue(rating)
    const stars = groupRef.current?.querySelectorAll<HTMLElement>('[data-star]')
    if (!stars || prefersReducedMotion()) return
    animate(Array.from(stars).slice(0, rating), {
      scale: [0.6, 1.15, 1],
      rotate: [-12, 0],
      duration: 480,
      delay: stagger(45),
      ease: 'outBack(1.8)',
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((rating) => {
          const id = `${name}-${rating}`
          const active = rating <= shown
          return (
            <label
              key={rating}
              htmlFor={id}
              onMouseEnter={() => setHover(rating)}
              className="relative cursor-pointer rounded-lg p-1 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background"
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={rating}
                checked={value === rating}
                onChange={() => choose(rating)}
                className="sr-only"
                aria-label={t('ratingOption', { rating })}
              />
              <Star
                data-star
                aria-hidden="true"
                className={cn(
                  'size-8 transition-colors duration-150',
                  active ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/50',
                )}
              />
            </label>
          )
        })}
      </div>
      <span aria-hidden="true" className="min-w-[6rem] text-sm font-medium text-muted-foreground">
        {shown > 0 ? t(`ratingLabels.${shown}`) : ''}
      </span>
    </div>
  )
}
