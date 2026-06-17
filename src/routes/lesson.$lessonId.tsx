import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Globe2,
  Languages,
  MessageCircle,
  PartyPopper,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";

import tutorLogo from "@/assets/tutor-logo.png";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import unit1 from "@/data/textbookUnit1.json";

type Lesson = (typeof unit1.lessons)[number];
type Question = Lesson["questions"][number];

type Phase = "main" | "bonus-intro" | "bonus" | "reward";

export const Route = createFileRoute("/lesson/$lessonId")({
  component: LessonPage,
});

function normalize(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:"'`’]/g, "")
    .replace(/\s+/g, " ");
}

function isCorrect(input: string, answers: string[]) {
  const n = normalize(input);
  if (!n) return false;
  return answers.some((a) => normalize(a) === n);
}

function LessonPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

  const lesson = useMemo(
    () => unit1.lessons.find((l) => l.id === lessonId),
    [lessonId],
  );

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Lesson not found</h1>
          <Link to="/lessons" className="mt-4 inline-block text-primary underline">
            Back to lessons
          </Link>
        </main>
      </div>
    );
  }

  const [phase, setPhase] = useState<Phase>("main");
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [chatOpen, setChatOpen] = useState(false);

  const currentList: Question[] = phase === "bonus" ? lesson.bonusQuestions : lesson.questions;
  const currentQ = currentList[qIndex];

  const handleCheck = () => {
    if (!currentQ) return;
    if (isCorrect(answer, currentQ.answers)) {
      setResult("correct");
    } else {
      setResult("wrong");
    }
  };

  const handleNext = () => {
    setAnswer("");
    setResult("idle");
    if (phase === "main") {
      if (qIndex + 1 < lesson.questions.length) {
        setQIndex(qIndex + 1);
      } else {
        setPhase("bonus-intro");
        setQIndex(0);
      }
    } else if (phase === "bonus") {
      if (qIndex + 1 < lesson.bonusQuestions.length) {
        setQIndex(qIndex + 1);
      } else {
        setPhase("reward");
      }
    }
  };

  const handleRetry = () => {
    setAnswer("");
    setResult("idle");
  };

  const startBonus = () => {
    setPhase("bonus");
    setQIndex(0);
    setAnswer("");
    setResult("idle");
  };

  const nextLessonIdx = unit1.lessons.findIndex((l) => l.id === lesson.id) + 1;
  const nextLesson = unit1.lessons[nextLessonIdx];

  // Lesson context string for AI
  const lessonContext = useMemo(() => {
    const passage = lesson.passage.map((p) => `EN: ${p.en}\nMY: ${p.my}`).join("\n\n");
    return `LESSON: ${lesson.code} ${lesson.type} — ${lesson.title}\nINTRO: ${lesson.intro}\n\nPASSAGE / CONTENT:\n${passage}`;
  }, [lesson]);

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <Link
            to="/lessons"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === "my" ? "သင်ခန်းစာ စာရင်းသို့" : "Back to lessons"}
          </Link>

          <Sheet open={chatOpen} onOpenChange={setChatOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <MessageCircle className="h-4 w-4" />
                {lang === "my" ? "ဆရာဇီးကွက်ကို မေးပါ" : "Ask Sayar Owl"}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
              <ChatPanel lesson={lesson} lessonContext={lessonContext} currentQ={currentQ} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Lesson header */}
        <header className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <span className="rounded-full bg-primary/10 px-2.5 py-1">
              {lesson.code} · {lesson.type}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight">
            {lang === "my" ? lesson.titleMy : lesson.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "my" ? lesson.introMy : lesson.intro}
          </p>
        </header>

        {/* Passage blocks with toggle buttons */}
        <section className="mt-6 space-y-4">
          {lesson.passage.map((block, i) => (
            <PassageBlock key={i} block={block} />
          ))}
        </section>

        {/* Quiz engine */}
        <section className="mt-8 rounded-2xl border-2 border-primary/30 bg-card p-5">
          {phase === "main" && currentQ && (
            <QuizCard
              question={currentQ}
              total={lesson.questions.length}
              index={qIndex}
              label={lang === "my" ? "မေးခွန်း" : "Question"}
              answer={answer}
              setAnswer={setAnswer}
              result={result}
              onCheck={handleCheck}
              onNext={handleNext}
              onRetry={handleRetry}
            />
          )}

          {phase === "bonus-intro" && (
            <div className="text-center py-4">
              <Sparkles className="mx-auto h-12 w-12 text-amber-500" />
              <h2 className="mt-3 text-xl font-bold">
                {lang === "my" ? "တော်လိုက်တာ! 🎉" : "Awesome work! 🎉"}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-foreground/90">
                စာအုပ်ထဲက လေ့ကျင့်ခန်းတွေ ပြီးသွားပြီမို့ တကယ်နားလည်လားဆိုတာ ဆရာ နောက်ထပ်
                မေးခွန်းအသစ်လေးတွေနဲ့ စမ်းသပ်ကြည့်မယ်နော်!
              </p>
              <Button onClick={startBonus} size="lg" className="mt-5 gap-2">
                <Star className="h-4 w-4" />
                {lang === "my" ? "Bonus မေးခွန်းတွေ စမည်" : "Start bonus questions"}
              </Button>
            </div>
          )}

          {phase === "bonus" && currentQ && (
            <QuizCard
              question={currentQ}
              total={lesson.bonusQuestions.length}
              index={qIndex}
              label={lang === "my" ? "Bonus မေးခွန်း" : "Bonus question"}
              isBonus
              answer={answer}
              setAnswer={setAnswer}
              result={result}
              onCheck={handleCheck}
              onNext={handleNext}
              onRetry={handleRetry}
            />
          )}

          {phase === "reward" && (
            <RewardScreen
              hasNext={!!nextLesson}
              onNext={() => {
                if (nextLesson) {
                  navigate({ to: "/lesson/$lessonId", params: { lessonId: nextLesson.id } });
                  setPhase("main");
                  setQIndex(0);
                  setAnswer("");
                  setResult("idle");
                } else {
                  navigate({ to: "/lessons" });
                }
              }}
              nextTitle={nextLesson ? (lang === "my" ? nextLesson.titleMy : nextLesson.title) : null}
            />
          )}
        </section>
      </main>
    </div>
  );
}

