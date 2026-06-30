-- =============================================================================
-- CMS expansion — direct image fields for admin-managed sections.
--
-- The first CMS expansion added a shared media bucket/catalog. This migration
-- adds image URL columns to the remaining content tables so section forms can
-- upload a file directly and persist the resulting public Storage URL.
-- =============================================================================

alter table public.skills
  add column if not exists image_url text;

alter table public.experiences
  add column if not exists image_url text;

alter table public.education
  add column if not exists image_url text;
