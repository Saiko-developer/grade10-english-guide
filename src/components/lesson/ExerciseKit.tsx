/**
 * Shared lesson-exercise presentation kit.
 *
 * These are the exact building blocks used by the dedicated Lesson Page
 * (/section/$sectionId). The homepage unit workspace imports the very same
 * components so both surfaces have perfect feature parity: translation
 * blocks, sentence-structure "train", answer validation and audio triggers.
 */
import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Languages,
  Lightbulb,
  ListChecks,
  Sparkles,
  Volume2,
} from "lucide-react";

import tutorLogo from "@/assets/tutor-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type SentenceBreakdown } from "@/data/unit1Supplement";
import { TAG_INFO } from "@/lib/sentenceStructure";

export function OwlBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
      <img src={tutorLogo} alt="" className="h-8 w-8 shrink-0" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function ToggleReveal({
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
    emerald:
      "border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
  }[tone];
  return (
    <div className="mt-2">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen((v) => !v)}>
        {open ? <EyeOff className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
        {open ? (hiddenLabel ?? "Hide") : label}
      </Button>
      {open && (
        <div className={`mt-2 rounded-lg border p-3 text-sm leading-relaxed ${toneClass}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export function StructureBreakdown({
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
      <h3 className="text-base font-bold leading-snug">
        🚂 Sentence: <span className="italic">&quot;{sentence}&quot;</span>
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{introMy}</p>

      <div className="mt-4 flex w-full flex-wrap items-center gap-x-2 gap-y-6">
        {cars.map((car, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <span className="text-sm font-bold leading-tight text-slate-900">{car.word}</span>
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

      <Sheet open={!!activeTag} onOpenChange={(o) => !o && setActiveTag(null)}>
        <SheetContent side="right" className="w-[88vw] sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{info ? info.titleMy : ""}</SheetTitle>
            <SheetDescription className="font-mono text-xs">[{activeTag}]</SheetDescription>
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

export function AnswerTryBox({
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
    s
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:"'`']/g, "")
      .replace(/\s+/g, " ");
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
          ❌ နည်းနည်းလွဲသွားတယ်နော် — ထပ်စဉ်းစားကြည့်ပါ၊ ဒါမှမဟုတ် &quot;Reveal Answer&quot; နှိပ်ပါ။
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

export function ParagraphBlock({
  block,
  forceShowMy,
}: {
  block: {
    paragraph_id: number;
    lines: string;
    english_text: string;
    burmese_explanation: string;
  };
  forceShowMy: boolean;
}) {
  const [showMy, setShowMy] = useState(false);
  const visible = forceShowMy || showMy;
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          ¶ {block.paragraph_id} · lines {block.lines}
        </span>
        {!forceShowMy && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 text-xs"
            onClick={() => setShowMy((v) => !v)}
          >
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

export function VocabCard({
  item,
}: {
  item: { word: string; pronunciation: string; meaningMy: string };
}) {
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
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={speak}
          aria-label={`Speak ${item.word}`}
        >
          <Volume2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{item.pronunciation}</p>
      <p className="mt-1 text-sm">🇲🇲 {item.meaningMy}</p>
    </div>
  );
}

export type ExItem = {
  id: number;
  text: string;
  translation: string;
  answer: string;
  breakdown?: SentenceBreakdown;
};

export function ExerciseGroup({
  title,
  titleMy,
  instructions,
  items,
  enableStructure = true,
  placeholder,
}: {
  title: string;
  titleMy: string;
  instructions: string;
  items: ExItem[];
  enableStructure?: boolean;
  placeholder?: string;
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
                  <StructureBreakdown
                    questionText={q.text.replace(/^"|"$/g, "")}
                    breakdown={q.breakdown}
                  />
                </ToggleReveal>
              )}
            </div>

            <AnswerTryBox correct={q.answer} placeholder={placeholder} />
          </li>
        ))}
      </ol>
    </div>
  );
}
