import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Languages,
  Lightbulb,
  ListChecks,
  Play,
  Sparkles,
  Volume2,
} from "lucide-react";

import tutorLogo from "@/assets/tutor-logo.png";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import unit1 from "@/data/textbookUnit1.json";
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
} from "@/data/unit1Supplement";
import { TAG_INFO } from "@/lib/sentenceStructure";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type SectionId = "1a" | "1b" | "1c";

export const Route = createFileRoute("/section/$sectionId")({
  component: SectionPage,
});

function SectionPage() {
  const { sectionId } = Route.useParams();
  const id = sectionId.toLowerCase() as SectionId;

  if (id !== "1a" && id !== "1b" && id !== "1c") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Section not found</h1>
          <Link to="/lessons" className="mt-4 inline-block text-primary underline">
            Back to lessons
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)]">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link
          to="/lessons"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to lessons
        </Link>
        {id === "1a" && <Section1A />}
        {id === "1b" && <Section1B />}
        {id === "1c" && <Section1C />}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared atoms                                                        */
/* ------------------------------------------------------------------ */

function OwlBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
      <img src={tutorLogo} alt="" className="h-8 w-8 shrink-0" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function ToggleReveal({
  label,
  hiddenLabel,
  children,
  icon: Icon = Eye,
  tone = "amber",
}: {
  label: string;
  hiddenLabel?: string;
  children: React.ReactNode;
  icon?: typeof Eye;
  tone?: "amber" | "primary" | "emerald";
}) {
  const [open, setOpen] = useState(false);
  const toneClass = {
    amber: "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
    primary: "border-primary/30 bg-primary/5",
    emerald: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
  }[tone];
  return (
    <div className="mt-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <EyeOff className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
        {open ? hiddenLabel ?? "Hide" : label}
      </Button>
      {open && <div className={`mt-2 rounded-lg border p-3 text-sm leading-relaxed ${toneClass}`}>{children}</div>}
    </div>
  );
}

