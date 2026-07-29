# Security hardening plan

Applies the four fixes you approved. Note on delivery: this project runs on
Lovable Cloud, which has no SQL Editor UI, so all DB changes are shipped
through the migration tool (you approve it in-app). The exact SQL is also
listed below for review.

## 1. Privilege escalation — applicants can update their own status

Current `applications` UPDATE policy allows a user to update their own row,
so an applicant could `PATCH` `status` to `accepted`. Fix: drop that policy
and replace with admin-only UPDATE. Applicants keep INSERT and SELECT.

```sql
DROP POLICY "Users can update own application or admins update all"
  ON public.applications;

CREATE POLICY "Only admins can update applications"
  ON public.applications
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

Impact on existing flows: none — the Apply form only INSERTs (via the
`handle_new_user` trigger), My Application only SELECTs, and Admin already
requires admin role to change status/interview fields.

## 2. Stored XSS via `portfolio_url`

Two layers:

### 2a. DB CHECK constraint (defense in depth)

```sql
ALTER TABLE public.applications
  ADD CONSTRAINT applications_portfolio_url_scheme_chk
  CHECK (
    portfolio_url IS NULL
    OR portfolio_url ~* '^https?://[^\s]+$'
  );

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_portfolio_url_scheme_chk
  CHECK (
    portfolio_url IS NULL
    OR portfolio_url ~* '^https?://[^\s]+$'
  );
```

### 2b. React sanitizer at every render site

Add `src/lib/safe-url.ts` exporting `safeHttpUrl(value)` that returns the
trimmed URL only when it parses as `http:` or `https:`; otherwise returns
`null`. Use it in:
- `src/routes/admin.tsx` (3 render sites: rows, expanded panel, dialog)
- `src/routes/my-application.tsx` (1 site)

Each `<a>` renders only when `safeHttpUrl(...)` is non-null, and uses that
sanitized value for `href`. Keeps `target="_blank" rel="noopener noreferrer"`
where already set; adds it where missing.

No change to the Zod schema in `apply.tsx` — it already enforces the same
pattern, and tightening it further risks breaking the form.

## 3. Admin email matching in `handle_new_user`

Left untouched, per your instruction.

## 4. Missing DB-level constraints mirroring Zod

```sql
ALTER TABLE public.applications
  ADD CONSTRAINT applications_position_valid_chk
  CHECK (position IN (
    'Web Developer','AI Engineer','Graphic Designer','Video Editor',
    'Content Creator','Social Media Specialist','Digital Marketing Specialist',
    'Fashion Designer','Sales Associate','Store Manager','Customer Support',
    'HR Specialist','Operations Coordinator'
  )),
  ADD CONSTRAINT applications_status_valid_chk
  CHECK (status IN ('pending','accepted','rejected')),
  ADD CONSTRAINT applications_interview_type_valid_chk
  CHECK (interview_type IS NULL OR interview_type IN ('onsite','online')),
  ADD CONSTRAINT applications_interview_meeting_url_scheme_chk
  CHECK (
    interview_meeting_url IS NULL
    OR interview_meeting_url ~* '^https?://[^\s]+$'
  ),
  ADD CONSTRAINT applications_interview_location_url_scheme_chk
  CHECK (
    interview_location_url IS NULL
    OR interview_location_url ~* '^https?://[^\s]+$'
  );

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_name_len_chk
    CHECK (name IS NULL OR char_length(name) BETWEEN 2 AND 80),
  ADD CONSTRAINT profiles_phone_format_chk
    CHECK (phone IS NULL OR phone ~ '^(\+20|0)?1[0125][0-9]{8}$'),
  ADD CONSTRAINT profiles_email_len_chk
    CHECK (email IS NULL OR char_length(email) <= 120);
```

Position/status/interview_type lists match `src/lib/positions.ts` and the
existing enums used in the UI. If you add a new position later, update this
CHECK in the same migration.

## Delivery

- SQL above ships as a single migration via the migration tool (you review
  and approve it in-app; no external SQL editor needed).
- React changes: new `src/lib/safe-url.ts` + edits to `src/routes/admin.tsx`
  and `src/routes/my-application.tsx`. No changes to Apply, Sign-in, or the
  auth trigger.

## Verification after apply

- Sign in as applicant → attempt `update applications set status='accepted'`
  from the browser client → expect RLS denial.
- Submit apply with `portfolio_url = 'javascript:alert(1)'` → expect Zod
  rejection; direct DB insert of same value → expect CHECK violation.
- Admin dashboard renders only sanitized links; malicious stored value (if
  any legacy row exists) renders as no-link text, not a clickable anchor.
- Existing flows unchanged: Apply → Sign in → My Application, and Admin
  accept/reject/schedule.
