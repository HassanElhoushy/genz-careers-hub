
## Goal

Migrate auth + application storage from localStorage to Lovable Cloud (Supabase Auth + Postgres). Keep every route, form, and UI intact. Passwords stay in `auth.users` only. Applicant portfolio link is renamed to `portfolio_url`. Admin is a real role, seeded for `admin@genz-s.com` — no hardcoded credentials remain in the frontend.

## Database (single migration)

**Enum**
- `app_role`: `admin`, `applicant`.

**Tables (all in `public`, all with `id`, `created_at`, `updated_at` where noted)**

1. `profiles`
   - `id uuid PK` → `auth.users(id) ON DELETE CASCADE`
   - `name text`, `phone text`, `birthday date`, `portfolio_url text`
   - Auto-created by trigger on signup from `raw_user_meta_data`.
2. `applications`
   - `id uuid PK default gen_random_uuid()`
   - `user_id uuid NOT NULL UNIQUE` → `auth.users(id) ON DELETE CASCADE`
   - `position text NOT NULL`
   - `status text NOT NULL default 'pending' CHECK IN ('pending','accepted','rejected')`
   - `portfolio_url text`
   - `interview_date date`, `interview_time text`, `interview_location text`, `interview_location_url text`, `interview_notes text`
   - `rejection_reason text`
   - `submitted_at timestamptz default now()`, `updated_at timestamptz default now()`
3. `user_roles`
   - `id uuid PK`, `user_id uuid NOT NULL` → `auth.users`, `role app_role NOT NULL`, `UNIQUE (user_id, role)`
   - Roles live in a separate table (never on `profiles`) to prevent privilege escalation.

**No password column anywhere.** Supabase Auth owns credentials.

### Role check (simplest secure approach)

Per the project's user-roles rules, a `SECURITY DEFINER` `has_role(_user_id, _role)` function is required — it's the standard way to check roles inside RLS policies without hitting infinite recursion on `user_roles`. That's the "simplest secure" pattern here; anything simpler either recurses or leaks. One tiny function, used everywhere.

```sql
create function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
```

### Triggers

- `handle_new_user()` on `auth.users` AFTER INSERT:
  - Insert into `profiles` using `raw_user_meta_data` (name, phone, birthday, portfolio_url).
  - Insert into `user_roles`: `admin` if `NEW.email = 'admin@genz-s.com'`, else `applicant`.
- `update_updated_at_column()` BEFORE UPDATE on `profiles` and `applications`.

### RLS policies

Enable RLS on all three tables.

- **profiles**
  - `select`: `auth.uid() = id` OR `has_role(auth.uid(),'admin')` — users read own, admin reads all.
  - `update`: `auth.uid() = id` OR admin.
  - No insert policy (trigger handles it); no delete policy (cascade via auth.users).
- **applications**
  - `select`: `auth.uid() = user_id` OR admin.
  - `insert`: `auth.uid() = user_id` — applicant creates their own row.
  - `update`: `auth.uid() = user_id` (applicants edit their own submission fields) OR admin (status/interview/rejection).
  - `delete`: admin only.
- **user_roles**
  - `select`: `auth.uid() = user_id` OR admin — a user can read their own role for redirect logic.
  - `insert/update/delete`: admin only. Trigger runs as definer, so seeding works without a policy.

### GRANTs (required)

For each table: `GRANT SELECT, INSERT, UPDATE, DELETE ON public.<t> TO authenticated; GRANT ALL ON public.<t> TO service_role;`. No `anon` grants — everything is authed.

### Admin seeding

The trigger auto-assigns `admin` when someone signs up with `admin@genz-s.com`. To guarantee the account exists, the migration also creates the admin user via `auth.admin_create_user` equivalent using Supabase's `auth.users` insert isn't allowed directly — instead the plan is: after the migration runs, sign the admin up **once** through the normal Apply form with `admin@genz-s.com` + a chosen password; the trigger assigns the admin role automatically. (Told to user in the post-migration explanation.) No hardcoded admin bypass remains in the frontend.

## Auth configuration

- Enable email/password. Disable anonymous signups.
- Enable `auto_confirm_email` to preserve the current "apply → immediately sign in" UX (no verification email in demo).

## Frontend changes

**Deleted / obsolete**
- Password checks against a custom column.
- The `admin@genz-s.com` + `admin` hardcoded branch in `signin.tsx`.
- The `Application.password` field.

**Rewrites (same public API where possible so routes barely change)**

- `src/types/application.ts`: replace `linkedinUrl` with `portfolioUrl`; drop `password`.
- `src/hooks/use-session.ts`: wrap Supabase Auth. Exposes `{ session, user, role, loading, signOut }`. Role fetched from `user_roles` after auth events.
- `src/hooks/use-applications.ts`: rewrite as react-query-backed data layer over `supabase.from('applications')`:
  - `useMyApplication()` — current user's row.
  - `useAllApplications()` — admin list.
  - `createApplication`, `updateApplication`, `deleteApplication` mutations.
- `src/routes/__root.tsx`: single `supabase.auth.onAuthStateChange` subscriber → refresh session/role, invalidate queries.
- `src/routes/apply.tsx`:
  - `supabase.auth.signUp({ email, password, options: { data: { name, phone, birthday, portfolio_url } } })`.
  - After signup, insert `applications` row (RLS = `auth.uid()`), then navigate to `/signin`.
  - Duplicate email → toast + link to signin.
- `src/routes/signin.tsx`: `supabase.auth.signInWithPassword`. Redirect based on role from `user_roles`; no email hardcoding.
- `src/routes/my-application.tsx`: uses `useMyApplication`; shows portfolio link as "🔗 View your portfolio".
- `src/routes/admin.tsx`: gated by `role === 'admin'` (redirect otherwise). All mutations via supabase. Field rename to `portfolio_url` reflected in the dialog.
- `src/components/Navbar.tsx` / `Footer.tsx`: read from new session hook; sign-out via `supabase.auth.signOut()`.

TanStack server functions are not needed — the browser Supabase client + RLS covers every read/write, matching the current client-only architecture.

## Not migrated

Existing `localStorage` applications are demo data with plain-text passwords; they can't be migrated safely. Users re-apply. Old keys are ignored.

## Deliverable: architecture write-up (after migration)

Once the migration is in and the app compiles, a detailed explanation covers each of the 11 requested topics:
1. Every table and its purpose.
2. Every FK/relationship.
3. Every trigger and what it does.
4. Every RLS policy and its rationale.
5. Every modified file.
6. Every new file.
7. Full authentication flow (signup → trigger → session).
8. Full authorization flow (`has_role` → RLS decisions).
9. How applicants are restricted to their own data.
10. How admins manage all applications.
11. Extension guide (adding fields, new roles, new tables, storage, edge functions).

## Out of scope

- Design changes, password reset UI, email verification UI, storage/edge functions, server functions.
