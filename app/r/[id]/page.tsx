import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getReportFeature } from "@/lib/reports";
import { SEVERITY_META, DAMAGE_TYPE_LABELS, CONDITION_MAX } from "@/lib/types";
import { formatLength } from "@/lib/format";
import { staticMapUrl } from "@/lib/geo/staticMap";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const report = await getReportFeature(id);
  if (!report) return { title: "Report not found" };
  const meta = SEVERITY_META[report.severity];
  const title = `${meta.label} road stretch (${formatLength(report.lengthM)}) - Bengaluru`;
  const description = `A ${meta.label.toLowerCase()} ${formatLength(report.lengthM)} stretch flagged for relaying. ${report.corroborations + 1} reports.`;
  const image = TOKEN ? staticMapUrl(report.geometry, TOKEN, 1200, 630) : undefined;
  return {
    title,
    description,
    openGraph: { title, description, images: image ? [image] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportFeature(id);
  if (!report) notFound();

  const meta = SEVERITY_META[report.severity];
  const img = TOKEN ? staticMapUrl(report.geometry, TOKEN, 1200, 630) : null;
  const reports = report.corroborations + 1;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 py-8">
      <Link href="/" className="label-caps w-fit text-muted-foreground hover:text-foreground">
        Fix Bengaluru Roads
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm">
        {img ? (
          <Image src={img} alt="Reported road stretch" width={1200} height={630} className="h-auto w-full" unoptimized priority />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Map preview needs a Mapbox token
          </div>
        )}
        <span
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-white shadow"
          style={{ backgroundColor: meta.color }}
        >
          {meta.label} &middot; {formatLength(report.lengthM)}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">
          A {meta.label.toLowerCase()} stretch, flagged by{" "}
          <span className="tabular-nums">{reports}</span> {reports === 1 ? "person" : "people"}
        </h1>
        <p className="text-[0.95rem] leading-relaxed text-muted-foreground">{meta.help}</p>
        {report.damageTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {report.damageTypes.map((d) => (
              <span
                key={d}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium"
              >
                {DAMAGE_TYPE_LABELS[d]}
              </span>
            ))}
          </div>
        )}
        {report.condition != null && (
          <p className="text-sm text-muted-foreground">
            Condition:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {report.condition}/{CONDITION_MAX}
            </span>{" "}
            vs Cubbon Park&apos;s roads (10 = smooth)
          </p>
        )}
      </div>

      <Button
        size="lg"
        nativeButton={false}
        className="h-12 w-fit rounded-full px-6 font-semibold"
        render={<Link href="/" />}
      >
        Flag a road you know
      </Button>

      <div className="mt-2 border-t border-border pt-4">
        <span className="block h-1.5 w-16 rounded-full bg-primary" />
        <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
          A citizen project to help Bengaluru&apos;s road relaying reach the worst stretches.
          Non-partisan, no logins.
        </p>
      </div>
    </main>
  );
}
