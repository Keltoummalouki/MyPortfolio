# Design System — Master File

> **LOGIC:** When building a specific page/section, first check `design-system/pages/[name].md`.
> If that file exists, its rules **override** this Master file. Otherwise follow the rules below.

**Project:** Keltoum Malouki — Full Stack Developer Portfolio
**Owner:** Keltoum Malouki · Casablanca · Full Stack Web Developer
**Generated:** 2026-06-24 (supersedes 2026-06-23 auto-draft)
**Category:** Personal developer portfolio (single page)
**Stack:** Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 (CSS theme) · shadcn/ui (new-york) · Framer Motion · GSAP ScrollTrigger · @react-three/fiber
**Locales:** `fr` (default) · `en` · `ar` (RTL) — cookie-based, no URL segment

---

## 1. North Star (Design Direction)

A **premium, motion-driven, dark-default** portfolio that reads as *engineered, not templated*. Three pillars, in priority order — **never trade #1 or #2 for #3**:

1. **Performance & Security** — fast LCP, zero CLS, lazy 3D, CSP + security headers.
2. **Accessibility & Code Quality** — WCAG AA+ contrast, keyboard-complete, reduced-motion safe, strict typing.
3. **Visual Polish** — glassmorphism surfaces on a near-black canvas, **bento-grid** content blocks, restrained gradient accents, micro-interactions.

**Personality:** confident, technical, calm. Apple-bento structure + developer-tool darkness + one signature gradient. Avoid: corporate stock templates, rainbow gradients, animation everywhere.

---

## 2. Color Palette

Dark is the **default**. Light mode is fully supported (class-based via `next-themes`). All pairings below meet **≥4.5:1** for body text and **≥3:1** for large text / UI.

> **NOTE — implemented palette.** The shipping design uses a **premium navy + blue→violet** system (mapped to shadcn tokens in `src/app/globals.css`), not the violet/cyan that an earlier draft proposed. The tables below reflect what is actually in the code. Keep this in sync with `globals.css`.

### 2.1 Dark mode (default)

| Role | Hex | shadcn token | Notes |
|------|-----|--------------|-------|
| Canvas (page) | `#0B0F19` | `--background` | Premium navy, near-black |
| Card / surface | `#111827` | `--card` | Raised cards (solid fallback under glass) |
| Secondary surface | `#1A2236` | `--secondary` / `--muted` | Chips, icon wells |
| Glass fill | `bg-card/80` + `backdrop-blur-xl` | `.glass-card` | Cards over canvas |
| Glass border | `rgba(148,163,184,0.12)` | `--border` | 1px hairline |
| Text primary | `#F8FAFC` | `--foreground` | ~16:1 on canvas |
| Text muted | `#94A3B8` | `--muted-foreground` | body-safe muted |
| Primary accent | `#2563EB` (blue) | `--primary` | Brand signature, CTAs, links |
| Gradient partner | `#8B5CF6` (violet) | — | Used only inside `--gradient-primary` |
| Ring / focus | `#2563EB` | `--ring` | Focus-visible outline |
| Destructive | `#EF4444` | `--destructive` | Form errors |

### 2.2 Light mode

| Role | Hex | shadcn token |
|------|-----|--------------|
| Canvas | `#F8FAFC` | `--background` |
| Card / surface | `#FFFFFF` | `--card` |
| Glass fill | `bg-card/80` (card is opaque white → stays visible) | `.glass-card` |
| Border | `#E2E8F0` | `--border` |
| Text primary | `#0B0F19` | `--foreground` |
| Text muted | `#64748B` (slate-500) | `--muted-foreground` |
| Primary accent | `#2563EB` | `--primary` |

### 2.3 Signature gradient (use sparingly — 1–2 spots/section max)

```css
/* from globals.css */
--gradient-primary: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); /* dark; light ends at #7C3AED */
--glow-color:       rgba(37, 99, 235, 0.25);
```

