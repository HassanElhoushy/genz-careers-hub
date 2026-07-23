## Goal

Fix two gaps in the Admin Dashboard applications list:
1. Email column is empty for every row.
2. Portfolio / professional link column is missing entirely.

## 1. Why email is empty today

`useAllApplications` (in `src/hooks/use-applications.ts`) fetches from `applications` + `profiles`, then passes `""` as email because `auth.users` isn't queryable from the browser. It even has a comment saying a server function "could join auth.users" — that's exactly what we need to do now.

## 2. Fix — fetch emails via an admin-guarded server function

Create `src/lib/admin-applications.functions.ts`:
- `createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(...)`.
- Inside the handler: verify caller is admin using `context.supabase` (`has_role(auth.uid(), 'admin')`) — must NOT trust `supabaseAdmin` for authorization.
- If admin, dynamically `await import("@/integrations/supabase/client.server")` and call `supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })`.
- Return a map `{ [userId]: email }`.

Rewire `useAllApplications` to also call this server function (via `useServerFn`) and merge the email map into the returned `Application[]`. Keep the existing applications+profiles queries as-is; just fill `email` from the map instead of `""`.

## 3. Fix — add Portfolio column

`portfolio_url` is already selected on `applications` and mapped to `portfolioUrl` in `toApplication`. Just render it in the admin UI:

- Desktop table (`src/routes/admin.tsx`): add a `Portfolio` column between Phone and Submitted. Render as a clickable `<a target="_blank" rel="noopener noreferrer">` showing "View" (or a link icon) when present, `—` when missing.
- Mobile card: add a small "Portfolio" link row under the position line when `portfolioUrl` is set.

No schema changes, no changes to the applicant-side flow.

## Files touched

- New: `src/lib/admin-applications.functions.ts`
- Edit: `src/hooks/use-applications.ts` (merge emails from server fn into `useAllApplications`)
- Edit: `src/routes/admin.tsx` (add Portfolio column + mobile link)

## Out of scope

Any other admin panel changes, exports, or new filters.
