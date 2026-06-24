'use client'

import {
  SiJavascript,
  SiTypescript,
  SiPhp,
  SiC,
  SiHtml5,
  SiCss3,
  SiMysql,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiGreensock,
  SiFramer,
  SiGraphql,
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiLaravel,
  SiPostgresql,
  SiMongodb,
  SiDocker,
  SiGithub,
  SiGitlab,
  SiGit,
  SiRubyonrails,
  SiAngular,
  SiFigma,
  SiCanva,
  SiAdobexd,
  SiJira,
} from 'react-icons/si'
import { VscAzureDevops } from 'react-icons/vsc'
import { Database, LucideIcon } from 'lucide-react'
import type { IconType } from 'react-icons'

export type TechName =
  | 'JavaScript' | 'TypeScript' | 'PHP' | 'C' | 'HTML5' | 'CSS3' | 'SQL' | 'NoSQL'
  | 'React' | 'Next.js' | 'Tailwind CSS' | 'GSAP' | 'Framer Motion' | 'GraphQL'
  | 'Node.js' | 'Express.js' | 'NestJS' | 'Laravel' | 'Ruby on Rails' | 'Angular'
  | 'MySQL' | 'PostgreSQL' | 'MongoDB'
  | 'Docker' | 'Git' | 'GitHub' | 'Git/GitHub' | 'GitLab' | 'CI/CD'
  | 'Figma' | 'Canva' | 'Adobe XD' | 'Jira'

interface IconConfig {
  icon: IconType | LucideIcon
  color: string
  darkColor?: string
  label: string
}

const techIcons: Record<TechName, IconConfig> = {
  'JavaScript': { icon: SiJavascript, color: '#F7DF1E', label: 'JavaScript' },
  'TypeScript': { icon: SiTypescript, color: '#3178C6', label: 'TypeScript' },
  'PHP': { icon: SiPhp, color: '#777BB4', label: 'PHP' },
  'C': { icon: SiC, color: '#A8B9CC', label: 'C' },
  'HTML5': { icon: SiHtml5, color: '#E34F26', label: 'HTML5' },
  'CSS3': { icon: SiCss3, color: '#1572B6', label: 'CSS3' },
  'SQL': { icon: SiMysql, color: '#4479A1', label: 'SQL' },
  'NoSQL': { icon: Database, color: '#47A248', label: 'NoSQL databases' },

  'React': { icon: SiReact, color: '#61DAFB', label: 'React' },
  'Next.js': { icon: SiNextdotjs, color: '#FFFFFF', label: 'Next.js' },
  'Tailwind CSS': { icon: SiTailwindcss, color: '#06B6D4', label: 'Tailwind CSS' },
  'GSAP': { icon: SiGreensock, color: '#88CE02', label: 'GSAP' },
  'Framer Motion': { icon: SiFramer, color: '#0055FF', darkColor: '#60A5FA', label: 'Framer Motion' },
  'GraphQL': { icon: SiGraphql, color: '#E10098', label: 'GraphQL' },

  'Node.js': { icon: SiNodedotjs, color: '#339933', label: 'Node.js' },
  'Express.js': { icon: SiExpress, color: '#FFFFFF', label: 'Express.js' },
  'NestJS': { icon: SiNestjs, color: '#E0234E', label: 'NestJS' },
  'Laravel': { icon: SiLaravel, color: '#FF2D20', label: 'Laravel' },
  'Ruby on Rails': { icon: SiRubyonrails, color: '#D30001', label: 'Ruby on Rails' },
  'Angular': { icon: SiAngular, color: '#DD0031', label: 'Angular' },

  'MySQL': { icon: SiMysql, color: '#4479A1', label: 'MySQL' },
  'PostgreSQL': { icon: SiPostgresql, color: '#4169E1', label: 'PostgreSQL' },
  'MongoDB': { icon: SiMongodb, color: '#47A248', label: 'MongoDB' },

  'Docker': { icon: SiDocker, color: '#2496ED', label: 'Docker' },
  'Git': { icon: SiGit, color: '#F05032', label: 'Git' },
  'Git/GitHub': { icon: SiGithub, color: '#FFFFFF', label: 'Git and GitHub' },
  'GitHub': { icon: SiGithub, color: '#FFFFFF', label: 'GitHub' },
  'GitLab': { icon: SiGitlab, color: '#FC6D26', label: 'GitLab' },
  'CI/CD': { icon: VscAzureDevops, color: '#0078D7', label: 'CI/CD' },

  'Figma': { icon: SiFigma, color: '#F24E1E', label: 'Figma' },
  'Canva': { icon: SiCanva, color: '#00C4CC', label: 'Canva' },
  'Adobe XD': { icon: SiAdobexd, color: '#FF61F6', label: 'Adobe XD' },
  'Jira': { icon: SiJira, color: '#0052CC', label: 'Jira' },
}

interface TechIconProps {
  name: TechName
  size?: number
  className?: string
  showColor?: boolean
}

export function TechIcon({ name, size = 20, className = '', showColor = true }: TechIconProps) {
  const config = techIcons[name]

  if (!config) {
    return null
  }

  const IconComponent = config.icon
  const color = showColor ? (config.darkColor || config.color) : 'currentColor'

  return (
    <IconComponent
      size={size}
      color={color}
      className={`flex-shrink-0 ${className}`}
      role="img"
      aria-label={config.label}
      title={config.label}
    />
  )
}

export function getTechColor(name: TechName): string {
  return techIcons[name]?.darkColor || techIcons[name]?.color || '#FFFFFF'
}

export function hasTechIcon(name: string): name is TechName {
  return name in techIcons
}

export default TechIcon
