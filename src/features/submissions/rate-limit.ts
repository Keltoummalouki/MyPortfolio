import 'server-only'

import { createHmac } from 'node:crypto'
import { headers } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export type PublicSubmissionKind = 'contact_message' | 'freelance_lead'

export type SubmissionGateResult =
  | { ok: true; shouldMarkSpam: boolean; ipHash: string }
  | { ok: false; error: 'rate_limited' | 'server' }

const UNKNOWN_IP = 'unknown'
const IP_HEADER_NAMES = [
  'cf-connecting-ip',
  'true-client-ip',
  'x-real-ip',
  'x-client-ip',
  'fastly-client-ip',
] as const

function normalizeIp(value: string | null): string | null {
  if (!value) return null

  const first = value.split(',')[0]?.trim()
  if (!first || first.toLowerCase() === 'unknown') return null

  if (first.startsWith('[')) {
    const end = first.indexOf(']')
    return end > 1 ? first.slice(1, end) : null
  }

  const withoutPort = first.replace(/^::ffff:/i, '')
  const ipv4WithPort = withoutPort.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/)
  return (ipv4WithPort?.[1] ?? withoutPort).slice(0, 128)
}

function hashIp(ip: string): string {
  const secret =
    process.env.IP_HASH_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'local-development-ip-hash-secret'

  return createHmac('sha256', secret).update(ip).digest('hex')
}

async function getRequestIp(): Promise<string> {
  const headerStore = await headers()

  for (const header of IP_HEADER_NAMES) {
    const ip = normalizeIp(headerStore.get(header))
    if (ip) return ip
  }

  return normalizeIp(headerStore.get('x-forwarded-for')) ?? UNKNOWN_IP
}

export async function reservePublicSubmission(
  kind: PublicSubmissionKind,
): Promise<SubmissionGateResult> {
  const ipHash = hashIp(await getRequestIp())

  try {
    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase.rpc('reserve_public_submission', {
      p_ip_hash: ipHash,
      p_submission_kind: kind,
    })

    if (error) {
      console.error('submission rate-limit check failed:', error.message)
      return { ok: false, error: 'server' }
    }

    const decision = data?.[0]
    if (!decision) return { ok: false, error: 'server' }
    if (!decision.allowed) return { ok: false, error: 'rate_limited' }

    return {
      ok: true,
      shouldMarkSpam: decision.should_spam,
      ipHash,
    }
  } catch (error) {
    console.error(
      'submission rate-limit check failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
    return { ok: false, error: 'server' }
  }
}
