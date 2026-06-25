-- Supabase seed data. Applied after migrations on `supabase db reset`.
--
-- SAFE SEED ONLY: public, non-sensitive content that mirrors what the static
-- portfolio already shows. No secrets, no credentials, no admin_profiles row
-- (the administrator profile is inserted in M3-T2 using the real auth user id,
-- never hardcoded here). Idempotent via fixed ids + ON CONFLICT DO NOTHING.

-- ---------------------------------------------------------------------------
-- Projects (the two featured projects already in ProjectsSection) + fr/en/ar
-- ---------------------------------------------------------------------------

insert into public.projects (id, slug, status, featured, sort_order, cover_image_url, repo_url, demo_url, tech_stack, started_at)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'event-booking-app',
    'published', true, 0,
    '/images/event-booking-app.png',
    'https://github.com/Keltoummalouki/event-booking-app',
    null,
    array['NestJS', 'Next.js', 'TypeScript', 'PostgreSQL', 'Docker', 'GitHub Actions', 'Jira'],
    '2025-12-01'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'reservez-moi',
    'published', true, 1,
    '/images/reservezmoi.png',
    'https://github.com/keltoummalouki/Reservez-Moi',
    null,
    array['Laravel', 'MySQL', 'HTML', 'Tailwind CSS', 'JavaScript', 'UML', 'Jira', 'Git/GitHub'],
    '2025-04-01'
  )
on conflict (id) do nothing;

insert into public.project_translations (project_id, locale, title, description)
values
  -- Event Booking App
  ('11111111-1111-4111-8111-111111111111', 'fr', 'Event Booking App',
   'Application de gestion d''événements avec système de réservation et gestion des rôles utilisateurs.'),
  ('11111111-1111-4111-8111-111111111111', 'en', 'Event Booking App',
   'Event management application with booking system and user-role management.'),
  ('11111111-1111-4111-8111-111111111111', 'ar', 'Event Booking App',
   'تطبيق لإدارة الفعاليات مع نظام حجز وإدارة أدوار المستخدمين.'),
  -- Réservez-Moi
  ('22222222-2222-4222-8222-222222222222', 'fr', 'Réservez-Moi',
   'Plateforme de réservation de services avec gestion des disponibilités et des réservations.'),
  ('22222222-2222-4222-8222-222222222222', 'en', 'Réservez-Moi',
   'Service-booking platform with availability and reservation management.'),
  ('22222222-2222-4222-8222-222222222222', 'ar', 'Réservez-Moi',
   'منصة لحجز الخدمات مع إدارة التوفر والحجوزات.')
on conflict (project_id, locale) do nothing;

-- ---------------------------------------------------------------------------
-- Services (generic, evidence-based offerings; titles/descriptions per locale)
-- ---------------------------------------------------------------------------

insert into public.services (id, slug, status, sort_order, icon, title, description)
values
  (
    '33333333-3333-4333-8333-333333333333',
    'full-stack-web-development',
    'published', 0, 'code',
    '{"fr": "Développement web full-stack", "en": "Full-stack web development", "ar": "تطوير الويب المتكامل"}'::jsonb,
    '{"fr": "Conception et développement d''applications web modernes, du frontend à la base de données.", "en": "Design and build of modern web applications, from frontend to database.", "ar": "تصميم وبناء تطبيقات ويب حديثة، من الواجهة الأمامية إلى قاعدة البيانات."}'::jsonb
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'backend-and-api-development',
    'published', 1, 'server',
    '{"fr": "Développement backend & API", "en": "Backend & API development", "ar": "تطوير الخلفية وواجهات البرمجة"}'::jsonb,
    '{"fr": "APIs REST/GraphQL robustes, modélisation de données et intégrations côté serveur.", "en": "Robust REST/GraphQL APIs, data modelling, and server-side integrations.", "ar": "واجهات برمجة REST/GraphQL موثوقة، ونمذجة البيانات، وتكاملات من جانب الخادم."}'::jsonb
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Site settings (singleton). Only public, already-displayed information.
-- ---------------------------------------------------------------------------

insert into public.site_settings (id, availability_status, contact_email, cv_url, social_links, profile)
values
  (
    true,
    'available',
    'keltoummalouki@gmail.com',
    '/cv.pdf',
    '{"github": "https://github.com/keltoummalouki"}'::jsonb,
    '{}'::jsonb
  )
on conflict (id) do nothing;
