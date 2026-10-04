-- =============================================================================
-- Visitor reviews (moderated) + FAQ "popular questions" CMS.
--
-- Reviews
--   * Visitors submit a name, a 1-5 star rating and a comment through the
--     public Server Action (Zod -> Turnstile -> reserve_public_submission ->
--     service-role insert). There is NO anon INSERT grant, so the rate limiter
--     cannot be bypassed with the public key.
--   * New reviews are 'pending' and only appear once an administrator approves
--     them. Visitors can read approved reviews' public columns only — never
--     ip_hash / spam_reason.
--
-- FAQ
--   * Same conventions as public.languages: {fr,en,ar} JSONB, sort_order,
--     content_status, public reads published rows, admins manage everything.
--     With no published rows the site falls back to messages/*.json.
--
-- Rate limiting
--   * 'review' joins the shared per-IP bucket used by contact messages and
--     freelance leads (same thresholds: 3rd-4th = spam, 5th = blocked 24h).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------

create type public.review_status as enum ('pending', 'approved', 'rejected', 'spam');

create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  author_name  text not null check (char_length(btrim(author_name)) between 2 and 80),
  rating       smallint not null check (rating between 1 and 5),
  comment      text not null check (char_length(btrim(comment)) between 10 and 1000),
  locale       text not null default 'fr' check (locale in ('fr', 'en', 'ar')),
  status       public.review_status not null default 'pending',
  ip_hash      text check (ip_hash is null or char_length(ip_hash) between 32 and 128),
  spam_reason  text check (spam_reason is null or char_length(spam_reason) <= 120),
  approved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.reviews is
  'Visitor reviews (name, 1-5 rating, comment). Inserted via Server Action only; public sees approved rows.';
comment on column public.reviews.ip_hash is
  'HMAC hash of the submitting IP address, used for abuse controls without storing the raw IP.';
comment on column public.reviews.approved_at is
  'Set when the review is approved (drives public ordering); cleared if it is unpublished.';

create index reviews_public_idx
  on public.reviews (status, approved_at desc, created_at desc);

create index reviews_ip_hash_created_at_idx
  on public.reviews (ip_hash, created_at desc)
  where ip_hash is not null;

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- approved_at follows the status: stamped on approval, cleared otherwise.
create or replace function public.reviews_track_approval()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.approved_at := case when new.status = 'approved' then now() else null end;
  elsif new.status = 'approved' and old.status is distinct from 'approved' then
    new.approved_at := now();
  elsif new.status <> 'approved' then
    new.approved_at := null;
  end if;
  return new;
end;
$$;

create trigger reviews_track_approval
  before insert or update of status on public.reviews
  for each row execute function public.reviews_track_approval();

alter table public.reviews enable row level security;

create policy "approved reviews are public"
  on public.reviews
  for select
  to anon, authenticated
  using (status = 'approved');

create policy "admins manage reviews"
  on public.reviews
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Column-level read for visitors: the public columns only.
grant select (id, author_name, rating, comment, locale, approved_at, created_at)
  on public.reviews to anon;
grant select, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;

-- ---------------------------------------------------------------------------
-- faq_items
-- ---------------------------------------------------------------------------

create table public.faq_items (
  id          uuid primary key default gen_random_uuid(),
  question    jsonb not null default '{}'::jsonb, -- {fr,en,ar}
  answer      jsonb not null default '{}'::jsonb, -- {fr,en,ar}
  sort_order  integer not null default 0,
  status      public.content_status not null default 'published',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.faq_items is
  'Home page "popular questions"; question/answer are per-locale {fr,en,ar} JSONB.';
create index faq_items_listing_idx on public.faq_items (status, sort_order);

create trigger faq_items_set_updated_at
  before update on public.faq_items
  for each row execute function public.set_updated_at();

alter table public.faq_items enable row level security;

create policy "published faq items are public" on public.faq_items
  for select to anon, authenticated using (status = 'published');
create policy "admins manage faq items" on public.faq_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.faq_items to anon, authenticated;
grant insert, update, delete on public.faq_items to authenticated;
grant all on public.faq_items to service_role;

-- ---------------------------------------------------------------------------
-- Rate limiter: accept the 'review' submission kind
-- ---------------------------------------------------------------------------

alter table public.public_submission_rate_limits
  drop constraint if exists public_submission_rate_limits_last_submission_kind_check;
alter table public.public_submission_rate_limits
  add constraint public_submission_rate_limits_last_submission_kind_check
  check (last_submission_kind in ('contact_message', 'freelance_lead', 'review'));

comment on table public.public_submission_rate_limits is
  'Private server-side rate-limit buckets for public contact messages, freelance leads and reviews.';

-- Same body as 20260630170000, with 'review' added to the accepted kinds.
create or replace function public.reserve_public_submission(
  p_ip_hash text,
  p_submission_kind text,
  p_spam_threshold integer default 3,
  p_block_threshold integer default 5,
  p_window interval default '24 hours',
  p_block_duration interval default '24 hours'
)
returns table (
  allowed boolean,
  should_spam boolean,
  submission_count integer,
  blocked_until timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_row public.public_submission_rate_limits%rowtype;
  v_count integer;
  v_window_started_at timestamptz;
  v_blocked_until timestamptz;
begin
  if p_ip_hash is null
    or char_length(trim(p_ip_hash)) < 32
    or p_submission_kind not in ('contact_message', 'freelance_lead', 'review')
    or p_spam_threshold < 1
    or p_block_threshold <= p_spam_threshold
  then
    return query select false, false, 0, null::timestamptz;
    return;
  end if;

  insert into public.public_submission_rate_limits (
    ip_hash,
    window_started_at,
    submission_count,
    last_submission_kind
  )
  values (
    p_ip_hash,
    v_now,
    0,
    p_submission_kind
  )
  on conflict (ip_hash) do nothing;

  select *
  into v_row
  from public.public_submission_rate_limits psrl
  where psrl.ip_hash = p_ip_hash
  for update;

  if v_row.blocked_until is not null and v_row.blocked_until > v_now then
    update public.public_submission_rate_limits
    set last_submission_kind = p_submission_kind
    where ip_hash = p_ip_hash;

    return query select false, true, v_row.submission_count, v_row.blocked_until;
    return;
  end if;

  if v_row.window_started_at <= v_now - p_window then
    v_count := 1;
    v_window_started_at := v_now;
  else
    v_count := v_row.submission_count + 1;
    v_window_started_at := v_row.window_started_at;
  end if;

  if v_count >= p_block_threshold then
    v_blocked_until := v_now + p_block_duration;

    update public.public_submission_rate_limits
    set
      window_started_at = v_window_started_at,
      submission_count = v_count,
      spammed_at = coalesce(spammed_at, v_now),
      blocked_until = v_blocked_until,
      last_submission_kind = p_submission_kind
    where ip_hash = p_ip_hash;

    return query select false, true, v_count, v_blocked_until;
    return;
  end if;

  update public.public_submission_rate_limits
  set
    window_started_at = v_window_started_at,
    submission_count = v_count,
    spammed_at = case
      when v_count >= p_spam_threshold then coalesce(spammed_at, v_now)
      else spammed_at
    end,
    blocked_until = null,
    last_submission_kind = p_submission_kind
  where ip_hash = p_ip_hash;

  return query select true, v_count >= p_spam_threshold, v_count, null::timestamptz;
end;
$$;

comment on function public.reserve_public_submission(text, text, integer, integer, interval, interval) is
  'Atomically reserves a public contact/lead/review submission slot and returns whether it is allowed or spam.';

revoke all on function public.reserve_public_submission(text, text, integer, integer, interval, interval) from public;
grant execute on function public.reserve_public_submission(text, text, integer, integer, interval, interval)
  to service_role;
