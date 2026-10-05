import Image from 'next/image'
import { Caveat } from 'next/font/google'
import { getTranslations } from 'next-intl/server'
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Code2,
  FolderOpen,
  Github,
  GraduationCap,
  Handshake,
  Languages,
  Layers,
  MapPin,
  type LucideIcon,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { isOptimizableImageSrc } from '@/lib/images'
import { cn } from '@/lib/utils'
import { statValue, type PortfolioStatKey } from '@/features/stats/portfolio'
import {
  composeProfileSummary,
  type ProfileFactId,
  type ProfileFacts,
} from '@/features/seo/profile-summary'

// Server component on purpose: the definitional paragraph, stats and key facts
// must be in the initial HTML (no client-side animation gating their
// visibility), so search engines and AI crawlers read exactly what visitors see.
// Motion here is CSS only (floating decor, hover), off under reduced motion.

/** Handwritten annotations (decorative, xl+ only): fetched on demand, never preloaded. */
const hand = Caveat({ subsets: ['latin'], weight: '500', display: 'swap', preload: false })

const FACT_ICONS: Record<ProfileFactId, LucideIcon> = {
  role: BriefcaseBusiness,
  basedIn: MapPin,
  current: Building2,
  education: GraduationCap,
  stack: Layers,
  languages: Languages,
  openTo: Handshake,
}

const STATS: { key: PortfolioStatKey; icon: LucideIcon }[] = [
  { key: 'projects', icon: FolderOpen },
  { key: 'experience', icon: CalendarDays },
  { key: 'technologies', icon: Layers },
  { key: 'commits', icon: Github },
]

/** Trait chips, each with its own accent dot. */
const TRAITS = [
  { key: 'creative', dot: 'bg-violet-400' },
  { key: 'problemSolver', dot: 'bg-sky-400' },
  { key: 'teamPlayer', dot: 'bg-amber-400' },
  { key: 'dedicated', dot: 'bg-rose-400' },
] as const

const pill =
  'group/pill inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-[background-color,border-color,color,scale] duration-200 ease-fluid active:scale-[0.98]'

