"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SEVERITY_META, type Severity } from "@/lib/types";

const ORDER: Severity[] = [3, 2, 1];

export function MapLegend() {
  const [open, setOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 640 : true
  );

  return (
    <div className="absolute bottom-28 left-3 z-10 sm:bottom-6 sm:left-4">
      {open ? (
        <div className="rounded-xl border border-border bg-card/90 px-3.5 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-6">
            <p className="label-caps text-muted-foreground">Severity</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Minimise legend"
              className="-mr-1 rounded p-0.5 text-muted-foreground hover:bg-muted"
            >
              <ChevronDown className="size-3.5" />
            </button>
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {ORDER.map((s) => (
              <li key={s} className="flex items-center gap-2.5 text-[0.8rem] font-medium">
                <span className="h-1 w-6 rounded-full" style={{ backgroundColor: SEVERITY_META[s].color }} />
                <span className="tabular-nums text-muted-foreground">{s}</span>
                {SEVERITY_META[s].label}
              </li>
            ))}
          </ul>
          <p className="mt-2.5 max-w-[11rem] text-[0.7rem] leading-snug text-muted-foreground">
            Thicker lines mean more people flagged it.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Show severity legend"
          className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-2 shadow-sm backdrop-blur"
        >
          <span className="flex gap-0.5">
            {([1, 2, 3] as Severity[]).map((s) => (
              <span key={s} className="size-2 rounded-full" style={{ backgroundColor: SEVERITY_META[s].color }} />
            ))}
          </span>
          <span className="text-xs font-medium">Legend</span>
        </button>
      )}
    </div>
  );
}
