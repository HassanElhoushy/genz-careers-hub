
## Auth & Recruitment Flow

Simulated auth using localStorage (no backend). Applicants register through the Apply form; admin is a hardcoded `admin` / `admin` account.

### Data model (localStorage)

- `genz_applications` (extend existing `Application`):
  - `position: string`
  - `password: string` (plain — simulated only)
  - `status: "pending" | "accepted" | "rejected"` (default `"pending"`)
  - `interview?: { date: string; time: string; location: string; notes?: string }`
  - `rejectionReason?: string`
- `genz_session` — `{ role: "admin" | "applicant"; email: string } | null`

Positions constant (`src/lib/positions.ts`): Web Developer, AI Engineer, Graphic Designer, Video Editor, Content Creator, Social Media Specialist, Digital Marketing Specialist, Fashion Designer, Sales Associate, Store Manager, Customer Support, HR Specialist, Operations Coordinator.

### Routes

- `src/routes/index.tsx` — swap "Dashboard" CTAs for "Sign In".
- `src/routes/apply.tsx` — add searchable **Position** field (Command/Combobox from shadcn), store `position` + `password` + default `status: "pending"`. Prevent duplicate email (toast + focus). On success → `navigate("/signin")` with toast "Account created — sign in".
- `src/routes/signin.tsx` (new) — email + password form. If `admin`/`admin` → session `role=admin`, navigate `/admin`. Else look up applicant by email+password → session `role=applicant`, navigate `/my-application`.
- `src/routes/my-application.tsx` (new) — guard: applicant session only. Show own application card with status badge:
  - pending → friendly "under review" message
  - accepted → interview date/time/location + optional notes
  - rejected → rejection reason
  - Sign out button.
- `src/routes/admin.tsx` (new, replaces `/dashboard`) — guard: admin session only. Table with: search (name/email/phone), position filter, status filter, actions per row:
  - Change status (select)
  - "Schedule interview" dialog (date/time/location/notes) — enabled when status = accepted
  - "Rejection reason" dialog — enabled when status = rejected
  - Delete (existing confirm dialog)
  - Sign out button in header.
- Delete `src/routes/dashboard.tsx` (or redirect to `/signin`).

### Shared pieces

- `src/hooks/use-session.ts` — `useSyncExternalStore` mirror of `use-applications` pattern; `signIn`, `signOut`, `session`.
- Extend `src/hooks/use-applications.ts`:
  - `add` accepts new fields, returns app; enforce unique email.
  - `update(id, patch)` for status / interview / rejectionReason.
  - `findByCredentials(email, password)`.
- `src/components/Navbar.tsx` — links: Home, Apply Now, Sign In. When signed in, replace "Sign In" with role-specific link (My Application / Admin) + Sign Out. No public Dashboard link.

### Guards

Client-side redirects inside route components using `useEffect` + `navigate` (matches existing SPA style — no server auth needed). Unauthorized applicant hitting `/admin` → `/signin`; unauthorized visitor hitting `/my-application` → `/signin`.

### Notes

- Passwords stored in plain localStorage — this is a demo flow, not real security; I'll add a short comment noting that.
- All new routes get their own `head()` metadata (title, description, og:*).
- Keep existing green brand system, floating labels, Framer Motion polish, skeletons, toasts.
