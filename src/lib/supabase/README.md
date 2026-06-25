# `src/lib/supabase`

Three Supabase clients, separated by trust boundary. Implementations land in **M3-T1**.

| File | Bundle | Key used | Import from |
| --- | --- | --- | --- |
| `client.ts` | browser + server | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anywhere (incl. Client Components) |
| `server.ts` | server only (`server-only`) | anon key + request cookies | Server Components / Actions / Route Handlers |
| `admin.ts` | server only (`server-only`) | `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) | server, only where strictly necessary |

Rules:

- The `server-only` import in `server.ts` and `admin.ts` turns any accidental import from a Client Component into a build error.
- The service-role key never appears in the browser bundle.
- RLS — not these clients — is the real authorization boundary (see M2).
- UI components call typed functions in `src/features/*`; they never build raw queries inline.
