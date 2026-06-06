"use client";

import { Button } from "@/components/ui/button";
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
          <Button
            key={s}
            type="button"
            variant="outline"
            size="lg"
            onClick={() => onChange(s)}
            aria-pressed={active}
            className={cn(
              "flex h-auto flex-col items-start gap-0.5 py-2 text-left whitespace-normal",
              active && "border-2"
            )}
            style={active ? { borderColor: meta.color } : undefined}
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
              {s}. {meta.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
