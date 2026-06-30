-- =============================================================================
-- Allow CV PDFs in the portfolio-media bucket.
--
-- Images remain validated server-side at 5 MB and jpeg/png/webp only. This
-- widens the bucket just enough for admin-uploaded PDF CV files.
-- =============================================================================

update storage.buckets
set
  file_size_limit = greatest(coalesce(file_size_limit, 0), 10485760),
  allowed_mime_types = (
    select array_agg(distinct allowed.mime)
    from unnest(coalesce(allowed_mime_types, array[]::text[]) || array['application/pdf']::text[]) as allowed(mime)
  )
where id = 'portfolio-media';
