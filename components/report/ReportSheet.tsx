"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SeveritySelect } from "./SeveritySelect";
import { DamageTypeChips } from "./DamageTypeChips";
import { ShareCard } from "./ShareCard";
import type { SnapResult } from "@/lib/geo/snap";
import type { DamageType, Severity } from "@/lib/types";
import { getSessionId } from "@/lib/session";
import { formatLength } from "@/lib/format";

export function ReportSheet({
  open,
  onOpenChange,
  snapped,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  snapped: SnapResult | null;
  onSubmitted: () => void;
}) {
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [damageTypes, setDamageTypes] = useState<DamageType[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  function reset() {
    setSeverity(null);
    setDamageTypes([]);
    setNote("");
    setCreatedId(null);
  }

  async function submit() {
    if (!snapped || !severity) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          geometry: snapped.geometry,
          lengthM: snapped.lengthM,
          severity,
          damageTypes,
          note: note.trim() || undefined,
          sessionId: getSessionId(),
        }),
      });
      if (!res.ok) throw new Error(`Submit failed (${res.status})`);
      const { id } = await res.json();
      setCreatedId(id);
      onSubmitted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit report");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[85vh] gap-0 overflow-y-auto sm:max-w-lg">
        {createdId && snapped && severity ? (
          <>
            <SheetHeader>
              <SheetTitle>Report added</SheetTitle>
            </SheetHeader>
            <div className="p-4 pt-0">
              <ShareCard
                id={createdId}
                geometry={snapped.geometry}
                severity={severity}
                lengthM={snapped.lengthM}
                onDone={() => handleOpenChange(false)}
              />
            </div>
          </>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Describe this stretch</SheetTitle>
              <SheetDescription>
                {snapped ? `Snapped to road · ${formatLength(snapped.lengthM)}` : ""}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 p-4 pt-0">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">How bad is it?</label>
                <SeveritySelect value={severity} onChange={setSeverity} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  What&apos;s wrong? <span className="text-muted-foreground">(optional)</span>
                </label>
                <DamageTypeChips value={damageTypes} onChange={setDamageTypes} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Anything else? <span className="text-muted-foreground">(optional)</span>
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  placeholder="e.g. landmark, how long it's been like this"
                />
              </div>
            </div>

            <SheetFooter>
              <Button size="lg" disabled={!severity || submitting} onClick={submit}>
                {submitting ? "Submitting…" : "Submit report"}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
