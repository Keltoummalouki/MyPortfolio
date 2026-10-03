import { Languages } from 'lucide-react'
import SkillIcon from '@/components/ui/SkillIcon'
import { cn } from '@/lib/utils'
import ProfileSection, { cardClass, chipClass } from './ProfileSection'

export interface AboutSkillItem {
  name: string
  icon?: string
  imageUrl?: string
}

export interface AboutSkillCategory {
  id: string
  name: string
  skills: AboutSkillItem[]
}

export function AboutSkills({
  title,
  lead,
  categories,
}: {
  title: string
  lead: string
  categories: AboutSkillCategory[]
}) {
  if (categories.length === 0) return null
  return (
    <ProfileSection id="skills" title={title} lead={lead}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {categories.map((category) => (
          <div key={category.id} className={cn(cardClass, 'p-5 md:p-6')}>
            <h3 className="text-base font-semibold text-foreground">{category.name}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <li key={skill.name} className={chipClass}>
                  <span aria-hidden="true" className="inline-flex">
                    <SkillIcon
                      name={skill.name}
                      icon={skill.icon}
                      imageUrl={skill.imageUrl}
                      className="text-primary"
                      size={14}
                    />
                  </span>
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ProfileSection>
  )
}

export function AboutLanguages({
  title,
  languages,
}: {
  title: string
  languages: { name: string; level: string }[]
}) {
  if (languages.length === 0) return null
  return (
    <ProfileSection id="languages" title={title}>
      <ul className={cn(cardClass, 'divide-y divide-border')}>
        {languages.map((language) => (
          <li key={language.name} className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="inline-flex items-center gap-3 font-medium text-foreground">
              <Languages aria-hidden="true" className="size-4 text-primary" />
              {language.name}
            </span>
            {language.level && <span className="text-sm text-muted-foreground">{language.level}</span>}
          </li>
        ))}
      </ul>
    </ProfileSection>
  )
}

export function AboutSoftSkills({
  title,
  lead,
  skills,
}: {
  title: string
  lead: string
  skills: AboutSkillItem[]
}) {
  if (skills.length === 0) return null
  return (
    <ProfileSection id="how-i-work" title={title} lead={lead}>
      <ul className="grid grid-cols-1 gap-3">
        {skills.map((skill) => (
          <li key={skill.name} className={cn(cardClass, 'flex items-center gap-3 px-5 py-4')}>
            <span aria-hidden="true" className="inline-flex rounded-lg bg-secondary p-2 text-primary">
              <SkillIcon name={skill.name} icon={skill.icon} imageUrl={skill.imageUrl} size={16} />
            </span>
            <span className="font-medium text-foreground">{skill.name}</span>
          </li>
        ))}
      </ul>
    </ProfileSection>
  )
}
