-- =============================================================================
-- CMS expansion — Storage bucket, storage policies, and media_assets catalog.
--
--   * Public-read `portfolio-media` bucket for images (profile/projects/blog/
--     certifications/education/experience/future sections).
--   * Writes/updates/deletes restricted to authenticated administrators.
--   * SVG is intentionally NOT allowed (avoids script-bearing SVG / stored XSS);
--     only jpeg/png/webp. 5 MB per-file limit.
--   * media_assets: optional catalog of uploaded files + metadata for a future
--     dashboard media library.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Storage object policies (RLS is already enabled on storage.objects)
-- ---------------------------------------------------------------------------

-- Public read of objects in the public bucket.
create policy "portfolio-media public read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'portfolio-media');

-- Only administrators may upload/update/delete. Anonymous upload is never allowed.
create policy "portfolio-media admin insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin());

create policy "portfolio-media admin update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin())
  with check (bucket_id = 'portfolio-media' and public.is_admin());

create policy "portfolio-media admin delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- media_assets catalog
-- ---------------------------------------------------------------------------

create table public.media_assets (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null default 'portfolio-media',
  path        text not null,
  url         text,
  alt         jsonb not null default '{}'::jsonb, -- {fr,en,ar} alt text
  mime_type   text,
  size_bytes  bigint,
  width       integer,
  height      integer,
  kind        text, -- 'profile' | 'project' | 'blog' | 'certification' | ...
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (bucket, path)
);

comment on table public.media_assets is 'Catalog of uploaded media (public bucket) + metadata.';
create index media_assets_kind_idx on public.media_assets (kind);

create trigger media_assets_set_updated_at
  before update on public.media_assets
  for each row execute function public.set_updated_at();

alter table public.media_assets enable row level security;

-- Public can read media metadata (the files themselves are in a public bucket);
-- only administrators can create/update/delete catalog rows.
create policy "media assets are public" on public.media_assets
  for select to anon, authenticated using (true);
create policy "admins manage media assets" on public.media_assets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.media_assets to anon, authenticated;
grant insert, update, delete on public.media_assets to authenticated;
grant all on public.media_assets to service_role;
