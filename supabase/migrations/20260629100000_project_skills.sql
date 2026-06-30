-- =============================================================================
-- Link projects to technical skills (many-to-many).
--
-- `project_skills` connects a project to the technical skills that make up its
-- tech stack, replacing the old free-text `projects.tech_stack` workflow in the
-- admin UI. `tech_stack` is kept on `projects` for backward compatibility and as
-- a public fallback when no skills are linked.
--
-- RLS mirrors the rest of the public-content tables:
--   * SELECT: anon + authenticated may read a link only when BOTH its project and
--     its skill are published (admins read all via is_admin()).
--   * INSERT/UPDATE/DELETE: administrators only (is_admin()).
-- =============================================================================

create table public.project_skills (
  project_id uuid not null references public.projects (id) on delete cascade,
  skill_id   uuid not null references public.skills (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (project_id, skill_id)
);

comment on table public.project_skills is
  'Many-to-many link between projects and technical skills (the project tech stack).';

create index project_skills_project_idx on public.project_skills (project_id, sort_order);
create index project_skills_skill_idx on public.project_skills (skill_id);

-- =============================================================================
-- RLS — project_skills
-- =============================================================================

alter table public.project_skills enable row level security;

create policy "links of published projects and skills are public"
  on public.project_skills
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
    and exists (
      select 1 from public.skills s
      where s.id = skill_id and s.status = 'published'
    )
  );

create policy "admins manage project skills"
  on public.project_skills
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.project_skills to anon, authenticated;
grant insert, update, delete on public.project_skills to authenticated;
grant all on public.project_skills to service_role;
