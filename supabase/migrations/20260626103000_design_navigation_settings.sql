-- Add controlled header placement and public navigation configuration.

alter table public.design_settings
  add column if not exists header_position text not null default 'bottom'
    check (header_position in ('bottom', 'left', 'right')),
  add column if not exists nav_items jsonb not null default
    '["about","skills","experience","education","projects","certifications","github","blog","freelance","contact"]'::jsonb;

update public.design_settings
set
  header_position = case when header_position in ('bottom', 'left', 'right') then header_position else 'bottom' end,
  nav_items = case
    when jsonb_typeof(nav_items) = 'array' and jsonb_array_length(nav_items) > 0 then nav_items
    else '["about","skills","experience","education","projects","certifications","github","blog","freelance","contact"]'::jsonb
  end;
