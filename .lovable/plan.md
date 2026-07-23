## Why emails vanish on Vercel

Emails live in `auth.users`, which the browser can't read. Locally we work around that with a server function (`getApplicantEmails`) that uses the admin service-role key to call `auth.admin.listUsers`.

On Vercel the same server function runs, but the required server env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) aren't set there, so the function throws and the client falls back to `""` — every Email cell renders as `—`. The service-role key for Lovable Cloud isn't retrievable, so we can't simply "paste it into Vercel".

## Fix: put email on `profiles` and read it like any other column

1. **Migration**
   - Add `email text` column to `public.profiles`.
   - Update `handle_new_user()` trigger to also insert `new.email` into `profiles.email` on signup.
   - Backfill: `update public.profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;`
   - No RLS change needed — existing profile policies already gate access (own row or admin).

2. **Frontend**
   - `src/hooks/use-applications.ts`: select `email` from `profiles` in both `useMyApplication` and `useAllApplications`, and use `profile.email` in `toApplication` instead of calling `getApplicantEmails` / `supabase.auth.getUser().email`. Remove the `Promise.all` email-map merge.
   - Delete `src/lib/admin-applications.functions.ts` (no longer needed).

3. **Result**
   - Emails render on Vercel, preview, and localhost with no server-only secret required.
   - No UI changes — same Email column and mobile card line.

## Out of scope

Any other admin/dashboard changes; keeping the admin server function around "just in case".
