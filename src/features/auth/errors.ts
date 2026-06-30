// Safe, generic auth messages. We never surface raw Supabase/provider errors to
// the client (they can leak whether an account exists, internal states, etc.).

export type AuthErrorCode = 'invalid_credentials' | 'not_authorized' | 'unknown'

const MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: 'Invalid email or password.',
  not_authorized: 'This account is not authorized to access the dashboard.',
  unknown: 'Something went wrong. Please try again.',
}

export function toSafeAuthMessage(code: AuthErrorCode): string {
  return MESSAGES[code]
}
