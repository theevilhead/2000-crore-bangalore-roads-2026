"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, HelpCircle, Info, Shield, Menu, X } from "lucide-react";

const item =
  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-left transition-colors hover:bg-muted";

export function MapNav({ onHowItWorks }: { onHowItWorks: () => void }) {
  const [open, setOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );

  return (
    <div className="pointer-events-auto w-56 max-w-[72vw] overflow-hidden rounded-xl border border-border bg-card/90 shadow-sm backdrop-blur">
      <div className="h-1 bg-primary" />
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-bold leading-none tracking-tight">Fix Bengaluru Roads</p>
          <p className="label-caps mt-1 text-muted-foreground">Citizen road map</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Collapse menu" : "Open menu"}
          aria-expanded={open}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-border p-1.5">
          <Link href="/dashboard" className={item}>
            <BarChart3 className="size-4 text-muted-foreground" strokeWidth={2} />
            Dashboard
          </Link>
          <button type="button" onClick={onHowItWorks} className={item}>
            <HelpCircle className="size-4 text-muted-foreground" strokeWidth={2} />
            How it works
          </button>
          <Link href="/about" className={item}>
            <Info className="size-4 text-muted-foreground" strokeWidth={2} />
            About
          </Link>
          <Link href="/privacy" className={item}>
            <Shield className="size-4 text-muted-foreground" strokeWidth={2} />
            Your data
          </Link>
        </nav>
      )}
    </div>
  );
}
