-- Fix the About headline seeded with the About *section subtitle* ("Get to know
-- me") instead of the job title. The headline is rendered as the hero role and
-- as Person.jobTitle in the JSON-LD, so the wrong value leaks into search
-- results. Each locale is fixed on its own and only when it still holds the
-- known bad seed value, so an admin's edit in any locale is never overwritten.
update public.about_profile
set headline = jsonb_set(headline, '{en}', to_jsonb('Full Stack Web Developer'::text))
where headline ->> 'en' = 'Get to know me';

update public.about_profile
set headline = jsonb_set(headline, '{fr}', to_jsonb('Développeuse Web Full Stack'::text))
where headline ->> 'fr' = 'Apprenez à me connaître';

update public.about_profile
set headline = jsonb_set(headline, '{ar}', to_jsonb('مطورة ويب متكاملة'::text))
where headline ->> 'ar' = 'تعرف علي أكثر';
