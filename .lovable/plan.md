## Problem

Deleting an application in the admin dashboard only removes the `applications` row. The `auth.users` account (and cascaded `profiles` / `user_roles`) stays, so the person can still sign in ("No application on file") and can't re-apply ("email already exists").

## Fix — SQL RPC, no service-role key

### 1. Migration: `delete_applicant(target_user_id uuid)`

```sql
create or replace function public.delete_applicant(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can delete applicants';
  end if;

  if public.has_role(target_user_id, 'admin') then
    raise exception 'Cannot delete an admin account';
  end if;

  delete from auth.users where id = target_user_id;
end;
$$;

revoke all on function public.delete_applicant(uuid) from public, anon;
grant execute on function public.delete_applicant(uuid) to authenticated;
```

`ON DELETE CASCADE` from `auth.users` already clears `profiles`, `user_roles`, and `applications`.

### 2. Frontend: `src/hooks/use-applications.ts`

Change `useDeleteApplication` to accept the applicant's `userId` and call:

```ts
const { error } = await supabase.rpc("delete_applicant", { target_user_id: userId });
```

Invalidate `["all-applications"]` on success.

### 3. Admin UI: `src/routes/admin.tsx`

Pass `application.userId` to the delete mutation (instead of `application.id`). Update the confirm dialog copy to say the applicant account will be removed and the email freed for reapplication.

No changes to applicant pages. No server function, no service-role key — works on Vercel.
