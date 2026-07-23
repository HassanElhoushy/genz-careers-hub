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

revoke all on function public.delete_applicant(uuid) from public;
revoke all on function public.delete_applicant(uuid) from anon;
grant execute on function public.delete_applicant(uuid) to authenticated;