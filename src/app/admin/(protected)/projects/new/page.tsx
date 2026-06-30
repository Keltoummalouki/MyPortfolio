import ProjectForm from '../ProjectForm'
import { createProjectAction } from '@/features/content/projects.actions'
import { listTechnicalSkillOptions } from '@/features/content/projects.queries'

export default async function NewProjectPage() {
  const technicalSkills = await listTechnicalSkillOptions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New project</h1>
        <p className="text-sm text-muted-foreground">Create a project and add its translations.</p>
      </div>
      <ProjectForm
        action={createProjectAction}
        submitLabel="Create project"
        technicalSkills={technicalSkills}
      />
    </div>
  )
}
