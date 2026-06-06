"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAMAGE_TYPES, DAMAGE_TYPE_LABELS, type DamageType } from "@/lib/types";

export function DamageTypeChips({
  value,
  onChange,
}: {
  value: DamageType[];
  onChange: (v: DamageType[]) => void;
}) {
  function toggle(t: DamageType) {
    onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t]);
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {DAMAGE_TYPES.map((t) => {
        const active = value.includes(t);
        return (
          <button
            key={t}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(t)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8rem] font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground hover:bg-muted/50"
            )}
          >
            {active && <Check className="size-3.5" strokeWidth={2.75} />}
            {DAMAGE_TYPE_LABELS[t]}
          </button>
        );
      })}
    </div>
  );
}
