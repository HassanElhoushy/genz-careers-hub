# GenZ Recruitment Web App

A premium, minimal three-page recruitment site for GenZ (Egyptian streetwear brand), built on the project's TanStack Start + Tailwind v4 + shadcn stack. Applications persist in `localStorage` — no backend needed.

## Brand system

Add to `src/styles.css` (@theme tokens + :root values, oklch):
- `--primary` Deep Forest Green `#0B5A36`
- `--background` White, `--foreground` Charcoal `#1A1A1A`
- `--muted` Light Gray `#F5F5F5`
- `--accent` Emerald (success)
- Radius `14px`, soft shadows, Inter via `<link>` in `__root.tsx` head
- Dark mode variant with charcoal background, green primary

Logo: upload the provided GenZ logo via `lovable-assets` and import as `@/assets/genz-logo.png.asset.json`. Used in navbar + footer.

## Routes (TanStack file-based)

```
src/routes/
  __root.tsx          -> global head (Inter font link), providers, Sonner Toaster
  index.tsx           -> Landing
  apply.tsx           -> Application form
  dashboard.tsx       -> Applications table
```

Each route defines its own `head()` with unique title/description/og tags.

Shared nav/footer in a layout component rendered inside each route (or in `__root.tsx` around `<Outlet />`). Sticky navbar with logo + Home / Apply / Dashboard links (active state via `activeProps`), dark-mode toggle.

## 1. Landing (`/`)

- Hero: large bold headline "Join the GenZ Team", subtitle, two CTAs (Apply Now → `/apply`, View Dashboard → `/dashboard`). Subtle abstract green shapes (SVG blobs, low opacity) in background — no stock illustrations.
- "Why Join Us": 3 cards (Creative Culture, Career Growth, Premium Fashion Brand) with Lucide icons (Sparkles, TrendingUp, Crown).
- "Our Values": 4 responsive cards (Innovation, Teamwork, Customer Experience, Excellence).
- Footer: logo, quick links, social icons (Instagram, Facebook, TikTok), contact email, copyright. Charcoal background.
- Framer Motion fade/slide-up on scroll for sections.

## 2. Apply (`/apply`)

Centered card, glassmorphism border. React Hook Form + Zod schema:
- `name` — required, min 2
- `email` — email format
- `phone` — Egyptian format regex (`^(\+20|0)?1[0-2,5]\d{8}$`)
- `password` — min 8, upper + lower + digit
- `birthday` — date picker (shadcn Calendar in Popover), must be past date, age ≥ 16

Floating labels via peer/placeholder-shown Tailwind pattern. Submit button shows spinner while "saving", writes record to `localStorage` key `genz_applications` (array of records with `id` + `submittedAt`), then Sonner success toast + reset form + optional confetti-free success animation (Framer Motion checkmark).

## 3. Dashboard (`/dashboard`)

Reads `localStorage`. Renders:
- Search input (filters name/email/phone)
- Sort dropdown (Name, Submission Date, Birthday — asc/desc)
- Responsive display: shadcn Table on md+, stacked cards on mobile
- Pagination (10 per page)
- Delete row (confirm dialog, updates localStorage + state)
- Empty state: minimal illustration (inline SVG) + "No applications yet" + CTA to `/apply`
- Skeleton loading on mount (brief, since localStorage is sync — use short delay for polish)

State via a small Zustand store `useApplicationsStore` that hydrates from localStorage and persists on change.

## Shared components (`src/components/`)

- `Navbar.tsx`, `Footer.tsx`, `Logo.tsx`
- `ThemeToggle.tsx` (class-based dark mode on `<html>`, persisted)
- `SectionHeading.tsx`, `FeatureCard.tsx`, `ValueCard.tsx`
- `FloatingInput.tsx`, `DatePickerField.tsx`
- `ApplicationsTable.tsx`, `ApplicationCard.tsx`, `EmptyState.tsx`

## Technical notes (for reference)

- Stack constraint: template uses **TanStack Router** (file-based `src/routes/`), not React Router DOM — I'll use `<Link>` from `@tanstack/react-router` instead. Everything else in the spec (RHF, Zod, Tailwind, shadcn, Lucide, Framer Motion, Zustand) is compatible.
- Install: `framer-motion`, `zustand`, `react-hook-form`, `@hookform/resolvers`, `zod`, `date-fns` (already may exist — will check).
- No backend / Lovable Cloud needed since persistence is localStorage per spec.
- SEO: per-route `head()` with unique title/description/og; semantic HTML, single H1 per page, alt text on logo.

## Out of scope (unless you want them)

- Real backend / auth
- Email sending on apply
- Admin-only gate on `/dashboard` (spec says dashboard is public and reads localStorage)

Approve and I'll build it end-to-end.