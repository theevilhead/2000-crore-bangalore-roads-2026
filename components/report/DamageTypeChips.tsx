"use client";

import { Button } from "@/components/ui/button";
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
    <div className="flex flex-wrap gap-2">
      {DAMAGE_TYPES.map((t) => {
        const active = value.includes(t);
        return (
          <Button
            key={t}
            type="button"
            variant={active ? "secondary" : "outline"}
            size="sm"
            aria-pressed={active}
            onClick={() => toggle(t)}
            className={cn(active && "ring-2 ring-ring/40")}
          >
            {DAMAGE_TYPE_LABELS[t]}
          </Button>
        );
      })}
    </div>
  );
}
