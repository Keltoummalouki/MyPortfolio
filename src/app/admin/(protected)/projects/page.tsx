import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { listAdminProjects } from '@/features/content/projects.queries'
import ProjectsTable, { type ProjectRowVM } from './ProjectsTable'

export default async function AdminProjectsPage() {
  const projects = await listAdminProjects()

  const rows: ProjectRowVM[] = projects.map((p) => {
    const hasLocale = (loc: string) =>
      p.project_translations.some((t) => t.locale === loc && t.title)
    const frTitle = p.project_translations.find((t) => t.locale === 'fr')?.title
    const anyTitle = p.project_translations[0]?.title

    return {
      id: p.id,
      slug: p.slug,
      title: frTitle || anyTitle || '',
      status: p.status,
      featured: p.featured,
      sortOrder: p.sort_order,
      techCount: p.tech_stack.length,
      locales: { fr: hasLocale('fr'), en: hasLocale('en'), ar: hasLocale('ar') },
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your portfolio projects and their translations.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">New project</Link>
        </Button>
      </div>

      <ProjectsTable projects={rows} />
    </div>
  )
}
