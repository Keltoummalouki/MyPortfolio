import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { MESSAGE_STATUSES, type MessageStatus } from './schema'

export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']

// All inbox reads run under the admin's RLS context (RLS restricts these tables
// to administrators; anonymous visitors can never read messages).

export async function listMessages(status?: MessageStatus): Promise<ContactMessage[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getMessage(id: string): Promise<ContactMessage | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getStatusCounts(): Promise<Record<MessageStatus, number>> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('contact_messages').select('status')
  if (error) throw error

  const counts = Object.fromEntries(MESSAGE_STATUSES.map((s) => [s, 0])) as Record<
    MessageStatus,
    number
  >
  for (const row of data ?? []) {
    const status = row.status as MessageStatus
    if (status in counts) counts[status] += 1
  }
  return counts
}
