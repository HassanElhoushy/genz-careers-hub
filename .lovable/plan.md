
## Scope

Update the public homepage, navbar, and footer to match the new GenZ's careers brief. No changes to auth flow, apply form, applicant portal, admin panel, or routes.

## 1. Brand name

Global rename of user-facing "GenZ" → "GenZ's" in: `Navbar`, `Footer`, `index.tsx` (hero + all sections), `__root.tsx` head/meta titles, `apply.tsx`, `signin.tsx`, `my-application.tsx`, `admin.tsx` page titles/headings. Logo `alt` becomes "GenZ's". Do NOT rename storage keys, code identifiers, file names, asset filenames, or the `/genz-logo.jpg` path.

## 2. Navbar (`src/components/Navbar.tsx`)

Public (signed-out) desktop layout uses a 3-column grid so center nav is centered against the full navbar, not the remaining space:

```text
[logo]        [Home  About Us]        [Apply Now (solid)  Sign In (outline)]
```

- Links: Home → `/`, About Us → `/#about`, Apply Now → `/apply`, Sign In → `/signin`.
- Home behavior: if already on `/`, `scrollTo({ top: 0, behavior: 'smooth' })`; otherwise navigate to `/`.
- About Us behavior: if on `/`, smooth-scroll to `#about`; otherwise navigate to `/#about` and let root-level hash handler scroll after mount.
- Apply Now = existing primary solid button; Sign In = outline/ghost button.
- Mobile menu: same 4 items, Apply Now visually prominent; auto-close on selection (already wired).
- Authed navbar: unchanged (logo + theme toggle + Sign Out; no center link, per prior decision).

## 3. Root route (`src/routes/__root.tsx`)

Add a small hash-scroll effect: on route change / mount, if `location.hash` is present, scroll the target into view smoothly (respecting `prefers-reduced-motion`). Needed so `/#about` works from other pages.

Add CSS: `html { scroll-behavior: smooth; }` gated by `@media (prefers-reduced-motion: no-preference)` in `src/styles.css`, and `scroll-margin-top` on the About section to clear the sticky header.

## 4. Homepage (`src/routes/index.tsx`)

New section order: Hero → About Us → Why Join Us → Ready to Join CTA. Delete the "What We Stand For" (Values) section entirely, including its `Lightbulb/Users/Heart/Award` imports.

### Hero
- Eyebrow: "CAREERS AT GENZ'S"
- H1: "Shape the Future of Local Fashion"
- Copy: new supporting paragraph from spec.
- CTA: single "Apply Now" button → `/apply`. Remove Sign In button.

### About Us (new `<section id="about" className="scroll-mt-24">`)
- Two-column desktop, single-column mobile.
- Left: eyebrow "ABOUT GENZ'S", H2 "Built for the Next Generation of Fashion", the 4-paragraph story broken into readable paragraphs.
- Right: two stacked cards — "Our Mission" and "Our Vision" — reusing existing card styling from Why Join Us (border, rounded-2xl, bg-card, subtle green accent).
- No invented stats.

### Why Join Us
- Update eyebrow/heading/subtext and the three card titles + bodies per spec.
- Keep existing card layout; swap icons to relevant Lucide icons: `Sparkles` (Create Local Impact), `TrendingUp` (Grow With the Brand), `Lightbulb` (Bring Ideas to Life).

### Ready to Join CTA
- Update eyebrow/heading/copy per spec; keep single Apply Now button.

### Head metadata
- Update title/description/og to reference GenZ's and the new positioning.

## 5. Footer (`src/components/Footer.tsx`)

- Rename brand text to "GenZ's".
- Quick Links: Home (`/`), About Us (`/#about`), Apply Now (`/apply`), Sign In (`/signin`).
- Email already `mailto:`; Instagram/TikTok already `target="_blank" rel="noopener noreferrer"` — keep.

## 6. Accessibility / polish

- Visible focus rings on nav links and buttons (rely on existing `focus-visible` tokens; add where missing).
- `aria-current` via `activeProps` on nav links.
- Smooth scroll gated by reduced-motion.
- `scroll-mt-24` on `#about` for sticky header offset.

## Files touched

- `src/components/Navbar.tsx` — restructured public nav, About link, Home smooth-scroll.
- `src/components/Footer.tsx` — GenZ's rename, updated links.
- `src/components/Logo.tsx` — alt text.
- `src/routes/index.tsx` — hero copy, remove Values section, add About section, update Why Join Us, update CTA, update head meta.
- `src/routes/__root.tsx` — hash-scroll effect, title rename.
- `src/routes/apply.tsx`, `src/routes/signin.tsx`, `src/routes/my-application.tsx`, `src/routes/admin.tsx` — user-facing "GenZ" → "GenZ's" in copy/titles only.
- `src/styles.css` — reduced-motion smooth scroll rule.

## Out of scope

Auth, form logic, admin/applicant portal behavior, routing structure, design tokens, logo asset, storage schemas.
