CREATE OR REPLACE FUNCTION public.reclaim_orphan_applicant_account(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  normalized_email text := lower(trim(target_email));
  target_id uuid;
BEGIN
  IF normalized_email IS NULL OR normalized_email = '' THEN
    RETURN false;
  END IF;

  SELECT u.id
  INTO target_id
  FROM auth.users u
  JOIN public.user_roles applicant_role
    ON applicant_role.user_id = u.id
   AND applicant_role.role = 'applicant'
  LEFT JOIN public.applications app
    ON app.user_id = u.id
  WHERE lower(u.email) = normalized_email
    AND app.id IS NULL
    AND NOT public.has_role(u.id, 'admin')
  LIMIT 1;

  IF target_id IS NULL THEN
    RETURN false;
  END IF;

  IF auth.uid() IS NOT NULL
     AND auth.uid() <> target_id
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not allowed to reclaim this applicant account';
  END IF;

  DELETE FROM auth.users WHERE id = target_id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.reclaim_orphan_applicant_account(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reclaim_orphan_applicant_account(text) TO anon, authenticated, service_role;

DELETE FROM auth.users u
WHERE EXISTS (
  SELECT 1
  FROM public.user_roles applicant_role
  WHERE applicant_role.user_id = u.id
    AND applicant_role.role = 'applicant'
)
AND NOT EXISTS (
  SELECT 1
  FROM public.applications app
  WHERE app.user_id = u.id
)
AND NOT public.has_role(u.id, 'admin');