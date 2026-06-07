import type { Metadata } from "next";
import Link from "next/link";
import { MapIcon } from "lucide-react";
import { getDashboardStats, type SeverityStat } from "@/lib/reports-data";
import { SEVERITY_META, type Severity } from "@/lib/types";
import { formatLength } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard - Fix Bengaluru Roads",
  description: "The crowd-mapped state of Bengaluru's roads: totals, severity, and the most-reported stretches.",
};

const ORDER: Severity[] = [3, 2, 1];

function statFor(bySeverity: SeverityStat[], s: Severity) {
  return bySeverity.find((x) => Number(x.severity) === s) ?? { severity: s, count: 0, km: 0 };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const maxCount = Math.max(1, ...stats.bySeverity.map((s) => s.count));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-8 sm:py-12">
      {/* Masthead */}
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="label-caps text-muted-foreground hover:text-foreground">
          Fix Bengaluru Roads
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <MapIcon className="size-4" strokeWidth={2} />
          Open the map
        </Link>
      </div>

      {stats.totalReports === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8">
          <span className="h-1.5 w-16 rounded-full bg-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">No roads flagged yet</h1>
          <p className="max-w-md text-muted-foreground">
            Be the first to map a bad stretch. It takes about thirty seconds.
          </p>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full bg-primary px-5 font-semibold text-primary-foreground"
          >
            Map a road
          </Link>
        </div>
      ) : (
        <>
          {/* Headline */}
          <header className="flex flex-col gap-2">
            <span className="h-1.5 w-16 rounded-full bg-primary" />
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Bengaluru has flagged{" "}
              <span className="tabular-nums">{stats.totalReports.toLocaleString("en-IN")}</span>{" "}
              {stats.totalReports === 1 ? "stretch" : "stretches"}
            </h1>
            <p className="text-lg text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{stats.totalKm}</span> km of
              road mapped as needing work.
            </p>
          </header>

          {/* Severity breakdown */}
          <section className="flex flex-col gap-4">
            <h2 className="label-caps text-muted-foreground">By severity</h2>
            <div className="flex flex-col gap-3">
              {ORDER.map((s) => {
                const st = statFor(stats.bySeverity, s);
                const meta = SEVERITY_META[s];
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className="flex w-28 items-center gap-2 shrink-0">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="text-sm font-medium">{meta.label}</span>
                    </div>
                    <div className="h-7 flex-1 overflow-hidden rounded-md bg-muted">
                      <div
                        className="flex h-full items-center justify-end rounded-md px-2 text-xs font-semibold text-white"
                        style={{
                          width: `${Math.max(6, (st.count / maxCount) * 100)}%`,
                          backgroundColor: meta.color,
                        }}
                      >
                        {st.count}
                      </div>
                    </div>
                    <span className="w-20 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
                      {st.km} km
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Worst stretches */}
          <section className="flex flex-col gap-4">
            <h2 className="label-caps text-muted-foreground">Most-reported stretches</h2>
            <ol className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {stats.worst.map((w, i) => {
                const meta = SEVERITY_META[Number(w.severity) as Severity];
                const reports = w.corroborations + 1;
                return (
                  <li key={w.id}>
                    <Link
                      href={`/r/${w.id}`}
                      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <span className="w-5 shrink-0 text-center font-display text-lg font-bold tabular-nums text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="flex-1 font-medium">{meta.label} stretch</span>
                      <span className="hidden text-sm text-muted-foreground tabular-nums sm:inline">
                        {formatLength(w.lengthM)}
                      </span>
                      <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums">
                        {reports} {reports === 1 ? "report" : "reports"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
        <p>
          A citizen project to help Bengaluru&apos;s road relaying reach the worst stretches.
          Non-partisan, no logins.
        </p>
        <Link href="/privacy" className="w-fit font-medium underline-offset-2 hover:text-foreground hover:underline">
          Your data &amp; privacy
        </Link>
      </div>
    </main>
  );
}
