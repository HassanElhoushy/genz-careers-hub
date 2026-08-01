DROP POLICY IF EXISTS "Users can create own application" ON public.applications;

CREATE POLICY "Users can create own pending application"
  ON public.applications FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND interview_type IS NULL AND interview_date IS NULL
    AND interview_time IS NULL AND interview_location IS NULL
    AND interview_location_url IS NULL AND interview_meeting_url IS NULL
    AND interview_notes IS NULL AND rejection_reason IS NULL
  );

CREATE OR REPLACE FUNCTION public.current_auth_email()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$ SELECT lower(u.email) FROM auth.users u WHERE u.id = auth.uid() $$;

REVOKE ALL ON FUNCTION public.current_auth_email() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.current_auth_email() TO authenticated;

UPDATE public.profiles p SET email = u.email FROM auth.users u
WHERE u.id = p.id AND (p.email IS NULL OR lower(p.email) IS DISTINCT FROM lower(u.email));

DROP POLICY IF EXISTS "Users can update own profile or admins update all" ON public.profiles;

CREATE POLICY "Users can update own profile or admins update all"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (
    (auth.uid() = id AND lower(email) IS NOT DISTINCT FROM public.current_auth_email())
    OR public.has_role(auth.uid(), 'admin')
  );