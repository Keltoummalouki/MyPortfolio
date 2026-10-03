# SEO & AI-search playbook: Keltoum Malouki

> **For:** you (Keltoum), the site owner. **Last researched:** 2026-10-03.
> **Goal:** when someone asks Google, ChatGPT, Perplexity, Gemini, Copilot or Claude about "Keltoum Malouki", the answer should say: *Full Stack Web Developer based in Casablanca, Morocco, currently at DabaDoc*, and it should cite keltoummalouki.com.

## How AI answers find you (read this first)

- **Google AI Overviews / AI Mode / Gemini** use the normal Google index. Google says a page only has to be **indexed and eligible for a snippet**. You don't need special files, AI text files or any particular schema markup.
- **ChatGPT search and Microsoft Copilot** rely heavily on **Bing's index**, plus OpenAI's `OAI-SearchBot` for ChatGPT. **If Bing hasn't indexed a page, ChatGPT search is unlikely to show it.**
- **Perplexity** runs a live search across its own crawler (`PerplexityBot`) and partner indexes, then cites the passages that answer the question most directly.
- **Claude** web search uses the **Brave Search** index (Anthropic lists Brave as its search provider). Brave has no webmaster console, so it finds you through links.
- **So all of them come back to three things:** (1) be indexed in Google and Bing, (2) be linked from places crawlers already visit, (3) state the same facts the same way everywhere.

**What helps:** indexable pages that state the facts in plain sentences. Consistent profiles that link back. Real independent mentions. Fresh, specific content.

**What doesn't help:**
- `llms.txt` on its own. It's a community proposal, not a standard. Google has said Search doesn't use it, and no major AI search engine has committed to reading it. It costs nothing, so think of it as cheap insurance, not a ranking factor.
- Keyword stuffing, hidden text, or schema that says things the page doesn't show visibly.
- Bought links, link exchanges and "profile backlink" packages.

### Your footprint today (what I found on 2026-10-03)

- **No keltoummalouki.com page appeared for any brand query I tried.** The site is effectively invisible to search right now. That makes Search Console + Bing (section 2) the top priority.
- **LinkedIn is indexed under the old URL** `linkedin.com/in/keltoum-malouki-79a28029a`. Your **GitHub profile's social link still points to that old URL too.**
- **GitHub** (`github.com/Keltoummalouki`) is in good shape: bio, company DabaDoc, Casablanca, and the website field set to your site.
  - It also lists X `@KeltoumMalouki`, Instagram `@keltoummalouki`, Medium, dev.to, Stack Overflow (user 23517421) and HackerRank.
  - The DabaDigital PRs you authored also show up for "keltoummalouki".
- **Medium** (`keltoummalouki.medium.com`) has French Laravel articles: "Utilisation des Factories dans Laravel" and "Utilisation de Laravel avec Docker et PostgreSQL".
- **Truelancer** has a profile spelled **"Kltoum malouki"** (`truelancer.com/freelancer/kltoummalouki`). Search snippets describe graphic-design services on it.
- **Some search summaries contradict your current profile.** One describes a "Keltoum Malouki" as a *video editor*, and another as *"Full-Stack Developer at YouCode Maroc"*. YouCode is where you trained, not an employer.
- **The Arabic name كلثوم ملوكي returns only Umm Kulthum results.** You have no Arabic-language footprint yet.
- **Neither featured project README links to your site.** The **Réservez-Moi README is still the default Laravel README.**

---

## 1. What's now in the code

- **Structured data (JSON-LD):** every page emits one `@graph` containing **Person**, **WebSite** and **WebPage**, all linked by stable `@id`s.
  - Home and /freelance add **Organization** ("Keltoum Malouki Web Development", founder = you).
  - /about is a **ProfilePage** with a **FAQPage**.
  - /projects is an **ItemList**, and each case study is a **SoftwareSourceCode/CreativeWork**.
  - Blog posts use **BlogPosting**. Every inner page has a **BreadcrumbList**.
  - `Person` includes your Arabic name (`alternateName: كلثوم ملوكي`), job title, Casablanca/Morocco, `sameAs` (published social links from Admin → Social), `worksFor` (the current experience in Admin), alumni, skills, languages and the Docker certificate.
