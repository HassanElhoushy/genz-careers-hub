# Two more RLS hardening fixes

Both target real gaps confirmed against the live database: the current
`applications` insert rule is named "Users can create own application" and only
checks ownership, and the `profiles` update rule lets a user write any value into
`email`.

## 1. Applicants can no longer self-accept at insert time

Replace the insert policy so a new application must be `pending` with all
interview and rejection fields empty. Ownership check stays.

Impact on existing flows: none. Applications are created by the
`handle_new_user` trigger, which runs as a definer function and inserts only
`user_id`, `position`, and `portfolio_url` — status defaults to `pending`.

## 2. profiles.email can no longer be spoofed

- Add `public.current_auth_email()`, a definer function returning the caller's
  real auth email, executable by signed-in users only.
- Backfill any profile rows whose email drifted from the auth record.
- Rewrite the profiles update policy: a user may update their own row only when
  the email value still matches their auth email; admins keep full update access.

Impact: the app never updates `profiles.email` from the client, so no current
screen changes behaviour.

## Delivery

Shipped as one migration through the migration tool (you approve it in-app);
the SQL is exactly what you supplied. No React changes are needed for either fix.

## Verification after apply

- Signed-in applicant attempting an insert with `status = 'accepted'` → denied.
- Signed-in applicant attempting to change their own `profiles.email` → denied;
  changing name/phone still works.
- Admin dashboard: status changes, interview scheduling, and delete unchanged.
- Full apply → sign in → my application flow still succeeds.
