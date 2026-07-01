-- =============================================================================
-- Public contact/freelance submission throttling.
--
-- Shared policy:
--   * Attempts 1-2 in a 24h window are stored as normal.
--   * Attempts 3-4 are accepted but automatically marked as spam.
--   * Attempt 5 blocks that IP hash for 24h and is not stored.
--
-- Only hashed IPs are stored. Public visitors must submit through Server
-- Actions now; direct anon INSERT grants are revoked so this limiter cannot be
-- bypassed with the public Supabase key.
-- =============================================================================

alter table public.contact_messages
  add column if not exists ip_hash text
    check (ip_hash is null or char_length(ip_hash) between 32 and 128),
  add column if not exists spam_reason text
    check (spam_reason is null or char_length(spam_reason) <= 120);

alter table public.freelance_leads
  add column if not exists ip_hash text
    check (ip_hash is null or char_length(ip_hash) between 32 and 128),
  add column if not exists spam_reason text
    check (spam_reason is null or char_length(spam_reason) <= 120);

comment on column public.contact_messages.ip_hash is
  'HMAC hash of the submitting IP address, used for abuse controls without storing the raw IP.';
comment on column public.contact_messages.spam_reason is
  'Server-side reason why this message was automatically classified as spam.';
comment on column public.freelance_leads.ip_hash is
  'HMAC hash of the submitting IP address, used for abuse controls without storing the raw IP.';
comment on column public.freelance_leads.spam_reason is
  'Server-side reason why this lead was automatically classified as spam.';

create index if not exists contact_messages_ip_hash_created_at_idx
  on public.contact_messages (ip_hash, created_at desc)
  where ip_hash is not null;

create index if not exists freelance_leads_ip_hash_created_at_idx
  on public.freelance_leads (ip_hash, created_at desc)
  where ip_hash is not null;

create table if not exists public.public_submission_rate_limits (
  ip_hash              text primary key
    check (char_length(ip_hash) between 32 and 128),
  window_started_at    timestamptz not null default now(),
  submission_count     integer not null default 0 check (submission_count >= 0),
  spammed_at           timestamptz,
  blocked_until        timestamptz,
  last_submission_kind text check (last_submission_kind in ('contact_message', 'freelance_lead')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.public_submission_rate_limits is
  'Private server-side rate-limit buckets for public contact messages and freelance leads.';
comment on column public.public_submission_rate_limits.ip_hash is
  'HMAC hash of the client IP. Raw IP addresses are intentionally not stored.';

create trigger public_submission_rate_limits_set_updated_at
  before update on public.public_submission_rate_limits
  for each row execute function public.set_updated_at();

alter table public.public_submission_rate_limits enable row level security;

grant all on public.public_submission_rate_limits to service_role;

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
    or p_submission_kind not in ('contact_message', 'freelance_lead')
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
  'Atomically reserves a public contact/lead submission slot and returns whether it is allowed or spam.';

revoke all on function public.reserve_public_submission(text, text, integer, integer, interval, interval) from public;
grant execute on function public.reserve_public_submission(text, text, integer, integer, interval, interval)
  to service_role;

drop policy if exists "anyone can submit a contact message"
  on public.contact_messages;
drop policy if exists "anyone can submit a freelance lead"
  on public.freelance_leads;

revoke insert on public.contact_messages from anon, authenticated;
revoke insert on public.freelance_leads from anon, authenticated;
