"use client";

import { cn } from "@/lib/utils";
import { SEVERITY_META, type Severity } from "@/lib/types";

const ORDER: Severity[] = [1, 2, 3];

export function SeveritySelect({
  value,
  onChange,
}: {
  value: Severity | null;
  onChange: (s: Severity) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ORDER.map((s) => {
        const meta = SEVERITY_META[s];
        const active = value === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            aria-pressed={active}
            className={cn(
              "group flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "shadow-sm"
                : "border-border bg-card hover:border-muted-foreground/40 hover:bg-muted/40"
            )}
            style={
              active
                ? {
                    borderColor: meta.color,
                    backgroundColor: `color-mix(in oklch, ${meta.color} 12%, var(--card))`,
                  }
                : undefined
            }
          >
            <span
              className="font-display text-2xl font-extrabold leading-none tabular-nums"
              style={{ color: active ? meta.color : "var(--muted-foreground)" }}
            >
              {s}
            </span>
            <span className="text-[0.8rem] font-semibold leading-tight">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
