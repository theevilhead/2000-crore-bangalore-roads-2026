"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SEVERITY_META, type Severity } from "@/lib/types";

export interface NearbyMatch {
  id: string;
  severity: Severity;
  length_m: number;
  corroborations: number;
  overlap_ratio: number | null;
}

export function CorroboratePrompt({
  open,
  onOpenChange,
  match,
  confirming,
  onConfirm,
  onReportNew,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  match: NearbyMatch | null;
  confirming: boolean;
  onConfirm: () => void;
  onReportNew: () => void;
}) {
  const reports = match ? match.corroborations + 1 : 0;
  const meta = match ? SEVERITY_META[match.severity] : null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>This stretch looks already flagged</SheetTitle>
          <SheetDescription>
            {match ? (
              <>
                {reports} {reports === 1 ? "person has" : "people have"} reported a nearby stretch
                {meta ? (
                  <>
                    {" "}
                    (<span style={{ color: meta.color }}>{meta.label}</span>)
                  </>
                ) : null}
                . Confirm it to push it up the list, or report a different problem.
              </>
            ) : null}
          </SheetDescription>
        </SheetHeader>
        <SheetFooter className="flex-row gap-2">
          <Button size="lg" className="flex-1" disabled={confirming} onClick={onConfirm}>
            {confirming ? "Confirming…" : "Yes, confirm this"}
          </Button>
          <Button size="lg" variant="outline" className="flex-1" onClick={onReportNew}>
            It&apos;s different
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
