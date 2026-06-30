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

insert into public.site_settings (id, availability_status, contact_email, cv_url, location, social_links, profile)
values
  (
    true,
    'available',
    'keltoummalouki@gmail.com',
    '/cv.pdf',
    '{"fr": "Casablanca (mobilité / relocation)", "en": "Casablanca (mobile / relocation)", "ar": "الدار البيضاء (تنقل / انتقال)"}'::jsonb,
    '{"github": "https://github.com/keltoummalouki"}'::jsonb,
    '{
      "location": {
        "fr": "Casablanca (mobilité / relocation)",
        "en": "Casablanca (mobile / relocation)",
        "ar": "الدار البيضاء (تنقل / انتقال)"
      },
      "cvUrls": {
        "fr": "/cv.pdf",
        "en": "/cv.pdf"
      }
    }'::jsonb
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- CMS expansion seed (safe subset from the existing static content).
-- Bulk content (individual skills, experiences, education, certifications) is
-- entered via the dashboard once its UI ships — deferred on purpose.
-- ---------------------------------------------------------------------------

-- About profile (singleton). Text mirrors messages/*.json `about`.
insert into public.about_profile (id, full_name, avatar_url, headline, bio)
values (
  true,
  'Keltoum Malouki',
  null,
  '{"fr": "Apprenez à me connaître", "en": "Get to know me", "ar": "تعرف علي أكثر"}'::jsonb,
  '{"fr": "Je suis Keltoum Malouki, développeuse web full stack basée à Casablanca, Maroc. Formée chez YouCode (UM6P), je livre des solutions web complètes, de l''interface utilisateur à l''architecture back-end. Je privilégie le code propre, l''expérience utilisateur et l''apprentissage continu.", "en": "I''m Keltoum Malouki, a Full Stack Web Developer from Casablanca, Morocco. With hands-on training at YouCode (UM6P), I deliver complete web solutions from front-end interfaces to back-end architecture. I care about clean code, user experience, and continuous learning.", "ar": "أنا كلثوم ملوكي، مطورة ويب متكاملة من الدار البيضاء، المغرب. تلقيت تدريباً عملياً في YouCode (UM6P)، وأقدم حلولاً ويب متكاملة من واجهات المستخدم إلى البنية التحتية الخلفية. أهتم بالبرمجية النظيفة وتجربة المستخدم والتعلم المستمر."}'::jsonb
)
on conflict (id) do nothing;

-- Design settings (singleton): sensible defaults matching the current site.
insert into public.design_settings (
  id,
  default_locale,
  default_theme,
  font_body,
  font_heading,
  cursor_style,
  header_position,
  nav_items
)
values (
  true,
  'fr',
  'dark',
  'space-grotesk',
  'archivo',
  'default',
  'bottom',
  '["about","skills","experience","education","projects","certifications","github","blog","freelance","contact"]'::jsonb
)
on conflict (id) do nothing;

-- Social links (mirrors the footer).
insert into public.social_links (platform, url, sort_order, status)
values
  ('github', 'https://github.com/keltoummalouki', 0, 'published'),
  ('linkedin', 'https://www.linkedin.com/in/keltoummalouki', 1, 'published'),
  ('email', 'mailto:keltoummalouki@gmail.com', 2, 'published')
on conflict do nothing;

-- Spoken languages shown in the About section.
insert into public.languages (id, name, level, icon, sort_order, status)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '{"fr": "Arabe", "en": "Arabic", "ar": "العربية"}'::jsonb,
    '{"fr": "Maternelle", "en": "Native", "ar": "اللغة الأم"}'::jsonb,
    'globe',
    0,
    'published'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '{"fr": "Français", "en": "French", "ar": "الفرنسية"}'::jsonb,
    '{"fr": "B1", "en": "B1", "ar": "B1"}'::jsonb,
    'globe',
    1,
    'published'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '{"fr": "Anglais", "en": "English", "ar": "الإنجليزية"}'::jsonb,
    '{"fr": "A2", "en": "A2", "ar": "A2"}'::jsonb,
    'globe',
    2,
    'published'
  )
on conflict (id) do nothing;

-- Skill categories (mirrors messages/*.json `skills.categories`).
insert into public.skill_categories (slug, name, sort_order)
values
  ('languages', '{"fr": "Langages", "en": "Languages", "ar": "لغات البرمجة"}'::jsonb, 0),
  ('frameworks', '{"fr": "Frameworks & APIs", "en": "Frameworks & APIs", "ar": "الأطر وواجهات البرمجة"}'::jsonb, 1),
  ('devops', '{"fr": "DevOps", "en": "DevOps", "ar": "DevOps"}'::jsonb, 2),
  ('databases', '{"fr": "Bases de données", "en": "Databases", "ar": "قواعد البيانات"}'::jsonb, 3),
  ('management', '{"fr": "Gestion de projets", "en": "Project Management", "ar": "إدارة المشاريع"}'::jsonb, 4),
  ('modeling', '{"fr": "Conception & Modélisation", "en": "Design & Modeling", "ar": "التصميم والنمذجة"}'::jsonb, 5),
  ('versioning', '{"fr": "Contrôle de version", "en": "Version Control", "ar": "التحكم بالإصدارات"}'::jsonb, 6),
  ('design', '{"fr": "UX/UI Design", "en": "UX/UI Design", "ar": "تصميم UX/UI"}'::jsonb, 7)
on conflict (slug) do nothing;

-- Technical skills + soft skills (mirrors the public skills/soft-skills cards).
with skill_seed(category_slug, skill_type, name, icon, sort_order) as (
  values
    ('languages', 'technical', 'C', 'C', 0),
    ('languages', 'technical', 'HTML5', 'HTML5', 1),
    ('languages', 'technical', 'CSS3', 'CSS3', 2),
    ('languages', 'technical', 'SQL', 'SQL', 3),
    ('languages', 'technical', 'NoSQL', 'NoSQL', 4),
    ('languages', 'technical', 'JavaScript', 'JavaScript', 5),
    ('languages', 'technical', 'TypeScript', 'TypeScript', 6),
    ('languages', 'technical', 'PHP', 'PHP', 7),
    ('frameworks', 'technical', 'Laravel', 'Laravel', 0),
    ('frameworks', 'technical', 'Node.js', 'Node.js', 1),
    ('frameworks', 'technical', 'React', 'React', 2),
    ('frameworks', 'technical', 'Next.js', 'Next.js', 3),
    ('frameworks', 'technical', 'Express.js', 'Express.js', 4),
    ('frameworks', 'technical', 'NestJS', 'NestJS', 5),
    ('frameworks', 'technical', 'Ruby on Rails', 'Ruby on Rails', 6),
    ('frameworks', 'technical', 'Angular', 'Angular', 7),
    ('frameworks', 'technical', 'Tailwind CSS', 'Tailwind CSS', 8),
    ('frameworks', 'technical', 'GraphQL', 'GraphQL', 9),
    ('devops', 'technical', 'Docker', 'Docker', 0),
    ('devops', 'technical', 'CI/CD', 'CI/CD', 1),
    ('devops', 'technical', 'GitLab', 'GitLab', 2),
    ('databases', 'technical', 'MySQL', 'MySQL', 0),
    ('databases', 'technical', 'PostgreSQL', 'PostgreSQL', 1),
    ('databases', 'technical', 'MongoDB', 'MongoDB', 2),
    ('management', 'technical', 'Agile', '', 0),
    ('management', 'technical', 'Jira', 'Jira', 1),
    ('modeling', 'technical', 'Merise', '', 0),
    ('modeling', 'technical', 'UML', '', 1),
    ('versioning', 'technical', 'Git', 'Git', 0),
    ('versioning', 'technical', 'GitHub', 'GitHub', 1),
    ('versioning', 'technical', 'GitLab', 'GitLab', 2),
    ('design', 'technical', 'Figma', 'Figma', 0),
    ('design', 'technical', 'Canva', 'Canva', 1),
    ('design', 'technical', 'Adobe XD', 'Adobe XD', 2),
    (null, 'soft', 'Time Management', 'clock', 0),
    (null, 'soft', 'Adaptability / Flexibility', 'rotate', 1),
    (null, 'soft', 'Teamwork', 'handshake', 2)
)
insert into public.skills (category_id, skill_type, name, icon, sort_order, status)
select
  c.id,
  s.skill_type,
  s.name,
  nullif(s.icon, ''),
  s.sort_order,
  'published'
from skill_seed s
left join public.skill_categories c on c.slug = s.category_slug
where not exists (
  select 1
  from public.skills existing
  where lower(existing.name) = lower(s.name)
    and existing.skill_type = s.skill_type
);

-- Experience items (mirrors the public timeline, with stack/technologies).
insert into public.experiences (
  id,
  company,
  location,
  start_date,
  end_date,
  is_current,
  sort_order,
  status,
  technologies
)
values
  (
    '55555555-5555-4555-8555-555555555555',
    'DabaDoc',
    'Casablanca, Morocco',
    '2026-02-01',
    null,
    true,
    0,
    'published',
    array['Ruby on Rails', 'Angular', 'CoffeeScript', 'MongoDB', 'Docker', 'Git/GitHub']
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'Caisse Manager',
    'Rabat, Morocco',
    '2025-06-01',
    '2025-08-31',
    false,
    1,
    'published',
    array['Next.js', 'React', 'Tailwind CSS', 'GSAP', 'Framer Motion', 'Git/GitHub']
  )
on conflict (id) do nothing;

insert into public.experience_translations (experience_id, locale, role, description)
values
  (
    '55555555-5555-4555-8555-555555555555',
    'fr',
    'Développeuse Full Stack',
    'Développement et maintenance de fonctionnalités pour une plateforme médicale de prise de rendez-vous. Amélioration de l''interface utilisateur et de l''expérience produit.'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'en',
    'Full Stack Developer',
    'Develop and maintain features for a medical appointment-booking platform. Improve UI and user experience across the product.'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'ar',
    'مطورة ويب متكاملة',
    'تطوير وصيانة ميزات لمنصة طبية لحجز المواعيد، مع تحسين الواجهة وتجربة المستخدم.'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'fr',
    'Stagiaire Développeuse Web',
    'Création d''un site vitrine et intégration d''interfaces front-end pour des outils de gestion financière.'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'en',
    'Web Developer Intern',
    'Built a showcase site and integrated front-end interfaces for financial management tools.'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'ar',
    'متدربة تطوير ويب',
    'بناء موقع تعريفي ودمج واجهات أمامية لأدوات إدارة مالية.'
  )
on conflict (experience_id, locale) do nothing;
