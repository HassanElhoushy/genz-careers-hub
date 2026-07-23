## Goal

Drop the password-reset flow, wipe and reseed `admin@genz-s.com` with password `admin`, and relax the sign-in password minimum for that one email.

## 1. Remove password reset flow

- Delete `src/routes/forgot-password.tsx` and `src/routes/reset-password.tsx`.
- In `src/routes/signin.tsx`, remove the "Forgot password?" link block (the `<div className="flex justify-end -mt-2">…</div>`).
- `src/routeTree.gen.ts` regenerates automatically from the file-based router — no manual edit.

## 2. Reseed the admin user

Supabase Auth users can't be created from a SQL migration (the `auth` schema is managed and password hashing lives in GoTrue). I'll do it via a one-off TanStack server function that uses `supabaseAdmin`:

- Look up any existing user with email `admin@genz-s.com` via `auth.admin.listUsers` and delete it with `auth.admin.deleteUser` (cascades to `profiles`, `user_roles`, `applications` via FK).
- Recreate with `auth.admin.createUser({ email: 'admin@genz-s.com', password: 'admin', email_confirm: true })`.
- The existing `handle_new_user` trigger will insert the `profiles` row and grant the `admin` role automatically (it already special-cases this email).
- I'll invoke the function once from the sandbox to perform the reseed, then leave the file in place (harmless, admin-guarded) or delete it — your call. Default: delete after use so it isn't a live endpoint.

Note: Supabase's default password policy requires min 6 chars. `admin` is 5. I'll relax the project's password minimum to 5 via `supabase--configure_auth` so the Admin API accepts it (and so subsequent sign-in works). This is a project-wide change — every user could then pick a 5-char password. Confirm you're OK with that; otherwise the only alternative is to use a 6+ char admin password.

## 3. Client-side validation exception

In `src/routes/signin.tsx`, replace the flat Zod schema with a `superRefine` (or a discriminated check) so:
- If `email === 'admin@genz-s.com'` → password must be ≥ 5 chars.
- Otherwise → password must be ≥ 6 chars.

Apply-form signup schema is left alone (new users still need 6+).

## Files touched

- Delete: `src/routes/forgot-password.tsx`, `src/routes/reset-password.tsx`
- Edit: `src/routes/signin.tsx` (remove link, adjust schema)
- New (temporary): `src/lib/seed-admin.functions.ts` — server fn using `supabaseAdmin` to delete+recreate the admin user; invoked once, then removed
- Config: lower auth `minimum_password_length` to 5

## Out of scope

Any other auth, admin panel, or applicant flow changes.

## Question before I build

Are you OK lowering the project-wide password minimum to 5 characters so `admin`/`admin` works? If not, I'll keep the min at 6 and reseed the admin with a 6-char password of your choice instead.
