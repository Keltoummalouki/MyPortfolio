import { getTranslations } from 'next-intl/server'
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Handshake,
  Languages,
  Layers,
  MapPin,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  composeProfileSummary,
  type ProfileFactId,
  type ProfileFacts,
} from '@/features/seo/profile-summary'

// Server component on purpose: the definitional paragraph and key facts must be
// in the initial HTML (no client-side animation gating their visibility), so
// search engines and AI crawlers read exactly what visitors see.

const FACT_ICONS: Record<ProfileFactId, LucideIcon> = {
  role: BriefcaseBusiness,
  basedIn: MapPin,
  current: Building2,
  education: GraduationCap,
  stack: Layers,
  languages: Languages,
  openTo: Handshake,
}

/** Long values read better across both columns. */
const WIDE_FACTS = new Set<ProfileFactId>(['stack', 'languages'])

const linkBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export default async function ProfileSummarySection({
  locale,
  facts,
}: {
  locale: string
  facts: ProfileFacts
}) {
  const t = await getTranslations({ locale, namespace: 'home.profile' })
  const summary = composeProfileSummary(facts, (key, values) => t(key, values), locale)

  return (
    <section
      id="profile"
      aria-labelledby="profile-title"
      className="relative section-padding overflow-hidden bg-background"
    >
      <div aria-hidden="true" className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      <div className="relative container-main">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium text-primary">
              <UserRound aria-hidden="true" className="size-4" />
              {t('eyebrow')}
            </p>

            <h2
              id="profile-title"
              className="mt-5 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance"
            >
              {t('title')}
            </h2>

            <div aria-hidden="true" className="mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-violet-500" />

            <p className="mt-6 text-base md:text-lg leading-relaxed text-muted-foreground text-pretty">
              {summary.paragraph}
            </p>

            <nav aria-label={t('cta.label')} className="mt-8">
              <ul className="flex flex-wrap gap-3">
                <li>
                  <Link
                    href="/about"
                    className={cn(linkBase, 'group bg-primary text-primary-foreground hover:bg-primary/90')}
                  >
                    {t('cta.about')}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                    />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/projects"
                    className={cn(linkBase, 'border border-border bg-card text-foreground hover:border-primary hover:text-primary')}
                  >
                    {t('cta.projects')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/freelance"
                    className={cn(linkBase, 'border border-border bg-card text-foreground hover:border-primary hover:text-primary')}
                  >
                    {t('cta.freelance')}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-6 md:p-8 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-foreground">{t('factsTitle')}</h3>

            <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {summary.facts.map((fact) => {
                const Icon = FACT_ICONS[fact.id]
                return (
                  <div
                    key={fact.id}
                    className={cn(
                      'rounded-xl border border-border bg-background/60 p-4',
                      WIDE_FACTS.has(fact.id) && 'sm:col-span-2',
                    )}
                  >
                    <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
                      {fact.label}
                    </dt>
                    <dd className="mt-1.5 text-base font-semibold leading-snug text-foreground">
                      {fact.items ? (
                        <ul className="mt-1 flex flex-wrap gap-2">
                          {fact.items.map((item) => (
                            <li
                              key={item}
                              className="rounded-full border border-border bg-secondary/70 px-3 py-1 text-sm font-medium text-foreground"
                            >
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
      </div>
    </section>
  )
}
