-- 1. Privilege escalation fix: only admins can UPDATE applications
DROP POLICY IF EXISTS "Users can update own application or admins update all" ON public.applications;

CREATE POLICY "Only admins can update applications"
  ON public.applications
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. URL scheme constraints (defense in depth against javascript:/data: payloads)
ALTER TABLE public.applications
  ADD CONSTRAINT applications_portfolio_url_scheme_chk
  CHECK (portfolio_url IS NULL OR portfolio_url ~* '^https?://[^\s]+$');

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_portfolio_url_scheme_chk
  CHECK (portfolio_url IS NULL OR portfolio_url ~* '^https?://[^\s]+$');

-- 4. CHECK constraints mirroring Zod
ALTER TABLE public.applications
  ADD CONSTRAINT applications_position_valid_chk
  CHECK (position IN (
    'Web Developer','AI Engineer','Graphic Designer','Video Editor',
    'Content Creator','Social Media Specialist','Digital Marketing Specialist',
    'Fashion Designer','Sales Associate','Store Manager','Customer Support',
    'HR Specialist','Operations Coordinator'
  )),
  ADD CONSTRAINT applications_status_valid_chk
    CHECK (status IN ('pending','accepted','rejected')),
  ADD CONSTRAINT applications_interview_type_valid_chk
    CHECK (interview_type IS NULL OR interview_type IN ('onsite','online')),
  ADD CONSTRAINT applications_interview_meeting_url_scheme_chk
    CHECK (interview_meeting_url IS NULL OR interview_meeting_url ~* '^https?://[^\s]+$'),
  ADD CONSTRAINT applications_interview_location_url_scheme_chk
    CHECK (interview_location_url IS NULL OR interview_location_url ~* '^https?://[^\s]+$');

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_name_len_chk
    CHECK (name IS NULL OR char_length(name) BETWEEN 2 AND 80),
  ADD CONSTRAINT profiles_phone_format_chk
    CHECK (phone IS NULL OR phone ~ '^(\+20|0)?1[0125][0-9]{8}$'),
  ADD CONSTRAINT profiles_email_len_chk
    CHECK (email IS NULL OR char_length(email) <= 120);