- **Metadata on every page:** title, description, canonical, `hreflang` for fr/en/ar plus `x-default`, full Open Graph and Twitter cards, and a generated OG image.
- **`/sitemap.xml`:** every public page in all 3 locales, with hreflang alternates. New projects and articles appear automatically.
- **`/robots.txt`:**
  - Allows everything public and names the AI and search crawlers explicitly: GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, and others.
  - Blocks `/admin` and `/api`.
  - **Vercel preview deployments get `Disallow: /` and `noindex`**, so they can't compete with production.
- **Homepage section "Who is Keltoum Malouki?"** in all 3 languages: a self-contained definitional paragraph plus a visible "Key facts" list.
- **`/[locale]/about`:** the full profile page with intro, at-a-glance facts, services, experience, education, skills, languages and a visible FAQ. The FAQ schema is built from the same items as the visible FAQ.
- **`/[locale]/projects` and `/[locale]/projects/[slug]`:** indexable case studies. Event Booking App and Réservez-Moi come pre-written in FR/EN/AR through a migration.
- **`/llms.txt` and `/llms-full.txt`:** plain-text profile summaries for LLM tools (the cheap insurance mentioned above).
- **Search-engine verification:** optional `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` env vars render the verification meta tags.

## 2. Do this today (about 30 minutes)

### 1. Deploy to production on Vercel
After it's live, check:
- `https://www.keltoummalouki.com/robots.txt` shows a `Sitemap:` line and `Disallow: /admin`.
- `/sitemap.xml`, `/llms.txt`, `/en/about` and `/en/projects` all load.
- A preview deployment's `/robots.txt` shows `Disallow: /`.

### 2. Apply the database migrations
From the repo, run:
```bash
supabase link --project-ref <your-project-ref>   # once
supabase db push
```
This applies `20261003110000_fix_about_headline.sql` and `20261003120000_project_case_studies.sql`.

Then confirm `/en/projects/event-booking-app` and `/en/projects/reservez-moi` each show a case study, not just the short overview. The backfill only fills projects with those slugs whose case study is still empty.

### 3. Check your data in Admin
**Admin → About → Headline** must be the job title in all 3 locales:
- `Full Stack Web Developer`
- `Développeuse Web Full Stack`
- `مطورة ويب متكاملة`

It must never be "Get to know me". The old seed set it to that, and it leaks into the hero and into `Person.jobTitle`. The migration fixes the known bad value, but look anyway.

**Admin → Experience:** DabaDoc must be published and marked **current**, with the company URL filled in. This becomes `worksFor` in the schema. Also check Caisse Manager, Admin → Education (YouCode – UM6P) and Admin → Certifications (Docker Foundations, with credential URL).

**Admin → Social:** add your real profiles. Every published `https://` link becomes `Person.sameAs`, which is the strongest "these profiles are the same person" signal.
- Platform `medium` → `https://keltoummalouki.medium.com`
- Platform `x` → `https://x.com/KeltoumMalouki`
- dev.to → `https://dev.to/keltoummalouki`
- Stack Overflow → `https://stackoverflow.com/users/23517421`

Medium and X get their own icons. Other platforms show a generic globe icon.

### 4. Domains and env vars on Vercel
- **Vercel → Domains:** `keltoummalouki.com` (no www) must **redirect (308) to `www.keltoummalouki.com`**. Every canonical URL uses `www`.
- **Leave `NEXT_PUBLIC_SITE_URL` empty.**
- **Set `GOOGLE_SITE_VERIFICATION` or `BING_SITE_VERIFICATION` only if you can't use DNS** (next step). Paste only the `content="…"` value, not the whole tag, then redeploy.

