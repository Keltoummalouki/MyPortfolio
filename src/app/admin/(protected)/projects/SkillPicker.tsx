'use client'

import { useMemo, useState, useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import SkillIcon from '@/components/ui/SkillIcon'
import { createTechnicalSkillAction } from '@/features/content/projects.actions'
import type { ProjectSkillOption } from '@/features/content/projects.schema'

const field =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
const labelClass = 'text-sm font-medium text-foreground'

interface SkillPickerProps {
  /** All technical skills available to attach. */
  options: ProjectSkillOption[]
  /** skills.id values selected on load (preserves saved order). */
  defaultSelectedIds: string[]
}

export default function SkillPicker({ options, defaultSelectedIds }: SkillPickerProps) {
  // Available pool grows when a skill is created inline.
  const [pool, setPool] = useState<ProjectSkillOption[]>(options)
  // Ordered list of selected skill ids; order is persisted as sort_order.
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    defaultSelectedIds.filter((id) => options.some((o) => o.id === id)),
  )
  const [query, setQuery] = useState('')
  const [newName, setNewName] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const byId = useMemo(() => new Map(pool.map((o) => [o.id, o])), [pool])
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const available = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return pool
      .filter((o) => !selectedSet.has(o.id))
      .filter((o) => !needle || o.name.toLowerCase().includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [pool, selectedSet, query])

  function add(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  function remove(id: string) {
    setSelectedIds((prev) => prev.filter((s) => s !== id))
  }

  function handleCreate() {
    const name = newName.trim()
    if (!name || isPending) return
    setCreateError(null)
    startTransition(async () => {
      const result = await createTechnicalSkillAction(name)
      if (!result.ok || !result.skill) {
        setCreateError(result.error ?? 'Could not create the skill.')
        return
      }
      const skill = result.skill
      setPool((prev) => (prev.some((o) => o.id === skill.id) ? prev : [...prev, skill]))
      add(skill.id)
      setNewName('')
      setQuery('')
    })
  }

  return (
    <fieldset className="space-y-3 rounded-md border border-border bg-background/60 p-4">
      <legend className="px-1 text-sm font-semibold text-foreground">Technical skills</legend>
      <p className="text-xs text-muted-foreground">
        Pick from your technical skills. The selected skills become this project&apos;s public tech stack.
      </p>

      {/* Submit the current selection (ordered) to the server action. */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="skillIds" value={id} />
      ))}

      {/* Selected skills as removable chips. */}
      <div className="space-y-1.5">
        <span className={labelClass}>Selected</span>
        {selectedIds.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            No skills selected yet.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {selectedIds.map((id) => {
              const skill = byId.get(id)
              if (!skill) return null
              return (
                <li key={id}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-3 py-1.5 text-sm text-primary">
                    <SkillIcon name={skill.name} icon={skill.icon} imageUrl={skill.imageUrl} className="text-primary" size={14} />
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => remove(id)}
                      aria-label={`Remove ${skill.name}`}
                      className="ml-0.5 rounded-full p-0.5 text-primary/70 transition-colors hover:bg-primary/20 hover:text-primary"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Search + add from existing technical skills. */}
      <div className="space-y-1.5">
        <label htmlFor="skill-search" className={labelClass}>
          Add existing skill
        </label>
        <input
          id="skill-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search technical skills…"
          className={field}
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {available.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {pool.length === 0
                ? 'No technical skills yet. Create one below.'
                : query.trim()
                  ? 'No matching skills. Create one below.'
                  : 'All technical skills are selected.'}
            </p>
          ) : (
            available.slice(0, 30).map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => add(skill.id)}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <SkillIcon name={skill.name} icon={skill.icon} imageUrl={skill.imageUrl} className="text-primary" size={14} />
                {skill.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Inline create a new technical skill. */}
      <div className="space-y-1.5 rounded-md border border-border bg-card p-3">
        <label htmlFor="new-skill-name" className={labelClass}>
          Add new skill
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="new-skill-name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreate()
              }
            }}
            placeholder="e.g. GraphQL"
            maxLength={120}
            className={field}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={isPending || !newName.trim()}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Plus size={16} aria-hidden="true" />
            {isPending ? 'Adding…' : 'Add new skill'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Creates a published technical skill, attaches it here, and adds it to the Skills page.
        </p>
        {createError && (
          <p role="alert" className="text-xs text-destructive">
            {createError}
          </p>
        )}
      </div>
    </fieldset>
  )
}