Utilities: `.text-gradient` (clipped headline span), `.bg-gradient-primary`, `.glow` / `.glow-sm`. Reserve the gradient for: hero role text, primary CTA/submit, certification badge, the "40+" projects tile, active nav indicator. **Body text stays solid `--foreground`.**

---

## 3. Typography

> **NOTE — implemented fonts.** Loaded in `layout.tsx` via Google Fonts `<link>` (Archivo + Space Grotesk; Noto Sans Arabic added only when `locale === 'ar'`) and wired through `--font-display` / `--font-sans` in `globals.css`. Headings use `--font-display`; body uses `--font-sans`.

| Use | Font | Weights | Token |
|-----|------|---------|-------|
| Display / headings | **Archivo** | 400–800 | `--font-display` |
| Body / UI | **Space Grotesk** | 300–700 | `--font-sans` |
| Code / numerals | system mono stack | — | `--font-mono` |
| Arabic (RTL only) | **Noto Sans Arabic** | 300–700 | applied via `html[dir="rtl"]` |

**Type scale** (clamp for fluid responsive, line-height tightens as size grows):

| Token | Size (clamp) | LH | Use |
|-------|--------------|----|-----|
| `display` | `clamp(2.75rem, 6vw, 5rem)` | 1.05 | Hero name |
| `h1` | `clamp(2rem, 4vw, 3rem)` | 1.1 | Section titles |
| `h2` | `clamp(1.5rem, 2.5vw, 2rem)` | 1.2 | Card titles |
| `h3` | `1.25rem` | 1.3 | Sub-headings |
| `body` | `1rem` (min 16px) | 1.6 | Paragraphs |
| `small` | `0.875rem` | 1.5 | Meta, captions |
| `mono` | `0.8125rem` | 1.4 | Tech tags, dates |

Rules: body line-length **65–75ch**; never below 16px on mobile; headings use `--font-heading`, prose uses `--font-body`, tech tags/dates use `--font-mono`.

---

## 4. Layout & Spacing

