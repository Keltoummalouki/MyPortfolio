-- =============================================================================
-- Languages CMS — spoken/communication languages shown in the public About card.
--
-- Conventions reused from the CMS expansion (20260625100000):
--   * enum public.content_status ('draft','published','archived')
--   * trigger fn public.set_updated_at()
--   * authorization helper public.is_admin()
--   * RLS pattern: public reads PUBLISHED rows; administrators manage everything;
--     explicit GRANTs expose the Data API.
--   * Short translatable labels use {fr,en,ar} JSONB i18n (like skill_categories),
--     not a separate *_translations table.
-- =============================================================================

create table public.languages (
  id          uuid primary key default gen_random_uuid(),
  name        jsonb not null default '{}'::jsonb, -- {fr,en,ar}
  level       jsonb not null default '{}'::jsonb, -- {fr,en,ar} e.g. Native / B1 / A2
  icon        text,
  sort_order  integer not null default 0,
  status      public.content_status not null default 'published',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.languages is 'Spoken languages shown publicly; name/level are per-locale {fr,en,ar} JSONB.';
create index languages_listing_idx on public.languages (status, sort_order);

create trigger languages_set_updated_at
  before update on public.languages
  for each row execute function public.set_updated_at();

-- RLS + grants: public reads published, admin manages.
alter table public.languages enable row level security;

create policy "published languages are public" on public.languages
  for select to anon, authenticated using (status = 'published');
create policy "admins manage languages" on public.languages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.languages to anon, authenticated;
grant insert, update, delete on public.languages to authenticated;
grant all on public.languages to service_role;
