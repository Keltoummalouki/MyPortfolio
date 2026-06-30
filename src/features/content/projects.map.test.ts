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

  it('falls back to tech_stack when no skills are linked', () => {
    const card = toProjectCard(base, 'fr')
    expect(card.stack).toEqual(['Next.js', 'TypeScript'])
    expect(card.stackItems).toEqual([
      { name: 'Next.js', icon: null, imageUrl: null },
      { name: 'TypeScript', icon: null, imageUrl: null },
    ])
  })

  it('prefers linked skills (ordered by sort_order) over tech_stack', () => {
    const card = toProjectCard(
      {
        ...base,
        project_skills: [
          { sort_order: 1, skills: { id: 's2', name: 'Docker', icon: 'docker', image_url: null } },
          { sort_order: 0, skills: { id: 's1', name: 'React', icon: null, image_url: '/img/react.png' } },
        ],
      },
      'en',
    )
    expect(card.stack).toEqual(['React', 'Docker'])
    expect(card.stackItems).toEqual([
      { name: 'React', icon: null, imageUrl: '/img/react.png' },
      { name: 'Docker', icon: 'docker', imageUrl: null },
    ])
  })

  it('ignores links whose skill is missing (e.g. unpublished)', () => {
    const card = toProjectCard(
      {
        ...base,
        project_skills: [
          { sort_order: 0, skills: null },
          { sort_order: 1, skills: { id: 's1', name: 'React', icon: null, image_url: null } },
        ],
      },
      'en',
    )
    expect(card.stack).toEqual(['React'])
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
