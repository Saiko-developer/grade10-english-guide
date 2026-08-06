import { useState } from "react";
import { ArrowLeft, BookOpen, Headphones, MessageSquare, PenLine, SpellCheck, Type } from "lucide-react";

import { SayaOwl } from "@/components/SayaOwl";
import { UnitSkillView } from "@/components/lesson/UnitSkillView";
import { getSyllabusUnit } from "@/lib/localData";
import type { PracticeSkill } from "@/lib/practice";

const SKILL_ICONS: Record<PracticeSkill, typeof BookOpen> = {
  reading: BookOpen,
  vocabulary: SpellCheck,
  grammar: Type,
  listening: Headphones,
  speaking: MessageSquare,
  writing: PenLine,
};

type PracticeWorkspaceProps = {
  unit: string;
  skill: PracticeSkill;
  onBack: () => void;
  backLabel?: string;
};

/**
 * Homepage unit workspace — renders the exact same exercise experience as the
 * dedicated Lesson Page, driven by the authentic data in src/data.
 */
export function PracticeWorkspace({
  unit,
  skill,
  onBack,
  backLabel = "Back to lessons",
}: PracticeWorkspaceProps) {
  const unitNumber = Number(unit);
  const syllabus = getSyllabusUnit(unitNumber);
  const [activeQuestion] = useState<string | null>(null);

  const label = skill.charAt(0).toUpperCase() + skill.slice(1);
  const Icon = SKILL_ICONS[skill];
  const lessonContext = `Unit ${unit} — ${syllabus?.title ?? "Grade 10 English"} · ${label}`;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </button>

      <header className="mt-4 flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Unit {unit} · {label}
          </p>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            {syllabus?.title ?? `${label} practice`}
          </h2>
        </div>
      </header>

      <div className="mt-5">
        <UnitSkillView unit={unitNumber} skill={skill} />
      </div>

      <SayaOwl lessonContext={lessonContext} currentQuestion={activeQuestion} />
    </div>
  );
}
