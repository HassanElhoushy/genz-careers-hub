# Security review — findings and optional hardening

## Summary
The project is in good shape. Automated scans return no vulnerabilities:
- Dependency scan: clean.
- Persisted security scan: no findings.
- Supabase DB linter: 2 WARNINGs, both intentional (see below).

Only one optional hardening step is worth doing now.

## Optional hardening (proposed changes)

### 1. Enable leaked-password protection (HIBP)
Turn on Supabase's Have I Been Pwned check so signup/password-change rejects
passwords known to be breached. No code changes needed — this is a project
auth setting toggle.

### 2. Document the two linter warnings as intentional
Update the security memory so future scans don't re-flag them:
- `public.has_role(uuid, app_role)` — must be EXECUTE-able by `authenticated`
  because every RLS policy on `applications`, `profiles`, and `user_roles`
  calls it. Revoking would break all row-level security.
- `public.delete_applicant(uuid)` — SECURITY DEFINER by design: it self-checks
  `has_role(auth.uid(), 'admin')` and refuses to delete other admins. It must
  be callable by `authenticated` so the admin UI can invoke it.

## Out of scope (already handled or deferred by you)
- `.env` committed to GitHub history — publishable keys only; rotation
  deferred per your decision, no history rewrite.
- No code changes to routes, RLS, or grants — current policies are correct.

## Technical notes
- HIBP is toggled via the Supabase auth config tool (or Cloud → Users → Auth
  Settings → Password HIBP Check).
- Security memory update uses `security--update_memory`; it does not modify
  application code.
