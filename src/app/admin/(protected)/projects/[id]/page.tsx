import { notFound } from 'next/navigation'
import ProjectForm, { type ProjectFormDefaults } from '../ProjectForm'
import { updateProjectAction } from '@/features/content/projects.actions'
import { getAdminProject, listTechnicalSkillOptions } from '@/features/content/projects.queries'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, technicalSkills] = await Promise.all([
    getAdminProject(id),
    listTechnicalSkillOptions(),
  ])
  if (!project) notFound()

  const tr = (loc: string) => project.project_translations.find((t) => t.locale === loc)
  const skillIds = [...project.project_skills]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => link.skill_id)

  const defaultValues: ProjectFormDefaults = {
    slug: project.slug,
    status: project.status,
    featured: project.featured,
    sortOrder: project.sort_order,
    skillIds,
    repoUrl: project.repo_url ?? '',
    demoUrl: project.demo_url ?? '',
    coverImageUrl: project.cover_image_url ?? '',
    startedAt: project.started_at ?? '',
    translations: {
      fr: { title: tr('fr')?.title ?? '', description: tr('fr')?.description ?? '' },
      en: { title: tr('en')?.title ?? '', description: tr('en')?.description ?? '' },
      ar: { title: tr('ar')?.title ?? '', description: tr('ar')?.description ?? '' },
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit project</h1>
        <p className="text-sm text-muted-foreground">{project.slug}</p>
      </div>
      <ProjectForm
        action={updateProjectAction.bind(null, id)}
        submitLabel="Save changes"
        technicalSkills={technicalSkills}
        defaultValues={defaultValues}
      />
    </div>
  )
}
