import { Link } from "@tanstack/react-router";
import tutorLogo from "@/assets/tutor-logo.png";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={tutorLogo} alt="Sayar Owl Academy" width={36} height={36} className="h-9 w-9" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Sayar Owl Academy</div>
            <div className="text-[11px] text-muted-foreground">English for Grade 10 Myanmar</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/" activeOptions={{ exact: true }} className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>
            Home
          </Link>
          <Link to="/lessons" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>
            Lessons
          </Link>
          <Link
            to="/tutor"
            className="ml-2 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Ask Sayar Owl
          </Link>
        </nav>
      </div>
    </header>
  );
}
