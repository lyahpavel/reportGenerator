ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS crew_leader TEXT; COMMENT ON COLUMN public.submissions.crew_leader IS 'Ім''я старшого екіпажу';
