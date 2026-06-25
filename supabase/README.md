# Local Supabase

Local development database, auth, and storage, run via Docker through the Supabase CLI.
The CLI is invoked with `npx supabase` (no global install required). **Docker must be running.**

## Commands

| Task | Command |
| --- | --- |
| Start the local stack | `npx supabase start` |
| Stop the local stack | `npx supabase stop` (add `--no-backup` to also drop data) |
| Show local URLs & keys | `npx supabase status` |
| **Reset** DB from migrations + seed | `npx supabase db reset` |
| Create a new migration | `npx supabase migration new <name>` |
| Apply pending migrations | `npx supabase migration up` |
| Generate TypeScript types | `npm run db:types` |

`npm run db:types` runs:

```bash
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

## Local services (defaults)

| Service | URL |
| --- | --- |
| API gateway | http://127.0.0.1:54321 |
| Postgres | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| Studio (dashboard) | http://127.0.0.1:54323 |
| Inbucket (email testing) | http://127.0.0.1:54324 |

## Notes

- The local `anon` and `service_role` keys printed by `supabase start` are **well-known development keys** (same for every local install) — they are **not** production secrets. Real keys go in `.env.local` only (gitignored) and are never committed.
- `db reset` re-applies every migration in `migrations/` then runs `seed.sql`, so the local database must be fully reproducible from version-controlled files alone.
- Generated `src/lib/supabase/database.types.ts` is checked in and must be regenerated (`npm run db:types`) after every schema migration.
- RLS integration tests (M2-T7) run against this local stack, not against any production project.
