
-- handle_new_user is only called by the auth.users trigger
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- update_updated_at_column is only called by triggers
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;

-- has_role is used inside RLS policies (called as authenticated); lock out anon
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
