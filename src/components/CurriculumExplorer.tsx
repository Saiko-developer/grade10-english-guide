import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Headphones,
  MessageSquare,
  PenLine,
  Play,
  SpellCheck,
  Sparkles,
  Type,
} from "lucide-react";

import { AppositionQuiz } from "@/components/AppositionQuiz";
import { SYLLABUS, type SkillKind, type SyllabusSkill } from "@/data/syllabus";

const SKILL_ICONS: Record<SkillKind, typeof BookOpen> = {
  listening: Headphones,
  reading: BookOpen,
  speaking: MessageSquare,
  writing: PenLine,
  vocabulary: SpellCheck,
  grammar: Type,
};

const GROUPS: { title: string; hint: string; kinds: SkillKind[] }[] = [
  { title: "Receptive Skills", hint: "Take language in", kinds: ["listening", "reading"] },
  { title: "Productive Skills", hint: "Put language out", kinds: ["speaking", "writing"] },
  {
    title: "Knowledge about Language",
    hint: "Build the system",
    kinds: ["vocabulary", "grammar"],
  },
];

export function CurriculumExplorer() {
  const [openUnit, setOpenUnit] = useState<number | null>(1);
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <div className="space-y-3">
      {SYLLABUS.map((node) => {
        if (node.type === "banner") {
          return (
            <div
              key={node.id}
              className="flex items-center gap-3 rounded-xl border border-dashed border-accent/60 bg-accent/15 px-4 py-2.5"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-accent-foreground" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground">
                {node.review}
              </span>
              <span className="h-px flex-1 bg-accent/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground">
                {node.poem}
              </span>
            </div>
          );
        }

        const isOpen = openUnit === node.number;
        return (
          <div
            key={node.number}
            className={`overflow-hidden rounded-2xl border bg-card transition ${
              isOpen ? "border-primary/40 shadow-md" : "border-border hover:border-primary/30"
            }`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenUnit(isOpen ? null : node.number)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition ${
                  isOpen
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {node.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Unit {node.number}
                </span>
                <span className="block truncate text-base font-semibold tracking-tight">
                  {node.title}
                </span>
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="grid gap-4 border-t border-border/70 px-5 py-5 md:grid-cols-3">
                  {GROUPS.map((group) => (
                    <div key={group.title}>
                      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                        {group.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{group.hint}</div>
                      <div className="mt-3 space-y-2">
                        {group.kinds.map((kind) => {
                          const skill = node.skills.find((s) => s.kind === kind) as SyllabusSkill;
                          const Icon = SKILL_ICONS[kind];
                          const interactive = Boolean(skill.quiz);
                          return (
                            <button
                              key={kind}
                              type="button"
                              disabled={!interactive}
                              onClick={() => interactive && setQuizOpen(true)}
                              className={`group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                                interactive
                                  ? "cursor-pointer border-primary/40 bg-primary/5 hover:-translate-y-0.5 hover:shadow-md"
                                  : "border-border bg-background hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
                              }`}
                            >
                              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-xs font-semibold">{skill.label}</span>
                                <span className="block text-xs text-muted-foreground">
                                  {skill.detail}
                                </span>
                                {interactive && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                                    <Play className="h-3 w-3" /> Start live quiz
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <AppositionQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </div>
  );
}
