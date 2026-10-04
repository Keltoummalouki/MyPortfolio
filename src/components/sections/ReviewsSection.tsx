'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animate, stagger, utils } from 'animejs'
import { MessageSquareQuote, PenLine } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import GlassCard from '@/components/ui/GlassCard'
import Pagination from '@/components/ui/Pagination'
import SectionHeader from '@/components/ui/SectionHeader'
import ReviewForm from '@/components/reviews/ReviewForm'
import StarRating from '@/components/reviews/StarRating'
import { REVIEWS_PER_PAGE, reviewerInitials, summarizeReviews, type PublicReview } from '@/features/reviews'
import { paginate } from '@/lib/pagination'
import { prefersReducedMotion } from '@/lib/motion/reduced-motion'
import { scrollToElement } from '@/lib/motion/smooth-scroll'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const STARS = [5, 4, 3, 2, 1] as const

export default function ReviewsSection({ reviews }: { reviews: PublicReview[] }) {
  const t = useTranslations('reviews')
  const format = useFormatter()
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [page, setPage] = useState(1)
  const pageChanged = useRef(false)

  const summary = useMemo(() => summarizeReviews(reviews), [reviews])
  const slice = paginate(reviews, page, REVIEWS_PER_PAGE)

  // Section reveal (GSAP ScrollTrigger, like the other sections) + rating bars
  // that grow once the summary scrolls into view (anime.js).
  useEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return
    const bars = Array.from(section.querySelectorAll<HTMLElement>('[data-rating-bar]'))
    utils.set(bars, { scaleX: 0 })

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.reviews-reveal',
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: section, start: 'top 80%', once: true },
        },
      )
      ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          animate(bars, { scaleX: [0, 1], duration: 900, delay: stagger(90), ease: 'outExpo' })
        },
      })
    }, section)

    return () => {
      ctx.revert()
      utils.set(bars, { scaleX: 1 })
    }
  }, [])

  // New page of reviews: staggered entrance (anime.js), skipped on first render.
  useEffect(() => {
    if (!pageChanged.current) return
    const cards = listRef.current?.querySelectorAll<HTMLElement>(':scope > li')
    if (!cards?.length || prefersReducedMotion()) return
    const animation = animate(cards, {
      opacity: [0, 1],
      y: [18, 0],
      duration: 480,
      delay: stagger(70),
      ease: 'outQuart',
    })
    return () => {
      animation.revert()
    }
  }, [page])

  const goToPage = (next: number) => {
    pageChanged.current = true
    setPage(next)
    const list = listRef.current
    if (list && list.getBoundingClientRect().top < 80) {
      scrollToElement(list, 112)
    }
  }

  return (
    <section
      id="reviews"
      ref={sectionRef}
      aria-labelledby="reviews-title"
      className="relative section-padding overflow-hidden bg-background"
    >
      <div aria-hidden="true" className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div aria-hidden="true" className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative container-main">
        <SectionHeader id="reviews-title" eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* Rating summary */}
            <GlassCard hover={false} className="reviews-reveal p-6 md:p-8">
              <div className="flex items-center gap-5">
                <p className="text-5xl font-bold tracking-tight text-foreground tabular-nums">
                  {summary.count > 0 ? format.number(summary.average, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—'}
                </p>
                <div className="space-y-1.5">
                  <StarRating
                    value={summary.average}
                    size={20}
                    label={t('starsAria', { rating: format.number(summary.average, { maximumFractionDigits: 1 }) })}
                  />
                  <p className="text-sm text-muted-foreground">{t('count', { count: summary.count })}</p>
                </div>
              </div>

              <ul className="mt-6 space-y-2.5">
                {STARS.map((stars) => {
                  const count = summary.distribution[stars]
                  const percent = summary.count > 0 ? (count / summary.count) * 100 : 0
                  return (
                    <li key={stars} className="flex items-center gap-3 text-sm">
                      <span className="w-3 text-end font-medium tabular-nums text-muted-foreground">{stars}</span>
                      <span className="sr-only">{t('distributionAria', { stars, count })}</span>
                      <span aria-hidden="true" className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <span
                          data-rating-bar
                          className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 origin-left rtl:origin-right"
                          style={{ width: `${percent}%` }}
                        />
                      </span>
                      <span aria-hidden="true" className="w-6 text-end tabular-nums text-muted-foreground">{count}</span>
                    </li>
                  )
                })}
              </ul>
            </GlassCard>

            {/* Leave a review */}
            <GlassCard hover={false} className="reviews-reveal p-6 md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="rounded-xl bg-secondary p-2.5 text-primary">
                  <PenLine aria-hidden="true" className="size-5" />
                </span>
                <h3 className="text-xl font-bold text-foreground">{t('form.title')}</h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{t('form.intro')}</p>
              <ReviewForm />
            </GlassCard>
          </div>

          {/* Approved reviews */}
          <div className="reviews-reveal lg:col-span-7">
            {reviews.length === 0 ? (
              <GlassCard hover={false} className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <span className="mb-4 rounded-2xl bg-secondary p-4 text-primary">
                  <MessageSquareQuote aria-hidden="true" className="size-8" />
                </span>
                <p className="text-lg font-semibold text-foreground">{t('emptyTitle')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('emptyText')}</p>
              </GlassCard>
            ) : (
              <>
                <ul ref={listRef} id="reviews-list" aria-label={t('listLabel')} className="grid scroll-mt-28 gap-4 md:grid-cols-2">
                  {slice.items.map((review) => (
                    <li key={review.id}>
                      <GlassCard className="flex h-full flex-col p-6">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white"
                          >
                            {reviewerInitials(review.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{review.name}</p>
                            <time dateTime={review.date} className="text-xs text-muted-foreground">
                              {format.dateTime(new Date(review.date), { year: 'numeric', month: 'long' })}
                            </time>
                          </div>
                        </div>
                        <StarRating
                          value={review.rating}
                          className="mt-4"
                          label={t('starsAria', { rating: review.rating })}
                        />
                        <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                          <p dir="auto">{review.comment}</p>
                        </blockquote>
                      </GlassCard>
                    </li>
                  ))}
                </ul>

                <Pagination
                  page={slice.page}
                  totalPages={slice.totalPages}
                  onPageChange={goToPage}
                  controls="reviews-list"
                  label={t('paginationLabel')}
                  className="mt-8"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
