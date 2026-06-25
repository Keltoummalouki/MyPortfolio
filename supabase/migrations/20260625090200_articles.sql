-- =============================================================================
-- M2-T4 (subset) — Article publishing: articles + article_translations.
--
-- Tags (tags / article_tags) from the full plan are deferred; this session
-- covers the article core requested. Slugs are per-locale and unique within a
-- locale. Drafts/archived articles are never public-readable.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- articles (locale-independent fields)
-- ---------------------------------------------------------------------------

create table public.articles (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  status           public.content_status not null default 'draft',
  featured         boolean not null default false,
  cover_image_url  text,
  author_name      text,
  published_at     timestamptz,
  reading_minutes  integer check (reading_minutes is null or reading_minutes >= 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.articles is 'Blog articles (locale-independent fields).';

create index articles_status_published_idx
  on public.articles (status, published_at desc);

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- article_translations (per-locale slug, title, excerpt, body, SEO)
-- ---------------------------------------------------------------------------

create table public.article_translations (
  id              uuid primary key default gen_random_uuid(),
  article_id      uuid not null references public.articles (id) on delete cascade,
  locale          text not null check (locale in ('fr', 'en', 'ar')),
  slug            text not null,
  title           text not null,
  excerpt         text,
  body_markdown   text,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- Exactly one row per (article, locale)...
  unique (article_id, locale),
  -- ...and slugs are unique within a locale (locale-aware routing).
  unique (locale, slug)
);

comment on table public.article_translations is
  'Per-locale slug/title/excerpt/Markdown body/SEO for an article.';

create trigger article_translations_set_updated_at
  before update on public.article_translations
  for each row execute function public.set_updated_at();

-- =============================================================================
-- RLS — articles
-- =============================================================================

alter table public.articles enable row level security;

create policy "published articles are public"
  on public.articles
  for select
  to anon, authenticated
  using (status = 'published');

create policy "admins manage articles"
  on public.articles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;

-- =============================================================================
-- RLS — article_translations
-- =============================================================================

alter table public.article_translations enable row level security;

create policy "translations of published articles are public"
  on public.article_translations
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_id and a.status = 'published'
    )
  );

create policy "admins manage article translations"
  on public.article_translations
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.article_translations to anon, authenticated;
grant insert, update, delete on public.article_translations to authenticated;
grant all on public.article_translations to service_role;
