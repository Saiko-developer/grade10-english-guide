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
import { useI18n } from "@/lib/i18n";

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
  { icon: MessageCircle, key: "ask" },
  { icon: Languages, key: "mm" },
  { icon: BookOpen, key: "g10" },
  { icon: Trophy, key: "practice" },
] as const;

const LESSONS = [
  { tag: "Grammar", title: "Present Perfect vs Past Simple", time: "8 min" },
  { tag: "Vocabulary", title: "Linking words: however, despite, although", time: "6 min" },
  { tag: "Writing", title: "Paragraph structure for essays", time: "10 min" },
  { tag: "Reading", title: "Finding the main idea", time: "7 min" },
  { tag: "Grammar", title: "Conditionals: zero, first, second, third", time: "12 min" },
  { tag: "Speaking", title: "Common matric interview phrases", time: "5 min" },
];

function Landing() {
  const { t } = useI18n();
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
              {t("hero.badge")}
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {t("hero.title.a")} <span className="text-primary">{t("hero.title.b")}</span> {t("hero.title.c")}
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              {t("hero.subtitle")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/tutor"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" />
                {t("hero.cta.chat")}
              </Link>
              <Link
                to="/lessons"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                <BookOpen className="h-4 w-4" />
                {t("hero.cta.browse")}
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {t("hero.tag.syllabus")}</div>
              <div className="flex items-center gap-1.5"><Languages className="h-4 w-4" /> {t("hero.tag.langs")}</div>
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
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("features.title")}</h2>
            <p className="mt-3 text-muted-foreground">{t("features.subtitle")}</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.key} className="rounded-2xl border border-border bg-background p-5 transition hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{t(`feature.${f.key}.title`)}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{t(`feature.${f.key}.body`)}</p>
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
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("lessons.popular")}</h2>
              <p className="mt-2 text-muted-foreground">{t("lessons.popular.sub")}</p>
            </div>
            <Link to="/lessons" className="hidden text-sm font-medium text-primary hover:underline sm:inline">
              {t("lessons.viewall")}
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
                  {t("lessons.askToExplain")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-primary/5">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("cta.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("cta.subtitle")}</p>
          <Link
            to="/tutor"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            {t("cta.button")}
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        {t("footer", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