function PassageBlock({ block }: { block: Lesson["passage"][number] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-base font-medium leading-relaxed">{block.en}</p>

      <Accordion type="multiple" className="mt-3">
        <AccordionItem value="structure" className="border-b-0">
          <AccordionTrigger className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-semibold hover:no-underline">
            <span className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              🔍 Sentence Structure / ဝါကျတည်ဆောက်ပုံခွဲခြမ်းစိတ်ဖြာချက်
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pt-3 pb-1 text-sm leading-relaxed text-muted-foreground">
            {block.structure}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="translation" className="border-b-0 mt-2">
          <AccordionTrigger className="rounded-lg border border-border bg-amber-50/60 dark:bg-amber-950/20 px-3 py-2 text-xs font-semibold hover:no-underline">
            <span className="flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5" />
              🌐 Burmese Translation / မြန်မာဘာသာပြန်ချက်
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pt-3 pb-1 text-base leading-relaxed">
            {block.my}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function QuizCard({
  question,
  total,
  index,
  label,
  isBonus,
  answer,
  setAnswer,
  result,
  onCheck,
  onNext,
  onRetry,
}: {
  question: Question;
  total: number;
  index: number;
  label: string;
  isBonus?: boolean;
  answer: string;
  setAnswer: (v: string) => void;
  result: "idle" | "correct" | "wrong";
  onCheck: () => void;
  onNext: () => void;
  onRetry: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (result === "idle") inputRef.current?.focus();
  }, [result, question]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {isBonus && <Star className="mr-1 inline h-3 w-3" />}
          {label} {index + 1} / {total}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i < index ? "bg-primary" : i === index ? "bg-primary/60" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-lg font-medium">{question.q}</p>
      <p className="mt-1 text-sm text-muted-foreground">{question.qMy}</p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          ref={inputRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && result !== "correct") {
              e.preventDefault();
              if (result === "wrong") onRetry();
              else onCheck();
            }
          }}
          placeholder="Type your answer here…"
          disabled={result === "correct"}
          className="flex-1"
        />
        {result === "idle" && (
          <Button onClick={onCheck} disabled={!answer.trim()} className="gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            Check Answer
          </Button>
        )}
        {result === "wrong" && (
          <Button onClick={onRetry} variant="outline" className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        {result === "correct" && (
          <Button onClick={onNext} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <ArrowRight className="h-4 w-4" />
            Next Question
          </Button>
        )}
      </div>

      {result === "correct" && (
        <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          <p className="flex items-center gap-2 text-base font-bold text-emerald-700 dark:text-emerald-300">
            <PartyPopper className="h-5 w-5" />
            ဝ့ား! တကယ်တော်တယ်! အဖြေမှန်ပါတယ်ခင်ဗျာ! 🌟
          </p>
          <p className="mt-1.5 text-sm text-emerald-800/90 dark:text-emerald-200/90">
            {question.explanationMy}
          </p>
        </div>
      )}

      {result === "wrong" && (
        <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/40">
          <p className="flex items-center gap-2 text-base font-semibold text-rose-700 dark:text-rose-300">
            <XCircle className="h-5 w-5" />
            ဟင့်အင်း၊ နည်းနည်းလွဲသွားတယ်နော် — ဆရာ ရှင်းပြပါ့မယ်။
          </p>
          <div className="mt-2 space-y-1.5 text-sm text-rose-900 dark:text-rose-100">
            <p>
              <span className="font-semibold">အဖြေမှန်: </span>
              <span className="rounded bg-white/70 dark:bg-rose-900/40 px-1.5 py-0.5 font-mono">
                {question.answers[0]}
              </span>
            </p>
            <p>
              <span className="font-semibold">ဘာကြောင့်လဲ: </span>
              {question.explanationMy}
            </p>
            <p>
              <span className="font-semibold">သဒ္ဒါစည်းမျဉ်း: </span>
              {question.ruleMy}
            </p>
            {question.hint && (
              <p className="text-xs italic text-rose-700/80 dark:text-rose-300/80">
                💡 Hint: {question.hint}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RewardScreen({
  hasNext,
  nextTitle,
  onNext,
}: {
  hasNext: boolean;
  nextTitle: string | null;
  onNext: () => void;
}) {
  return (
    <div className="relative overflow-hidden text-center py-6">
      {/* Confetti dots */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 80}%`,
              animationDelay: `${(i % 6) * 0.15}s`,
              animationDuration: `${1 + (i % 4) * 0.25}s`,
            }}
          >
            {["⭐", "🎉", "✨", "🌟", "🎊"][i % 5]}
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg">
          <Star className="h-10 w-10 fill-white text-white" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">တကယ်ထူးချွန်တယ်! 🏆</h2>
        <p className="mt-2 text-base text-foreground/90">
          ဒီသင်ခန်းစာကို အောင်မြင်စွာ ပြီးဆုံးပါပြီ။ ဆရာ ဂုဏ်ယူပါတယ်နော်!
        </p>
        <div className="mt-4 flex justify-center gap-1 text-3xl">⭐⭐⭐</div>

        <Button onClick={onNext} size="lg" className="mt-6 gap-2">
          {hasNext ? (
            <>
              Go to Next Lesson 🚀
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Back to all lessons
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        {nextTitle && (
          <p className="mt-2 text-xs text-muted-foreground">Next: {nextTitle}</p>
        )}
      </div>
    </div>
  );
}

function ChatPanel({
  lesson,
  lessonContext,
  currentQ,
}: {
  lesson: Lesson;
  lessonContext: string;
  currentQ: Question | undefined;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { lessonContext, currentQuestion: currentQ?.q ?? null },
      }),
    [lessonContext, currentQ],
  );
  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (e) => console.error("[chat]", e),
  });
  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const t = text.trim();
    if (!t || isLoading) return;
    void sendMessage({ text: t });
    setInput("");
  };

  const starters = [
    { icon: Search, label: "ဒီသင်ခန်းစာကို ရှင်းပြပါ", prompt: "ဒီသင်ခန်းစာကို မြန်မာလို ရိုးရိုးလေး စပြီး ရှင်းပြပေးပါ။" },
    { icon: Languages, label: "ဥပမာ ထပ်ပြောပါ", prompt: "ဒီသင်ခန်းစာအတွက် ဥပမာဝါကျ ၃ ခုလောက် မြန်မာ အဓိပ္ပာယ်နဲ့အတူ ပေးပါ။" },
    { icon: Sparkles, label: "မေးခွန်းကို ဖြေဖို့ အကြံ", prompt: currentQ ? `ဒီမေးခွန်းကို ဘယ်လိုဖြေရမယ်ဆိုတဲ့ အကြံပြုပါ (အဖြေ မပြောပါနဲ့): ${currentQ.q}` : "ဒီသင်ခန်းစာက အရေးအကြီးဆုံး အချက် ၂ ခုကို ပြောပြပါ။" },
  ];

  return (
    <>
      <SheetHeader className="border-b border-border px-4 py-3 space-y-0">
        <SheetTitle className="flex items-center gap-2 text-base">
          <img src={tutorLogo} alt="" className="h-8 w-8" />
          <div>
            <div>ဆရာ ဇီးကွက်</div>
            <div className="text-xs font-normal text-muted-foreground">
              {lesson.code} · {lesson.type}
            </div>
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              မင်္ဂလာပါ! ကျွန်တော် ဆရာဇီးကွက်ပါ 🦉 ဒီသင်ခန်းစာအတွက် ဘာများ မေးချင်လဲ?
              အရင်က အင်္ဂလိပ်စာ လုံးဝမသိသူပဲ ဖြစ်ပါစေ၊ စိတ်ရှည်ရှည် ရှင်းပြပေးပါမယ်နော်။
            </p>
            <div className="grid gap-2">
              {starters.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s.prompt)}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-left text-sm hover:bg-secondary"
                >
                  <s.icon className="h-4 w-4 text-primary shrink-0" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m: UIMessage) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            return (
              <div
                key={m.id}
                className={`rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-6 bg-primary text-primary-foreground"
                    : "mr-6 bg-secondary/60"
                }`}
              >
                {text}
              </div>
            );
          })
        )}
        {isLoading && (
          <div className="mr-6 rounded-xl bg-secondary/60 px-3 py-2 text-sm text-muted-foreground italic">
            ဆရာဇီးကွက် တွေးနေပါသည်…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-border p-3 flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="မေးခွန်း ရိုက်ပါ…"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </>
  );
}
