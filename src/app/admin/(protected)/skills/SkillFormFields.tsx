'use client'

import { useState } from 'react'
import { AdminSelectField } from '@/components/admin/AdminFormControls'
import FileUploadField from '@/components/admin/FileUploadField'
import SkillIcon from '@/components/ui/SkillIcon'
import { CMS_STATUSES, SKILL_TYPES, type SkillType } from '@/features/cms/schema'

const fieldClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
const labelClass = 'text-sm font-medium text-foreground'

export interface SkillCategoryOption {
  id: string
  label: string
}

export interface SkillFieldsValues {
  skillType: SkillType
  name: string
  categoryId: string
  icon: string
  imageUrl: string
  level: string
  sortOrder: number
  status: string
}

const TYPE_LABELS: Record<SkillType, string> = {
  technical: 'Technical skill',
  soft: 'Soft skill',
}

function FormField({
  id,
  label,
  name,
  defaultValue,
  type = 'text',
  placeholder,
  required,
  min,
  max,
  help,
}: {
  id: string
  label: string
  name: string
  defaultValue?: string | number | null
  type?: string
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  help?: string
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        min={min}
        max={max}
        required={required}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className={fieldClass}
      />
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  )
}

export default function SkillFormFields({
  idPrefix,
  categories,
  values,
}: {
  idPrefix: string
  categories: SkillCategoryOption[]
  values?: Partial<SkillFieldsValues>
}) {
  const [skillType, setSkillType] = useState<SkillType>(values?.skillType ?? 'technical')
  const isTechnical = skillType === 'technical'
  const previewName = values?.name || (isTechnical ? 'Next.js' : 'Teamwork')
  const previewIcon = values?.icon || (isTechnical ? previewName : 'handshake')
  const skillTypeOptions = SKILL_TYPES.map((type) => ({
    value: type,
    label: TYPE_LABELS[type],
    description: type === 'technical' ? 'Category + logo/image' : 'Standalone personal skill',
  }))
  const categoryOptions = [
    { value: '', label: 'No category', description: 'Keep this skill outside a technical group' },
    ...categories.map((category) => ({ value: category.id, label: category.label })),
  ]
  const statusOptions = CMS_STATUSES.map((status) => ({
    value: status,
    label: status === 'published' ? 'Published' : status === 'draft' ? 'Draft' : 'Archived',
  }))

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr_1fr]">
        <AdminSelectField
          id={`${idPrefix}-type`}
          label="Skill family"
          name="skillType"
          options={skillTypeOptions}
          value={skillType}
          onValueChange={(next) => setSkillType(next as SkillType)}
          help="Technical skills use categories and logos. Soft skills are standalone."
        />

        <FormField
          id={`${idPrefix}-name`}
          label="Skill name"
          name="name"
          required
          defaultValue={values?.name}
          placeholder={isTechnical ? 'Next.js' : 'Teamwork'}
        />

        <FormField
          id={`${idPrefix}-icon`}
          label="Icon key"
          name="icon"
          defaultValue={values?.icon}
          placeholder={isTechnical ? 'Next.js' : 'handshake'}
          help={isTechnical ? 'Use a tech name like React, Next.js, Docker.' : 'Use clock, rotate, handshake, sparkles, target, users, lightbulb.'}
        />
      </div>

      <div className="rounded-2xl border border-border bg-background/70 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
            <SkillIcon name={previewName} icon={previewIcon} imageUrl={values?.imageUrl} className="text-primary" size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isTechnical ? 'Technical skill settings' : 'Soft skill settings'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isTechnical
                ? 'Category and logo upload are enabled for technical skills.'
                : 'Soft skills keep the form simple: name, icon key, order, and visibility.'}
            </p>
          </div>
        </div>
      </div>

      {isTechnical && (
        <div className="grid gap-4 lg:grid-cols-[1fr_140px]">
          <AdminSelectField
            id={`${idPrefix}-category`}
            label="Category"
            name="categoryId"
            options={categoryOptions}
            defaultValue={values?.categoryId ?? ''}
          />

          <FormField
            id={`${idPrefix}-level`}
            label="Level (0–5)"
            name="level"
            type="number"
            min={0}
            max={5}
            defaultValue={values?.level}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          id={`${idPrefix}-order`}
          label="Sort order"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={values?.sortOrder ?? 0}
        />
        <AdminSelectField
          id={`${idPrefix}-status`}
          label="Visibility"
          name="status"
          options={statusOptions}
          defaultValue={values?.status ?? 'published'}
        />
      </div>

      {isTechnical && (
        <>
          <input type="hidden" name="imageUrl" value={values?.imageUrl ?? ''} />
          <FileUploadField
            label="Upload skill image/logo"
            name="imageFile"
            buttonLabel="Upload logo"
            help="Optional for technical skills only. Upload a JPG, PNG, or WebP logo up to 5 MB."
          />
        </>
      )}
    </div>
  )
}
