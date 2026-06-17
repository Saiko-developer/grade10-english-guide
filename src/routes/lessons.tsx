import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Lightbulb, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Lessons — Sayar Owl Academy" },
      {
        name: "description",
        content:
          "Grammar, vocabulary, writing, reading and speaking lessons for Grade 10 English students in Myanmar.",
      },
      { property: "og:title", content: "Lessons — Sayar Owl Academy" },
      {
        property: "og:description",
        content: "Browse focused English lessons aligned to the Grade 10 syllabus.",
      },
    ],
  }),
  component: LessonsPage,
});

const CATEGORIES = [
  {
    title: "Grammar",
    items: [
      "Present Perfect vs Past Simple",
      "Conditionals: zero, first, second, third",
      "Reported Speech",
      "Active vs Passive Voice",
      "Modal verbs: should, must, might",
    ],
  },
  {
    title: "Vocabulary",
    items: [
      "Linking words: however, despite, although",
      "Common matric exam vocabulary",
      "Phrasal verbs you'll actually use",
      "Synonyms and antonyms practice",
    ],
  },
  {
    title: "Writing",
    items: [
      "Paragraph structure for essays",
      "Writing a formal letter",
      "Describing a picture or chart",
    ],
  },
  {
    title: "Reading & Speaking",
    items: [
      "Finding the main idea",
      "Skimming and scanning techniques",
      "Common matric interview phrases",
    ],
  },
];

function LessonsPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" /> {t("lessons.crumb")}
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{t("lessons.title")}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t("lessons.subtitle")}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <section key={cat.title} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">{t(`cat.${cat.title}`)}</h2>
              <ul className="mt-4 space-y-2">
                {cat.items.map((item) => (
                  <li key={item}>
                    <Link
                      to="/tutor"
                      search={{ lesson: item, category: cat.title }}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-sm transition hover:border-border hover:bg-secondary"
                    >
                      <span className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-accent" />
                        {item}
                      </span>
                      <MessageCircle className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-primary/5 p-6 text-center">
          <h2 className="text-xl font-semibold">{t("lessons.cant.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("lessons.cant.sub")}</p>
          <Link
            to="/tutor"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            {t("lessons.cant.btn")}
          </Link>
        </div>
      </main>
    </div>
  );
}
