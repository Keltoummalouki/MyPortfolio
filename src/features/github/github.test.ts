import { describe, expect, it } from 'vitest'
import { toContributionCalendar, toGithubProfile } from './map'

const profilePayload = {
  login: 'Keltoummalouki',
  name: 'Keltoum Malouki',
  html_url: 'https://evil.example/not-used',
  public_repos: 54,
  followers: 12,
  following: 9,
}

describe('toGithubProfile', () => {
  it('maps the counts and builds the profile URL from the login', () => {
    expect(toGithubProfile(profilePayload)).toEqual({
      login: 'Keltoummalouki',
      name: 'Keltoum Malouki',
      url: 'https://github.com/Keltoummalouki',
      publicRepos: 54,
      followers: 12,
      following: 9,
    })
  })

  it('falls back to the login when the name is empty or missing', () => {
    expect(toGithubProfile({ ...profilePayload, name: '  ' })?.name).toBe('Keltoummalouki')
    expect(toGithubProfile({ ...profilePayload, name: null })?.name).toBe('Keltoummalouki')
  })

  it('rejects malformed payloads (errors, bad logins, negative counts)', () => {
    expect(toGithubProfile({ message: 'API rate limit exceeded' })).toBeNull()
    expect(toGithubProfile({ ...profilePayload, login: '../admin' })).toBeNull()
    expect(toGithubProfile({ ...profilePayload, followers: -1 })).toBeNull()
    expect(toGithubProfile(null)).toBeNull()
  })
})

describe('toContributionCalendar', () => {
  // 2025-10-08 is a Wednesday (weekday 3).
  const days = Array.from({ length: 10 }, (_, i) => ({
    date: `2025-10-${String(8 + i).padStart(2, '0')}`,
    count: i,
    level: Math.min(4, i),
  }))

  it('groups days into Sunday-first weeks, padding the first column', () => {
    const calendar = toContributionCalendar({ total: { lastYear: 99 }, contributions: days })
    expect(calendar?.total).toBe(99)
    expect(calendar?.weeks).toHaveLength(2)
    expect(calendar?.weeks[0].slice(0, 3)).toEqual([null, null, null])
    expect(calendar?.weeks[0][3]?.date).toBe('2025-10-08')
    expect(calendar?.weeks[1][0]?.date).toBe('2025-10-12')
    expect(calendar?.weeks[1]).toHaveLength(6)
  })

  it('sorts unordered days and sums counts when no total is given', () => {
    const calendar = toContributionCalendar({ contributions: [...days].reverse() })
    expect(calendar?.total).toBe(45)
    expect(calendar?.weeks[0][3]?.date).toBe('2025-10-08')
  })

  it('rejects empty or malformed payloads', () => {
    expect(toContributionCalendar({ contributions: [] })).toBeNull()
    expect(toContributionCalendar({ contributions: [{ date: 'yesterday', count: 1, level: 1 }] })).toBeNull()
    expect(toContributionCalendar({ contributions: [{ date: '2025-10-08', count: 1, level: 7 }] })).toBeNull()
    expect(toContributionCalendar({ error: 'not found' })).toBeNull()
  })
})
