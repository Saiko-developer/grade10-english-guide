/**
 * Practice-lesson data service — reads lessons + questions live from the
 * Cloud database (no static imports).
 */
import { supabase } from "@/integrations/supabase/client";

export type PracticeSkill =
  | "reading"
  | "vocabulary"
  | "grammar"
  | "listening"
  | "speaking"
  | "writing";

/** Speaking shares the Listening & Speaking lesson row. */
export function normalizeSkill(skill: string): PracticeSkill | null {
  const s = skill.toLowerCase();
  if (s === "speaking") return "speaking";
  if (
    s === "reading" ||
    s === "vocabulary" ||
    s === "grammar" ||
    s === "listening" ||
    s === "writing"
  ) {
    return s;
  }
  return null;
}

function dbSkill(skill: PracticeSkill): string {
  return skill === "speaking" ? "listening" : skill;
}

export type PracticeQuestion = {
  id: number;
  number: number;
  question: string;
  suggestedAnswer: string | null;
  answer: string | null;
};

export type PracticeLesson = {
  id: string;
  code: string;
  type: string | null;
  title: string;
  titleMy: string | null;
  intro: string | null;
  introMy: string | null;
  audioUrl: string | null;
  skill: PracticeSkill;
  unitTitle: string | null;
  unitCode: string | null;
  questions: PracticeQuestion[];
  bonusQuestions: PracticeQuestion[];
};

export async function fetchPracticeLesson(
  unitNumber: string,
  skill: PracticeSkill,
): Promise<PracticeLesson | null> {
  const unitId = `unit-${unitNumber}`;

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*, units(code, title)")
    .eq("unit_id", unitId)
    .eq("skill", dbSkill(skill))
    .maybeSingle();

  if (error) {
    console.warn("[practice] lesson lookup failed:", error.message);
    return null;
  }
  if (!lesson) return null;

  const { data: rows } = await supabase
    .from("lesson_questions")
    .select("*")
    .eq("lesson_id", lesson.id)
    .order("question_number");

  const map = (kind: string): PracticeQuestion[] =>
    (rows ?? [])
      .filter((r) => r.kind === kind)
      .map((r) => ({
        id: r.id,
        number: r.question_number,
        question: r.question,
        suggestedAnswer: r.suggested_answer,
        answer: r.answer,
      }));

  const unit = (lesson as unknown as { units?: { code: string; title: string } | null }).units;

  return {
    id: lesson.id,
    code: lesson.code,
    type: lesson.type,
    title: lesson.title,
    titleMy: lesson.title_my,
    intro: lesson.intro,
    introMy: lesson.intro_my,
    audioUrl: lesson.audio_url,
    skill,
    unitCode: unit?.code ?? null,
    unitTitle: unit?.title ?? null,
    questions: map("main"),
    bonusQuestions: map("bonus"),
  };
}

/* ------------------------------------------------------------------ */
/* Source material for the left column of the split-screen workspace   */
/* ------------------------------------------------------------------ */

export type PassageParagraph = { english: string; burmese: string | null };

export type VocabEntry = {
  word: string;
  pronunciation: string | null;
  meaningMy: string | null;
  exampleEn: string | null;
};

export type GrammarNote = {
  whatMy?: string;
  whyMy?: string;
  whenMy?: string;
  examples?: { en: string; my?: string }[];
};

export type LessonMaterial = {
  passageTitle: string | null;
  paragraphs: PassageParagraph[];
  vocabulary: VocabEntry[];
  grammar: GrammarNote | null;
};

/** Reads the passage / vocabulary / grammar source content for a lesson code (e.g. "1A"). */
export async function fetchLessonMaterial(code: string): Promise<LessonMaterial> {
  const sectionId = code.toLowerCase();

  const [passageRes, vocabRes, grammarRes] = await Promise.all([
    supabase.from("section_passages").select("content").eq("section_id", sectionId).maybeSingle(),
    supabase
      .from("vocabulary_items")
      .select("word, pronunciation, meaning_my, example_en")
      .eq("section_id", sectionId)
      .order("sort_order"),
    supabase
      .from("supplements")
      .select("payload")
      .eq("section_id", sectionId)
      .like("key", "grammar%")
      .maybeSingle(),
  ]);

  const content = (passageRes.data?.content ?? {}) as {
    reading_passage?: {
      title?: string;
      paragraphs?: { english_text?: string; burmese_explanation?: string }[];
    };
  };

  return {
    passageTitle: content.reading_passage?.title ?? null,
    paragraphs: (content.reading_passage?.paragraphs ?? []).map((p) => ({
      english: p.english_text ?? "",
      burmese: p.burmese_explanation ?? null,
    })),
    vocabulary: (vocabRes.data ?? []).map((v) => ({
      word: v.word,
      pronunciation: v.pronunciation,
      meaningMy: v.meaning_my,
      exampleEn: v.example_en,
    })),
    grammar: (grammarRes.data?.payload as GrammarNote | undefined) ?? null,
  };
}
