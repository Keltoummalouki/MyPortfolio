// Auth feature public API (server-side). UI imports typed functions from here,
// never raw Supabase queries.
//
// NOTE: Client Components must import server actions DIRECTLY from
// `./actions` (a `use server` module), not from this barrel — this barrel also
// re-exports `./session`, which is `server-only` and cannot enter a client
// bundle.
export { getAdminSession, requireAdmin, type AdminSession } from './session'
export { signInAction, signOutAction, type SignInState } from './actions'
