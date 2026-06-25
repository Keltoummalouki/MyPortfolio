import type { Metadata } from 'next'

// Applies to every /admin route (login + protected). The dashboard must never
// be indexed; full SEO exclusion (sitemap/robots) is completed in M4-T2.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
