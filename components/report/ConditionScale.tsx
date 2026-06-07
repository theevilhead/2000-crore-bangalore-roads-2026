"use client";

import { cn } from "@/lib/utils";
import { CONDITION_ANCHOR_HIGH, CONDITION_ANCHOR_LOW } from "@/lib/types";

const VALUES = Array.from({ length: 10 }, (_, i) => i + 1);

export function ConditionScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-10 gap-1">
        {VALUES.map((v) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? null : v)}
              className={cn(
                "flex h-9 items-center justify-center rounded-md border text-sm font-semibold tabular-nums transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/50"
              )}
            >
              {v}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-[0.7rem] text-muted-foreground">
        <span>1 &middot; {CONDITION_ANCHOR_LOW}</span>
        <span>10 &middot; {CONDITION_ANCHOR_HIGH}</span>
      </div>
    </div>
  );
}
