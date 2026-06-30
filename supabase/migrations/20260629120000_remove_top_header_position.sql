-- Remove the old "top" section-dock placement.
-- Existing rows using "top" are moved to the supported "bottom" placement.

alter table public.design_settings
  drop constraint if exists design_settings_header_position_check;

update public.design_settings
set header_position = 'bottom'
where header_position is null or header_position = 'top';

alter table public.design_settings
  alter column header_position set default 'bottom',
  add constraint design_settings_header_position_check
    check (header_position in ('bottom', 'left', 'right'));
