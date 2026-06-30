-- =============================================================================
-- CMS expansion — remaining portfolio content tables.
--
-- Adds: about_profile, social_links, skill_categories, skills,
-- experiences(+translations), education(+translations),
-- certifications(+translations), design_settings.
--
-- Conventions reused from M2:
--   * enum public.content_status ('draft','published','archived')
--   * trigger fn public.set_updated_at()
--   * authorization helper public.is_admin()
--   * RLS pattern: public reads PUBLISHED rows (or all for singletons);
--     administrators manage everything; explicit GRANTs expose the Data API.
--   * Singletons/config use {fr,en,ar} JSONB i18n (like site_settings/services);
--     repeatable content uses *_translations tables.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- about_profile (singleton)
-- ---------------------------------------------------------------------------

create table public.about_profile (
  id          boolean primary key default true,
  full_name   text,
  avatar_url  text,
  headline    jsonb not null default '{}'::jsonb, -- {fr,en,ar}
  bio         jsonb not null default '{}'::jsonb, -- {fr,en,ar}
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint about_profile_single_row check (id)
);

comment on table public.about_profile is 'Singleton about/profile (translatable text as {fr,en,ar} JSONB).';

create trigger about_profile_set_updated_at
  before update on public.about_profile
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- social_links
-- ---------------------------------------------------------------------------

