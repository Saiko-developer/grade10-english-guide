import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  EyeOff,
  Headphones,
  PenLine,
  RotateCcw,
  SpellCheck,
  Type,
  MessageSquare,
} from "lucide-react";

import { SayaOwl } from "@/components/SayaOwl";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchPracticeLesson,
  normalizeSkill,
  type PracticeLesson,
  type PracticeQuestion,
  type PracticeSkill,
} from "@/lib/practice";

export const Route = createFileRoute("/practice/$unit/$skill")({
  head: ({ params }) => {
    const label = params.skill.charAt(0).toUpperCase() + params.skill.slice(1);
    const title = `${label} Practice — Unit ${params.unit} | Sayar Owl Academy`;
    const description = `Interactive ${label.toLowerCase()} practice for Unit ${params.unit} of the Grade 10 Myanmar English textbook, with Saya Owl guiding you question by question.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PracticePage,
});

const SKILL_ICONS: Record<PracticeSkill, typeof BookOpen> = {
  reading: BookOpen,
  vocabulary: SpellCheck,
  grammar: Type,
  listening: Headphones,
  speaking: MessageSquare,
  writing: PenLine,
};

function PracticePage() {
  const { unit, skill: rawSkill } = Route.useParams();
  const skill = normalizeSkill(rawSkill);

  const { data, isLoading } = useQuery({
    queryKey: ["practice", unit, skill],
    queryFn: () => (skill ? fetchPracticeLesson(unit, skill) : Promise.resolve(null)),
    enabled: Boolean(skill),
    staleTime: 5 * 60_000,
  });

  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const label = rawSkill.charAt(0).toUpperCase() + rawSkill.slice(1);
  const Icon = skill ? SKILL_ICONS[skill] : BookOpen;

  const lessonContext = data
    ? `Unit ${unit} — ${data.code} ${data.type ?? label}: ${data.title}. ${data.intro ?? ""}`
    : `Unit ${unit} — ${label} practice`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to curriculum
        </Link>

        <header className="mt-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Unit {unit} · {label}
              </p>
              <h1 className="text-2xl font-bold tracking-tight">
                {data?.title ?? `${label} practice`}
              </h1>
              {data?.titleMy && (
                <p className="mt-1 text-sm text-muted-foreground">{data.titleMy}</p>
              )}
            </div>
          </div>

          {data?.intro && (
            <div className="mt-5 rounded-xl bg-secondary/50 p-4">
              <p className="text-sm leading-relaxed">{data.intro}</p>
              {data.introMy && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {data.introMy}
                </p>
              )}
            </div>
          )}
        </header>

        {isLoading && (
          <p className="mt-8 text-sm text-muted-foreground">Loading lesson from the database…</p>
        )}

        {!isLoading && !data && (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium">
              This {label.toLowerCase()} lesson isn&apos;t in the database yet.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Unit 1 is fully available — more units are on the way. Saya Owl can still help you
              practise right now.
            </p>
          </div>
        )}

        {data && skill && (
          <div className="mt-8 space-y-8">
            {skill === "listening" || skill === "speaking" ? (
              <ListeningView lesson={data} onFocus={setActiveQuestion} />
            ) : skill === "vocabulary" ? (
              <VocabularyView lesson={data} onFocus={setActiveQuestion} />
            ) : skill === "writing" ? (
              <WritingView lesson={data} onFocus={setActiveQuestion} />
            ) : (
              <ReadingView lesson={data} onFocus={setActiveQuestion} />
            )}
          </div>
        )}
      </main>

      <SayaOwl lessonContext={lessonContext} currentQuestion={activeQuestion} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-primary">
      {children}
    </h2>
  );
}

type ViewProps = {
  lesson: PracticeLesson;
  onFocus: (q: string | null) => void;
};

/** Reading — Q&A with reveal-able suggested answers. */
function ReadingView({ lesson, onFocus }: ViewProps) {
  return (
    <section>
      <SectionTitle>Comprehension questions</SectionTitle>
      <div className="space-y-3">
        {lesson.questions.map((q) => (
          <RevealCard key={q.id} q={q} onFocus={onFocus} />
        ))}
      </div>
      {lesson.bonusQuestions.length > 0 && (
        <div className="mt-8">
          <SectionTitle>Bonus questions</SectionTitle>
          <div className="space-y-3">
            {lesson.bonusQuestions.map((q) => (
              <RevealCard key={q.id} q={q} onFocus={onFocus} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function RevealCard({ q, onFocus }: { q: PracticeQuestion; onFocus: ViewProps["onFocus"] }) {
  const [shown, setShown] = useState(false);
  const answer = q.suggestedAnswer ?? q.answer;
  return (
    <article
      onFocus={() => onFocus(q.question)}
      onMouseEnter={() => onFocus(q.question)}
      tabIndex={-1}
      className="rounded-xl border border-border bg-card p-4"
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
            {shown ? "Hide answer" : "Reveal suggested answer"}
          </Button>
          {shown && (
            <p className="mt-2 rounded-lg bg-secondary/60 p-3 text-sm leading-relaxed">
              {answer}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

/** Vocabulary — tap-to-flip flashcards. */
function VocabularyView({ lesson, onFocus }: ViewProps) {
  const cards = [...lesson.questions, ...lesson.bonusQuestions];
  return (
    <section>
      <SectionTitle>Flashcards — tap a card to reveal</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((q) => (
          <Flashcard key={q.id} q={q} onFocus={onFocus} />
        ))}
      </div>
    </section>
  );
}

function Flashcard({ q, onFocus }: { q: PracticeQuestion; onFocus: ViewProps["onFocus"] }) {
  const [flipped, setFlipped] = useState(false);
  const answer = q.suggestedAnswer ?? q.answer;
  return (
    <button
      type="button"
      onClick={() => {
        onFocus(q.question);
        setFlipped((v) => !v);
      }}
      className={`flex min-h-28 w-full flex-col justify-between rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
        flipped ? "border-primary/50 bg-primary/5" : "border-border bg-card"
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

/** Listening & Speaking — audio player, fill-in-the-blanks, interview questions. */
function ListeningView({ lesson, onFocus }: ViewProps) {
  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-5">
        <SectionTitle>Listen</SectionTitle>
        {lesson.audioUrl ? (
          <audio controls preload="none" className="w-full" src={lesson.audioUrl}>
            Your browser does not support audio playback.
          </audio>
        ) : (
          <p className="text-sm text-muted-foreground">
            The audio track for this lesson hasn&apos;t been uploaded yet. You can still try the
            fill-in-the-blanks below and ask Saya Owl to read the sentences to you.
          </p>
        )}
      </div>

      <div>
        <SectionTitle>Fill in the blanks</SectionTitle>
        <div className="space-y-3">
          {lesson.questions.map((q) => (
            <RevealCard key={q.id} q={q} onFocus={onFocus} />
          ))}
        </div>
      </div>

      {lesson.bonusQuestions.length > 0 && (
        <div>
          <SectionTitle>Speaking — interview your partner</SectionTitle>
          <div className="space-y-3">
            {lesson.bonusQuestions.map((q) => (
              <RevealCard key={q.id} q={q} onFocus={onFocus} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** Writing — topic, student textarea, model answer. */
function WritingView({ lesson, onFocus }: ViewProps) {
  const task = lesson.questions[0];
  const [draft, setDraft] = useState("");
  const [showModel, setShowModel] = useState(false);

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-5">
        <SectionTitle>Your writing task</SectionTitle>
        <p className="text-sm leading-relaxed">{task?.question ?? lesson.title}</p>
      </div>

      {lesson.bonusQuestions.length > 0 && (
        <div className="rounded-2xl border border-border bg-secondary/40 p-5">
          <SectionTitle>Suggested points</SectionTitle>
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            {lesson.bonusQuestions.map((q) => (
              <li key={q.id}>{q.question}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <SectionTitle>Write your paragraph</SectionTitle>
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
              onFocus(
                `${task?.question ?? lesson.title}\n\nStudent draft:\n${draft || "(empty)"}`,
              );
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
      </div>
    </section>
  );
}
