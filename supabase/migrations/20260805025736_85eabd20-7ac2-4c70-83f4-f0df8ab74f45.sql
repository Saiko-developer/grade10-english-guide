-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CURRICULUM ADDITIONS ============
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE TABLE public.unit_skills (
  id bigserial PRIMARY KEY,
  unit_id text NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  kind text NOT NULL,
  label text NOT NULL,
  detail text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_id, kind)
);
GRANT SELECT ON public.unit_skills TO anon, authenticated;
GRANT ALL ON public.unit_skills TO service_role;
ALTER TABLE public.unit_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Unit skills are public" ON public.unit_skills FOR SELECT USING (true);

CREATE TABLE public.grammar_lessons (
  id text PRIMARY KEY,
  unit_id text NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_my text,
  topic text NOT NULL,
  rule_my text,
  examples jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.grammar_lessons TO anon, authenticated;
GRANT ALL ON public.grammar_lessons TO service_role;
ALTER TABLE public.grammar_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grammar lessons are public" ON public.grammar_lessons FOR SELECT USING (true);

-- ============ PROGRESS ============
CREATE TABLE public.practice_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id text NOT NULL,
  grammar_lesson_id text,
  source text NOT NULL DEFAULT 'grammar',
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_progress TO authenticated;
GRANT ALL ON public.practice_progress TO service_role;
ALTER TABLE public.practice_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own progress" ON public.practice_progress FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX practice_progress_user_unit_idx ON public.practice_progress (user_id, unit_id);

-- ============ EXAM UPLOADS ============
CREATE TABLE public.exam_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  status text NOT NULL DEFAULT 'uploaded',
  error_message text,
  extracted_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_uploads TO authenticated;
GRANT ALL ON public.exam_uploads TO service_role;
ALTER TABLE public.exam_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own uploads" ON public.exam_uploads FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER exam_uploads_updated_at BEFORE UPDATE ON public.exam_uploads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.exam_upload_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid NOT NULL REFERENCES public.exam_uploads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'multiple_choice',
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  answer text NOT NULL,
  explanation_my text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_upload_questions TO authenticated;
GRANT ALL ON public.exam_upload_questions TO service_role;
ALTER TABLE public.exam_upload_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own upload questions" ON public.exam_upload_questions FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ MONTHLY EXAMS ============
CREATE TABLE public.monthly_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_ids text[] NOT NULL DEFAULT '{}',
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'ready',
  score integer,
  total integer,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_exams TO authenticated;
GRANT ALL ON public.monthly_exams TO service_role;
ALTER TABLE public.monthly_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own monthly exams" ON public.monthly_exams FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER monthly_exams_updated_at BEFORE UPDATE ON public.monthly_exams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();