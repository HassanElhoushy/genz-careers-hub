## Root cause

After `supabase.auth.signUp`, Supabase immediately creates a session (email confirmation is off), so the applicant is technically signed in. The apply page then calls `signOut()` and navigates to `/signin` after a 1.4s delay. Two races happen:

1. **Session‑listener race on `/signin`.** `signin.tsx` has a `useEffect` that redirects any applicant session to `/my-application`. When we navigate to `/signin`, the `onAuthStateChange(SIGNED_OUT)` event hasn't reached the session store yet, so the effect still sees an "applicant" session and pushes to `/my-application`.
2. **Application‑row race.** `/my-application` then queries `applications` for the just‑created user. The DB trigger inserts the row from signup metadata, but the query can run before the row is visible, so the page renders "No application on file".

## Fix (scope: `src/routes/apply.tsx` only; no business‑logic changes elsewhere)

1. After a successful `supabase.auth.signUp`, poll `applications` for the new `user_id` (up to ~5 tries, 300ms apart) to confirm the trigger inserted the row. If it never appears, surface a toast and stop — don't proceed to the "success" state.
2. Await `supabase.auth.signOut()` and wait for the store to reflect a null session (subscribe once, resolve on `SIGNED_OUT`, with a short timeout fallback).
3. Show the existing success overlay and a `toast.success("Application submitted successfully!", { description: "Sign in to track your application." })`.
4. Replace the client‑side `navigate({ to: "/signin" })` with `window.location.assign("/signin")`. A hard navigation guarantees `/signin` mounts with a fresh (signed‑out) session snapshot, sidestepping the listener race entirely.
5. Remove the 1.4s `setTimeout` guessing game; drive the redirect from the awaited steps above (keep the success overlay visible for ~800ms for feedback, then hard‑navigate).

No changes to `signin.tsx`, `use-session.ts`, DB schema, or the trigger.

### Technical details

- Polling uses the existing browser `supabase` client and RLS (`user_id = auth.uid()`), so it works while the just‑created session is still active.
- Hard navigation is the smallest safe fix for the listener race; refactoring `signin.tsx`'s auto‑redirect is out of scope for this ticket.
- The password field and all other form behavior stay unchanged.