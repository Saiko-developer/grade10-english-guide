ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS skill text,
  ADD COLUMN IF NOT EXISTS audio_url text;

CREATE INDEX IF NOT EXISTS lessons_unit_skill_idx ON public.lessons (unit_id, skill);