### 5. Set up Google Search Console with a Domain property
- Search Console → Add property → **Domain** → enter `keltoummalouki.com`.
- Copy the `google-site-verification=…` **TXT** record.
- Add it at your DNS host. If your nameservers are Vercel's: Vercel → Domains → keltoummalouki.com → DNS Records → TXT, name `@`.
- Click Verify. DNS can take minutes to hours.
- Why a Domain property: it covers http/https and www/non-www in one go. A URL-prefix property only covers one exact origin.

### 6. Submit the sitemap
In Search Console → Sitemaps, enter `https://www.keltoummalouki.com/sitemap.xml`. The status should become **Success**.

### 7. Request indexing for the key pages
Search Console → URL Inspection → paste the URL → **Request indexing**. There's a daily quota, so only do the important pages:
- `/fr`, `/en`, `/ar`
- `/en/about`, `/fr/about`, `/ar/about`
- `/en/projects`
- `/en/projects/event-booking-app`, `/en/projects/reservez-moi`

### 8. Add the site to Bing Webmaster Tools
- Go to bing.com/webmasters → **Import from Google Search Console** → pick the property → Import. This verifies the site and imports the sitemap.
- Alternatively, verify with a DNS CNAME or the `BING_SITE_VERIFICATION` env var.
- Then, in URL Submission, submit the same key URLs.
- **IndexNow** (instant pings to Bing, Yandex and others; Google doesn't use it) is optional and not wired in the code. Bing's manual URL Submission is enough for a site this size.

### 9. Validate the structured data
Run `/en`, `/en/about` and `/en/projects/event-booking-app` through:
- **Rich Results Test:** search.google.com/test/rich-results
- **Schema Markup Validator:** validator.schema.org

You want **0 errors**. Warnings about optional fields are fine.

Two notes on what to expect:
- Google only shows FAQ rich results for well-known government and health sites, so **don't expect FAQ snippets**. The FAQ still helps AI answers.
- ProfilePage markup doesn't guarantee any visual result.

### 10. Privacy check
`/cv.pdf` is public and Google indexes PDFs. **If it contains your phone number, decide whether you want that searchable.**

---

## 3. Entity footprint outside the site

**The goal is corroboration:** many independent pages saying the same thing about the same person, all linking to keltoummalouki.com. Inconsistency is what makes AI mix you up with namesakes or give stale facts.

### Your identity kit: copy-paste this exact text everywhere

| Field | Value |
|---|---|
| Name | **Keltoum Malouki** (never "Kltoum", "Kaltoum"…) · Arabic: **كلثوم ملوكي** |
| Title | Full Stack Web Developer · Développeuse web full stack · مطورة ويب متكاملة |
| Location | Casablanca, Morocco |
| Current | Full Stack Developer at DabaDoc |
| Photo | The same headshot as the site (`public/images/keltoum.png`), same crop, everywhere |
| Link | `https://www.keltoummalouki.com` (or the most relevant deep link, e.g. `/en/about`) |

**Short bio (≤160 characters):** *Full Stack Web Developer in Casablanca, Morocco · Full Stack Developer at DabaDoc · React, Next.js, Angular, NestJS, Laravel · keltoummalouki.com*

**Canonical bio sentence.** Use it as the first line of every "About" field:
- **EN:** Keltoum Malouki is a Full Stack Web Developer based in Casablanca, Morocco, currently at DabaDoc, building web applications with React, Next.js, Angular, NestJS, Laravel and Ruby on Rails.
- **FR:** Keltoum Malouki est développeuse web full stack basée à Casablanca, au Maroc, actuellement chez DabaDoc. Elle crée des applications web avec React, Next.js, Angular, NestJS, Laravel et Ruby on Rails.
- **AR:** كلثوم ملوكي (Keltoum Malouki) مطورة ويب متكاملة (Full Stack) مقيمة في الدار البيضاء بالمغرب، تعمل حالياً لدى DabaDoc، وتبني تطبيقات الويب باستخدام React وNext.js وAngular وNestJS وLaravel وRuby on Rails.

**When a fact changes** (new job, new city), update it **everywhere in the same week**: Admin, LinkedIn, GitHub, X, dev.to, Medium, CV.

### Profile checklist

#### LinkedIn (highest priority)
- **Public profile & URL:** confirm your custom URL is **`linkedin.com/in/keltoummalouki`**.
  - LinkedIn **does not redirect old custom URLs**, so every copy of `/in/keltoum-malouki-79a28029a` is now a dead or weak link.
  - Replace it on your GitHub profile (Settings → Social accounts), in CV PDFs, in Medium/dev.to/X bios and in your email signature. The site and its README already use the new URL.
- **Headline:** `Full Stack Web Developer at DabaDoc | React · Next.js · Angular · NestJS · Laravel · Ruby on Rails | Casablanca, Morocco`
- **About:** the first line is the canonical EN sentence, then 3–5 lines on what you build, then `Portfolio & case studies: https://www.keltoummalouki.com/en/about`.
- **Contact info → Website:** `https://www.keltoummalouki.com` (type: Portfolio).
- **Experience and Education:** pick the **real company and school pages** from the dropdown (DabaDoc; YouCode / UM6P), not free text, so LinkedIn links the entities. Use the same dates as the site.
- **Licenses & certifications:** Docker Foundations Professional Certificate, with the credential URL.
- **Featured:** add `/en/about`, `/en/projects/event-booking-app` and `/en/projects/reservez-moi`.
- **Second profile language:** Profile → *Add profile in another language* → **Arabic** (name **كلثوم ملوكي**, Arabic headline). You can add a French one too. This is your best quick win for Arabic-name queries.

#### GitHub
- **Settings → Social accounts:** replace the old LinkedIn link with `https://www.linkedin.com/in/keltoummalouki`. Keep website = `https://www.keltoummalouki.com`.
- **Profile README** (`Keltoummalouki/Keltoummalouki`): make the canonical EN sentence the first line, then links to `/en/about` and `/en/projects`.
- **Pinned repos:** keep `event-booking-app` and `Reservez-Moi` first. For each one:
  - Repo **About (gear) → Website** = its case-study URL, e.g. `https://www.keltoummalouki.com/en/projects/event-booking-app`.
  - Add **topics**, e.g. `nestjs nextjs typescript postgresql docker github-actions`.
  - At the top of the README: `Case study: <url> · Built by [Keltoum Malouki](https://www.keltoummalouki.com)`.
- **Réservez-Moi:** replace the default Laravel README with a real one covering what it is, features, stack, screenshots, setup, and a link to the case study.
- **MyPortfolio repo:** set the website field to the site.

#### Writing platforms
Publish on your site first, then cross-post with a canonical link pointing back (see section 5).
- **Medium:** set your bio and link.
  - For your existing Laravel articles: republish an updated version on `/fr/blog`, then on Medium use ⋯ → *Customize canonical link* → the site URL.
  - For new posts, use *Import a story*, which adds the canonical link automatically.
- **dev.to:** fill in Settings → Website, Location, Bio and Work. Put `canonical_url: https://www.keltoummalouki.com/…` in each post's front matter.
- **Hashnode (optional):** when publishing, set the *original article URL* to your site.

#### Other profiles
- **Stack Overflow** (user 23517421): fill in Website, Location, the About-me first line and the GitHub link. A few genuine answers in tags you use (laravel, nestjs, next.js, angular) are real, citable mentions.
- **X `@KeltoumMalouki`, Instagram `@keltoummalouki`, HackerRank:** short bio plus website. Same photo.
- **Gravatar** (sign up with `keltoummalouki@gmail.com`): name, photo, canonical bio, links. Many dev tools and comment systems pull from it.

#### Freelance marketplaces (only if you want leads)
- **Malt:** eligibility for freelancers registered outside Malt's core countries depends on your country and legal status. Check Malt's help article *"S'inscrire sur Malt depuis l'étranger"*. You'll need a legal status such as Moroccan auto-entrepreneur.
- **Upwork:** an option too.
- On any marketplace, use the identity kit, list exactly the services on `/freelance` (full-stack web development; backend & API development), and link your case studies.
- **Truelancer "Kltoum malouki":** if that profile is yours, fix the name spelling, title and link, or delete it. If it isn't, leave it alone.
- **If you name your freelance practice anywhere,** use exactly **"Keltoum Malouki Web Development"**. That's the Organization name in the site's schema (in `src/features/seo/site.ts`).

#### Google Business Profile: be honest about the rule
- Google requires **in-person contact with customers**, at a storefront or by visiting them as a *service-area business*. **Online-only businesses are explicitly ineligible.**
- If you only work remotely, **skip it.** A profile that breaks the rules gets suspended.
- Only if you really do meet clients in Casablanca: create a service-area business, hide your home address, and pick the category "Website designer".

#### YouCode / UM6P and DabaDoc: ask, don't assume
- Ask YouCode whether they have alumni stories, project showcases or demo-day pages that could link to you.
- Ask DabaDoc whether a team, careers or engineering-blog page exists that you could appear on.
- **Never publish anything confidential about DabaDoc.** Get approval before writing about work done there.

#### Wikidata / Wikipedia: not yet
- Wikidata needs "serious and publicly available references". **Your own site and social profiles don't count,** and items about people without independent sources tend to get deleted.
- Revisit once you have **2 or more independent sources**: a press article, a conference speaker page, a published interview.
- Never write your own Wikipedia article (conflict of interest, plus notability rules).

---

## 4. Mentions & backlinks (white-hat only)

Ordered by value-per-hour. Do 1–4 this month, then add one item from 5–8 each month.

| # | Action | Effort | Why it helps |
|---|---|---|---|
| 1 | Repo READMEs + repo "Website" fields → case studies (section 3, GitHub) | 30 min | GitHub is crawled constantly; this ties projects to you and to the site |
| 2 | Every profile in section 3 → identity kit + link | 1–2 h | The `sameAs` web: consistent, cross-linked profiles |
| 3 | Republish your Medium Laravel articles on the site and set Medium's canonical to the site | 1 h per article | Moves the authority you already earned to your domain |
| 4 | Ask YouCode and DabaDoc (one short email each) | 15 min | Independent, high-trust pages naming you |
| 5 | Answer questions on Stack Overflow / dev.to; share your articles in the Moroccan and Francophone dev groups you're already in (LinkedIn, Discord), value first, with a link only where relevant | 1 h/week | Real mentions and discovery |
| 6 | Small open-source PRs to tools you use: docs, i18n and **RTL fixes** (you have real RTL experience from this site) | 2–4 h each | Credited contributions on high-authority repos |
| 7 | Give a lightning talk at a local meetup (Google Developer Groups chapter in Casablanca, Meetup.com JS/Laravel groups) or a YouCode event, and ask for a speaker page that links to you | 1 day | Independent pages with your name and bio; this also counts toward Wikidata later |
| 8 | Pitch Moroccan/Francophone tech podcasts or YouTube channels. Topics: "from YouCode to a health-tech dev job", "building RTL web apps" | Ongoing | Interviews are the kind of independent coverage AI trusts |

**Never:** buy links, use PBNs, do link-exchange schemes, buy mass directory or "profile backlink" packages, submit AI-spun guest posts, post fake testimonials or reviews, or comment-spam. None of these build a lasting entity, and they risk a penalty.

---

## 5. Content plan

**Process for every article:**
1. Publish on **your site first** (Admin → Blog, all locales you can write well).
2. Open with a self-contained definitional paragraph that names you and the project.
3. Link to the related case study and to `/about`.
4. Wait a few days for it to be indexed.
5. Cross-post to dev.to, Hashnode or Medium **with the canonical link pointing to your site**.
6. Share a native summary on LinkedIn with the link.

**Cadence:** 1 article per month beats 6 in one week.

| # | Working title | Target query | Angle (only real facts) |
|---|---|---|---|
| 1 | Building an event booking app with NestJS, Next.js and PostgreSQL | `nestjs nextjs event booking app` | Architecture, roles and permissions, capacity rules, PDF tickets with QR code, unit + e2e tests: the Event Booking App case study in long form |
| 2 | Dockerizing a NestJS + Next.js + PostgreSQL app and adding CI with GitHub Actions | `docker compose nestjs nextjs postgres github actions` | Step by step from the real repo: Compose services, env handling, the CI pipeline, and what broke along the way |
| 3 | Designing a service-booking platform with Laravel and MySQL, UML first | `laravel reservation system availability` | Réservez-Moi: from UML/Merise models and the Jira backlog to Laravel code for availability and reservations |
| 4 | What building features for a medical appointment-booking platform taught me | `medical appointment booking ux` | General lessons on booking UX and working in a Rails / Angular / MongoDB codebase. **No confidential details; get DabaDoc's OK first** |
| 5 | Docker fundamentals I actually use as a full-stack developer | `docker basics for web developers` | Practical notes from the Docker Foundations Professional Certificate, applied to your own projects |
| 6 | Building a trilingual (FR/EN/AR) portfolio with Next.js 15, next-intl and Supabase, including RTL | `next-intl arabic rtl next.js` | Logical CSS utilities, locale routing, hreflang, JSON-LD: this exact site. Strong developer interest and naturally linkable |
| 7 | De YouCode (UM6P) à développeuse full stack : mon parcours *(write in French first)* | `youcode um6p avis` / `formation youcode développeur` | An honest first-person account of the program, projects and first jobs. Strongly ties your name to YouCode |
| 8 | Les factories dans Laravel / Laravel avec Docker et PostgreSQL (updated) | `factories laravel`, `laravel docker postgresql` | Republish your existing Medium articles, refreshed, on `/fr/blog`, then set Medium's canonical link to the site |

**Also:** in Admin → Projects → *Case study (Markdown)*, write case studies for 2–4 more projects that show different stacks. Your pinned repos are good candidates, e.g. TruckFlow (Node/Express/MongoDB/React) and careflow-ehr (TypeScript API). Stick to facts from each repo.

---

## 6. Measure

### Google Search Console (weekly for the first month, then monthly)
- **Performance → Search results → + New → Query → "Queries containing" `malouki`.** Track impressions, clicks and average position.
- **Queries to watch:**
  - `keltoum malouki`, `keltoum malouki developer`, `keltoum malouki portfolio`, `كلثوم ملوكي`
  - non-brand (slower): `full stack developer casablanca`, `développeuse full stack casablanca`, `développeur web freelance casablanca`
- **Pages:** `/fr`, `/en`, `/ar`, `/en/about` and the case studies should all get impressions.
- **Indexing → Pages:** fix anything stuck in *"Crawled – currently not indexed"* or *"Duplicate, Google chose different canonical"* (usually www vs non-www, or an old URL).
- **Sitemaps:** status is Success, and the discovered-URL count roughly equals pages × 3 locales.
- **Enhancements:** Breadcrumbs should show 0 invalid items.
- **AI features:** AI Overviews and AI Mode impressions are counted inside the normal Web numbers. If your account shows a separate Generative AI / AI report, track its impressions (it has no clicks or queries).

### Bing Webmaster Tools (monthly)
- **Search Performance:** for Bing, and therefore for ChatGPT search and Copilot.
- **AI Performance** (public preview since Feb 2026): how often Copilot and Bing AI answers cite your pages, plus the *grounding queries* that led to them.

### Monthly AI-answer check (first Monday, about 20 minutes)
**How to test:**
- Use a fresh chat, logged out or with memory/personalization off, and **web search on**.
- Test ChatGPT, Perplexity, Gemini, Google AI Mode, Copilot and Claude.
- Log the date, tool, sources cited, correct facts and wrong facts in a simple sheet.

**Prompts:**
1. `Who is Keltoum Malouki?`
2. `Keltoum Malouki developer Casablanca`
3. `What projects has Keltoum Malouki built? Cite sources.`
4. `Where does Keltoum Malouki work and where did Keltoum Malouki study?`
5. `Qui est Keltoum Malouki ?`
6. `من هي كلثوم ملوكي؟`
7. *(non-brand, long-term)* `Full stack web developers in Casablanca who use Next.js and NestJS`
8. *(non-brand, long-term)* `Freelance full stack developer in Morocco for a Laravel project`

**A good answer includes:**
- Keltoum Malouki, Full Stack Web Developer, Casablanca, Morocco
- currently at DabaDoc
- trained at YouCode (UM6P)
- 1–2 real projects (Event Booking App, Réservez-Moi) and the core stack
- **a citation of keltoummalouki.com** (or LinkedIn/GitHub)

**Red flags:**
- "no information found"
- mixing you up with namesakes or with Umm Kulthum
- "developer at YouCode", "video editor" or "graphic designer"
- invented facts

**When an answer is wrong, fix the source it cites.** The page it cites is the only thing you can actually change.

### Tools
- **Rich Results Test** (search.google.com/test/rich-results) and **Schema Markup Validator** (validator.schema.org): after every structural change.
- **GSC URL Inspection → Test live URL → View tested page:** confirms Google sees the JSON-LD and the "Who is Keltoum Malouki?" text.
- **Bing URL Inspection:** the same check for Bing.
- **PageSpeed Insights** (pagespeed.web.dev): keep Core Web Vitals green on `/fr`, `/en/about` and one case study.

---

## 7. Priority table

| Priority | Change | Status | Your next step |
|---|---|---|---|
| Red 1 | Clear Keltoum Malouki description on homepage | **Done in code:** "Who is Keltoum Malouki?" section, key facts, explicit title/description in FR/EN/AR | Deploy; check Admin → About headline is the job title; request indexing for `/fr`, `/en`, `/ar` |
| Red 2 | Organization + WebSite JSON-LD | **Done in code:** Person + Organization + WebSite + WebPage graph, linked by `@id`, on every page | Validate (section 2, step 9); fill Admin → Social / Experience / Certifications so `sameAs` and `worksFor` are complete |
| Red 3 | Search Console + sitemap/indexing | **Code done** (sitemap, robots, verification env vars). **Your action:** DNS + submissions | Domain property via DNS TXT, submit sitemap, request indexing, Bing import (section 2) |
| Orange 5 | Detailed About page | **Done in code:** `/[locale]/about` (ProfilePage, visible FAQ, experience, education, skills) | Keep the CMS data complete; add it to LinkedIn Featured |
| Orange 6 | Individual portfolio case studies | **Done in code:** `/projects` + `/projects/[slug]`; 2 case studies ship via migration | `supabase db push`; write 2–4 more in Admin → Projects; point repo Website fields at them |
| Yellow 8 | Articles / technical case studies | Blog + BlogPosting schema exist. **Content is yours** | One article a month from section 5, site first, then canonical cross-posts |
| Yellow 9 | External mentions / backlinks | **Your action** | Section 3 checklist this week (LinkedIn URL + Arabic profile first); one section 4 item per month |

---

### Research notes and sources

- **Sources used:**
  - Google Search Central, *AI features and your website* and *AI optimization guide* (2026): no special files or markup are needed for AI Overviews/AI Mode, and `llms.txt` isn't used.
  - Search Console Help on Domain vs URL-prefix properties.
  - Bing Webmaster Tools help on importing from GSC, and the Feb 2026 *AI Performance* announcement.
  - IndexNow (Google doesn't participate).
  - Google Business Profile eligibility guidelines (online-only businesses are ineligible).
  - Wikidata:Notability.
  - LinkedIn custom-URL behavior (old URLs don't redirect).
  - Medium, dev.to and Hashnode canonical-link docs.
  - Third-party analyses of how ChatGPT search (Bing + OAI-SearchBot), Perplexity and Claude (Brave) pick sources.
- **Limits of this research:**
  - The research sandbox blocked direct fetches of developers.google.com, Medium, dev.to, Malt help and keltoummalouki.com itself. Those points rely on search-result excerpts plus general knowledge, so re-check the details in each console as you go.
  - The footprint snapshot came from a web-search tool, not from Google itself. Search Console is the real source of truth once it's verified.