export default async function ProfileSummarySection({
  locale,
  facts,
  avatarUrl,
}: {
  locale: string
  facts: ProfileFacts
  avatarUrl: string
}) {
  const [t, about] = await Promise.all([
    getTranslations({ locale, namespace: 'home.profile' }),
    getTranslations({ locale, namespace: 'about' }),
  ])
  const summary = composeProfileSummary(facts, (key, values) => t(key, values), locale)

  return (
    <section id="profile" aria-labelledby="profile-title" className="relative overflow-hidden bg-background py-20 md:py-28">
      {/* Backdrop: one glow behind the portrait + a faint dot field. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -start-40 top-1/4 size-[36rem] rounded-full bg-[radial-gradient(closest-side,var(--glow-color),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,color-mix(in_oklab,var(--foreground)_14%,transparent)_1px,transparent_1px)] bg-size-[22px_22px] opacity-40 [mask-image:radial-gradient(60%_60%_at_25%_45%,black,transparent)]" />
      </div>

      <div className="relative container-main">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 xl:gap-20">
          <Portrait
            src={avatarUrl}
            note={t('note')}
            className="order-last lg:order-first"
          />

          <div className="min-w-0">
            {/* Text + (xl) a narrow column of handwritten notes beside it. */}
            <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_10.5rem] xl:gap-10">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-text rtl:tracking-normal">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                  {t('eyebrow')}
                </p>

                {/* `font-serif!`: the theme's heading font is injected unlayered (DesignSettingsStyle) and would win otherwise. */}
                <h2
                  id="profile-title"
                  className="mt-6 text-4xl font-medium leading-[1.08] tracking-tight text-foreground text-balance sm:text-5xl ltr:font-serif! ltr:font-normal"
                >
                  {t('tagline.lead')}{' '}
                  <span className="block bg-linear-to-r from-primary via-indigo-600 to-violet-600 bg-clip-text pb-1 text-transparent rtl:bg-linear-to-l dark:from-sky-300 dark:via-primary-text dark:to-violet-400">
                    {t('tagline.accent')}
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
                  {summary.paragraph}
                </p>

                <ul aria-label={t('traitsLabel')} className="mt-7 flex flex-wrap gap-2.5">
                  {TRAITS.map((trait) => (
                    <li
                      key={trait.key}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-sm font-medium text-foreground backdrop-blur"
                    >
                      <span aria-hidden="true" className={cn('size-1.5 rounded-full', trait.dot)} />
                      {about(`qualities.${trait.key}`)}
                    </li>
                  ))}
                </ul>
              </div>

              <Annotations role={facts.role} note={t('notes.cleanCode')} />
            </div>

            <dl
              aria-label={t('statsLabel')}
              className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-xl shadow-primary/5 sm:grid-cols-4"
            >
              {STATS.map(({ key, icon: Icon }) => (
                <div key={key} className="flex flex-col-reverse items-center gap-1 bg-card px-3 py-5 text-center md:py-6">
                  <dt className="text-xs font-medium text-muted-foreground md:text-sm">{about(`stats.${key}`)}</dt>
                  <dd className="flex flex-col items-center gap-3">
                    <Icon aria-hidden="true" className="size-5 text-primary-text" strokeWidth={1.75} />
                    <span className="text-2xl font-bold tracking-tight tabular-nums text-foreground md:text-3xl">
                      {statValue(key)}+
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Key facts: the quotable profile (also feeds the Person JSON-LD) + crawlable profile links. */}
        <div className="mt-16 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl md:mt-20 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-text rtl:tracking-normal">
              {t('factsTitle')}
            </h3>
            <nav aria-label={t('cta.label')}>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link href="/about" className={cn(pill, 'bg-primary text-primary-foreground hover:bg-primary/90')}>
                    {t('cta.about')}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-200 ease-fluid group-hover/pill:translate-x-0.5 rtl:rotate-180 rtl:group-hover/pill:-translate-x-0.5"
                    />
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className={cn(pill, 'border border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/10')}>
                    {t('cta.projects')}
                  </Link>
                </li>
                <li>
                  <Link href="/freelance" className={cn(pill, 'border border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/10')}>
                    {t('cta.freelance')}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {summary.facts.map((fact) => {
              const Icon = FACT_ICONS[fact.id]
              return (
                <div key={fact.id} className={cn('min-w-0', fact.id === 'stack' && 'sm:col-span-2')}>
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Icon aria-hidden="true" className="size-3.5 shrink-0 text-primary-text" />
                    {fact.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
                    {fact.items ? (
                      <ul className="flex flex-wrap gap-1.5">
                        {fact.items.map((item) => (
                          <li key={item} className="rounded-md border border-border bg-secondary/70 px-2 py-0.5 text-xs font-medium">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      fact.value
                    )}
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      </div>
    </section>
  )
}

/** Portrait in a glowing arch, circled by an orbit line, with a code badge and a floating note. */
function Portrait({ src, note, className }: { src: string; note: string; className?: string }) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[19rem] sm:max-w-sm lg:max-w-none', className)}>
      {/* Orbit ring behind the arch. */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-[14%] top-[34%] h-[52%] -rotate-12 rounded-[50%] border border-primary/30 shadow-[0_0_40px_-12px_var(--glow-color)]"
      />

      {/* The arch fades out at the bottom so the cropped portrait melts into the page. */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-card/60 [mask-image:linear-gradient(to_bottom,black_72%,transparent)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_38%,color-mix(in_oklab,var(--primary)_55%,transparent),color-mix(in_oklab,#7c3aed_35%,transparent)_55%,transparent_80%)]"
        />
        <Image
          src={src}
          // Decorative here: the hero already shows (and names) the same portrait.
          alt=""
          fill
          sizes="(min-width: 1280px) 440px, (min-width: 1024px) 38vw, (min-width: 640px) 384px, 304px"
          unoptimized={!isOptimizableImageSrc(src)}
          className="object-cover"
        />
        {/* Rim light: reads as glow on opaque photos too (the CMS avatar is not a cutout). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(85%_45%_at_50%_0%,color-mix(in_oklab,var(--primary)_45%,transparent),transparent_75%)] mix-blend-screen"
        />
      </div>

      <span
        aria-hidden="true"
        className="float-delayed absolute -end-3 top-[46%] flex size-14 items-center justify-center rounded-full border border-border bg-card/80 text-primary-text shadow-lg shadow-primary/20 backdrop-blur-xl sm:-end-5"
      >
        <Code2 className="size-6" strokeWidth={1.75} />
      </span>

      <p className="float absolute -start-2 top-8 max-w-[12.5rem] rounded-2xl border border-border bg-card/80 p-4 text-sm leading-snug text-foreground shadow-xl shadow-black/10 backdrop-blur-xl sm:-start-8">
        <span aria-hidden="true" className="mb-2 block size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
        {note}
      </p>
    </div>
  )
}

/** Handwritten role note with an arrow + a tilted "tablet" with code (xl+, decorative). */
function Annotations({ role, note }: { role: string; note: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none hidden select-none pt-6 xl:block">
      <div className={cn(hand.className, 'flex items-start gap-1 text-[1.35rem] leading-none text-primary-text/85')}>
        <svg viewBox="0 0 48 32" fill="none" className="mt-3 h-7 w-11 shrink-0 rtl:-scale-x-100">
          <path d="M2 28 C 10 12, 24 6, 44 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M38 3 L 44 8 L 37 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="-rotate-6 lowercase">{role}</span>
      </div>

      <div className="float ms-6 mt-8 w-32 rotate-6 rounded-[1.25rem] border border-border bg-secondary p-1.5 shadow-2xl shadow-primary/25">
        <div className="aspect-[3/4] rounded-[0.9rem] bg-background p-3">
          <div className="flex gap-1">
            <span className="size-1.5 rounded-full bg-rose-400/80" />
            <span className="size-1.5 rounded-full bg-amber-400/80" />
            <span className="size-1.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="mt-3 space-y-1.5">
            {CODE_LINES.map((line, i) => (
              <span key={i} className={cn('block h-1 rounded-full', line)} />
            ))}
          </div>
        </div>
      </div>

      <p className={cn(hand.className, 'mt-5 -rotate-6 text-end text-lg leading-tight text-muted-foreground')}>{note}</p>
    </div>
  )
}

const CODE_LINES = [
  'w-3/5 bg-violet-400/70',
  'ms-2 w-4/5 bg-primary/70',
  'ms-2 w-2/5 bg-sky-300/60',
  'ms-4 w-3/5 bg-emerald-400/60',
  'ms-4 w-1/2 bg-primary/50',
  'ms-2 w-2/3 bg-amber-300/60',
  'w-1/3 bg-violet-400/60',
  'w-3/4 bg-foreground/15',
  'ms-2 w-1/2 bg-foreground/10',
]
