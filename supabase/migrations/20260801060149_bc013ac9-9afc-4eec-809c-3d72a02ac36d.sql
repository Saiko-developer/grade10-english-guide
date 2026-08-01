
CREATE TABLE public.units (
  id text PRIMARY KEY,
  code text NOT NULL,
  title text NOT NULL,
  title_my text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lessons (
  id text PRIMARY KEY,
  unit_id text REFERENCES public.units(id) ON DELETE CASCADE,
  code text NOT NULL,
  type text,
  title text NOT NULL,
  title_my text,
  intro text,
  intro_my text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lesson_questions (
  id bigserial PRIMARY KEY,
  lesson_id text REFERENCES public.lessons(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'main',
  question_number int NOT NULL,
  question text NOT NULL,
  suggested_answer text,
  answer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vocabulary_items (
  id bigserial PRIMARY KEY,
  lesson_id text REFERENCES public.lessons(id) ON DELETE CASCADE,
  section_id text,
  word text NOT NULL,
  pronunciation text,
  meaning_my text,
  example_en text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.section_passages (
  id bigserial PRIMARY KEY,
  section_id text NOT NULL,
  lesson text,
  topic text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.section_exercises (
  id bigserial PRIMARY KEY,
  section_id text NOT NULL,
  part text NOT NULL,
  instructions text,
  headers jsonb,
  data jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.supplements (
  id bigserial PRIMARY KEY,
  section_id text NOT NULL,
  key text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section_id, key)
);

GRANT SELECT ON public.units TO anon, authenticated;
GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT SELECT ON public.lesson_questions TO anon, authenticated;
GRANT SELECT ON public.vocabulary_items TO anon, authenticated;
GRANT SELECT ON public.section_passages TO anon, authenticated;
GRANT SELECT ON public.section_exercises TO anon, authenticated;
GRANT SELECT ON public.supplements TO anon, authenticated;
GRANT ALL ON public.units TO service_role;
GRANT ALL ON public.lessons TO service_role;
GRANT ALL ON public.lesson_questions TO service_role;
GRANT ALL ON public.vocabulary_items TO service_role;
GRANT ALL ON public.section_passages TO service_role;
GRANT ALL ON public.section_exercises TO service_role;
GRANT ALL ON public.supplements TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curriculum units are public" ON public.units FOR SELECT USING (true);
CREATE POLICY "Curriculum lessons are public" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Curriculum questions are public" ON public.lesson_questions FOR SELECT USING (true);
CREATE POLICY "Curriculum vocabulary is public" ON public.vocabulary_items FOR SELECT USING (true);
CREATE POLICY "Curriculum passages are public" ON public.section_passages FOR SELECT USING (true);
CREATE POLICY "Curriculum exercises are public" ON public.section_exercises FOR SELECT USING (true);
CREATE POLICY "Curriculum supplements are public" ON public.supplements FOR SELECT USING (true);
