## 1. Add LinkedIn / Portfolio field to Apply form

- `src/types/application.ts`: add optional `linkedinUrl?: string` to `Application`.
- `src/routes/apply.tsx`:
  - Extend Zod schema with `linkedinUrl: z.string().trim().url("Enter a valid URL").max(200).optional().or(z.literal(""))`.
  - Add a `FloatingField` labeled "LinkedIn or portfolio URL (optional)" between password and position.
  - Pass `linkedinUrl` into `add(...)` on submit (normalize empty string to undefined).
- `src/routes/admin.tsx`: show the link on the applicant row/detail as a clickable "🔗 Portfolio" opening in a new tab when present.
- `src/routes/my-application.tsx`: (optional) display the saved link so applicants can confirm what they submitted.

## 2. Change admin login from `admin` to `admin@genz-s.com`

- `src/routes/signin.tsx`: replace the hard-coded `email === "admin"` check with `email.trim().toLowerCase() === "admin@genz-s.com"` (password still `admin`). Update the placeholder/help text hint if one is shown.
- `src/hooks/use-session.ts`: widen the admin session `email` type from the literal `"admin"` to `string` (or `"admin@genz-s.com"`) and update `signInAdmin` accordingly.
- Search for any other references to the `"admin"` literal (navbar, admin route guard) and update them to the new email.

## Out of scope

Styling overhaul, auth backend, other routes.
