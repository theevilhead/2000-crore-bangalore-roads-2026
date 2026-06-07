"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SEVERITY_META, type Severity } from "@/lib/types";

const ORDER: Severity[] = [3, 2, 1];

export function MapLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-5 left-4 z-10">
      {open ? (
        <div className="rounded-xl border border-border bg-card/90 px-3.5 py-3 shadow-md backdrop-blur">
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
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card/90 shadow-md backdrop-blur"
        >
          <span className="flex flex-col items-center gap-[3px]">
            {ORDER.map((s) => (
              <span
                key={s}
                className="h-[3px] w-5 rounded-full"
                style={{ backgroundColor: SEVERITY_META[s].color }}
              />
            ))}
          </span>
        </button>
      )}
    </div>
  );
}
