-- =============================================================================
-- M2-T2 — Identity, authorization helpers, and shared conventions.
--
-- Creates:
--   * shared enum types (content/message/lead status)
--   * a reusable updated_at trigger function
--   * admin_profiles (1:1 with auth.users)
--   * a SECURITY DEFINER is_admin() authorization helper
--   * RLS on admin_profiles (admins read only their own row; anon denied)
--
-- Security model (applies to every later migration too):
--   * RLS is the real authorization boundary.
--   * anon / authenticated reach tables through the Data API ONLY where an
--     explicit GRANT is present (new tables are not auto-exposed).
--   * service_role bypasses RLS and is used SERVER-SIDE ONLY (never in the
--     browser). It still needs GRANTs to use the Data API, granted per table.
--   * Authorization relies on the server-controlled admin_profiles table via
--     is_admin(), never on user-editable auth metadata.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Shared enum types
-- ---------------------------------------------------------------------------

-- Publication lifecycle for portfolio content and articles.
create type public.content_status as enum ('draft', 'published', 'archived');

-- Contact inbox message workflow.
create type public.message_status as enum ('new', 'read', 'replied', 'archived', 'spam');

-- Freelance lead pipeline.
create type public.lead_status as enum ('new', 'qualified', 'meeting', 'proposal', 'won', 'lost', 'spam');

-- ---------------------------------------------------------------------------
-- Reusable updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger function: stamps NEW.updated_at = now() on every UPDATE.';

-- ---------------------------------------------------------------------------
-- admin_profiles: server-controlled administrator records (1:1 auth.users)
-- ---------------------------------------------------------------------------

create table public.admin_profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  -- Only 'admin' is exposed for the first release. The CHECK is intentionally
  -- narrow so additional roles are a deliberate, reviewed migration later.
  role        text not null default 'admin' check (role in ('admin')),
  full_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.admin_profiles is
  'Administrators. A row here (not auth metadata) is what grants dashboard access.';

create trigger admin_profiles_set_updated_at
  before update on public.admin_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- is_admin(): authorization helper used by every protected table's policies.
-- SECURITY DEFINER so it can read admin_profiles regardless of that table's
-- RLS, which both works for anon callers and avoids recursive policy checks.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.id = (select auth.uid())
  );
$$;

comment on function public.is_admin() is
  'True when the current request is an authenticated administrator.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS: admin_profiles
-- ---------------------------------------------------------------------------

alter table public.admin_profiles enable row level security;

-- An administrator may read only their own profile row. Anonymous users get
-- nothing (auth.uid() is null), and a non-admin authenticated user has no row.
create policy "admin reads own profile"
  on public.admin_profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Data API exposure. No grant to anon -> admin_profiles is never anon-readable.
-- Writes are intentionally not granted to authenticated: profiles are managed
-- by service_role (server) / migrations only, so users cannot self-promote.
grant select on public.admin_profiles to authenticated;
grant all on public.admin_profiles to service_role;