function StructureBreakdown({
  questionText,
  breakdown,
}: {
  questionText: string;
  breakdown?: SentenceBreakdown;
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const info = activeTag ? TAG_INFO[activeTag] : null;
  const sentence = questionText.trim();

  if (!breakdown) {
    return (
      <div className="text-sm text-muted-foreground">
        🦉 ဒီမေးခွန်းအတွက် ဝါကျဖွဲ့စည်းပုံ ရှင်းလင်းချက်ကို မကြာမီ ထည့်ပေးပါမည်။
      </div>
    );
  }

  const { cars, introMy, noteMy } = breakdown;

  return (
    <div>
      {/* Header */}
      <h3 className="text-base font-bold leading-snug">
        🚂 Sentence: <span className="italic">"{sentence}"</span>
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{introMy}</p>

      {/* Inline train of cars — wraps naturally on mobile */}
      <div className="mt-4 flex flex-wrap items-center gap-y-6 gap-x-2 w-full">
        {cars.map((car, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg bg-slate-50"
          >
            <span className="text-sm font-bold leading-tight text-slate-900">
              {car.word}
            </span>
            <span className="mt-1 text-[11px] leading-tight text-slate-600">
              ({car.translation})
            </span>
            <button
              type="button"
              onClick={() => setActiveTag(car.tag)}
              className="mt-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
              aria-label={`Explain ${car.tag}`}
            >
              [{car.tag}]
            </button>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs italic text-muted-foreground">📐 {noteMy}</p>

      {/* Right-side drawer for tag explanation */}
      <Sheet open={!!activeTag} onOpenChange={(o) => !o && setActiveTag(null)}>
        <SheetContent side="right" className="w-[88vw] sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{info ? info.titleMy : ""}</SheetTitle>
            <SheetDescription className="text-xs font-mono">[{activeTag}]</SheetDescription>
          </SheetHeader>
          {info && (
            <div className="mt-4 space-y-3 text-sm leading-relaxed">
              <p>{info.bodyMy}</p>
              {info.example && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                  <p className="text-[11px] font-semibold uppercase tracking-wider">Example</p>
                  <p className="mt-1 font-medium">{info.example}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                🦉 ဆရာ ဇီးကွက် — ဒီအပိုင်းကို နားလည်ပြီးရင် မေးခွန်းကို ပြန်ကြိုးစားကြည့်ပါ။
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AnswerTryBox({
  correct,
  placeholder = "Type your answer here…",
}: {
  correct: string;
  placeholder?: string;
}) {
  const [val, setVal] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState<null | boolean>(null);

  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/[.,!?;:"'`']/g, "").replace(/\s+/g, " ");
  const isMatch = () => {
    const a = normalize(val);
    if (!a) return false;
    return correct
      .split(/[;,/]| or /i)
      .map(normalize)
      .some((c) => c === a || (a.length > 3 && c.includes(a)));
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setChecked(null);
          }}
          placeholder={placeholder}
          disabled={revealed}
          className="flex-1"
        />
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setChecked(isMatch())}
          disabled={!val.trim() || revealed}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Check Answer
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5"
          onClick={() => setRevealed((v) => !v)}
        >
          <Lightbulb className="h-3.5 w-3.5" /> {revealed ? "Hide Answer" : "Reveal Answer"}
        </Button>
      </div>
      {checked === true && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          ✅ မှန်ပါတယ်! တော်လိုက်တာ။
        </div>
      )}
      {checked === false && (
        <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
          ❌ နည်းနည်းလွဲသွားတယ်နော် — ထပ်စဉ်းစားကြည့်ပါ၊ ဒါမှမဟုတ် "Reveal Answer" နှိပ်ပါ။
        </div>
      )}
      {revealed && (
        <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span className="font-semibold">Answer: </span>
          {correct}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 1A — Reading + Comprehension                                */
/* ------------------------------------------------------------------ */

function Section1A() {
  const data = unit1.sections[0] as any; // 1A
  const passage = data.reading_passage;
  const comp = data.comprehension;

  const [showFullMy, setShowFullMy] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* LEFT — Reading Passage */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <span className="rounded-full bg-primary/10 px-2.5 py-1">1A · Reading</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight">{data.topic}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{passage.title}</p>

        <Button
          size="sm"
          variant={showFullMy ? "default" : "outline"}
          className="mt-3 gap-1.5"
          onClick={() => setShowFullMy((v) => !v)}
        >
          <Languages className="h-3.5 w-3.5" />
          {showFullMy ? "Hide all Burmese" : "Translate Whole Passage to Burmese"}
        </Button>

        <div className="mt-4 space-y-5">
          {passage.paragraphs.map((p: any) => (
            <ParagraphBlock key={p.paragraph_id} block={p} forceShowMy={showFullMy} />
          ))}
        </div>
      </section>

      {/* RIGHT — Interactive Saya Owl + Exercises */}
      <section className="space-y-5">
        <OwlBadge>
          <p className="font-semibold">မင်္ဂလာပါ! ဆရာ ဇီးကွက်ပါ 🦉</p>
          <p>
            ဘယ်ဘက်က စာပိုဒ်ကို သေသေချာချာ ဖတ်ပါ။ ပြီးရင် ညာဘက်က လေ့ကျင့်ခန်း A, B, C တစ်ခုချင်း ဖြေကြည့်ပါ။ <strong>အဖြေတွေကို မပြသေးပါဘူး</strong> — ကိုယ်တိုင် စဉ်းစားပြီး ကြိုးစားကြည့်ပါ။
          </p>
        </OwlBadge>

        <ExerciseGroup
          title="Exercise A — Fill in the blanks"
          titleMy="လေ့ကျင့်ခန်း A — ကွက်လပ်များ ဖြည့်ပါ"
          instructions={comp.part_A.instructions}
          items={comp.part_A.exercises.map((e: any) => ({
            id: e.question_number,
            text: e.text,
            translation: partA1A_translations[e.question_number] ?? "",
            answer: e.answer,
            breakdown: partA1A_breakdowns[e.question_number],
          }))}
        />

        <ExerciseGroup
          title="Exercise B — Short answers"
          titleMy="လေ့ကျင့်ခန်း B — အတိုချုံး အဖြေများ"
          instructions={comp.part_B.instructions}
          items={comp.part_B.exercises.map((e: any) => ({
            id: e.question_number,
            text: e.question,
            translation: partB1A_translations[e.question_number] ?? "",
            answer: e.answer,
            breakdown: partB1A_breakdowns[e.question_number],
          }))}
        />

        <ExerciseGroup
          title="Exercise C — Function of each utterance"
          titleMy="လေ့ကျင့်ခန်း C — စကားလုံးတစ်ခုစီ၏ လုပ်ဆောင်ချက်"
          instructions={comp.part_C.instructions}
          enableStructure={false}
          items={comp.part_C.exercises.map((e: any) => ({
            id: e.question_number,
            text: `"${e.utterance}"`,
            translation: partC1A_translations[e.question_number] ?? "",
            answer: e.function,
          }))}
        />
      </section>
    </div>
  );
}

function ParagraphBlock({
  block,
  forceShowMy,
}: {
  block: { paragraph_id: number; lines: string; english_text: string; burmese_explanation: string };
  forceShowMy: boolean;
}) {
  const [showMy, setShowMy] = useState(false);
  const visible = forceShowMy || showMy;
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-muted-foreground">¶ {block.paragraph_id} · lines {block.lines}</span>
        {!forceShowMy && (
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => setShowMy((v) => !v)}>
            <Languages className="h-3 w-3" />
            {showMy ? "Hide Burmese" : "Translate Paragraph"}
          </Button>
        )}
      </div>
      <p className="mt-2 leading-relaxed">{block.english_text}</p>
      {visible && (
        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">
          <span className="text-xs font-semibold">🌐 မြန်မာ ဘာသာပြန် — </span>
          {block.burmese_explanation}
        </div>
      )}
    </div>
  );
}

type ExItem = { id: number; text: string; translation: string; answer: string };

function ExerciseGroup({
  title,
  titleMy,
  instructions,
  items,
  enableStructure = true,
}: {
  title: string;
  titleMy: string;
  instructions: string;
  items: ExItem[];
  enableStructure?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
        <ListChecks className="h-3.5 w-3.5" /> {title}
      </div>
      <h3 className="mt-1 text-base font-semibold">{titleMy}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{instructions}</p>

      <ol className="mt-4 space-y-4">
        {items.map((q) => (
          <li key={q.id} className="rounded-xl border border-border bg-background p-3">
            <div className="flex gap-2">
              <span className="text-sm font-bold text-primary">{q.id}.</span>
              <p className="text-sm font-medium leading-relaxed">{q.text}</p>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <ToggleReveal label="Translate Question" icon={Languages}>
                {q.translation || "မြန်မာ ဘာသာပြန် မရရှိနိုင်ပါ။"}
              </ToggleReveal>
              {enableStructure && (
                <ToggleReveal label="Sentence Structure" icon={Sparkles} tone="primary">
                  <StructureBreakdown questionText={q.text.replace(/^"|"$/g, "")} />
                </ToggleReveal>
              )}
            </div>

            <AnswerTryBox correct={q.answer} />
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 1B — Vocabulary + Sentence Rewriting                        */
/* ------------------------------------------------------------------ */

function Section1B() {
  const data = unit1.sections[1] as any; // 1B
  const partB = data.part_B;
  const partA = data.part_A;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <span className="rounded-full bg-primary/10 px-2.5 py-1">1B · Vocabulary</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight">{data.topic}</h1>
        <OwlBadge>
          ဒီအပိုင်းမှာ နိုင်ငံ၊ နိုင်ငံသား၊ ဘာသာစကား ဝေါဟာရတွေကို အသံထွက်နဲ့တစ်ခြင်း သုံးမည် ဖြစ်ပါတယ်။ ပြီးရင် ဝါကျတွေကို ပြန်ရေးရတဲ့ လေ့ကျင့်ခန်းကို ဖြေရမှာပါ။ <strong>အဖြေတွေကို မပြသေးပါဘူး</strong> — ကိုယ်တိုင် စဉ်းစားပြီး ကြိုးစားကြည့်ပါ။
        </OwlBadge>
      </header>

      {/* Vocabulary list */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <BookOpen className="h-3.5 w-3.5" /> Vocabulary — Word · Pronunciation · မြန်မာ အဓိပ္ပာယ်
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {vocab1B.map((v) => (
            <VocabCard key={v.word} item={v} />
          ))}
        </div>

        {/* Reference table from JSON */}
        <details className="mt-5">
          <summary className="cursor-pointer text-sm font-semibold text-primary">
            📋 Reference Table (Exercise A — Countries / Nationalities / Languages)
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-secondary">
                <tr>
                  {partA.headers.map((h: any) => (
                    <th key={h} className="px-2 py-1.5 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partA.table_data.map((r: any) => (
                  <tr key={r.country} className="border-b border-border">
                    <td className="px-2 py-1.5">{r.country}</td>
                    <td className="px-2 py-1.5">{r.nationality}</td>
                    <td className="px-2 py-1.5">{r.language}</td>
                    <td className="px-2 py-1.5">{r.adjective}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      {/* Exercise B — rewrite sentences */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <ListChecks className="h-3.5 w-3.5" /> Exercise B — Rewrite each sentence
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{partB.instructions}</p>

        <ol className="mt-4 space-y-4">
          {partB.exercises.map((q: any) => (
            <li key={q.question_number} className="rounded-xl border border-border bg-background p-3">
              <div className="flex gap-2">
                <span className="text-sm font-bold text-primary">{q.question_number}.</span>
                <p className="text-sm font-medium leading-relaxed">{q.text}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <ToggleReveal label="Show Translation" icon={Languages}>
                  {partB1B_translations[q.question_number] ?? "မြန်မာ ဘာသာပြန် မရရှိနိုင်ပါ။"}
                </ToggleReveal>
              </div>
              <AnswerTryBox correct={q.answer} placeholder="Fill in the missing word…" />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function VocabCard({ item }: { item: { word: string; pronunciation: string; meaningMy: string } }) {
  const speak = () => {
    if (typeof window === "undefined") return;
    const u = new SpeechSynthesisUtterance(item.word);
    u.lang = "en-US";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-bold">{item.word}</span>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={speak} aria-label={`Speak ${item.word}`}>
          <Volume2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{item.pronunciation}</p>
      <p className="mt-1 text-sm">🇲🇲 {item.meaningMy}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 1C — Grammar Focus (Nouns in Apposition)                    */
/* ------------------------------------------------------------------ */

function Section1C() {
  const data = unit1.sections[2] as any; // 1C
  const partA = data.part_A;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <span className="rounded-full bg-primary/10 px-2.5 py-1">1C · Grammar</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight">{data.topic}</h1>
      </header>

      {/* Owl explanation */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <OwlBadge>
          <p className="font-semibold">ဆရာ ဇီးကွက်ရဲ့ ရှင်းပြချက် 🦉</p>
        </OwlBadge>
        <div className="mt-3 space-y-3 text-sm leading-relaxed">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold text-primary">📘 ဘာလဲ? (What)</p>
            <p className="mt-1">{grammar1C.whatMy}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold text-primary">⏰ ဘယ်အချိန် သုံးလဲ? (When)</p>
            <p className="mt-1">{grammar1C.whenMy}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold text-primary">💡 ဘာကြောင့်? (Why)</p>
            <p className="mt-1">{grammar1C.whyMy}</p>
          </div>
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:bg-amber-950/30">
            <p className="text-xs font-semibold">✨ Examples</p>
            <ul className="mt-1 space-y-1">
              {grammar1C.examples.map((e, i) => (
                <li key={i} className="text-sm">
                  {e.en.split(e.apposition)[0]}
                  <mark className="rounded bg-amber-200 px-1 dark:bg-amber-700/50">{e.apposition}</mark>
                  {e.en.split(e.apposition)[1]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* YouTube video */}
      {grammar1C.youtubeId && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Play className="h-3.5 w-3.5" /> Video — {grammar1C.youtubeTitle}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Watch this video to understand appositives better:</p>
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${grammar1C.youtubeId}?modestbranding=1&rel=0`}
              title={grammar1C.youtubeTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <p className="mt-2 text-xs italic text-muted-foreground">📝 {grammar1C.subtitleNoteMy}</p>
        </section>
      )}

      {/* Exercise A — spot apposition */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <ListChecks className="h-3.5 w-3.5" /> Exercise A — Spot the noun in apposition
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{partA.instructions}</p>

        <ol className="mt-4 space-y-4">
          {partA.exercises.map((q: any) => (
            <li key={q.question_number} className="rounded-xl border border-border bg-background p-3">
              <div className="flex gap-2">
                <span className="text-sm font-bold text-primary">{q.question_number}.</span>
                <p className="text-sm font-medium leading-relaxed">{q.text}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <ToggleReveal label="Translate" icon={Languages}>
                  {partA1C_translations[q.question_number] ?? "မြန်မာ ဘာသာပြန် မရရှိနိုင်ပါ။"}
                </ToggleReveal>
              </div>
              <AnswerTryBox
                correct={q.apposition_phrases.join(" ; ")}
                placeholder="Type the noun-in-apposition phrase…"
              />
            </li>
          ))}
        </ol>
      </section>

      <div className="flex justify-end">
        <Link
          to="/lessons"
          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Back to Unit 1 lessons <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
