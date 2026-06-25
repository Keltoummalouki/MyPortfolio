import { describe, it, expect } from 'vitest'
import { toProjectCard, type ProjectInput } from './projects.map'

const base: ProjectInput = {
  id: 'p1',
  cover_image_url: '/images/cover.png',
  repo_url: 'https://github.com/example/repo',
  demo_url: null,
  featured: true,
  tech_stack: ['Next.js', 'TypeScript'],
  started_at: '2025-04-01',
  project_translations: [
    { locale: 'fr', title: 'Titre FR', description: 'Desc FR' },
    { locale: 'en', title: 'Title EN', description: 'Desc EN' },
  ],
}

describe('toProjectCard', () => {
  it('uses the requested locale translation', () => {
    const card = toProjectCard(base, 'en')
    expect(card.title).toBe('Title EN')
    expect(card.description).toBe('Desc EN')
    expect(card.stack).toEqual(['Next.js', 'TypeScript'])
    expect(card.image).toBe('/images/cover.png')
  })

  it('falls back to the default locale (fr) when the requested locale is missing', () => {
    const card = toProjectCard(base, 'ar')
    expect(card.title).toBe('Titre FR')
  })

  it('returns empty title when there are no translations', () => {
    const card = toProjectCard({ ...base, project_translations: [] }, 'fr')
    expect(card.title).toBe('')
    expect(card.description).toBeNull()
  })

  it('returns a null dateLabel when started_at is missing', () => {
    const card = toProjectCard({ ...base, started_at: null }, 'fr')
    expect(card.dateLabel).toBeNull()
  })
})
