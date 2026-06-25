import { redirect } from 'next/navigation'

// /admin entry point. The dashboard guard handles auth from there (sending
// anonymous users to /admin/login).
export default function AdminIndexPage() {
  redirect('/admin/dashboard')
}
