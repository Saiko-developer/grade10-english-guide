import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, GraduationCap, Library, MessageCircle, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";
import unit1 from "@/data/textbookUnit1.json";

const ICONS = [Library, BookOpen, Sparkles, GraduationCap];

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Grade 10 English — Unit 1 Lessons" },
      {
        name: "description",
        content:
          "Interactive Grade 10 English lessons from Unit 1: Reading, Comprehension, Vocabulary and Grammar — taught by Sayar Owl in simple Burmese.",
      },
    ],
  }),
  component: LessonsPage,
});

function LessonsPage() {
  const { t, lang } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" /> {t("lessons.crumb")} · {unit1.unit}
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          {lang === "my" ? `${unit1.unit}: ${unit1.unitTitle}` : `${unit1.unit}: ${unit1.unitTitle}`}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {lang === "my"
            ? "သင်ခန်းစာတစ်ခုကို နှိပ်လိုက်ရင် ဆရာဇီးကွက်က မြန်မာလို စိတ်ရှည်ရှည် ရှင်းပြပြီး မေးခွန်းတွေ တစ်ခုချင်း လေ့ကျင့်ပေးပါမယ်။"
            : "Click any lesson — Sayar Owl will explain in simple Burmese and quiz you one question at a time."}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {unit1.lessons.map((lesson, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Link
                key={lesson.id}
                to="/lesson/$lessonId"
                params={{ lessonId: lesson.id }}
                className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Icon className="h-3.5 w-3.5" />
                    {lesson.code} · {lesson.type}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-tight">
                    {lang === "my" ? lesson.titleMy : lesson.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {lang === "my" ? lesson.introMy : lesson.intro}
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {lesson.questions.length}
                  {lang === "my" ? " မေးခွန်း + " : " questions + "}
                  {lesson.bonusQuestions.length}
                  {lang === "my" ? " bonus" : " bonus"}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
