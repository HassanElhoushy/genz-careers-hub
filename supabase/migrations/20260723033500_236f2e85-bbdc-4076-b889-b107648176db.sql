CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, birthday, portfolio_url, email)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'birthday', '')::date,
    NULLIF(NEW.raw_user_meta_data->>'portfolio_url', ''),
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN lower(NEW.email) = 'admin@genz-s.com' THEN 'admin'::public.app_role
         ELSE 'applicant'::public.app_role END
  );

  IF lower(NEW.email) <> 'admin@genz-s.com'
     AND NULLIF(NEW.raw_user_meta_data->>'position', '') IS NOT NULL THEN
    INSERT INTO public.applications (user_id, position, portfolio_url)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'position',
      NULLIF(NEW.raw_user_meta_data->>'portfolio_url', '')
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.reclaim_orphan_applicant_account(text);