## Deployment to Vercel — Required environment variables

Set these environment variables in the Vercel project dashboard (do NOT commit them to the repo):

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase instance URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon (public) key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only)
- `LEADSHIELD_SYNC_TOKEN` — Shared sync token used by the LeadShield app
- `NEXT_PUBLIC_SITE_URL` — Public site URL (e.g. https://your-crm.vercel.app)
- `RESEND_API_KEY` — Resend API key (for transactional emails)
- `MASTER_ADMIN_TOKEN` — Token used to access admin stats endpoint

Notes and recommendations:

- Remove any committed `.env*` files from the repository and rotate keys immediately if they were committed (they were present previously). Use `git rm --cached .env.local` and commit, then rotate keys in Supabase/Resend.
- Keep `SUPABASE_SERVICE_ROLE_KEY`, `MASTER_ADMIN_TOKEN`, and `LEADSHIELD_SYNC_TOKEN` as Vercel Environment Variables with the type "Encrypted" (do not expose to client).
- `NEXT_PUBLIC_*` variables are exposed to the browser; only put non-sensitive values there.

Vercel build settings (defaults are fine):

- Build Command: `npm run build`
- Output Directory: `.next`

Quick local test commands:

```
npm install
npm run build
npm run start    # serves production build on default port
```

Once env vars are set in Vercel, deploy the project. The LeadShield Android app (or other clients) should POST to `/api/sync` using the `LEADSHIELD_SYNC_TOKEN` as a Bearer token or `x-leadshield-sync-token` header.

If you want, I can:
- Remove other committed secrets from git history (needs caution),
- Add CI checks or a small deploy checklist,
- Run a local build and smoke test here.