### 4.1 Container & grid
- Page max-width: **`max-w-6xl`** (1152px) consistent across all sections; gutters `px-4 sm:px-6 lg:px-8`.
- **Bento grid:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`, `grid-auto-rows: minmax(180px, auto)`, `gap-4 md:gap-5`. Cards span varied sizes (1×1, 2×1, 2×2) to create hierarchy. Reflow 4→2→1.
- Featured card = `lg:col-span-2 lg:row-span-2`; supporting cards = `1×1`.

### 4.2 Spacing scale (4px base)

| Token | Value | Use |
|-------|-------|-----|
| `--space-xs` | 4px | tight gaps |
| `--space-sm` | 8px | inline / icon gaps |
| `--space-md` | 16px | card padding |
| `--space-lg` | 24px | card padding (large), inner section |
| `--space-xl` | 32px | block gaps |
| `--space-2xl` | 48px | between sub-blocks |
| `--space-3xl` | 64px | hero padding |
| section rhythm | `py-20 md:py-28` | vertical space between sections |

### 4.3 Radius & z-index
- Radius: cards `rounded-2xl` (16px) to `rounded-3xl` (24px); inputs/buttons `rounded-xl` (12px); chips `rounded-full`.
- **Z-index scale (only these):** base `0`, raised `10`, sticky header `20`, dropdown/popover `30`, modal/overlay `50`, toast `60`. Beware new stacking contexts (transform/opacity/filter create them).

---

## 5. Elevation & Glass Recipes

```css
/* Glass card (dark) */
.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border-radius: 1rem;
}
/* Light mode override: bump fill opacity so it doesn't disappear */
.light .glass { background: rgba(255,255,255,0.80); border-color: #E5E7EB; }
```

| Shadow | Value | Use |
|--------|-------|-----|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,.30)` | subtle lift |
| `--shadow-md` | `0 8px 24px rgba(0,0,0,.35)` | cards |
| `--shadow-lg` | `0 16px 48px rgba(0,0,0,.45)` | popovers, featured |
| `--shadow-glow` | `0 0 0 1px var(--glass-border), 0 8px 40px rgba(124,92,255,.18)` | hovered accent card |

Hover for cards: raise shadow + lift `translateY(-2px)` + brighten border. **No scale that shifts neighbors** in grid (use shadow/border/translate, or `will-change: transform` on isolated elements only).

---

## 6. Motion Language

Style = **Motion-Driven**, but disciplined: animate **1–2 key elements per view**, never everything.

- **Durations:** micro-interactions 150–250ms; entrance reveals 400–600ms; page/hero 600–800ms.
- **Easing:** `ease-out` for entrances, `ease-in` for exits; spring for playful hovers. Never `linear` for UI.
- **Framer Motion:** standard reveal variant — `initial {opacity:0, y:24}` → `whileInView {opacity:1, y:0}`, `viewport={{ once:true, margin:'-80px' }}`, stagger children `0.06–0.1s`.
- **GSAP ScrollTrigger:** register guarded by `typeof window !== 'undefined'`; use for hero parallax (3–5 layers, subtle) and pinned scroll moments only. Kill triggers on unmount.
- **Three.js:** ambient hero background only, **lazy-loaded below the fold / after idle**, `dynamic(() => ..., { ssr:false })`, capped DPR, paused when offscreen.
- **Reduced motion (REQUIRED):** wrap all non-essential motion in `@media (prefers-reduced-motion: reduce)` / check the hook — disable parallax, scroll-jacking, autoplay 3D; keep instant opacity fades only. This is a **High severity** a11y gate.
- **RTL:** mirror directional animations (x-offsets) when `dir="rtl"`; vertical motion is unaffected.

---

## 7. Component Specs

**Buttons**
```css
.btn-primary { background: var(--cta); color:#fff; padding:12px 24px; border-radius:12px;
  font-weight:600; transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease; cursor:pointer; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: var(--shadow-glow); }
.btn-primary:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
.btn-primary[disabled] { opacity:.6; cursor:not-allowed; } /* use during async submit */

.btn-ghost { background:transparent; color:var(--text); border:1px solid var(--glass-border);
  padding:12px 24px; border-radius:12px; font-weight:600; transition: all .2s ease; cursor:pointer; }
.btn-ghost:hover { background: var(--glass-bg); border-color: var(--accent); }
```

**Tech chip / badge** — `--font-mono`, `text-small`, `rounded-full`, glass bg, 1px border, icon (Lucide/Simple Icons SVG, 16px) + label. Never emoji.

**Card (bento)** — `.glass` + `--shadow-md`, `p-6`, `cursor-pointer` when it links, hover → `--shadow-glow` + border brighten + `translateY(-2px)`.

**Input (contact form)**
```css
.input { background: var(--glass-bg); border:1px solid var(--glass-border); border-radius:12px;
  padding:12px 16px; font-size:16px; color:var(--text); transition: border-color .2s ease, box-shadow .2s ease; }
.input:focus-visible { border-color: var(--accent); outline:none; box-shadow:0 0 0 3px rgba(124,92,255,.25); }
.input[aria-invalid="true"] { border-color: var(--danger); }
```
Every input has a `<label for>`; errors render adjacent to the field with `aria-describedby`; submit button disables + shows spinner during EmailJS send.

**Header** — floating glass nav, `top-4 inset-x-4`, `rounded-2xl`, blur; active section indicator uses gradient; contains Theme toggle + Language switcher (cookie write → `location.reload()`) + CV download. Reserve scroll-offset so content isn't hidden behind it. ScrollProgress bar at very top (`z-20`).

**Footer** — glass top-border, contact links (GitHub/LinkedIn/email as SVG icons), copyright, back-to-top.

---

## 8. Section Design Intent (order fixed)

1. **Hero** — name (display, gradient accent word), role, location, primary CTA (Contact) + ghost CTA (Download CV). Ambient: lazy Three.js / gradient glow + subtle GSAP parallax. Largest motion moment of the page.
2. **About** — short narrative + portrait (`next/image`, fixed dims, priority). Glass card.
3. **Skills** — **bento grid** of categories (Languages, Frameworks & APIs, DevOps, Databases, PM, Modeling, Version Control, UX/UI). Tech chips with brand SVG icons.
4. **Experience** — vertical timeline of glass cards (DabaDoc; Caisse Manager). Date in mono, stack as chips.
5. **Education** — two glass cards (YouCode/UM6P; Baccalauréat).
6. **Projects** — bento/feature grid; feature **Event Booking App** and **Réservez-Moi** as large cards with stack chips + links; "40+ realized" stat tile.
7. **Certifications** — compact glass card(s): Docker Foundations Professional (LinkedIn).
8. **GitHub Stats** — remote stat images via `next/image` (hosts already whitelisted in `next.config.ts`); reserve width/height to prevent CLS.
9. **Contact** — EmailJS form (client-only) + soft-skills + languages (Arabic native / French B1 / English A2).

---

## 9. Accessibility & Performance Guardrails (priority gates)

- Contrast: body ≥4.5:1, large/UI ≥3:1 — verified both themes.
- Keyboard: full tab order matches visual order; visible `:focus-visible` rings everywhere; skip-to-content link.
- Semantics: `<header><nav><main><section aria-labelledby><footer>`; icon-only buttons get `aria-label`; all meaningful images get alt text.
- `prefers-reduced-motion` honored globally.
- CLS = 0: reserve dimensions for images, 3D canvas, and remote stat images; `font-display: swap`.
- LCP: hero text/image prioritized; defer 3D & below-fold JS; code-split sections; prefer server components, push `'use client'` to leaf interactive parts.
- Security: strict CSP + security headers in `next.config.ts`; only publishable EmailJS keys client-side; validate/sanitize form input; no unsanitized `dangerouslySetInnerHTML`; `remotePatterns` whitelist (never `*`).

---

## 10. Anti-Patterns (Do NOT use)

- ❌ Emojis as icons → use SVG (Lucide / Simple Icons for brand logos, verified paths).
- ❌ Layout-shifting hover (scale that pushes grid neighbors).
- ❌ Rainbow / more than the one signature gradient family.
- ❌ Gradient or low-contrast body text.
- ❌ Animation on 5+ elements per view; scroll-jacking without reduced-motion escape.
- ❌ Invisible glass in light mode (`bg-white/10`) — use ≥`bg-white/80`.
- ❌ Borders that vanish (`border-white/10` in light mode) — use `gray-200`.
- ❌ Corporate stock template / generic layout.
- ❌ Mixed container widths; `<img>` instead of `next/image`; `domains:['*']`.

---

## 11. Pre-Delivery Checklist

- [ ] No emojis as icons; consistent icon set; brand logos verified (Simple Icons)
- [ ] `cursor-pointer` on all clickable elements; hover feedback 150–300ms
- [ ] Contrast 4.5:1 (body) in **both** themes; glass visible in light mode
- [ ] `:focus-visible` rings present; full keyboard nav; skip link
- [ ] `prefers-reduced-motion` respected (parallax/3D/auto motion disabled)
- [ ] Zero CLS: images, 3D canvas, GitHub stat images have reserved dimensions
- [ ] 3D lazy-loaded `ssr:false`; sections code-split; client boundaries at leaves
- [ ] All 3 locales (`fr`/`en`/`ar`) synced; RTL verified; Noto Sans Arabic only for `ar`
- [ ] CSP + security headers set; only publishable keys client-side; form validated
- [ ] Responsive at 375 / 768 / 1024 / 1440px; no horizontal scroll
- [ ] `npm run lint` clean; no `any`; no console noise
