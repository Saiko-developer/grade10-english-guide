import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  Languages,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Trophy,
} from "lucide-react";

import heroOwl from "@/assets/hero-owl.jpg";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sayar Owl Academy — Modern English Learning for Grade 10 Myanmar" },
      {
        name: "description",
        content:
          "A modern learning platform with Sayar Owl, your patient AI English tutor. Grammar lessons, sentence breakdowns, and Myanmar translations built for Grade 10 students.",
      },
      { property: "og:title", content: "Sayar Owl Academy — English Learning Platform" },
      {
        property: "og:description",
        content:
          "Learn English with Sayar Owl — patient, simple explanations with Myanmar translation context.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Ask Sayar Owl anything",
    body: "A patient AI tutor that breaks down any sentence and explains the 'why' behind every grammar rule.",
  },
  {
    icon: Languages,
    title: "Myanmar translation context",
    body: "Tricky words and phrases explained in Burmese (မြန်မာ) so the meaning truly clicks.",
  },
  {
    icon: BookOpen,
    title: "Grade 10 aligned",
    body: "Lessons and examples tuned to the Myanmar Grade 10 syllabus and matriculation exam style.",
  },
  {
    icon: Trophy,
    title: "Practice that sticks",
    body: "Every answer ends with a tiny practice question so you actually remember what you learned.",
  },
];

const LESSONS = [
  { tag: "Grammar", title: "Present Perfect vs Past Simple", time: "8 min" },
  { tag: "Vocabulary", title: "Linking words: however, despite, although", time: "6 min" },
  { tag: "Writing", title: "Paragraph structure for essays", time: "10 min" },
  { tag: "Reading", title: "Finding the main idea", time: "7 min" },
  { tag: "Grammar", title: "Conditionals: zero, first, second, third", time: "12 min" },
  { tag: "Speaking", title: "Common matric interview phrases", time: "5 min" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_oklch(0.95_0.05_190)_0%,_transparent_60%)]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              For Grade 10 students in Myanmar
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Learn English with{" "}
              <span className="text-primary">Sayar Owl</span> — your patient AI tutor.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Paste any sentence or grammar question. Sayar Owl explains the rule, the structure, and the
              Myanmar meaning — kindly and clearly, every time.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/tutor"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" />
                Start chatting with Sayar Owl
              </Link>
              <Link
                to="/lessons"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                <BookOpen className="h-4 w-4" />
                Browse lessons
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> Grade 10 syllabus</div>
              <div className="flex items-center gap-1.5"><Languages className="h-4 w-4" /> English + မြန်မာ</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-accent/30 to-primary/20 blur-2xl" />
            <img
              src={heroOwl}
              alt="Sayar Owl, the friendly English tutor mascot"
              width={1024}
              height={1024}
              className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Why students love Sayar Owl</h2>
            <p className="mt-3 text-muted-foreground">
              A modern learning experience built for the way Myanmar students actually study English.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-background p-5 transition hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lessons preview */}
      <section id="lessons" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Popular lessons</h2>
              <p className="mt-2 text-muted-foreground">Quick, focused topics straight from the Grade 10 syllabus.</p>
            </div>
            <Link to="/lessons" className="hidden text-sm font-medium text-primary hover:underline sm:inline">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LESSONS.map((l) => (
              <Link
                key={l.title}
                to="/tutor"
                className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-accent/30 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
                    {l.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">{l.time}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold group-hover:text-primary">{l.title}</h3>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Ask Sayar Owl to explain this
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-primary/5">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to ask your first question?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Sayar Owl is online now — patient, encouraging, and happy to explain anything in English or
            မြန်မာ.
          </p>
          <Link
            to="/tutor"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Chat with Sayar Owl
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Sayar Owl Academy · Built with care for Myanmar students
      </footer>
    </div>
  );
}
