
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

UPDATE public.profiles p SET email = u.email FROM auth.users u WHERE u.id = p.id AND p.email IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, name, phone, birthday, portfolio_url, email)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'birthday', '')::date,
    nullif(new.raw_user_meta_data->>'portfolio_url', ''),
    new.email
  );

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when lower(new.email) = 'admin@genz-s.com' then 'admin'::public.app_role
         else 'applicant'::public.app_role end
  );

  return new;
end;
$function$;
