'use client'

/**
 * TechIcon Component
 * ===================
 * 
 * A reusable component that renders official technology logos/icons.
 * 
 * RECOMMENDED LIBRARY: react-icons
 * ================================
 * Justification:
 * 1. Contains 40+ icon sets including Simple Icons (brand logos) and Devicons
 * 2. Tree-shakeable - only imports icons you use (great for performance)
 * 3. All icons are optimized SVGs (crisp at any size)
 * 4. TypeScript support out of the box
 * 5. Easy to style with CSS/className
 * 6. 4M+ weekly downloads - well maintained
 * 
 * Icon Sets Used:
 * - Si (Simple Icons): Official brand logos (React, Next.js, TypeScript, etc.)
 * - Di (Devicons): Developer-focused icons
 * - Fa (Font Awesome): General icons
 * 
 * PERFORMANCE BEST PRACTICES:
 * - Icons are loaded on-demand (tree-shaking)
 * - SVG format = scalable without quality loss
 * - No external network requests
 * 
 * ACCESSIBILITY:
 * - Each icon includes aria-label for screen readers
 * - role="img" for proper semantic meaning
 * - titleId for SVG title element
 */

import {
    SiJavascript,
    SiTypescript,
    SiPhp,
    SiC,
    SiHtml5,
    SiCss3,
    SiMysql as SiSql,
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
    SiMysql,
    SiPostgresql,
    SiMongodb,
    SiDocker,
    SiGithub,
    SiGitlab,
} from 'react-icons/si'

import { VscAzureDevops } from 'react-icons/vsc'
import { IconType } from 'react-icons'

// Type for tech names
export type TechName =
    | 'JavaScript' | 'TypeScript' | 'PHP' | 'C' | 'HTML5' | 'CSS3' | 'SQL'
    | 'React' | 'Next.js' | 'Tailwind CSS' | 'GSAP' | 'Framer Motion' | 'GraphQL'
    | 'Node.js' | 'Express.js' | 'NestJS' | 'Laravel'
    | 'MySQL' | 'PostgreSQL' | 'MongoDB'
    | 'Docker' | 'Git/GitHub' | 'CI/CD' | 'GitLab'

// Icon configuration with colors optimized for dark UI
interface IconConfig {
    icon: IconType
    color: string       // Primary brand color
    darkColor?: string  // Optional color for dark theme (defaults to color)
    label: string       // Accessible label
}

/**
 * Icon mapping with official brand colors
 * Colors are adjusted for visibility on dark backgrounds
 */
const techIcons: Record<TechName, IconConfig> = {
    // Languages
    'JavaScript': {
        icon: SiJavascript,
        color: '#F7DF1E',
        label: 'JavaScript programming language'
    },
    'TypeScript': {
        icon: SiTypescript,
        color: '#3178C6',
        label: 'TypeScript programming language'
    },
    'PHP': {
        icon: SiPhp,
        color: '#777BB4',
        label: 'PHP programming language'
    },
    'C': {
        icon: SiC,
        color: '#A8B9CC',
        label: 'C programming language'
    },
    'HTML5': {
        icon: SiHtml5,
        color: '#E34F26',
        label: 'HTML5 markup language'
    },
    'CSS3': {
        icon: SiCss3,
        color: '#1572B6',
        label: 'CSS3 styling language'
    },
    'SQL': {
        icon: SiSql,
        color: '#4479A1',
        label: 'SQL database language'
    },

    // Frontend
    'React': {
        icon: SiReact,
        color: '#61DAFB',
        label: 'React JavaScript library'
    },
    'Next.js': {
        icon: SiNextdotjs,
        color: '#FFFFFF',
        label: 'Next.js React framework'
    },
    'Tailwind CSS': {
        icon: SiTailwindcss,
        color: '#06B6D4',
        label: 'Tailwind CSS framework'
    },
    'GSAP': {
        icon: SiGreensock,
        color: '#88CE02',
        label: 'GSAP animation library'
    },
    'Framer Motion': {
        icon: SiFramer,
        color: '#0055FF',
        darkColor: '#60A5FA', // Brighter for dark mode
        label: 'Framer Motion animation library'
    },
    'GraphQL': {
        icon: SiGraphql,
        color: '#E10098',
        label: 'GraphQL query language'
    },

    // Backend
    'Node.js': {
        icon: SiNodedotjs,
        color: '#339933',
        label: 'Node.js runtime'
    },
    'Express.js': {
        icon: SiExpress,
        color: '#FFFFFF',
        label: 'Express.js web framework'
    },
    'NestJS': {
        icon: SiNestjs,
        color: '#E0234E',
        label: 'NestJS framework'
    },
    'Laravel': {
        icon: SiLaravel,
        color: '#FF2D20',
        label: 'Laravel PHP framework'
    },

    // Databases
    'MySQL': {
        icon: SiMysql,
        color: '#4479A1',
        label: 'MySQL database'
    },
    'PostgreSQL': {
        icon: SiPostgresql,
        color: '#4169E1',
        label: 'PostgreSQL database'
    },
    'MongoDB': {
        icon: SiMongodb,
        color: '#47A248',
        label: 'MongoDB database'
    },

    // DevOps
    'Docker': {
        icon: SiDocker,
        color: '#2496ED',
        label: 'Docker containerization'
    },
    'Git/GitHub': {
        icon: SiGithub,
        color: '#FFFFFF',
        label: 'Git version control and GitHub'
    },
    'CI/CD': {
        icon: VscAzureDevops,
        color: '#0078D7',
        label: 'CI/CD pipelines'
    },
    'GitLab': {
        icon: SiGitlab,
        color: '#FC6D26',
        label: 'GitLab DevOps platform'
    },
}

interface TechIconProps {
    name: TechName
    size?: number
    className?: string
    showColor?: boolean  // Use brand color or inherit parent color
}

/**
 * TechIcon Component
 * 
 * Usage Examples:
 * ```tsx
 * <TechIcon name="React" />
 * <TechIcon name="Next.js" size={24} />
 * <TechIcon name="TypeScript" showColor={false} className="text-white" />
 * ```
 */
export function TechIcon({
    name,
    size = 20,
    className = '',
    showColor = true
}: TechIconProps) {
    const config = techIcons[name]

    if (!config) {
        console.warn(`TechIcon: No icon found for "${name}"`)
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

/**
 * Get icon color for a technology
 * Useful for gradients or custom styling
 */
export function getTechColor(name: TechName): string {
    return techIcons[name]?.darkColor || techIcons[name]?.color || '#FFFFFF'
}

/**
 * Check if a technology has an icon
 */
export function hasTechIcon(name: string): name is TechName {
    return name in techIcons
}

export default TechIcon
