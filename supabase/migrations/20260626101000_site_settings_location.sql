-- =============================================================================
-- Add localized public location text to site_settings.
--
-- Stored as JSONB {fr,en,ar}, matching the other singleton/profile i18n fields.
-- =============================================================================

alter table public.site_settings
  add column if not exists location jsonb not null default '{}'::jsonb;
