import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  EyeOff,
  Headphones,
  MessageSquare,
  PenLine,
  RotateCcw,
  SpellCheck,
  Type,
} from "lucide-react";

import { LessonAudioPlayer } from "@/components/LessonAudioPlayer";
import { SayaOwl } from "@/components/SayaOwl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import tutorLogo from "@/assets/tutor-logo.png";
import {
  fetchLessonMaterial,
  fetchPracticeLesson,
  type LessonMaterial,
  type PracticeLesson,
  type PracticeQuestion,
  type PracticeSkill,
} from "@/lib/practice";

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

/** Split-screen lesson workspace: source material left, guided practice right. */
export function PracticeWorkspace({
  unit,
  skill,
  onBack,
  backLabel = "Back to lessons",
}: PracticeWorkspaceProps) {
  const { data: lesson, isLoading } = useQuery({
    queryKey: ["practice", unit, skill],
    queryFn: () => fetchPracticeLesson(unit, skill),
    staleTime: 5 * 60_000,
  });

  const { data: material } = useQuery({
    queryKey: ["practice-material", lesson?.code],
    queryFn: () => fetchLessonMaterial(lesson!.code),
    enabled: Boolean(lesson?.code),
    staleTime: 5 * 60_000,
  });

  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const label = skill.charAt(0).toUpperCase() + skill.slice(1);
  const Icon = SKILL_ICONS[skill];
  const lessonContext = lesson
    ? `Unit ${unit} — ${lesson.code} ${lesson.type ?? label}: ${lesson.title}. ${lesson.intro ?? ""}`
    : `Unit ${unit} — ${label} practice`;

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
            Unit {unit} · {lesson?.code ?? ""} {label}
          </p>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            {lesson?.title ?? `${label} practice`}
          </h2>
          {lesson?.titleMy && (
            <p className="mt-1 text-sm text-muted-foreground">{lesson.titleMy}</p>
          )}
        </div>
      </header>

      {isLoading && (
        <p className="mt-6 text-sm text-muted-foreground">Loading lesson from the database…</p>
      )}

      {!isLoading && !lesson && (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">
            This {label.toLowerCase()} lesson isn&apos;t in the database yet.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Unit 1 is fully available — more units are on the way.
          </p>
        </div>
      )}

      {lesson && (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* LEFT — source material */}
          <div className="space-y-4">
            <SourceColumn lesson={lesson} material={material} skill={skill} />
          </div>

          {/* RIGHT — Burmese helper + interactive questions */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <img src={tutorLogo} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 text-sm">
                <p className="font-semibold">Saya Owl 🦉</p>
                <p className="mt-0.5 leading-relaxed text-muted-foreground">
                  {lesson.introMy ??
                    "အောက်ကမေးခွန်းတွေကို ဖြေကြည့်ပါ။ မရရင် ကျွန်တော့်ကို မေးလိုက်ပါ။"}
                </p>
              </div>
            </div>

            {skill === "vocabulary" ? (
              <VocabularyExercises lesson={lesson} onFocus={setActiveQuestion} />
            ) : skill === "writing" ? (
              <WritingExercises lesson={lesson} onFocus={setActiveQuestion} />
            ) : skill === "listening" || skill === "speaking" ? (
              <ListeningExercises lesson={lesson} skill={skill} onFocus={setActiveQuestion} />
            ) : (
              <QuestionExercises lesson={lesson} onFocus={setActiveQuestion} />
            )}
          </div>
        </div>
      )}

      <SayaOwl lessonContext={lessonContext} currentQuestion={activeQuestion} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-primary">{title}</h3>
      {children}
    </section>
  );
}

