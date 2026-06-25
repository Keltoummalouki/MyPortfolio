import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { LEAD_STATUSES, type LeadStatus } from './schema'

export type FreelanceLead = Database['public']['Tables']['freelance_leads']['Row']

// All lead reads run under the admin's RLS context (RLS restricts these tables
// to administrators; anonymous visitors can never read leads).

export async function listLeads(status?: LeadStatus): Promise<FreelanceLead[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from('freelance_leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getLead(id: string): Promise<FreelanceLead | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('freelance_leads')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getLeadStatusCounts(): Promise<Record<LeadStatus, number>> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('freelance_leads').select('status')
  if (error) throw error

  const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>
  for (const row of data ?? []) {
    const status = row.status as LeadStatus
    if (status in counts) counts[status] += 1
  }
  return counts
}
