-- =============================================================================
-- CMS expansion — technologies used per experience item.
--
-- Stores the stack shown in the public Experience timeline. Values are selected
-- from technical skills in the dashboard UI, but kept denormalized as text[] so
-- old experience rows remain simple and public reads stay fast.
-- =============================================================================

alter table public.experiences
  add column if not exists technologies text[] not null default '{}'::text[];
