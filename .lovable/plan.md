## Goal

Restore access to `admin@genz-s.com`, add a proper password reset flow, and surface clearer sign-in errors so this class of issue doesn't recur.

## 1. Reset the admin account

Delete the existing `admin@genz-s.com` auth user (cascades to `profiles`, `user_roles`, `applications`) so you can register fresh at `/apply` with a valid password (min 6 chars). The DB trigger `handle_new_user` will re-grant the admin role automatically on re-signup.

## 2. Add a "Forgot password" flow

- Add a **Forgot password?** link on `/signin`.
- New public route `/forgot-password`: email input, calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: ${origin}/reset-password })`.
- New public route `/reset-password`: detects the `type=recovery` hash, shows a new-password form, calls `supabase.auth.updateUser({ password })`, then redirects to `/signin`.
- Both pages use the existing `SiteLayout` + floating-label field styling from `signin.tsx`.

## 3. Improve sign-in error messages

Update `src/routes/signin.tsx` to map Supabase auth errors instead of the generic string:
- `invalid_credentials` → "Wrong email or password."
- `email_not_confirmed` → "Please confirm your email first."
- Network/other → show the raw message.

Also add a client-side min-length hint (6 chars) on the password field so the same 5-character mistake is caught before the request.

## 4. Auth email templates

Password reset relies on Supabase sending a recovery email. I'll scaffold the Lovable auth email templates (`email_domain--scaffold_auth_email_templates`) so the recovery email actually delivers with GenZ's branding. If no email domain is set up yet, I'll surface the email setup dialog first.

## Files touched

- `src/routes/signin.tsx` — error mapping + "Forgot password?" link
- `src/routes/forgot-password.tsx` *(new)*
- `src/routes/reset-password.tsx` *(new)*
- Delete admin auth user via admin API (server-side, one-off)
- Scaffold auth email templates

## Out of scope

No schema changes, no changes to the admin panel, applicant portal, or application form.
