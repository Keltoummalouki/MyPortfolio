import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { FALLBACK_PROJECTS } from './projects.fallback'

// Guards the case-study backfill shipped in SQL: the migration (production) and
// the seed (local dev) must carry the same statements, never overwrite admin
// edits, and respect the page/content rules (one h1 per page, facts only).

const read = (relative: string) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8')

const MIGRATION = read('../../../supabase/migrations/20261003120000_project_case_studies.sql')
const SEED = read('../../../supabase/seed.sql')

const STATEMENT =
  /update public\.project_translations\nset body_markdown = \$cs\$([\s\S]*?)\$cs\$\nwhere body_markdown is null\n {2}and locale = '(fr|en|ar)'\n {2}and project_id = \(select id from public\.projects where slug = '([a-z0-9-]+)'\);/g

function statements(sql: string) {
  return [...sql.matchAll(STATEMENT)].map((match) => ({
    statement: match[0],
    body: match[1],
    locale: match[2],
    slug: match[3],
  }))
}

const migration = statements(MIGRATION)
const seed = statements(SEED)

describe('project case-study backfill (SQL)', () => {
  it('adds the nullable column idempotently', () => {
    expect(MIGRATION).toMatch(/alter table public\.project_translations\s+add column if not exists body_markdown text;/)
  })

  it('backfills both featured projects in fr, en and ar', () => {
    const pairs = migration.map((s) => `${s.slug}:${s.locale}`).sort()
    const expected = FALLBACK_PROJECTS.flatMap((p) => ['ar', 'en', 'fr'].map((l) => `${p.slug}:${l}`)).sort()
    expect(pairs).toEqual(expected)
  })

  it('only fills empty case studies (every update is guarded)', () => {
    const updates = MIGRATION.match(/^update /gm) ?? []
    expect(updates).toHaveLength(migration.length)
  })

  it('mirrors the exact same statements into seed.sql', () => {
    expect(seed.map((s) => s.statement)).toEqual(migration.map((s) => s.statement))
  })

  describe.each(migration.map((s) => [`${s.slug} (${s.locale})`, s] as const))('%s', (_label, { body, locale, slug }) => {
    it('starts with an h2 and never uses an h1 (the page owns the only h1)', () => {
      expect(body.startsWith('## ')).toBe(true)
      expect(body).not.toMatch(/^# /m)
    })

    it('names Keltoum Malouki in a self-contained overview sentence', () => {
      const overview = body.split(/\n## /)[0]
      expect(overview).toContain('Keltoum Malouki')
      if (locale === 'ar') expect(overview).toContain('كلثوم ملوكي')
    })

    it('links to the repository and to localized internal pages', () => {
      const repo = FALLBACK_PROJECTS.find((p) => p.slug === slug)?.github
      expect(repo).toBeTruthy()
      expect(body).toContain(`(${repo})`)
      expect(body).toContain(`(/${locale}/projects)`)
      expect(body).toContain(`(/${locale}/freelance)`)
    })

    it('contains no phone number and no dollar-quote delimiter', () => {
      expect(body).not.toMatch(/(?:\+?\d[\s.-]?){9,}/)
      expect(body).not.toContain('$cs$')
    })

    if (locale === 'en') {
      it('uses no gendered pronouns in English', () => {
        expect(body).not.toMatch(/\b(he|she|her|hers|his|him|himself|herself)\b/i)
      })
    }
  })
})
