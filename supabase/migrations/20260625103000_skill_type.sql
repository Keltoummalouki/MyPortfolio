-- =============================================================================
-- CMS expansion — distinguish technical vs soft skills.
--
-- Technical skills belong to a category and may have an icon/image; soft skills
-- are standalone (no category, no image). A single `skill_type` column models
-- both in the existing `skills` table.
-- =============================================================================

alter table public.skills
  add column if not exists skill_type text not null default 'technical'
  check (skill_type in ('technical', 'soft'));

create index if not exists skills_type_idx on public.skills (skill_type, status, sort_order);
