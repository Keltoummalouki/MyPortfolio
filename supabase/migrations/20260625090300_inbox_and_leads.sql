-- =============================================================================
-- M2-T5 (subset) — Contact inbox + freelance leads.
--
-- Public visitors may INSERT a contact message or a freelance lead, and nothing
-- else: they cannot list, read, update, or delete any row. Administrators
-- manage everything. Column-level CHECK constraints provide a database-side
-- guardrail in addition to server validation (Zod/Turnstile/rate-limit in M7/M9).
--
-- Data minimisation: only the fields needed to reply to a contact/inquiry are
-- stored. Retention/deletion is an operational policy (admin can delete rows;
-- documented for M10-T4).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 320),
  subject     text check (subject is null or char_length(subject) <= 200),
  message     text not null check (char_length(message) between 1 and 5000),
  status      public.message_status not null default 'new',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.contact_messages is
  'Inbound contact-form messages. Public may INSERT only; admins manage.';

create index contact_messages_status_idx
  on public.contact_messages (status, created_at desc);

create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- freelance_leads
-- ---------------------------------------------------------------------------

create table public.freelance_leads (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null check (char_length(name) between 1 and 120),
  email              text not null check (char_length(email) between 3 and 320),
  company            text check (company is null or char_length(company) <= 160),
  project_type       text check (project_type is null or char_length(project_type) <= 80),
  budget_range       text check (budget_range is null or char_length(budget_range) <= 80),
  timeline           text check (timeline is null or char_length(timeline) <= 80),
  details            text check (details is null or char_length(details) <= 5000),
  contact_preference text check (contact_preference is null or char_length(contact_preference) <= 40),
  status             public.lead_status not null default 'new',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.freelance_leads is
  'Inbound freelance project inquiries. Public may INSERT only; admins manage.';

create index freelance_leads_status_idx
  on public.freelance_leads (status, created_at desc);

create trigger freelance_leads_set_updated_at
  before update on public.freelance_leads
  for each row execute function public.set_updated_at();

-- =============================================================================
-- RLS — contact_messages
-- =============================================================================

alter table public.contact_messages enable row level security;

-- Public may submit a message. No SELECT/UPDATE/DELETE policy or grant for
-- anon -> stored messages are never readable from the browser.
create policy "anyone can submit a contact message"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

create policy "admins manage contact messages"
  on public.contact_messages
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;

-- =============================================================================
-- RLS — freelance_leads
-- =============================================================================

alter table public.freelance_leads enable row level security;

create policy "anyone can submit a freelance lead"
  on public.freelance_leads
  for insert
  to anon, authenticated
  with check (true);

create policy "admins manage freelance leads"
  on public.freelance_leads
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant insert on public.freelance_leads to anon, authenticated;
grant select, update, delete on public.freelance_leads to authenticated;
grant all on public.freelance_leads to service_role;
