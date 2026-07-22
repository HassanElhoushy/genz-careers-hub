## Problem

1. **Broken logo on Vercel**: `src/components/Logo.tsx` loads the logo from `/__l5e/assets-v1/...` — that's Lovable's CDN path, which doesn't exist on Vercel, so the image 404s and shows as a broken icon.
2. **Wrong browser tab icon**: `src/routes/__root.tsx` still links `/favicon.ico` (the default Lovable icon).

## Fix

1. Copy the GenZ logo binary into the repo so any host serves it:
   - Save it as `public/genz-logo.jpg` (served at `/genz-logo.jpg` on Vercel and Lovable alike).
   - Update `src/components/Logo.tsx` to use `/genz-logo.jpg` directly instead of the `.asset.json` pointer.
2. Add a proper favicon:
   - Save the same image as `public/favicon.png`.
   - In `src/routes/__root.tsx`, replace the `/favicon.ico` link with `{ rel: "icon", type: "image/png", href: "/favicon.png" }`.
   - Delete the old `public/favicon.ico`.

No behavior/logic changes — presentation/asset paths only.
