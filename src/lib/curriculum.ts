/**
 * Curriculum data service.
 *
 * Parallel-fallback strategy:
 *   1. Try to read the live curriculum from the Cloud database.
 *   2. If anything fails (network error, timeout, empty result because of
 *      row-level-security), fall back to the bundled local JSON/TS data and
 *      log a loud console.warn so the fallback is easy to spot.
 *
 * The local files are intentionally NOT deleted — they are the safety net.
 */
import { supabase } from "@/integrations/supabase/client";
import localUnit from "@/data/textbookUnit1.json";
import {
  grammar1C,
  partA1A_breakdowns,
  partA1A_translations,
  partA1C_translations,
  partB1A_breakdowns,
  partB1A_translations,
  partB1B_translations,
  partC1A_translations,
  vocab1B,
  type SentenceBreakdown,
  type VocabItem,
} from "@/data/unit1Supplement";

export type CurriculumSource = "cloud" | "local";

export type Supplement = {
  partA1A_translations: Record<number, string>;
  partB1A_translations: Record<number, string>;
  partC1A_translations: Record<number, string>;
  partB1B_translations: Record<number, string>;
  partA1C_translations: Record<number, string>;
  partA1A_breakdowns: Record<number, SentenceBreakdown>;
  partB1A_breakdowns: Record<number, SentenceBreakdown>;
  grammar1C: typeof grammar1C;
  vocab1B: VocabItem[];
};

export type Curriculum = {
  unit: {
    unit: string;
    unitTitle: string;
    lessons: any[];
    sections: any[];
  };
  supplement: Supplement;
  source: CurriculumSource;
  /** Reason the local fallback was used (only set when source === "local"). */
  fallbackReason?: string;
};

const LOCAL_SUPPLEMENT: Supplement = {
  partA1A_translations,
  partB1A_translations,
  partC1A_translations,
  partB1B_translations,
  partA1C_translations,
  partA1A_breakdowns,
  partB1A_breakdowns,
  grammar1C,
  vocab1B,
};

export const LOCAL_CURRICULUM: Curriculum = {
  unit: localUnit as unknown as Curriculum["unit"],
  supplement: LOCAL_SUPPLEMENT,
  source: "local",
};

function localFallback(reason: string): Curriculum {
  console.warn(
    `[curriculum] ⚠️ Cloud database unavailable — falling back to local JSON data. Reason: ${reason}`,
  );
  return { ...LOCAL_CURRICULUM, fallbackReason: reason };
}

function withTimeout<T>(promise: PromiseLike<T>, ms = 8000): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`request timed out after ${ms}ms`)), ms),
    ),
  ]);
}

const SECTION_IDS = ["1a", "1b", "1c"] as const;

/** Read the whole Unit 1 curriculum from the Cloud database, or fall back. */
export async function fetchCurriculum(): Promise<Curriculum> {
  try {
    const [units, lessons, questions, vocab, passages, exercises, supplements] =
      await withTimeout(
        Promise.all([
          supabase.from("units").select("*").limit(1),
          supabase.from("lessons").select("*").order("sort_order"),
          supabase.from("lesson_questions").select("*").order("question_number"),
          supabase.from("vocabulary_items").select("*").order("sort_order"),
          supabase.from("section_passages").select("*").order("sort_order"),
          supabase.from("section_exercises").select("*").order("sort_order"),
          supabase.from("supplements").select("*"),
        ]),
      );

    const failed = [units, lessons, questions, vocab, passages, exercises, supplements].find(
      (r) => r.error,
    );
    if (failed?.error) return localFallback(failed.error.message);

    const unitRow = (units.data ?? [])[0] as any;
    const lessonRows = (lessons.data ?? []) as any[];
    const passageRows = (passages.data ?? []) as any[];

    if (!unitRow || lessonRows.length === 0 || passageRows.length === 0) {
      return localFallback("no rows returned (empty tables or RLS restriction)");
    }

    // --- lessons + their questions ------------------------------------
    const questionRows = (questions.data ?? []) as any[];
    const builtLessons = lessonRows.map((l) => ({
      id: l.id,
      code: l.code,
      type: l.type,
      title: l.title,
      titleMy: l.title_my ?? undefined,
      intro: l.intro ?? undefined,
      introMy: l.intro_my ?? undefined,
      questions: questionRows
        .filter((q) => q.lesson_id === l.id && q.kind === "main")
        .map((q) => ({
          id: q.question_number,
          question: q.question,
          suggested_answer: q.suggested_answer ?? undefined,
        })),
      bonusQuestions: questionRows
        .filter((q) => q.lesson_id === l.id && q.kind === "bonus")
        .map((q) => ({
          id: q.question_number,
          question: q.question,
          answer: q.answer ?? q.suggested_answer ?? undefined,
        })),
    }));

    // --- sections: passage content + exercise parts --------------------
    const exerciseRows = (exercises.data ?? []) as any[];
    const builtSections = SECTION_IDS.map((sid) => {
      const passage = passageRows.find((p) => p.section_id === sid);
      const parts: Record<string, unknown> = {};
      for (const ex of exerciseRows.filter((e) => e.section_id === sid)) {
        parts[ex.part] = ex.data;
      }
      return { ...(passage?.content ?? {}), ...parts };
    });

    if (builtSections.some((s) => Object.keys(s).length === 0)) {
      return localFallback("incomplete section data in the database");
    }

    // --- supplements (Burmese translations, breakdowns, grammar) -------
    const supplementRows = (supplements.data ?? []) as any[];
    const byKey = (key: keyof Supplement) =>
      supplementRows.find((r) => r.key === key)?.payload;

    const built: Supplement = {
      partA1A_translations: byKey("partA1A_translations") ?? partA1A_translations,
      partB1A_translations: byKey("partB1A_translations") ?? partB1A_translations,
      partC1A_translations: byKey("partC1A_translations") ?? partC1A_translations,
      partB1B_translations: byKey("partB1B_translations") ?? partB1B_translations,
      partA1C_translations: byKey("partA1C_translations") ?? partA1C_translations,
      partA1A_breakdowns: byKey("partA1A_breakdowns") ?? partA1A_breakdowns,
      partB1A_breakdowns: byKey("partB1A_breakdowns") ?? partB1A_breakdowns,
      grammar1C: byKey("grammar1C") ?? grammar1C,
      // `meaning_my` (DB) maps to `meaningMy` (UI)
      vocab1B: ((vocab.data ?? []) as any[]).length
        ? ((vocab.data ?? []) as any[]).map((v) => ({
            word: v.word,
            pronunciation: v.pronunciation ?? "",
            meaningMy: v.meaning_my ?? "",
            exampleEn: v.example_en ?? undefined,
          }))
        : vocab1B,
    };

    return {
      unit: {
        unit: unitRow.code,
        unitTitle: unitRow.title,
        lessons: builtLessons,
        sections: builtSections,
      },
      supplement: built,
      source: "cloud",
    };
  } catch (error) {
    return localFallback(error instanceof Error ? error.message : String(error));
  }
}
