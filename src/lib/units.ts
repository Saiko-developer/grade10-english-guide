/**
 * Live curriculum metadata (units, per-unit skills, grammar lessons) read from
 * the Cloud database. No static syllabus fallback — the database is the source
 * of truth, synced from the Grade 10 textbook data.
 */
import { supabase } from "@/integrations/supabase/client";

export type SkillKind =
  | "listening"
  | "reading"
  | "speaking"
  | "writing"
  | "vocabulary"
  | "grammar";

export type UnitSkill = {
  kind: SkillKind;
  label: string;
  detail: string;
};

export type UnitRecord = {
  id: string;
  number: number;
  code: string;
  title: string;
  titleMy: string | null;
  audioUrl: string | null;
  skills: UnitSkill[];
};

export type GrammarLesson = {
  id: string;
  unitId: string;
  title: string;
  titleMy: string | null;
  topic: string;
  ruleMy: string | null;
  examples: { en: string; my?: string }[];
};

export async function fetchUnits(): Promise<UnitRecord[]> {
  const [{ data: units, error }, { data: skills }] = await Promise.all([
    supabase.from("units").select("*").order("sort_order"),
    supabase.from("unit_skills").select("*").order("sort_order"),
  ]);

  if (error) throw new Error(error.message);

  return (units ?? []).map((u) => ({
    id: u.id,
    number: Number(u.id.replace("unit-", "")) || u.sort_order,
    code: u.code,
    title: u.title,
    titleMy: u.title_my,
    audioUrl: u.audio_url,
    skills: (skills ?? [])
      .filter((s) => s.unit_id === u.id)
      .map((s) => ({
        kind: s.kind as SkillKind,
        label: s.label,
        detail: s.detail,
      })),
  }));
}

export async function fetchGrammarLessons(unitId: string): Promise<GrammarLesson[]> {
  const { data, error } = await supabase
    .from("grammar_lessons")
    .select("*")
    .eq("unit_id", unitId)
    .order("sort_order");

  if (error) throw new Error(error.message);

  return (data ?? []).map((g) => ({
    id: g.id,
    unitId: g.unit_id,
    title: g.title,
    titleMy: g.title_my,
    topic: g.topic,
    ruleMy: g.rule_my,
    examples: Array.isArray(g.examples) ? (g.examples as { en: string; my?: string }[]) : [],
  }));
}

export type ProgressRow = {
  unitId: string;
  grammarLessonId: string | null;
  score: number;
  total: number;
  completedAt: string;
};

export async function fetchProgress(userId: string): Promise<ProgressRow[]> {
  const { data } = await supabase
    .from("practice_progress")
    .select("unit_id, grammar_lesson_id, score, total, completed_at")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  return (data ?? []).map((r) => ({
    unitId: r.unit_id,
    grammarLessonId: r.grammar_lesson_id,
    score: r.score,
    total: r.total,
    completedAt: r.completed_at,
  }));
}

export async function saveProgress(input: {
  userId: string;
  unitId: string;
  grammarLessonId?: string | null;
  score: number;
  total: number;
  source?: string;
}) {
  await supabase.from("practice_progress").insert({
    user_id: input.userId,
    unit_id: input.unitId,
    grammar_lesson_id: input.grammarLessonId ?? null,
    score: input.score,
    total: input.total,
    source: input.source ?? "grammar",
  });
}

/** Units where the student has finished at least one practice set. */
export function completedUnitIds(rows: ProgressRow[]): string[] {
  return [...new Set(rows.filter((r) => r.total > 0).map((r) => r.unitId))];
}
