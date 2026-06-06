"use client";

import { SEVERITY_META, type Severity } from "@/lib/types";

const ORDER: Severity[] = [3, 2, 1];

export function MapLegend() {
  return (
    <div className="absolute bottom-28 left-3 z-10 rounded-xl border border-border bg-card/90 px-3.5 py-3 shadow-sm backdrop-blur sm:bottom-6 sm:left-4">
      <p className="label-caps text-muted-foreground">Severity</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {ORDER.map((s) => (
          <li key={s} className="flex items-center gap-2.5 text-[0.8rem] font-medium">
            <span
              className="h-1 w-6 rounded-full"
              style={{ backgroundColor: SEVERITY_META[s].color }}
            />
            <span className="tabular-nums text-muted-foreground">{s}</span>
            {SEVERITY_META[s].label}
          </li>
        ))}
      </ul>
      <p className="mt-2.5 max-w-[11rem] text-[0.7rem] leading-snug text-muted-foreground">
        Thicker lines mean more people flagged it.
      </p>
    </div>
  );
}
