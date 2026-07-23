ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS interview_type text,
  ADD COLUMN IF NOT EXISTS interview_meeting_url text;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_interview_type_check;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_interview_type_check
  CHECK (interview_type IS NULL OR interview_type IN ('onsite','online'));