"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Route, Gauge, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Route,
    title: "Trace it",
    body: "Tap along a bad stretch. It snaps to the real road and measures the length for you.",
  },
  {
    icon: Gauge,
    title: "Rate it",
    body: "Mark how bad it is - Annoying, Damaging, or Dangerous.",
  },
  {
    icon: Share2,
    title: "Rally it",
    body: "Share on WhatsApp. When neighbours confirm the same stretch, it climbs the list.",
  },
];

export function HowItWorks({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How it works"
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-primary" />
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1.5">
            <p className="label-caps text-primary">Fix Bengaluru Roads</p>
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight">
              Map a bad road in three steps
            </h2>
          </div>

          <ol className="flex flex-col gap-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <s.icon className="size-5" strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold leading-tight">
                    <span className="tabular-nums text-muted-foreground">{i + 1}. </span>
                    {s.title}
                  </p>
                  <p className="text-[0.85rem] leading-snug text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <Button size="lg" className="h-12 w-full rounded-full text-[0.95rem] font-semibold" onClick={onClose}>
            Start mapping
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            No login needed.{" "}
            <Link href="/about" className="font-medium underline underline-offset-2 hover:text-foreground">
              About
            </Link>{" "}
            &middot;{" "}
            <Link href="/privacy" className="font-medium underline underline-offset-2 hover:text-foreground">
              What we store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
