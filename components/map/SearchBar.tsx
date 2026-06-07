"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchPlaces, type PlaceResult } from "@/lib/geo/geocode";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export function SearchBar({ onSelect }: { onSelect: (center: [number, number], name: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const skipNext = useRef(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    if (q.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      searchPlaces(q, TOKEN, ctrl.signal)
        .then((r) => {
          setResults(r);
          setOpen(true);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function choose(r: PlaceResult) {
    onSelect(r.center, r.name);
    skipNext.current = true;
    setQ(r.name);
    setResults([]);
    setOpen(false);
  }

  function clear() {
    setQ("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) choose(results[0]);
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search a place in Bengaluru"
        aria-label="Search a place in Bengaluru"
        className="h-11 rounded-full border-border bg-card/95 pl-9 pr-9 shadow-md backdrop-blur"
      />
      {loading ? (
        <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : q ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      ) : null}

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-12 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => choose(r)}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted/60"
              >
                <Search className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span className="leading-snug">{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
