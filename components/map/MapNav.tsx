"use client";

import Link from "next/link";
import { BarChart3, HelpCircle, Info, Shield, Menu, X } from "lucide-react";

const item =
  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-left transition-colors hover:bg-muted";

export function MapNav({
  open,
  onToggle,
  onHowItWorks,
}: {
  open: boolean;
  onToggle: () => void;
  onHowItWorks: () => void;
}) {
  return (
    <div className="pointer-events-auto w-64 max-w-[78vw] overflow-hidden rounded-xl border border-border bg-card/90 shadow-sm backdrop-blur">
      <div className="h-1 bg-primary" />
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            role="img"
            aria-label="Kannada flag"
            className="shrink-0 overflow-hidden rounded-[3px] shadow-sm ring-1 ring-black/10"
          >
            {/* Kannada flag (yellow over red), 3:2, recreated faithfully. */}
            <svg width="27" height="18" viewBox="0 0 3 2">
              <rect width="3" height="1" fill="#FFCC00" />
              <rect y="1" width="3" height="1" fill="#FF0000" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold leading-none tracking-tight">Fix Bengaluru Roads</p>
            <p className="label-caps mt-1 text-muted-foreground">Citizen road map</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
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
