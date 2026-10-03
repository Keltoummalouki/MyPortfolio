-- Fix the About headline seeded with the About *section subtitle* ("Get to know
-- me") instead of the job title. The headline is rendered as the hero role and
-- as Person.jobTitle in the JSON-LD, so the wrong value leaks into search
-- results. Only rewrites the known bad seed value — never an admin's edit.
update public.about_profile
set headline = '{"fr": "Développeuse Web Full Stack", "en": "Full Stack Web Developer", "ar": "مطورة ويب متكاملة"}'::jsonb
where headline ->> 'en' = 'Get to know me'
   or headline ->> 'fr' = 'Apprenez à me connaître'
   or headline ->> 'ar' = 'تعرف علي أكثر';