function SourceColumn({
  lesson,
  material,
  skill,
}: {
  lesson: PracticeLesson;
  material?: LessonMaterial;
  skill: PracticeSkill;
}) {
  const transcript =
    material?.paragraphs.map((p) => p.english).join(" ") ||
    lesson.intro ||
    lesson.title;

  return (
    <>
      {(skill === "listening" || skill === "speaking") && (
        <LessonAudioPlayer
          src={lesson.audioUrl}
          script={transcript}
          label={skill === "speaking" ? "Model pronunciation" : "Listening track"}
          hint={
            skill === "speaking"
              ? "နမူနာ အသံထွက်ကို နားထောင်ပြီး လိုက်ဆိုကြည့်ပါ။"
              : "နားထောင်ပြီး ကွက်လပ်တွေကို ဖြည့်ပါ။"
          }
        />
      )}

      {lesson.intro && (
        <Panel title="Lesson">
          <p className="text-sm leading-relaxed">{lesson.intro}</p>
          {lesson.introMy && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lesson.introMy}</p>
          )}
        </Panel>
      )}

      {material && material.paragraphs.length > 0 && (
        <Panel title={material.passageTitle ?? "Reading passage"}>
          <div className="space-y-4">
            {material.paragraphs.map((p, i) => (
              <div key={i}>
                <p className="text-sm leading-relaxed">{p.english}</p>
                {p.burmese && (
                  <p className="mt-1.5 rounded-lg bg-secondary/50 p-2.5 text-sm leading-relaxed text-muted-foreground">
                    {p.burmese}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {material && material.vocabulary.length > 0 && (
        <Panel title="Word list">
          <ul className="divide-y divide-border/70">
            {material.vocabulary.map((v) => (
              <li key={v.word} className="py-2">
                <p className="text-sm font-semibold">{v.word}</p>
                {v.pronunciation && (
                  <p className="text-xs text-muted-foreground">{v.pronunciation}</p>
                )}
                {v.meaningMy && <p className="text-sm">{v.meaningMy}</p>}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {material?.grammar && (
        <Panel title="Grammar note">
          <div className="space-y-2 text-sm leading-relaxed">
            {material.grammar.whatMy && <p>{material.grammar.whatMy}</p>}
            {material.grammar.whyMy && (
              <p className="text-muted-foreground">{material.grammar.whyMy}</p>
            )}
            {material.grammar.whenMy && (
              <p className="text-muted-foreground">{material.grammar.whenMy}</p>
            )}
            {material.grammar.examples && material.grammar.examples.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {material.grammar.examples.map((e, i) => (
                  <li key={i} className="rounded-lg bg-secondary/50 p-2.5">
                    <span className="block font-medium">{e.en}</span>
                    {e.my && <span className="block text-muted-foreground">{e.my}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
      )}
    </>
  );
}

/* ------------------------- exercise columns ------------------------ */

type ExerciseProps = {
  lesson: PracticeLesson;
  onFocus: (q: string | null) => void;
};

function QuestionExercises({ lesson, onFocus }: ExerciseProps) {
  return (
    <>
      <Panel title="Exercise A — answer the questions">
        <div className="space-y-3">
          {lesson.questions.map((q) => (
            <RevealCard key={q.id} q={q} onFocus={onFocus} />
          ))}
        </div>
      </Panel>
      {lesson.bonusQuestions.length > 0 && (
        <Panel title="Exercise B — bonus questions">
          <div className="space-y-3">
            {lesson.bonusQuestions.map((q) => (
              <RevealCard key={q.id} q={q} onFocus={onFocus} />
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}

function ListeningExercises({
  lesson,
  skill,
  onFocus,
}: ExerciseProps & { skill: PracticeSkill }) {
  return (
    <>
      {skill === "listening" && (
        <Panel title="Exercise A — fill in the blanks">
          <div className="space-y-3">
            {lesson.questions.map((q) => (
              <RevealCard key={q.id} q={q} onFocus={onFocus} />
            ))}
          </div>
        </Panel>
      )}
      {lesson.bonusQuestions.length > 0 && (
        <Panel title={skill === "speaking" ? "Speak — interview practice" : "Exercise B — speaking"}>
          <div className="space-y-3">
            {lesson.bonusQuestions.map((q) => (
              <RevealCard key={q.id} q={q} onFocus={onFocus} />
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}

function VocabularyExercises({ lesson, onFocus }: ExerciseProps) {
  const cards = [...lesson.questions, ...lesson.bonusQuestions];
  return (
    <Panel title="Flashcards — tap to reveal">
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((q) => (
          <Flashcard key={q.id} q={q} onFocus={onFocus} />
        ))}
      </div>
    </Panel>
  );
}

function WritingExercises({ lesson, onFocus }: ExerciseProps) {
  const task = lesson.questions[0];
  const [draft, setDraft] = useState("");
  const [showModel, setShowModel] = useState(false);

  return (
    <>
      <Panel title="Your writing task">
        <p className="text-sm leading-relaxed">{task?.question ?? lesson.title}</p>
        {lesson.bonusQuestions.length > 0 && (
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {lesson.bonusQuestions.map((q) => (
              <li key={q.id}>{q.question}</li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Write your paragraph">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => onFocus(task?.question ?? lesson.title)}
          rows={10}
          placeholder="Start writing here… ဒီနေရာမှာ စရေးပါ။"
          className="text-sm leading-relaxed"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {draft.trim() ? draft.trim().split(/\s+/).length : 0} words
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onFocus(`${task?.question ?? lesson.title}\n\nStudent draft:\n${draft || "(empty)"}`);
              setShowModel((v) => !v);
            }}
          >
            {showModel ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showModel ? "Hide model answer" : "View model answer"}
          </Button>
        </div>
        {showModel && task?.suggestedAnswer && (
          <p className="mt-4 rounded-xl bg-secondary/60 p-4 text-sm leading-relaxed">
            {task.suggestedAnswer}
          </p>
        )}
      </Panel>
    </>
  );
}

function RevealCard({ q, onFocus }: { q: PracticeQuestion; onFocus: ExerciseProps["onFocus"] }) {
  const [shown, setShown] = useState(false);
  const answer = q.suggestedAnswer ?? q.answer;
  return (
    <article
      onMouseEnter={() => onFocus(q.question)}
      className="rounded-xl border border-border bg-background p-3.5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-primary">
          {q.number}
        </span>
        <p className="flex-1 text-sm font-medium leading-relaxed">{q.question}</p>
      </div>
      {answer && (
        <div className="mt-3 pl-9">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onFocus(q.question);
              setShown((v) => !v);
            }}
          >
            {shown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {shown ? "Hide answer" : "Reveal answer"}
          </Button>
          {shown && (
            <p className="mt-2 rounded-lg bg-secondary/60 p-3 text-sm leading-relaxed">{answer}</p>
          )}
        </div>
      )}
    </article>
  );
}

function Flashcard({ q, onFocus }: { q: PracticeQuestion; onFocus: ExerciseProps["onFocus"] }) {
  const [flipped, setFlipped] = useState(false);
  const answer = q.suggestedAnswer ?? q.answer;
  return (
    <button
      type="button"
      onClick={() => {
        onFocus(q.question);
        setFlipped((v) => !v);
      }}
      className={`flex min-h-28 w-full cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
        flipped ? "border-primary/50 bg-primary/5" : "border-border bg-background"
      }`}
    >
      <p className="text-sm font-medium leading-relaxed">{q.question}</p>
      <p className="mt-3 text-sm">
        {flipped ? (
          <span className="font-semibold text-primary">{answer ?? "—"}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <RotateCcw className="h-3 w-3" /> Tap to reveal
          </span>
        )}
      </p>
    </button>
  );
}
