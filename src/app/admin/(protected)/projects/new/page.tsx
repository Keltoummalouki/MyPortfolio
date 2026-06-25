import ProjectForm from '../ProjectForm'
import { createProjectAction } from '@/features/content/projects.actions'

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New project</h1>
        <p className="text-sm text-muted-foreground">Create a project and add its translations.</p>
      </div>
      <ProjectForm action={createProjectAction} submitLabel="Create project" />
    </div>
  )
}
