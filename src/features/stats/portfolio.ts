export const PORTFOLIO_STATS = {
  projects: 50,
  experience: 1,
  technologies: 20,
  commits: 500,
  githubRepos: 50,
} as const

export type PortfolioStatKey = keyof typeof PORTFOLIO_STATS

export function statValue(key: PortfolioStatKey): number {
  return PORTFOLIO_STATS[key]
}