create table public.social_links (
  id          uuid primary key default gen_random_uuid(),
  platform    text not null,
  url         text not null,
  label       text,
  icon        text,
  sort_order  integer not null default 0,
  status      public.content_status not null default 'published',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.social_links is 'Social/contact links shown publicly.';
create index social_links_listing_idx on public.social_links (status, sort_order);

create trigger social_links_set_updated_at
  before update on public.social_links
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- skill_categories + skills
-- ---------------------------------------------------------------------------

create table public.skill_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        jsonb not null default '{}'::jsonb, -- {fr,en,ar}
  sort_order  integer not null default 0,
  status      public.content_status not null default 'published',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.skill_categories is 'Skill groupings; name is per-locale JSONB.';
create index skill_categories_listing_idx on public.skill_categories (status, sort_order);

create trigger skill_categories_set_updated_at
  before update on public.skill_categories
  for each row execute function public.set_updated_at();

create table public.skills (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.skill_categories (id) on delete set null,
  name         text not null, -- technology name (not translated)
  level        integer check (level is null or (level between 0 and 5)),
  icon         text,
  sort_order   integer not null default 0,
  status       public.content_status not null default 'published',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.skills is 'Individual skills, optionally grouped by a category.';
create index skills_category_idx on public.skills (category_id);
create index skills_listing_idx on public.skills (status, sort_order);

create trigger skills_set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- experiences (+ translations)
-- ---------------------------------------------------------------------------

create table public.experiences (
  id          uuid primary key default gen_random_uuid(),
  company     text,
  location    text,
  start_date  date,
  end_date    date,
  is_current  boolean not null default false,
  url         text,
  sort_order  integer not null default 0,
  status      public.content_status not null default 'published',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.experiences is 'Work experience (locale-independent fields).';
create index experiences_listing_idx on public.experiences (status, sort_order);

create trigger experiences_set_updated_at
  before update on public.experiences
  for each row execute function public.set_updated_at();

create table public.experience_translations (
  id             uuid primary key default gen_random_uuid(),
  experience_id  uuid not null references public.experiences (id) on delete cascade,
  locale         text not null check (locale in ('fr', 'en', 'ar')),
  role           text not null,
  description    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (experience_id, locale)
);

comment on table public.experience_translations is 'Per-locale role/description for an experience.';
create index experience_translations_locale_idx on public.experience_translations (locale);

create trigger experience_translations_set_updated_at
  before update on public.experience_translations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- education (+ translations)
-- ---------------------------------------------------------------------------

create table public.education (
  id          uuid primary key default gen_random_uuid(),
  institution text,
  location    text,
  start_date  date,
  end_date    date,
  sort_order  integer not null default 0,
  status      public.content_status not null default 'published',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.education is 'Education entries (locale-independent fields).';
create index education_listing_idx on public.education (status, sort_order);

create trigger education_set_updated_at
  before update on public.education
  for each row execute function public.set_updated_at();

create table public.education_translations (
  id            uuid primary key default gen_random_uuid(),
  education_id  uuid not null references public.education (id) on delete cascade,
  locale        text not null check (locale in ('fr', 'en', 'ar')),
  degree        text not null,
  field         text,
  description   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (education_id, locale)
);

comment on table public.education_translations is 'Per-locale degree/field/description for education.';
create index education_translations_locale_idx on public.education_translations (locale);

create trigger education_translations_set_updated_at
  before update on public.education_translations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- certifications (+ translations)
-- ---------------------------------------------------------------------------

create table public.certifications (
  id             uuid primary key default gen_random_uuid(),
  issuer         text,
  issue_date     date,
  credential_url text,
  image_url      text,
  sort_order     integer not null default 0,
  status         public.content_status not null default 'published',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.certifications is 'Certifications (locale-independent fields).';
create index certifications_listing_idx on public.certifications (status, sort_order);

create trigger certifications_set_updated_at
  before update on public.certifications
  for each row execute function public.set_updated_at();

create table public.certification_translations (
  id                uuid primary key default gen_random_uuid(),
  certification_id  uuid not null references public.certifications (id) on delete cascade,
  locale            text not null check (locale in ('fr', 'en', 'ar')),
  name              text not null,
  description       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (certification_id, locale)
);

comment on table public.certification_translations is 'Per-locale name/description for a certification.';
create index certification_translations_locale_idx on public.certification_translations (locale);

create trigger certification_translations_set_updated_at
  before update on public.certification_translations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- design_settings (singleton)
-- ---------------------------------------------------------------------------

create table public.design_settings (
  id             boolean primary key default true,
  primary_color  text,
  accent_color   text,
  default_locale text not null default 'fr' check (default_locale in ('fr', 'en', 'ar')),
  default_theme  text not null default 'dark' check (default_theme in ('light', 'dark', 'system')),
  font_body      text,
  font_heading   text,
  cursor_style   text,
  extra          jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint design_settings_single_row check (id)
);

comment on table public.design_settings is 'Singleton theme/design settings (colors, fonts, defaults, cursor).';

create trigger design_settings_set_updated_at
  before update on public.design_settings
  for each row execute function public.set_updated_at();

-- =============================================================================
-- RLS + grants
-- =============================================================================

-- Singletons: public read, admin manage.
alter table public.about_profile enable row level security;
create policy "about is public" on public.about_profile
  for select to anon, authenticated using (true);
create policy "admins manage about" on public.about_profile
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.about_profile to anon, authenticated;
grant insert, update, delete on public.about_profile to authenticated;
grant all on public.about_profile to service_role;

alter table public.design_settings enable row level security;
create policy "design settings are public" on public.design_settings
  for select to anon, authenticated using (true);
create policy "admins manage design settings" on public.design_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.design_settings to anon, authenticated;
grant insert, update, delete on public.design_settings to authenticated;
grant all on public.design_settings to service_role;

-- Status-gated parent tables: public reads published, admin manages.
do $$
declare
  t text;
  parents text[] := array[
    'social_links', 'skill_categories', 'skills', 'experiences', 'education', 'certifications'
  ];
begin
  foreach t in array parents loop
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'create policy "published %1$s are public" on public.%1$I for select to anon, authenticated using (status = ''published'');',
      t
    );
    execute format(
      'create policy "admins manage %1$s" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin());',
      t
    );
    execute format('grant select on public.%I to anon, authenticated;', t);
    execute format('grant insert, update, delete on public.%I to authenticated;', t);
    execute format('grant all on public.%I to service_role;', t);
  end loop;
end $$;

-- Translation tables: public readable only while the parent is published.
do $$
declare
  spec record;
  specs constant text[][] := array[
    array['experience_translations', 'experiences', 'experience_id'],
    array['education_translations', 'education', 'education_id'],
    array['certification_translations', 'certifications', 'certification_id']
  ];
  i int;
begin
  for i in 1 .. array_length(specs, 1) loop
    declare
      child  text := specs[i][1];
      parent text := specs[i][2];
      fk     text := specs[i][3];
    begin
      execute format('alter table public.%I enable row level security;', child);
      execute format(
        'create policy "translations of published %1$s are public" on public.%2$I for select to anon, authenticated using (exists (select 1 from public.%1$I p where p.id = %3$I and p.status = ''published''));',
        parent, child, fk
      );
      execute format(
        'create policy "admins manage %1$s" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin());',
        child
      );
      execute format('grant select on public.%I to anon, authenticated;', child);
      execute format('grant insert, update, delete on public.%I to authenticated;', child);
      execute format('grant all on public.%I to service_role;', child);
    end;
  end loop;
end $$;
