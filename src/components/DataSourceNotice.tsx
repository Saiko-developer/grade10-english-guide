import { AlertTriangle } from "lucide-react";

import type { Curriculum } from "@/lib/curriculum";

/** Visible warning shown when the app is serving bundled JSON instead of live data. */
export function DataSourceNotice({ curriculum }: { curriculum: Curriculum }) {
  if (curriculum.source !== "local") return null;

  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-semibold">Offline lesson data (local fallback)</p>
        <p className="text-xs opacity-90">
          Live database unavailable — showing bundled lesson content.
          {curriculum.fallbackReason ? ` (${curriculum.fallbackReason})` : ""}
        </p>
      </div>
    </div>
  );
}
