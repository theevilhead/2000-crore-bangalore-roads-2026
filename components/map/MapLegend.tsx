"use client";

import { SEVERITY_META, type Severity } from "@/lib/types";

const ORDER: Severity[] = [1, 2, 3];

export function MapLegend() {
  return (
    <div className="absolute bottom-24 left-3 z-10 rounded-lg border bg-background/90 p-3 text-xs shadow-sm backdrop-blur sm:bottom-4">
      <p className="mb-1.5 font-medium">Severity</p>
      <ul className="flex flex-col gap-1">
        {ORDER.map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span className="h-1.5 w-5 rounded-full" style={{ backgroundColor: SEVERITY_META[s].color }} />
            {s}. {SEVERITY_META[s].label}
          </li>
        ))}
      </ul>
      <p className="mt-2 max-w-[12rem] text-[11px] text-muted-foreground">
        Thicker lines = more people reported it.
      </p>
    </div>
  );
}
