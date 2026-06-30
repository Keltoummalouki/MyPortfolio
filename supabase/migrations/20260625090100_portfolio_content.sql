-- =============================================================================
-- M2-T3 (subset) — Portfolio content: projects, services, site settings.
--
-- Scope for this session: projects + project_translations, services,
-- site_settings. Experience/education/certifications/skills are deferred.
--
-- RLS pattern reused on every public-content table:
--   * SELECT: anon + authenticated may read PUBLISHED rows; admins read all.
--   * INSERT/UPDATE/DELETE: administrators only (is_admin()).
--   * Translation rows are public-readable only while their parent is published.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------

create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  status          public.content_status not null default 'draft',
  featured        boolean not null default false,
  sort_order      integer not null default 0,
  cover_image_url text,
  repo_url        text,
  demo_url        text,
  tech_stack      text[] not null default '{}',
  started_at      date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.projects is 'Portfolio projects (locale-independent fields).';

create index projects_status_idx on public.projects (status);
create index projects_listing_idx on public.projects (status, featured, sort_order);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_translations (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  locale      text not null check (locale in ('fr', 'en', 'ar')),
  title       text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Exactly one row per (project, locale).
  unique (project_id, locale)
);

comment on table public.project_translations is 'Per-locale title/description for a project.';

create index project_translations_locale_idx on public.project_translations (locale);

create trigger project_translations_set_updated_at
  before update on public.project_translations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- services (single table; translatable fields stored as { fr, en, ar } JSONB,
-- per the request to keep services as one table without a translation sibling)
-- ---------------------------------------------------------------------------

create table public.services (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  status      public.content_status not null default 'draft',
  sort_order  integer not null default 0,
  icon        text,
  -- JSONB i18n maps, e.g. {"fr": "...", "en": "...", "ar": "..."}.
  title       jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.services is
  'Freelance service offerings; title/description are per-locale JSONB maps.';

create index services_listing_idx on public.services (status, sort_order);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- site_settings (enforced singleton: id can only ever be true -> one row)
-- ---------------------------------------------------------------------------

create table public.site_settings (
  id                  boolean primary key default true,
  availability_status text not null default 'available'
                        check (availability_status in ('available', 'limited', 'unavailable')),
  contact_email       text,
  cv_url              text,
  social_links        jsonb not null default '{}'::jsonb,
  -- Per-locale profile copy, e.g. {"tagline": {"fr": "..."}}.
  profile             jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint site_settings_single_row check (id)
);

comment on table public.site_settings is
  'Singleton global site configuration (always exactly one row, id = true).';

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- =============================================================================
-- RLS — projects
-- =============================================================================

alter table public.projects enable row level security;

create policy "published projects are public"
  on public.projects
  for select
  to anon, authenticated
  using (status = 'published');

create policy "admins manage projects"
  on public.projects
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;

-- =============================================================================
-- RLS — project_translations
-- =============================================================================

alter table public.project_translations enable row level security;

create policy "translations of published projects are public"
  on public.project_translations
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

create policy "admins manage project translations"
  on public.project_translations
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.project_translations to anon, authenticated;
grant insert, update, delete on public.project_translations to authenticated;
grant all on public.project_translations to service_role;

-- =============================================================================
-- RLS — services
-- =============================================================================

alter table public.services enable row level security;

create policy "published services are public"
  on public.services
  for select
  to anon, authenticated
  using (status = 'published');

create policy "admins manage services"
  on public.services
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;

-- =============================================================================
-- RLS — site_settings (global config is public to read, admin to change)
-- =============================================================================

alter table public.site_settings enable row level security;

create policy "site settings are public"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

create policy "admins manage site settings"
  on public.site_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
