## Remove the centered nav link after sign-in

Agreed — the logo already routes to the right workspace (Admin Panel or My Application) when signed in, so the centered "Admin Panel" / "My Application" link is redundant.

### Change

**`src/components/Navbar.tsx`**
- Remove the authed `<nav>` block that renders the centered "My Application" / "Admin Panel" link (desktop).
- Remove the equivalent link from the mobile menu; keep only the Sign Out button there.
- Keep everything else: logo remains clickable and context-aware, Sign Out button stays, public nav (Home / Apply Now / Sign In) unchanged for signed-out users.

### Result

After sign-in the navbar shows: logo (left) · theme toggle + Sign Out (right). Mobile menu shows only Sign Out.