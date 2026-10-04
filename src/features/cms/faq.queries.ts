import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Locale } from '@/lib/validation/locale'
import { mapPublicFaq, type FaqItemRow, type PublicFaqItem } from './faq'

/**
 * Published FAQ items for the public site ([] on any failure, so the home page
 * falls back to the default questions from messages/*.json).
 */
export async function getPublishedFaq(locale: Locale): Promise<PublicFaqItem[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .eq('status', 'published')
      .order('sort_order')
    if (error) throw error
    return mapPublicFaq(data ?? [], locale)
  } catch (error) {
    console.error('faq: loading published items failed:', error instanceof Error ? error.message : error)
    return []
  }
}

/** Every FAQ item for the admin editor (admin RLS context). */
export async function getAdminFaqItems(): Promise<{ items: FaqItemRow[]; error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('faq_items').select('*').order('sort_order')
  return { items: data ?? [], error: error ? error.message : null }
}
