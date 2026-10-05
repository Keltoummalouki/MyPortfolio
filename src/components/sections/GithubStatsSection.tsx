'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animate, stagger, utils } from 'animejs'
import { ArrowUpRight, Github } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import ShowcaseSection from '@/components/sections/showcase/ShowcaseSection'
import { iconButton, pillOutline, surface } from '@/components/sections/showcase/classes'
import { GITHUB_USERNAME, type ContributionCalendar, type ContributionLevel, type GithubSummary } from '@/features/github'
import { prefersReducedMotion } from '@/lib/motion/reduced-motion'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const LEVEL_FILL: Record<ContributionLevel, string> = {
  0: 'fill-foreground/[0.07]',
  1: 'fill-primary/35',
  2: 'fill-primary/60',
  3: 'fill-primary/85',
  4: 'fill-violet-500',
}

type GithubStatsSectionProps = {
  index: string
  /** null while streaming (`pending`) or when nothing could be loaded. */
  summary: GithubSummary | null
  /** Suspense fallback: same layout with skeletons, so nothing shifts on arrival. */
  pending?: boolean
}

export default function GithubStatsSection({ index, summary, pending = false }: GithubStatsSectionProps) {
  const t = useTranslations('github')
  const format = useFormatter()
  const sectionRef = useRef<HTMLElement>(null)

  const profile = summary?.profile ?? null
  const calendar = summary?.contributions ?? null
  const profileUrl = profile?.url ?? `https://github.com/${GITHUB_USERNAME}`

  // Card reveal (GSAP) + heatmap weeks fading in left to right (anime.js).
  useEffect(() => {
    const section = sectionRef.current
    if (!section || pending || prefersReducedMotion()) return
    const weeks = Array.from(section.querySelectorAll<SVGGElement>('[data-heat-week]'))
    utils.set(weeks, { opacity: 0 })

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-github-card]',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 80%', once: true } },
      )
      ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          animate(weeks, { opacity: [0, 1], duration: 500, delay: stagger(14), ease: 'outQuart' })
        },
      })
    }, section)

    return () => {
      ctx.revert()
      utils.set(weeks, { opacity: 1 })
    }
  }, [pending])

  const stats = [
    calendar && { key: 'contributions', value: calendar.total },
    profile && { key: 'repositories', value: profile.publicRepos },
    profile && { key: 'followers', value: profile.followers },
    profile && { key: 'following', value: profile.following },
  ].filter((stat): stat is { key: string; value: number } => Boolean(stat))

  const unavailable = !pending && stats.length === 0

  return (
    <ShowcaseSection
      ref={sectionRef}
      id="github"
      index={index}
      layout="half"
      eyebrow={t('title')}
      title={t('heading')}
      description={t('subtitle')}
    >
      <article data-github-card aria-busy={pending || undefined} className={cn(surface, '@container p-4 sm:p-5')}>
        <header className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground ring-1 ring-border">
            <Github aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">{profile?.name ?? 'GitHub'}</h3>
            <p className="truncate text-xs text-muted-foreground" dir="ltr">
              @{profile?.login ?? GITHUB_USERNAME}
            </p>
          </div>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className={cn(iconButton, 'ms-auto')}>
            <ArrowUpRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            <span className="sr-only">{t('viewProfile')}</span>
          </a>
        </header>

        {unavailable ? (
          <div className="mt-5 rounded-xl border border-dashed border-border p-5 text-center">
            <p className="text-sm text-muted-foreground">{t('unavailable')}</p>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className={cn(pillOutline, 'mt-4 h-10 px-4')}>
              {t('viewProfile')}
              <ArrowUpRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </a>
          </div>
        ) : (
          <>
            <dl className="mt-5 grid grid-cols-2 gap-2 @lg:grid-cols-4">
              {(pending ? ['contributions', 'repositories', 'followers', 'following'] : stats.map((stat) => stat.key)).map(
                (key) => {
                  const stat = stats.find((item) => item.key === key)
                  return (
                    <div key={key} className="flex flex-col-reverse rounded-xl border border-border bg-secondary/50 px-3 py-2.5">
                      <dt className="text-xs text-muted-foreground">{t(`stats.${key}`)}</dt>
                      <dd className="text-xl font-bold tabular-nums text-foreground">
                        {stat ? (
                          format.number(stat.value)
                        ) : (
                          <span aria-hidden="true" className="my-1 block h-5 w-12 animate-pulse rounded bg-foreground/10" />
                        )}
                      </dd>
                    </div>
                  )
                },
              )}
            </dl>

            {pending ? (
              <div aria-hidden="true" className="mt-5 aspect-[636/82] animate-pulse rounded-lg bg-foreground/[0.06]" />
            ) : (
              calendar && (
                <figure className="mt-5">
                  <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{t('heatmapTitle')}</span>
                    <HeatmapLegend less={t('less')} more={t('more')} />
                  </figcaption>
                  <Heatmap
                    calendar={calendar}
                    label={t('heatmapLabel', { count: calendar.total, total: format.number(calendar.total) })}
                  />
                </figure>
              )
            )}
          </>
        )}
      </article>
    </ShowcaseSection>
  )
}

const CELL = 10
const STEP = 12

function Heatmap({ calendar, label }: { calendar: ContributionCalendar; label: string }) {
  const width = calendar.weeks.length * STEP - (STEP - CELL)
  const height = 7 * STEP - (STEP - CELL)
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full">
      {calendar.weeks.map((week, x) => (
        <g key={x} data-heat-week>
          {week.map((day, y) =>
            day ? (
              <rect key={day.date} x={x * STEP} y={y * STEP} width={CELL} height={CELL} rx={2} className={LEVEL_FILL[day.level]} />
            ) : null,
          )}
        </g>
      ))}
    </svg>
  )
}

function HeatmapLegend({ less, more }: { less: string; more: string }) {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1.5">
      {less}
      <svg viewBox={`0 0 ${5 * STEP - 2} ${CELL}`} className="h-2.5 w-auto">
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <rect key={level} x={level * STEP} y={0} width={CELL} height={CELL} rx={2} className={LEVEL_FILL[level]} />
        ))}
      </svg>
      {more}
    </span>
  )
}
