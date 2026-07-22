## 1. Mobile navbar (`src/components/Navbar.tsx`)

On phones the 3-column grid renders as `[logo] [empty center] [toggle + hamburger]`, which leaves an awkward gap and hides the Apply Now / Sign In CTAs entirely until the menu is opened. Fix:

- Use a plain flex row (`flex items-center justify-between`) on mobile, and promote to the 3-column grid at `md:` only.
- Keep Apply Now / Sign In hidden on mobile (they live inside the hamburger menu, which is correct), so mobile shows: logo left, theme toggle + hamburger right — no empty center column.

## 2. About Us active state (`src/components/Navbar.tsx`)

Currently "About Us" is a plain `<a href="/#about">`, so the router keeps the active style on "Home" even while viewing the About section. Fix:

- Track active section with a small scroll listener that sets `activeSection` to `"about"` when `#about` is in view (top < 120px, bottom > 120px), otherwise `"home"`.
- Apply the active styles (`text-foreground bg-accent`) to Home or About Us based on `activeSection`, and stop relying on `activeProps` for Home.
- Same logic mirrored in the mobile menu items.

## 3. Restore previous hero (`src/routes/index.tsx`)

Revert the hero heading to **"Join the GenZ's Team"** (keep the highlighted-word treatment on "GenZ's Team"). Keep the current eyebrow ("CAREERS AT GENZ'S"), supporting paragraph, and single Apply Now button. Update the route `head()` title/og accordingly (e.g. `Join the GenZ's Team — Careers at GenZ's`).

## 4. About GenZ's section — shorter, no em dashes (`src/routes/index.tsx`)

Rewrite the left column copy to be tighter and remove every `—`. Proposed 3 short paragraphs:

- "GenZ's was created to redefine fashion for the next generation."
- "What started as a simple question about why we wear what we wear has grown into one of Egypt's destinations for local fashion. We see style as a way to express identity, creativity, and confidence."
- "By bringing Egyptian brands together in one place, we make it easier to discover distinctive, high-quality pieces while supporting local designers, creators, and manufacturers."

Also scrub em dashes from the Mission and Vision card bodies (replace with commas or periods) and from any other homepage copy.

## Files touched

- `src/components/Navbar.tsx` — mobile layout + active-section tracking for Home / About Us.
- `src/routes/index.tsx` — restored hero heading, updated head meta, shortened About copy, no `—`.

## Out of scope

Auth, admin, applicant portal, footer, styles.css, routes structure.
