
# Security & Architecture Audit Fixes

Scoped exactly to the 7 items requested. Each item lists what changes and any caveat you should know before I implement.

## 1. `.gitignore` — ensure `.env` is ignored
Add explicit `.env` (and `.env.*.local`) entries if not already present. Note: this only prevents future commits. If `.env` was previously committed, you'll also need to rotate any exposed keys and remove it from git history separately (I can guide you after this is applied).

## 2. `src/routes/signin.tsx` — remove admin backdoor
- Delete `ADMIN_EMAIL` constant.
- Remove `.superRefine(...)` block.
- Replace schema with a flat `z.object({ email, password: z.string().min(5, "Password must be at least 5 characters") })`.

Caveat: min length 5 keeps the current admin/legacy accounts working as you requested, but it's below Supabase's recommended 6+. Flagging for awareness — not changing unless you ask.

## 3. `src/integrations/supabase/auth-middleware.ts` — don't block valid users
Current middleware calls `supabase.auth.getClaims(token)` with the publishable-key client. That call is actually valid for JWT access tokens, so the real failure mode is usually a missing/expired bearer token, not the key type. I will:
- Wrap `getClaims` in try/catch so unexpected failures don't hard-throw before a fallback.
- If `getClaims` returns no claims, fall back to `supabase.auth.getUser(token)` (which validates against Supabase Auth using the publishable key + bearer) and derive `userId` from the returned user.
- Only throw `Unauthorized` if BOTH paths fail, and return a clearer message.
- No service-role usage added (service key must stay server-only and isn't needed for user validation).

If you're seeing "Unauthorized" in practice, the more likely root cause is the client middleware not attaching the bearer — I can investigate that next if the fix here doesn't resolve it.

## 4. `src/hooks/use-session.ts` — SSR-safe store
- Remove module-level mutable `state` and `listeners` singletons.
- Wrap them in a factory `createSessionStore()` and instantiate it lazily inside a browser-only guard, or move to a React context provider mounted in `__root.tsx` so each SSR request gets its own instance.
- Preferred approach: keep the `useSyncExternalStore` API but create the store inside a `SessionProvider` that lives in `__root.tsx`. `useSession()` reads from context. On the server, the provider returns a fresh, non-hydrating store (loading + null); browser-side it wires up `supabase.auth.getSession()` and `onAuthStateChange` in an effect.
- Update `sessionStore.signOut()` consumers (if any outside components) to go through the context or a small exported helper that just calls `supabase.auth.signOut()` (state updates flow through the auth listener).

## 5. `src/routes/apply.tsx` — dynamic age gate + cleaner optional URL
- Move `today` / `minAgeDate` out of module scope. Compute inside `ApplyPage` via `useMemo(() => { const t = new Date(); return new Date(t.getFullYear()-16, t.getMonth(), t.getDate()); }, [])`.
- Build the Zod schema inside the component with `useMemo` so it closes over the fresh `minAgeDate` (or accept a small perf hit and rebuild per render).
- Replace `portfolioUrl` schema with:
  ```
  portfolioUrl: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().url("Enter a valid URL (include https://)").max(200).optional()
  )
  ```
- Pass `minAgeDate` into the Calendar props as today (already local variable).

## 6. `src/router.tsx` — QueryClient singleton
- Hoist `const queryClient = new QueryClient(...)` to module scope.
- `getRouter()` reuses it in `context: { queryClient }`.
- Caveat: TanStack Start's `getRouter` is called per-request during SSR; a module-scoped QueryClient means server requests share cache. Acceptable for this app (no per-user server prefetching), and matches the "stable singleton" you asked for. If we later add SSR prefetch, we'd revisit.

## 7. `src/routes/admin.tsx` — EditDialog reset guard
- In the `EditDialog`'s `useEffect` that syncs form fields from the selected application, add a guard: only run when `open === true` and `application?.id` changed; explicitly reset all fields (including interview subfields) to defaults when switching, so no stale value from the previous applicant leaks in.
- Include `application?.id` in the dep array (not the whole object) to avoid effect thrash from reference changes.

---

## Technical notes / risks
- Item 3: I'm keeping the fix defensive rather than rewriting the auth model. If "Unauthorized" persists, next step is checking `src/start.ts` bearer attacher.
- Item 4: Switching to a context-based store is a small refactor but touches every `useSession()` consumer only if they were importing `sessionStore` directly. I'll grep and update the one or two call sites (e.g. Navbar sign-out).
- Item 6: Confirmed no per-request user state is stashed in QueryClient today, so singleton is safe.

## Out of scope
No feature changes, no DB migrations, no UI redesign. If any fix requires broader refactor (e.g. item 4 touching many files), I'll keep the surface minimal and note it in the final message.
