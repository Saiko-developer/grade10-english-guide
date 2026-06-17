import { Link } from "@tanstack/react-router";
import tutorLogo from "@/assets/tutor-logo.png";
import { LanguageToggle, useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={tutorLogo} alt="Sayar Owl Academy" width={36} height={36} className="h-9 w-9" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">{t("site.title")}</div>
            <div className="text-[11px] text-muted-foreground">{t("site.tagline")}</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/" activeOptions={{ exact: true }} className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>
            {t("nav.home")}
          </Link>
          <Link to="/lessons" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>
            {t("nav.lessons")}
          </Link>
          <LanguageToggle className="ml-1" />
          <Link
            to="/tutor"
            className="ml-2 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            {t("nav.ask")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
